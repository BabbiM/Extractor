from fastapi import APIRouter, HTTPException
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

fake_db = {"admin": "admin123"}

@router.post("/login")
def login(user: User):
    if fake_db.get(user.username) == user.password:
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")
