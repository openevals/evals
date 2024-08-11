from fastapi import APIRouter
from version import OPENEVALS_VERSION

health_router = APIRouter()


@health_router.get("/", status_code=200)
def health() -> dict:
    """
    Return service version
    """
    return {"version": OPENEVALS_VERSION}
