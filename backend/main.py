from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Include service routes
from backend.routers.health import health_router
from backend.routers.models import models_router
from backend.routers.evals import evals_router

app = FastAPI(title="OpenEvals")

# Configure CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix='/health')
app.include_router(models_router, prefix='/models')
app.include_router(evals_router, prefix='/evals')
app.include_router(health_router)

# Only for debug purposes
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
