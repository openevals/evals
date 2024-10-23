from asyncio import TimeoutError as TimeoutErrorAsyncio
from asyncio import get_event_loop, wait_for
from logging import Logger

import sqlalchemy as sa
from db.db import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from version import OPENEVALS_VERSION

health_router = APIRouter()

logger = Logger(__name__)


async def wrap_in_executor(component: str, func, *args, timeout=1.0):
    """
    Wrap a function in an async executor to call it adding a timeout to prevent
    function hanging in large requests
    """
    try:
        loop = get_event_loop()
        future = loop.run_in_executor(None, func, *args)
        return await wait_for(future, timeout=timeout)
    except TimeoutErrorAsyncio:
        logger.error(
            "TimeoutError execution in %s running for more than %s seconds",
            component,
            timeout,
        )
        return "timeout"
    except Exception as err:  # pylint: disable=broad-exception-caught
        logger.error("Error in %s: %s", component, err)
        return "failed"


async def check_db_connection(db: Session) -> str:
    """
    Check that database connection is valid. Execute a dummy query to ensure
    connection is opened and can handle queries.
    """
    result = await wrap_in_executor("database", db.execute, sa.text("SELECT 1;"))
    return "success" if not isinstance(result, str) else result


@health_router.get("/", status_code=200)
async def health(db: Session = Depends(get_db)) -> dict:
    """
    Return service version
    """
    # Check the database connection
    try:
        db_status = await check_db_connection(db)
    except Exception as e:
        logger.error("Error in database connection: %s", e)
        db_status = "failed"

    return {"version": OPENEVALS_VERSION, "db": db_status}
