# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import auth, drawings, marketplace

# tworzę tabele w bazie (raz, przy starcie)
models.Base.metadata.create_all(bind=engine)

# tylko JEDNO FastAPI()
app = FastAPI()

# CORS — pozwalam na żądania z React dev-servera
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # uwaga: dokładnie małe litery
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# rejestruję wszystkie routery
app.include_router(auth.router)
app.include_router(drawings.router)
app.include_router(marketplace.router)