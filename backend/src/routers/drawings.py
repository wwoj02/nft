# routers/drawings.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from PIL import Image
import io, base64

import schemas, models
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/drawings", tags=["drawings"])

@router.get("/", response_model=List[schemas.Drawing])
def read_drawings(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Zwraca wszystkie rysunki (NFT) należące do zalogowanego użytkownika.
    """
    drawings = (
        db.query(models.Drawing)
        .filter(models.Drawing.user_id == user.id)
        .all()
    )
    return drawings

@router.post("/", response_model=schemas.Drawing)
async def create_drawing(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Tworzy nowe NFT z przesłanego pliku obrazka:
    1) Waliduje, że to obraz.
    2) Skalowanie do max 1024×1024px.
    3) Konwersja na data-URL i zapis w bazie.
    """
    # 1) Tylko obrazy
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Można przesłać tylko pliki graficzne")

    content = await file.read()
    try:
        img = Image.open(io.BytesIO(content))
    except Exception:
        raise HTTPException(400, "Nieprawidłowy plik obrazka")

    # 2) Skalowanie (bez utraty proporcji) z użyciem LANCZOS
    max_size = (1024, 1024)
    # Pillow>=10: ANTIALIAS zostało usunięte, używamy Resampling.LANCZOS
    try:
        resample_filter = Image.Resampling.LANCZOS
    except AttributeError:
        # starsze wersje Pillow
        resample_filter = Image.LANCZOS
    img.thumbnail(max_size, resample=resample_filter)

    # 3) Konwersja do data-URL
    buf = io.BytesIO()
    fmt = img.format or "PNG"
    img.save(buf, format=fmt)
    b64 = base64.b64encode(buf.getvalue()).decode()
    data_url = f"data:image/{fmt.lower()};base64,{b64}"

    # 4) Zapis w bazie
    db_drawing = models.Drawing(
        name=name,
        image_data_url=data_url,
        width=img.width,
        height=img.height,
        user_id=user.id,
    )
    db.add(db_drawing)
    db.commit()
    db.refresh(db_drawing)
    return db_drawing
