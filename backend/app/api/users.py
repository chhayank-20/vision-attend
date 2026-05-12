from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from app.models.database import get_session
from app.models.schemas import User, UserRole, Embedding
from app.api.deps import get_current_user
from app.services.face_recognition import face_service
from typing import List
import pandas as pd
import io
import cv2
import numpy as np
import os

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=User)
def create_user(
    user: User,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create users")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/", response_model=List[User])
def read_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    users = session.exec(select(User)).all()
    return users


@router.post("/{user_id}/enroll")
async def enroll_user_face(
    user_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    try:
        # 1. Read Image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # 2. Get Embedding
        embedding = face_service.get_embedding(img_rgb)
        if embedding is None:
            raise HTTPException(
                status_code=400,
                detail="No face detected. Please try again with a clearer photo.",
            )

        # 3. Save Image & Embedding
        img_dir = "data/enrollments"
        os.makedirs(img_dir, exist_ok=True)
        img_path = f"{img_dir}/user_{user_id}.jpg"
        cv2.imwrite(img_path, img)

        # Check if user already has an embedding
        existing_emb = session.exec(
            select(Embedding).where(Embedding.user_id == user_id)
        ).first()
        if existing_emb:
            existing_emb.vector_blob = embedding.tobytes()
            existing_emb.image_path = img_path
            session.add(existing_emb)
        else:
            new_emb = Embedding(
                user_id=user_id, vector_blob=embedding.tobytes(), image_path=img_path
            )
            session.add(new_emb)

        session.commit()

        # 4. Sync FAISS
        from app.services.index_sync import sync_faiss_index

        sync_faiss_index()

        return {"message": "Face enrolled successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Enrollment error: {str(e)}")


@router.post("/bulk-upload")
async def bulk_upload_users(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can bulk upload users")
    try:
        contents = await file.read()
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload CSV or Excel.",
            )

        users_added = 0
        for _, row in df.iterrows():
            user = User(
                name=str(row.get("Name")),
                employee_id=str(row.get("Employee ID")),
                email=str(row.get("Email")),
                department=str(row.get("Department")),
                role=row.get("Role", UserRole.EMPLOYEE),
            )
            session.add(user)
            users_added += 1

        session.commit()
        return {"message": f"Successfully added {users_added} users"}
    except Exception:
        session.rollback()


@router.get("/face-image")
def get_face_image(path: str):
    """Serves a face image from the local filesystem."""
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)
