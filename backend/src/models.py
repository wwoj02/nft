# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric, text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # saldo zawsze NOT NULL, domyślnie 0
    cash = Column(
        Numeric(10, 4),
        nullable=False,
        server_default=text("0")
    )

class Drawing(Base):
    __tablename__ = "drawings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100))
    image_data_url = Column(Text)
    width = Column(Integer)
    height = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    id = Column(Integer, primary_key=True, index=True)
    drawing_id = Column(Integer, ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    price = Column(Numeric(10,4), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="listed", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    seller = relationship("User", lazy="joined")
