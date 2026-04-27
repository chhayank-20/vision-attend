import cv2
import threading
import queue
import time
import json
from app.services.face_recognition import face_service
from app.models.schemas import AttendanceLog, Camera
from app.models.database import engine
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import Dict, Optional

class CameraManager:
    def __init__(self):
        self.camera_threads = {}  # {camera_id: (thread, stop_event)}
        self.latest_frames = {}   # {camera_id: frame}
        self.camera_rois = {}     # {camera_id: roi_dict}
        self.processing_queue = queue.Queue(maxsize=50)
        self.running = False
        self.worker_thread = None
        self.last_seen = {}  # {(user_id, camera_id): timestamp} for debounce

    def start_worker(self):
        """Starts the central recognition worker."""
        if self.worker_thread and self.worker_thread.is_alive():
            return
        self.running = True
        self.worker_thread = threading.Thread(target=self._recognition_worker, daemon=True)
        self.worker_thread.start()
        print("🚀 Vision Engine Worker Started")

    def _recognition_worker(self):
        while self.running:
            try:
                # Blocks for 1 second if queue is empty
                camera_id, frame = self.processing_queue.get(timeout=1)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                embedding = face_service.get_embedding(rgb_frame)
                if embedding is not None:
                    user_id, distance = face_service.search(embedding)
                    if user_id:
                        self._handle_recognition(user_id, camera_id)
                
                self.processing_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"❌ Worker Error: {e}")

    def _handle_recognition(self, user_id, camera_id):
        """Handles the business logic for a recognized user."""
        now = datetime.utcnow()
        key = (user_id, camera_id)
        
        # 10-second debounce to prevent spamming logs
        if key in self.last_seen and (now - self.last_seen[key]) < timedelta(seconds=10):
            return

        self.last_seen[key] = now
        
        with Session(engine) as session:
            last_log = session.exec(
                select(AttendanceLog)
                .where(AttendanceLog.user_id == user_id)
                .order_by(AttendanceLog.timestamp.desc())
            ).first()
            
            status = "OUT" if last_log and last_log.status == "IN" else "IN"
            
            new_log = AttendanceLog(user_id=user_id, camera_id=camera_id, status=status)
            session.add(new_log)
            session.commit()
            print(f"✅ User {user_id} marked {status} at Camera {camera_id}")

    def add_camera(self, camera: Camera):
        """Spawns a new capture thread for a camera."""
        if camera.id in self.camera_threads:
            self.stop_camera(camera.id)
        
        try:
            self.camera_rois[camera.id] = json.loads(camera.roi_json) if camera.roi_json else {}
        except:
            self.camera_rois[camera.id] = {}

        stop_event = threading.Event()
        thread = threading.Thread(
            target=self._camera_capture, 
            args=(camera.id, camera.url, stop_event),
            daemon=True
        )
        self.camera_threads[camera.id] = (thread, stop_event)
        thread.start()
        print(f"📹 Started Stream for Camera {camera.id}: {camera.name}")

    def stop_camera(self, camera_id):
        """Stops a specific camera thread."""
        if camera_id in self.camera_threads:
            thread, stop_event = self.camera_threads[camera_id]
            stop_event.set()
            thread.join(timeout=2)
            del self.camera_threads[camera_id]
            if camera_id in self.latest_frames:
                del self.latest_frames[camera_id]

    def update_camera_roi(self, camera_id: int, roi_json: Optional[str]):
        """Updates the ROI for an active camera stream."""
        try:
            self.camera_rois[camera_id] = json.loads(roi_json) if roi_json else {}
            print(f"🔄 ROI Updated for Camera {camera_id}")
        except:
            pass

    def get_frame(self, camera_id: int):
        """Returns the latest frame for a specific camera."""
        return self.latest_frames.get(camera_id)

    def _camera_capture(self, camera_id, url, stop_event):
        source = int(url) if url.isdigit() else url
        cap = cv2.VideoCapture(source)
        
        frame_count = 0
        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                print(f"⚠️ Camera {camera_id} disconnected. Retrying...")
                cap.release()
                time.sleep(5)
                cap = cv2.VideoCapture(source)
                continue
            
            self.latest_frames[camera_id] = frame.copy()
            
            frame_count += 1
            # Process every 5th frame for recognition
            if frame_count % 5 == 0:
                roi = self.camera_rois.get(camera_id, {})
                process_frame = frame
                if roi and all(k in roi for k in ('x', 'y', 'w', 'h')):
                    x, y, w, h = roi['x'], roi['y'], roi['w'], roi['h']
                    h_max, w_max = frame.shape[:2]
                    # Ensure ROI is within frame bounds
                    y1, y2 = max(0, y), min(h_max, y+h)
                    x1, x2 = max(0, x), min(w_max, x+w)
                    if y2 > y1 and x2 > x1:
                        process_frame = frame[y1:y2, x1:x2]
                
                if not self.processing_queue.full():
                    self.processing_queue.put((camera_id, process_frame.copy()))

        cap.release()

camera_manager = CameraManager()
