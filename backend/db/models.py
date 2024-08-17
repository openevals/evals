from enum import Enum

from db import Base
from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Float, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

eval_authors = Table(
    "eval_authors",
    Base.metadata,
    Column("author_id", Integer, ForeignKey("authors.id"), primary_key=True),
    Column("eval_id", Integer, ForeignKey("evals.id"), primary_key=True),
)


class ValidatorType(Enum):
    Includes = "Includes"
    ExactMatch = "ExactMatch"
    FuzzyMatch = "FuzzyMatch"
    MultipleChoice = "MultipleChoice"
    ModelGraded = "ModelGraded"
    Custom = "Custom"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    affiliation = Column(String, nullable=True)
    github_access_token = Column(String, nullable=True)
    github_id = Column(Integer, unique=True, nullable=True)
    github_login = Column(String, nullable=True)
    github_avatar = Column(String, nullable=True)
    author = relationship("Author", back_populates="user")
    eval_upvotes = relationship("EvalUpvote", back_populates="user")
    evals = relationship("Eval", back_populates="owner")
    task_instances = relationship("TaskInstance", back_populates="owner")
    eval_runs = relationship("EvalRun", back_populates="owner")
    created_at = Column(DateTime, server_default=func.now())


class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    avatar = Column(String, nullable=True)
    github_login = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="author")
    authored_evals = relationship(
        "Eval", secondary=eval_authors, back_populates="authors"
    )
    created_at = Column(DateTime, server_default=func.now())


class Model(Base):
    __tablename__ = "models"
    id = Column(Integer, primary_key=True)
    model_developer = Column(String, nullable=False)
    model_name = Column(String, nullable=False)
    eval_runs = relationship("EvalRun", back_populates="model")
    outputs = relationship("TaskInstanceOutput", back_populates="model")
    created_at = Column(DateTime, server_default=func.now())


class Eval(Base):
    __tablename__ = "evals"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    validator_type = Column(SQLAlchemyEnum(ValidatorType), nullable=False)
    upvotes = Column(Integer, nullable=False, default=0)
    primary_author = Column(String, nullable=True)
    authors = relationship(
        "Author", secondary=eval_authors, back_populates="authored_evals"
    )
    task_instances = relationship("TaskInstance", back_populates="eval")
    eval_runs = relationship("EvalRun", back_populates="eval")
    user_upvotes = relationship("EvalUpvote", back_populates="eval")
    # Ownership information
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="evals")
    created_at = Column(DateTime, server_default=func.now())


class EvalUpvote(Base):
    __tablename__ = "evals_upvotes"
    id = Column(Integer, primary_key=True)
    eval_id = Column(Integer, ForeignKey("evals.id"), nullable=False)
    eval = relationship("Eval", back_populates="user_upvotes")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="eval_upvotes")
    created_at = Column(DateTime, server_default=func.now())


class TaskInstance(Base):
    __tablename__ = "task_instances"
    id = Column(Integer, primary_key=True)
    is_public = Column(Boolean, nullable=False, default=False)
    input = Column(String, nullable=False)
    ideal = Column(
        String, nullable=False
    )  # ideal output that will be validated against
    system_prompt = Column(String, nullable=True)
    user_prompt = Column(String, nullable=True)

    eval_id = Column(Integer, ForeignKey("evals.id"), nullable=False)
    eval = relationship("Eval", back_populates="task_instances")
    outputs = relationship("TaskInstanceOutput", back_populates="task_instance")
    # Ownership information
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="task_instances")
    created_at = Column(DateTime, server_default=func.now())


class EvalRunStatus(Enum):
    Queued = "Queued"
    Running = "Running"
    Failed = "Failed"
    Finished = "Finished"


class TaskInstanceOutput(Base):
    __tablename__ = "task_instance_outputs"
    id = Column(Integer, primary_key=True)
    output = Column(String, nullable=False)
    status = Column(
        SQLAlchemyEnum(EvalRunStatus), nullable=False, default=EvalRunStatus.Queued
    )
    task_instance_id = Column(Integer, ForeignKey("task_instances.id"), nullable=False)
    task_instance = relationship("TaskInstance", back_populates="outputs")
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    model = relationship("Model", back_populates="outputs")
    num_tokens = Column(Integer, nullable=False)
    eval_run_id = Column(Integer, ForeignKey("eval_runs.id"), nullable=False)
    eval_run = relationship("EvalRun", back_populates="task_instance_outputs")
    created_at = Column(DateTime, server_default=func.now())


class EvalRun(Base):
    __tablename__ = "eval_runs"
    id = Column(Integer, primary_key=True)
    score = Column(Float, nullable=False)
    datetime = Column(DateTime, nullable=False)
    validator_type = Column(SQLAlchemyEnum(ValidatorType), nullable=False)
    status = Column(
        SQLAlchemyEnum(EvalRunStatus), nullable=False, default=EvalRunStatus.Queued
    )
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    model = relationship("Model", back_populates="eval_runs")
    eval_id = Column(Integer, ForeignKey("evals.id"), nullable=False)
    eval = relationship("Eval", back_populates="eval_runs")
    task_instance_outputs = relationship(
        "TaskInstanceOutput", back_populates="eval_run"
    )
    # Ownership information
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="eval_runs")
    created_at = Column(DateTime, server_default=func.now())


class OAuth2Sates(Base):
    __tablename__ = "oauth_states"
    id = Column(Integer, primary_key=True)
    state = Column(String, nullable=False)
