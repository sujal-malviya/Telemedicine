from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import engine, get_db
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# # Create tables
models.Base.metadata.create_all(bind=engine)
# Drop existing tables and create new ones
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# Define allowed origins
origins = [
    "http://localhost:3000",
]

# Apply CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user_username = crud.get_user_by_username(db, username=user.username)
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_user_email = crud.get_user_by_email(db, email=user.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role (this is now handled by the Pydantic validator)
    
    # Create user
    return crud.create_user(db=db, user=user)

@app.post("/login")
def login_user(username: str, password: str, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "message": "Login successful", 
        "user_id": user.id, 
        "role": user.role
    }


@app.get("/doctors", response_model=List[schemas.DoctorResponse])
def list_doctors(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Endpoint to retrieve a list of doctors
    
    :param skip: Number of records to skip (for pagination)
    :param limit: Maximum number of doctors to return
    :param db: Database session dependency
    :return: List of doctors
    """
    doctors = crud.get_doctors(db, skip=skip, limit=limit)
    
    # If no doctors found, return an empty list instead of a 404
    return doctors

@app.get("/user", response_model=List[schemas.DoctorResponse])
def list_user(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Endpoint to retrieve a list of doctors
    
    :param skip: Number of records to skip (for pagination)
    :param limit: Maximum number of doctors to return
    :param db: Database session dependency
    :return: List of doctors
    """
    user = crud.get_user(db, skip=skip, limit=limit)
    
    # If no doctors found, return an empty list instead of a 404
    return user


@app.post("/appointments/", response_model=schemas.AppointmentResponse)
def book_appointment(
    appointment: schemas.AppointmentCreate, 
    db: Session = Depends(get_db),
    patient_id: int = None  # Pass patient_id explicitly
):
    """
    Patients can book an appointment with an available doctor.
    """
    # Ensure the user is a patient
    patient = crud.get_user_by_id(db, patient_id)
    if not patient or patient.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments.")
    
    # Check doctor availability
    doctor = crud.get_user_by_id(db, appointment.doctor_id)
    if not doctor or doctor.role != "doctor":
        raise HTTPException(status_code=404, detail="Doctor not found.")
    
    # Create the appointment
    return crud.create_appointment(db, appointment, patient_id)

@app.get("/appointments/", response_model=List[schemas.AppointmentResponse])
def get_appointments(
    db: Session = Depends(get_db),
    user_id: int = None  # Pass user_id explicitly
):
    """
    Patients view their booked appointments.
    Doctors view appointments assigned to them.
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.role == "patient":
        return crud.get_appointments_by_patient(db, user.id)
    elif user.role == "doctor":
        return crud.get_appointments_by_doctor(db, user.id)
    else:
        raise HTTPException(status_code=403, detail="Invalid user role.")

@app.put("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db),
    doctor_id: int = None  # Pass doctor_id explicitly
):
    """
    Doctors accept or reject an appointment.
    """
    doctor = crud.get_user_by_id(db, doctor_id)
    if not doctor or doctor.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update appointment status.")

    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status.")
    
    return crud.update_appointment_status(db, appointment_id, doctor_id, status)

@app.get("/appointments/{appointment_id}/", response_model=schemas.AppointmentResponse)
def get_appointment_details(
    appointment_id: int, 
    db: Session = Depends(get_db), 
    user_id: int = None  # Pass user_id explicitly
):
    """
    Get details of a specific appointment.
    """
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    appointment = crud.get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    # Ensure the user has access to the appointment
    if (
        user.role == "patient" and appointment.patient_id != user.id
    ) or (
        user.role == "doctor" and appointment.doctor_id != user.id
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment.")
    
    return appointment