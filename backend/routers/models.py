from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.db.db import get_db
from backend.db.models import Model
from backend.validation_schemas.models import ModelSchema

models_router = APIRouter()


@models_router.get("/all/", response_model=List[ModelSchema], status_code=200)
def get_models(db: Session = Depends(get_db)) -> dict:
    """
    Return all registered models
    """
    models = db.query(Model).all()
    return models
