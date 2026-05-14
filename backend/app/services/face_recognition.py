import torch
import numpy as np
import faiss
from loguru import logger
import cv2
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from app.services.liveness_service import liveness_service

# Using loguru logger directly

class FaceRecognitionService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.mtcnn = None
        self.model = None
        # FAISS Index (512-dim for InceptionResnetV1)
        self.index = faiss.IndexFlatL2(512)
        self.user_ids = []  # Maps index position to user_id
        self._initialized = False

    def initialize(self):
        """Loads models if not already initialized. Can be slow due to weight downloads."""
        if self._initialized:
            return
        
        try:
            logger.info(f"Initializing FaceRecognitionService on {self.device}")
            # Keep MTCNN and Resnet instances
            self.mtcnn = MTCNN(keep_all=False, device=self.device)
            self.model = InceptionResnetV1(pretrained="vggface2").eval().to(self.device)
            logger.info("FaceRecognitionService initialized successfully")
            self._initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize FaceRecognitionService: {e}")
            raise

    @torch.inference_mode()
    def get_embedding(self, frame_rgb, check_liveness=False):
        """Extracts embedding from a single RGB frame with optional liveness check."""
        if not self._initialized:
            self.initialize()
            
        try:
            img = Image.fromarray(frame_rgb)
            # mtcnn.detect returns boxes as [x1, y1, x2, y2]
            boxes, probs = self.mtcnn.detect(img)
            
            if boxes is not None and len(boxes) > 0:
                logger.debug(f"Detected {len(boxes)} faces with probabilities: {probs}")
                # Pick the largest face if multiple are detected
                box = boxes[0]
                
                # Perform Liveness Check
                if check_liveness:
                    # Convert RGB back to BGR for opencv-based liveness service
                    frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
                    x1, y1, x2, y2 = map(int, box)
                    face_box = (x1, y1, x2 - x1, y2 - y1)
                    
                    liveness_score = liveness_service.check_liveness(frame_bgr, face_box)
                    if liveness_score < 0.4: # Configurable threshold
                        logger.warning(f"Liveness check failed (score: {liveness_score:.2f})")
                        return None

                # Process the face for embedding
                # MTCNN(img) detects AND crops/scales, but we already have boxes from detect()
                # To be consistent with existing logic, we let MTCNN handle the crop again
                face = self.mtcnn(img)
                if face is not None:
                    import time
                    start_time = time.time()
                    embedding = self.model(face.unsqueeze(0).to(self.device))
                    logger.debug(f"Embedding extraction took {(time.time() - start_time)*1000:.2f}ms")
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
_face_service = FaceRecognitionService()
face_service = _face_service

def get_face_service():
    return _face_service
