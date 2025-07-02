from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.extractor import router as extractor_router

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(extractor_router)

@app.get("/")
def root():
    return {"message": "YouTube Comment Extractor API is running"}
