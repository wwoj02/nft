# main.py :contentReference[oaicite:2]{index=2}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import auth, drawings, marketplace
from routers import users  # import nowego routera

# Tworzę tabele w bazie (raz, przy starcie)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rejestruję wszystkie routery
app.include_router(auth.router)
app.include_router(drawings.router)
app.include_router(marketplace.router)
app.include_router(users.router)  # rejestracja endpointu /users/deposit
