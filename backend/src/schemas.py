# schemas.py
from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict

# --- Users ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    # Pydantic v2: zamiast Config.orm_mode
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Drawings ---
class DrawingBase(BaseModel):
    name: str
    image_data_url: str
    width: int
    height: int

class DrawingCreate(DrawingBase):
    pass

class Drawing(DrawingBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Marketplace ---
class MarketplaceItemBase(BaseModel):
    drawing_id: int
    price: Decimal
    category: str
    description: str

class MarketplaceItemCreate(MarketplaceItemBase):
    pass

class MarketplaceItem(MarketplaceItemBase):
    id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
