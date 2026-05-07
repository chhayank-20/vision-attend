from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlmodel import Session, select
from app.models.database import get_session
from app.models.schemas import EnrollmentRequest, User, UserRole, SystemSettings, Embedding
from app.api.deps import get_current_user
import shutil
import os
import uuid
from typing import List

router = APIRouter(prefix="/enrollment", tags=["enrollment"])

UPLOAD_DIR = "data/enrollment_requests"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/submit")
async def submit_enrollment(
    employee_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    department: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Public endpoint for employees to submit enrollment data."""
    # Check if remote enrollment is allowed
    settings = session.exec(select(SystemSettings)).first()
    if not settings or not settings.allow_remote_enroll:
        raise HTTPException(status_code=403, detail="Remote enrollment is currently disabled")

    # Check if user exists
    user = session.exec(select(User).where(User.employee_id == employee_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee ID not found in system")

    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}{file_ext}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    request = EnrollmentRequest(
        employee_id=employee_id,
        name=name,
        email=email,
        department=department,
        image_path=file_path
    )
    session.add(request)
    session.commit()
    session.refresh(request)
    return {"message": "Enrollment request submitted successfully", "request_id": request.id}

@router.get("/requests", response_model=List[EnrollmentRequest])
def list_requests(
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to view pending requests."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return session.exec(select(EnrollmentRequest).where(EnrollmentRequest.status == "pending")).all()

@router.post("/requests/{request_id}/approve")
def approve_request(
    request_id: int,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to approve and process enrollment."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    req = session.get(EnrollmentRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    user = session.exec(select(User).where(User.employee_id == req.employee_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User no longer exists")

    # Process face embedding
    import cv2
    import numpy as np
    from app.services.face_recognition import face_service
    
    try:
        img = cv2.imread(req.image_path)
        if img is None:
            raise HTTPException(status_code=400, detail="Could not read the uploaded image")
            
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        embedding_vec = face_service.get_embedding(img_rgb)
        
        if embedding_vec is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        # Save embedding
        new_embedding = Embedding(
            user_id=user.id,
            vector_blob=embedding_vec.tobytes(),
            image_path=req.image_path
        )
        session.add(new_embedding)
        req.status = "approved"
        session.add(req)
        session.commit()
        
        # Sync FAISS
        from app.services.index_sync import sync_faiss_index
        sync_faiss_index()
        
        return {"message": "Enrollment approved and face data synchronized"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Error processing face: {str(e)}")

@router.post("/requests/{request_id}/reject")
def reject_request(
    request_id: int,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to reject enrollment."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    req = session.get(EnrollmentRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = "rejected"
    session.add(req)
    session.commit()
    return {"message": "Request rejected"}
