# schemas.py
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel

# --- Users ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(UserBase):
    id: int
    created_at: datetime
    cash: Optional[Decimal] = Decimal(0)

    class Config:
        orm_mode = True

# --- Deposit ---
class DepositRequest(BaseModel):
    amount: Decimal

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

    class Config:
        orm_mode = True

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
    seller_id: int
    seller_username: str   # nowa własność
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
