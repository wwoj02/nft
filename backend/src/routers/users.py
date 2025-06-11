# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal

import schemas, models
from database import get_db
from dependencies import get_current_user  # get_current_user zwraca models.User :contentReference[oaicite:1]{index=1}

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/deposit", response_model=schemas.User)
def deposit(
    req: schemas.DepositRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if req.amount <= Decimal(0):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Kwota wpłaty musi być dodatnia"
        )
    # Zainicjalizuj saldo, jeśli None
    user.cash = (user.cash or Decimal(0)) + req.amount
    db.commit()
    db.refresh(user)
    return user
