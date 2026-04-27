from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from app.models.database import get_session
from app.models.schemas import Camera, CameraUpdate
from app.services.camera_manager import camera_manager
from typing import List
import cv2
import time
import json

router = APIRouter(prefix="/cameras", tags=["cameras"])

@router.post("/", response_model=Camera)
def create_camera(camera: Camera, session: Session = Depends(get_session)):
    session.add(camera)
    session.commit()
    session.refresh(camera)
    camera_manager.add_camera(camera)
    return camera

@router.get("/", response_model=List[Camera])
def read_cameras(session: Session = Depends(get_session)):
    cameras = session.exec(select(Camera)).all()
    return cameras

@router.patch("/{camera_id}", response_model=Camera)
def update_camera(camera_id: int, camera_update: CameraUpdate, session: Session = Depends(get_session)):
    camera = session.get(Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    update_data = camera_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(camera, key, value)
    
    session.add(camera)
    session.commit()
    session.refresh(camera)
    
    # Update active thread
    if camera_update.roi_json is not None:
        camera_manager.update_camera_roi(camera_id, camera_update.roi_json)
    
    return camera

@router.get("/{camera_id}/stream")
async def stream_camera(camera_id: int):
    def generate():
        while True:
            frame = camera_manager.get_frame(camera_id)
            if frame is not None:
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1) # 10 FPS for preview is enough
    
    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")
