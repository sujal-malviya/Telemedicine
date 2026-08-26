from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str

    @validator('role')
    def validate_role(cls, v):
        if v.lower() not in ['patient', 'doctor']:
            raise ValueError('Role must be either "patient" or "doctor"')
        return v.lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True


class DoctorResponse(BaseModel):
    """
    Specialized schema for returning doctor information
    Excludes sensitive information like password
    """
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True


class AppointmentBase(BaseModel):
    doctor_id: int
    description: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    status: str

    class Config:
        orm_mode = True
