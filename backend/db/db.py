import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def load_env_file():
    backend_env = Path(__file__).resolve().parent.parent / ".env"

    if backend_env.exists():
        load_dotenv(dotenv_path=str(backend_env), override=True)
        print(f"Environment loaded successfully from {backend_env}")
    else:
        print(f"Warning: .env not found at {backend_env}")


load_env_file()
db_host = os.getenv("POSTGRESQL_HOST")
db_username = os.getenv("POSTGRESQL_USERNAME")
db_password = os.getenv("POSTGRESQL_PASSWORD")
db_name = os.getenv("POSTGRESQL_DATABASE")
db_ssl = "require" if os.getenv("POSTGRESQL_SSL") == "require" else "prefer"


# Synchronous engine
engine = create_engine(
    f"postgresql+psycopg2://{db_username}:{db_password}@{db_host}/{db_name}",
    isolation_level="READ UNCOMMITTED",
    pool_size=10,
    max_overflow=20,
)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
