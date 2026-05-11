import torch
import numpy as np
import faiss
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image


class FaceRecognitionService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.mtcnn = MTCNN(keep_all=False, device=self.device)
        self.model = InceptionResnetV1(pretrained="vggface2").eval().to(self.device)

        # FAISS Index (512-dim for InceptionResnetV1)
        self.index = faiss.IndexFlatL2(512)
        self.user_ids = []  # Maps index position to user_id

    def get_embedding(self, frame_rgb):
        """Extracts embedding from a single RGB frame."""
        img = Image.fromarray(frame_rgb)
        face = self.mtcnn(img)
        if face is not None:
            # face is [3, 160, 160]
            embedding = self.model(face.unsqueeze(0).to(self.device))
            return embedding.detach().cpu().numpy().flatten()
        return None

    def update_index(self, embeddings_list, user_ids_list):
        """Rebuilds the FAISS index with a list of embeddings."""
        if not embeddings_list:
            return
        vectors = np.array(embeddings_list).astype("float32")
        # Reset and rebuild for simplicity in small/medium datasets
        self.index = faiss.IndexFlatL2(512)
        self.index.add(vectors)
        self.user_ids = user_ids_list

    def search(self, embedding, threshold=0.6):
        """Searches for the closest match in the FAISS index."""
        if self.index.ntotal == 0:
            return None, 1.0

        vector = embedding.reshape(1, -1).astype("float32")
        distances, indices = self.index.search(vector, 1)

        dist = distances[0][0]
        idx = indices[0][0]

        # Note: L2 distance thresholding (smaller is better)
        if idx != -1 and dist < threshold:
            return self.user_ids[idx], dist
        return None, dist


# Singleton instance
face_service = FaceRecognitionService()
