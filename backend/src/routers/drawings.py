# routers/drawings.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import schemas, models
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/drawings", tags=["drawings"])

@router.post("/", response_model=schemas.Drawing)
def create_drawing(d: schemas.DrawingCreate,
                   db: Session = Depends(get_db),
                   user: models.User = Depends(get_current_user)):
    db_d = models.Drawing(user_id=user.id, **d.dict())
    db.add(db_d); db.commit(); db.refresh(db_d)
    return db_d

@router.get("/", response_model=List[schemas.Drawing])
def read_drawings(db: Session = Depends(get_db),
                  user: models.User = Depends(get_current_user)):
    return db.query(models.Drawing).filter(models.Drawing.user_id == user.id).all()
