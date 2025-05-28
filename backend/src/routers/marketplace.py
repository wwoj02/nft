# routers/marketplace.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas, models
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.post("/", response_model=schemas.MarketplaceItem)
def list_item(item: schemas.MarketplaceItemCreate,
              db: Session = Depends(get_db),
              user: models.User = Depends(get_current_user)):
    # sprawdź własność rysunku
    d = db.query(models.Drawing).filter(
        models.Drawing.id == item.drawing_id,
        models.Drawing.user_id == user.id
    ).first()
    if not d:
        raise HTTPException(400, "Nie masz takiego rysunku")
    db_i = models.MarketplaceItem(**item.dict())
    db.add(db_i); db.commit(); db.refresh(db_i)
    return db_i

@router.get("/", response_model=List[schemas.MarketplaceItem])
def read_items(db: Session = Depends(get_db)):
    return db.query(models.MarketplaceItem).all()
