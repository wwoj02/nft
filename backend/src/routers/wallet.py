# routers/wallet.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
import models

router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.post("/deposit")
def deposit(amount: float,
            db: Session = Depends(get_db),
            user: models.User = Depends(get_current_user)):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0.")
    user.cash = (user.cash or 0) + amount
    db.commit()
    return {"cash": float(user.cash)}
