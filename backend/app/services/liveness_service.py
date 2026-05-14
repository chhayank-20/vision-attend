import cv2
import numpy as np
from loguru import logger

# Using loguru directly

class LivenessService:
    def check_liveness(self, frame_bgr, face_box=None) -> float:
        """
        Performs silent liveness detection on a face.
        Returns a score between 0 and 1, where 1 is highly likely to be real.
        """
        try:
            if face_box is not None:
                x, y, w, h = face_box
                face_img = frame_bgr[y:y+h, x:x+w]
            else:
                face_img = frame_bgr

            if face_img.size == 0:
                return 0.0

            # 1. Texture Analysis (Laplacian Variance for sharpness/blur)
            # Fake faces (screens/photos) often have different sharpness levels or artifacts
            gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Normalize score (Calibrated for typical 720p/1080p face crops)
            # Real faces: 50-200, Screens: < 20 or > 1000
            sharpness_score = min(1.0, laplacian_var / 300.0)

            # 2. Color Space Analysis (HSV/YCbCr)
            # Skin has specific distributions in certain color spaces.
            hsv = cv2.cvtColor(face_img, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            
            # Real skin tends to have a good distribution of Saturation and Value.
            s_mean = np.mean(s)
            s_std = np.std(s)
            
            # Heuristic: Real skin saturation mean is usually between 10 and 170
            # and has a decent variance.
            color_score = 1.0 if (10 < s_mean < 170 and s_std > 8) else 0.5

            # Combine scores (Balanced weighting)
            final_score = (sharpness_score * 0.5) + (color_score * 0.5)
            
            logger.debug(f"Liveness Check - Sharpness: {sharpness_score:.2f}, Color: {color_score:.2f}, Total: {final_score:.2f}")
            
            return final_score
        except Exception as e:
            logger.error(f"Liveness check failed: {e}")
            return 0.5 # Neutral fallback

liveness_service = LivenessService()
