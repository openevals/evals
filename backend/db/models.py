from enum import Enum

from sqlalchemy import ARRAY, Boolean, Column
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.db.base import Base


class ValidatorType(Enum):
    ExactMatch = "ExactMatch"
    FuzzyMatch = "FuzzyMatch"
    ModelGraded = "ModelGraded"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    affiliation = Column(String)

    secrets = relationship("Secret", back_populates="user")
    authored_evals = relationship("Eval", back_populates="authors")


class Model(Base):
    __tablename__ = "models"
    id = Column(Integer, primary_key=True)
    model_developer = Column(String, nullable=False)
    model_name = Column(String, nullable=False)


class Eval(Base):
    __tablename__ = "evals"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    system_prompt = Column(String)

    authors = relationship("User", back_populates="authored_evals")
    task_instances = relationship("TaskInstance", back_populates="eval")
    validators = Column(ARRAY(SQLAlchemyEnum(ValidatorType)), nullable=False)
    eval_runs = relationship("EvalRun", back_populates="eval")


class TaskInstance(Base):
    __tablename__ = "task_instances"
    is_public = Column(Boolean, nullable=False, default=False)
    id = Column(Integer, primary_key=True)
    input = Column(String, nullable=False)
    system_prompt = Column(String)  # overrides eval system prompt
    user_prompt = Column(String)  # task-specific user prompt
    ideal = Column(
        String, nullable=False
    )  # ideal output that will be validated against

    eval_id = Column(Integer, ForeignKey("evals.id"), nullable=False)
    eval = relationship("Eval", back_populates="task_instances")


class EvalRun(Base):
    __tablename__ = "eval_runs"
    id = Column(Integer, primary_key=True)
    score = Column(Float, nullable=False)

    eval_id = Column(Integer, ForeignKey("evals.id"), nullable=False)
    eval = relationship("Eval", back_populates="eval_runs")
    validator_id = Column(Integer, ForeignKey("validators.id"), nullable=False)
    validator = relationship("Validator")


class Secret(Base):
    __tablename__ = "secrets"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="secrets")
