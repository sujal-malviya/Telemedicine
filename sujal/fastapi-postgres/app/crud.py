from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user: schemas.UserCreate):
    # Hash the password
    hashed_password = pwd_context.hash(user.password)
    
    # Create user model instance
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    
    # Add and commit
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user




def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve a list of doctors from the database
    
    :param db: Database session
    :param skip: Number of records to skip (for pagination)
    :param limit: Maximum number of records to return
    :return: List of doctor users
    """
    return (
        db.query(models.User)
        .filter(models.User.role == 'doctor')
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_user(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve a list of doctors from the database
    
    :param db: Database session
    :param skip: Number of records to skip (for pagination)
    :param limit: Maximum number of records to return
    :return: List of doctor users
    """
    return (
        db.query(models.User)
        .filter(models.User.role == 'patient')
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_user_by_id(db: Session, user_id: int) -> models.User:
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate, patient_id: int) -> models.Appointment:
    new_appointment = models.Appointment(
        doctor_id=appointment.doctor_id,
        patient_id=patient_id,
        description=appointment.description,
        status="pending"
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment

def get_appointments_by_patient(db: Session, patient_id: int):
    return db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).all()

def get_appointments_by_doctor(db: Session, doctor_id: int):
    return db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_id).all()

def update_appointment_status(db: Session, appointment_id: int, doctor_id: int, status: str) -> models.Appointment:
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id, models.Appointment.doctor_id == doctor_id
    ).first()
    if appointment is None:
        raise ValueError("Appointment not found or unauthorized access.")
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return appointment

def get_appointment_by_id(db: Session, appointment_id: int) -> models.Appointment:
    return db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
