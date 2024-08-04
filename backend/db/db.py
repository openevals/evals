import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

if os.path.exists(".env"):
    load_dotenv(dotenv_path=".env", override=True)
    print("Environment loaded successfully")
else:
    print("Warning: .env not found!")

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
