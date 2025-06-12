# src/routers/marketplace.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import schemas, models
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.post(
    "/",
    response_model=schemas.MarketplaceItemOut,
    status_code=status.HTTP_201_CREATED
)
def list_item(
    item: schemas.MarketplaceItemCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    # sprawdź, że to Twój rysunek
    d = db.query(models.Drawing).filter(
        models.Drawing.id == item.drawing_id,
        models.Drawing.user_id == user.id
    ).first()
    if not d:
        raise HTTPException(status_code=400, detail="Nie masz takiego rysunku")
    # utwórz wpis na marketplace
    db_i = models.MarketplaceItem(
        drawing_id = d.id,
        seller_id  = user.id,
        name       = d.name,
        image_data_url = d.image_data_url,
        width      = d.width,
        height     = d.height,
        price      = item.price,
        category   = item.category,
        description= item.description,
        status     = "listed"
    )
    # opcjonalnie: usuń z drawings, jeśli chcesz przenieść rekord
    db.add(db_i)
    db.delete(d)
    db.commit()
    db.refresh(db_i)
    return db_i

@router.get(
    "/",
    response_model=List[schemas.MarketplaceItemOut]
)
def read_items(db: Session = Depends(get_db)):
    return db.query(models.MarketplaceItem)\
             .filter(models.MarketplaceItem.status == "listed")\
             .all()


@router.post("/buy/{item_id}")
def buy_item(
        item_id: int,
        db: Session = Depends(get_db),
        buyer: models.User = Depends(get_current_user)
):
    # Pobierz NFT z marketplace
    item = db.query(models.MarketplaceItem) \
        .filter_by(id=item_id, status="listed") \
        .first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not available")

    # 🚫 Kupujący nie może być sprzedawcą
    if item.seller_id == buyer.id:
        raise HTTPException(status_code=400, detail="Nie możesz kupić własnej oferty")

    # Pobierz konto sprzedawcy
    seller = db.query(models.User).get(item.seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Sprzedawca nie istnieje")

    # 💸 Sprawdź środki
    if (buyer.cash or 0) < item.price:
        raise HTTPException(status_code=400, detail="Niewystarczające środki")

    # 💸 Transfer pieniędzy
    buyer.cash -= item.price
    seller.cash = (seller.cash or 0) + item.price

    # ✅ Przypisz NFT do kupującego
    new_drawing = models.Drawing(
        user_id=buyer.id,
        name=item.name,
        image_data_url=item.image_data_url,
        width=item.width,
        height=item.height,
    )
    db.add(new_drawing)

    # Oznacz jako sprzedane
    item.status = "sold"

    # Zapisz wszystko
    db.commit()
    return {"message": "Zakup zakończony sukcesem"}


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def unlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    # Znajdź wystawiony przedmiot
    item = db.query(models.MarketplaceItem)\
             .filter_by(id=item_id, status="listed")\
             .first()

    # Sprawdź czy istnieje i czy jest "listed"
    if not item:
        raise HTTPException(status_code=404, detail="Brak takiej oferty")

    # Sprawdź czy użytkownik to właściciel
    if item.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Nie możesz cofnąć czyjejś oferty")

    # 🎨 Przywróć rysunek użytkownikowi
    restored = models.Drawing(
        user_id        = user.id,
        name           = item.name,
        image_data_url = item.image_data_url,
        width          = item.width,
        height         = item.height
    )
    db.add(restored)

    # ❌ Usuń z marketplace
    db.delete(item)

    db.commit()
