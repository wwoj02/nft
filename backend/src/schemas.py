# schemas.py
from datetime import datetime
from decimal import Decimal
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
    cash: Decimal

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
class MarketplaceItemCreate(BaseModel):
    drawing_id: int
    price: Decimal
    category: str
    description: str

class MarketplaceItemOut(BaseModel):
    id: int
    name: str
    image_data_url: str
    width: int
    height: int
    seller_id: int
    price: Decimal
    category: str
    description: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
