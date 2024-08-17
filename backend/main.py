import uvicorn
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.account import account_router
from routers.evals import evals_router

load_dotenv()

# Include service routes
from routers.health import health_router
from routers.models import models_router
from routers.oauth import oauth_router

docs_url = "/docs" if os.getenv("ENV") != "production" else None
redoc_url = "/redoc" if os.getenv("ENV") != "production" else None
app = FastAPI(title="OpenEvals", docs_url=docs_url, redoc_url=redoc_url)

# Configure CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/health")
app.include_router(models_router, prefix="/models")
app.include_router(evals_router, prefix="/evals")
app.include_router(oauth_router, prefix="/oauth")
app.include_router(account_router, prefix="/account")
app.include_router(health_router)

# Only for debug purposes
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
