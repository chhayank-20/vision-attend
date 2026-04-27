from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func
from app.models.database import get_session
from app.models.schemas import User, AttendanceLog, Camera
from app.services.camera_manager import camera_manager
from datetime import datetime, time as dt_time
import pandas as pd
import io
import os
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_summary(session: Session = Depends(get_session)):
    # ... (existing logic remains)
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, dt_time.min)
    total_users = session.exec(select(func.count(User.id))).one()
    present_today = session.exec(
        select(func.count(func.distinct(AttendanceLog.user_id)))
        .where(AttendanceLog.timestamp >= start_of_day)
        .where(AttendanceLog.status == "IN")
    ).one()
    late_cutoff = datetime.combine(today, dt_time(hour=9, minute=0))
    late_today = session.exec(
        select(func.count(func.distinct(AttendanceLog.user_id)))
        .where(AttendanceLog.timestamp > late_cutoff)
        .where(AttendanceLog.status == "IN")
    ).one()
    active_cameras = len(camera_manager.camera_threads)
    return {
        "total_users": total_users,
        "present_today": present_today,
        "late_today": late_today,
        "active_cameras": active_cameras
    }

@router.get("/recent-logs")
def get_recent_logs(session: Session = Depends(get_session)):
    # ... (existing logic remains)
    statement = (
        select(AttendanceLog, User.name.label("user_name"), Camera.name.label("camera_name"))
        .join(User, AttendanceLog.user_id == User.id)
        .join(Camera, AttendanceLog.camera_id == Camera.id)
        .order_by(AttendanceLog.timestamp.desc())
        .limit(10)
    )
    results = session.exec(statement).all()
    logs = []
    for log, user_name, camera_name in results:
        logs.append({
            "id": log.id,
            "user_name": user_name,
            "camera_name": camera_name,
            "status": log.status,
            "timestamp": log.timestamp
        })
    return logs

@router.get("/export")
def export_reports(
    start_date: str, 
    end_date: str, 
    format: str = "csv", 
    session: Session = Depends(get_session)
):
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date).replace(hour=23, minute=59, second=59)
        
        statement = (
            select(AttendanceLog, User.name.label("user_name"), User.employee_id, Camera.name.label("camera_name"))
            .join(User, AttendanceLog.user_id == User.id)
            .join(Camera, AttendanceLog.camera_id == Camera.id)
            .where(AttendanceLog.timestamp >= start_dt)
            .where(AttendanceLog.timestamp <= end_dt)
            .order_by(AttendanceLog.timestamp.asc())
        )
        results = session.exec(statement).all()
        
        data = []
        for log, user_name, emp_id, cam_name in results:
            data.append({
                "Timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "Employee ID": emp_id,
                "Name": user_name,
                "Camera": cam_name,
                "Status": log.status
            })
        
        df = pd.DataFrame(data)
        
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, f"attendance_report_{start_date}_to_{end_date}")

        if format == "csv":
            file_path += ".csv"
            df.to_csv(file_path, index=False)
            return FileResponse(file_path, filename=f"VisionAttend_Report_{start_date}.csv")
        
        elif format == "xlsx":
            file_path += ".xlsx"
            df.to_excel(file_path, index=False)
            return FileResponse(file_path, filename=f"VisionAttend_Report_{start_date}.xlsx")
        
        elif format == "pdf":
            file_path += ".pdf"
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = []
            
            # Header
            elements.append(Paragraph(f"VisionAttend Attendance Report", styles['Title']))
            elements.append(Paragraph(f"Period: {start_date} to {end_date}", styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Table
            table_data = [["Timestamp", "ID", "Name", "Camera", "Status"]]
            for row in data:
                table_data.append([row["Timestamp"], row["Employee ID"], row["Name"], row["Camera"], row["Status"]])
            
            t = Table(table_data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            elements.append(t)
            doc.build(elements)
            return FileResponse(file_path, filename=f"VisionAttend_Report_{start_date}.pdf")
            
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
