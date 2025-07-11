from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.routes.extractor import router as extractor_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extractor_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting YouTube Comment Extractor API")

@app.get("/")
async def root():
    return {"message": "YouTube Comment Extractor API"}