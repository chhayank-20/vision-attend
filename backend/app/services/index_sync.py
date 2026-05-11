import numpy as np
from sqlmodel import Session, select
from app.models.database import engine
from app.models.schemas import Embedding, Camera
from app.services.face_recognition import face_service
from app.services.camera_manager import camera_manager


def sync_faiss_index():
    """Fetches all embeddings from the DB and updates the FAISS index."""
    with Session(engine) as session:
        embeddings = session.exec(select(Embedding)).all()

        vectors = []
        user_ids = []
        for emb in embeddings:
            # Convert binary blob back to numpy array
            vector = np.frombuffer(emb.vector_blob, dtype="float32")
            vectors.append(vector)
            user_ids.append(emb.user_id)

        face_service.update_index(vectors, user_ids)
        print(f"🔄 FAISS Index Synced: {len(user_ids)} embeddings loaded.")


def start_vision_engine():
    """Initializes the FAISS index and starts all active camera streams."""
    # 1. Sync Index
    sync_faiss_index()

    # 2. Start Worker
    camera_manager.start_worker()

    # 3. Start Cameras
    with Session(engine) as session:
        active_cameras = session.exec(select(Camera).where(Camera.is_active)).all()
        for cam in active_cameras:
            camera_manager.add_camera(cam)
