from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging

from app.api.endpoints import router as api_router
from app.websocket.stream import router as ws_router

from app.routes.championship import router as championship_router
from app.routes.track import router as track_router

load_dotenv()
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="PitWall Dashboard API", lifespan=lifespan)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(ws_router)

app.include_router(championship_router, prefix="/api")
app.include_router(track_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to PitWall API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
