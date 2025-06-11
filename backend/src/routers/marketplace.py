# routers/marketplace.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas, models
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.post("/", response_model=schemas.MarketplaceItem)
def list_item(
    item: schemas.MarketplaceItemCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    drawing = (
        db.query(models.Drawing)
        .filter(models.Drawing.id == item.drawing_id, models.Drawing.user_id == user.id)
        .first()
    )
    if not drawing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nie masz takiego rysunku")
    db_item = models.MarketplaceItem(**item.dict(), seller_id=user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return schemas.MarketplaceItem(
        **db_item.__dict__,
        seller_username=db_item.seller.username
    )

@router.get("/", response_model=List[schemas.MarketplaceItem])
def read_items(db: Session = Depends(get_db)):
    # zwracaj tylko te, które są w statusie 'listed'
    offers = (
        db.query(models.MarketplaceItem)
        .filter(models.MarketplaceItem.status == "listed")
        .all()
    )
    # dołącz username sprzedawcy
    return [
        schemas.MarketplaceItem(
            **offer.__dict__,
            seller_username=offer.seller.username
        )
        for offer in offers
    ]

@router.post("/{item_id}/buy", response_model=schemas.MarketplaceItem)
def buy_item(
    item_id: int,
    db: Session = Depends(get_db),
    buyer: models.User = Depends(get_current_user),
):
    offer = (
        db.query(models.MarketplaceItem)
        .filter(models.MarketplaceItem.id == item_id, models.MarketplaceItem.status == "listed")
        .first()
    )
    if not offer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Oferta nie istnieje lub została już zakończona")
    if offer.seller_id == buyer.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nie możesz kupić swojego NFT")
    if buyer.cash is None or buyer.cash < offer.price:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Niewystarczające środki na koncie")

    seller = db.get(models.User, offer.seller_id)
    buyer.cash -= offer.price
    seller.cash += offer.price

    drawing = db.get(models.Drawing, offer.drawing_id)
    drawing.user_id = buyer.id

    offer.status = "sold"
    db.commit()
    db.refresh(offer)
    return schemas.MarketplaceItem(
        **offer.__dict__,
        seller_username=offer.seller.username
    )

@router.delete("/{item_id}", status_code=204)
def withdraw_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    offer = db.query(models.MarketplaceItem).filter(models.MarketplaceItem.id == item_id).first()
    if not offer or offer.status != "listed":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Oferta nie istnieje lub nie można jej wycofać")
    if offer.seller_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Tylko sprzedający może wycofać ofertę")

    offer.status = "withdrawn"
    db.commit()
    return
