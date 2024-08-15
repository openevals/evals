import pytest
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from db.db import SessionLocal


def test_sync_db_connection():
    try:
        with SessionLocal() as session:
            result = session.execute(text("SELECT 1")).scalar_one()
            assert result == 1  # nosec B101
    except SQLAlchemyError as e:
        pytest.fail(f"Database connection failed: {e}")
