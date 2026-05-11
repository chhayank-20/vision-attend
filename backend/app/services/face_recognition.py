import torch
import numpy as np
import faiss
import logging
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image

logger = logging.getLogger("vision-attend.face")

class FaceRecognitionService:
    def __init__(self):
        try:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Initializing FaceRecognitionService on {self.device}")
            
            # Keep MTCNN and Resnet instances
            self.mtcnn = MTCNN(keep_all=False, device=self.device)
            self.model = InceptionResnetV1(pretrained="vggface2").eval().to(self.device)
            
            # FAISS Index (512-dim for InceptionResnetV1)
            self.index = faiss.IndexFlatL2(512)
            self.user_ids = []  # Maps index position to user_id
            logger.info("FaceRecognitionService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize FaceRecognitionService: {e}")
            raise

    @torch.inference_mode()
    def get_embedding(self, frame_rgb):
        """Extracts embedding from a single RGB frame."""
        try:
            img = Image.fromarray(frame_rgb)
            face = self.mtcnn(img)
            if face is not None:
                # face is [3, 160, 160]
                embedding = self.model(face.unsqueeze(0).to(self.device))
                return embedding.detach().cpu().numpy().flatten()
            return None
        except Exception as e:
            logger.error(f"Error extracting embedding: {e}")
            return None

    def update_index(self, embeddings_list, user_ids_list):
        """Rebuilds the FAISS index with a list of embeddings."""
        try:
            if not embeddings_list:
                logger.warning("Empty embeddings list provided for index update")
                return
            
            vectors = np.array(embeddings_list).astype("float32")
            # Reset and rebuild
            self.index = faiss.IndexFlatL2(512)
            self.index.add(vectors)
            self.user_ids = user_ids_list
            logger.info(f"FAISS Index updated with {len(user_ids_list)} users")
        except Exception as e:
            logger.error(f"Error updating FAISS index: {e}")

    def search(self, embedding, threshold=0.6):
        """Searches for the closest match in the FAISS index."""
        try:
            if self.index.ntotal == 0:
                return None, 1.0

            vector = embedding.reshape(1, -1).astype("float32")
            distances, indices = self.index.search(vector, 1)

            dist = distances[0][0]
            idx = indices[0][0]

            if idx != -1 and dist < threshold:
                return self.user_ids[idx], dist
            return None, dist
        except Exception as e:
            logger.error(f"Error during face search: {e}")
            return None, 1.0

# Singleton instance
face_service = FaceRecognitionService()
