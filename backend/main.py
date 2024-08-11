from pathlib import Path
from fastapi import FastAPI

# Include service routes
from routers.health import health_router

app = FastAPI(title="OpenEvals")


app.include_router(health_router, prefix='/health')
app.include_router(health_router)

# Only for debug purposes
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
