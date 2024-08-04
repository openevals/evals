from enum import Enum

from sqlalchemy import Boolean, Column
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Float, ForeignKey, Integer, String, Table
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Association table
eval_authors = Table(
    "eval_authors",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("eval_id", Integer, ForeignKey("evals.id"), primary_key=True),
)


class ValidatorType(Enum):
    Match = "Match"
    MultipleChoice = "MultipleChoice"
    ExactMatch = "ExactMatch"
    FuzzyMatch = "FuzzyMatch"
    ModelGraded = "ModelGraded"
    Custom = "Custom"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    affiliation = Column(String)

    authored_evals = relationship(
        "Eval", secondary=eval_authors, back_populates="authors"
    )


class Model(Base):
    __tablename__ = "models"
    id = Column(Integer, primary_key=True)
    model_developer = Column(String, nullable=False)
    model_name = Column(String, nullable=False)
    eval_runs = relationship("EvalRun", back_populates="model")


class Eval(Base):
    __tablename__ = "evals"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    system_prompt = Column(String)
    validator_type = Column(SQLAlchemyEnum(ValidatorType), nullable=False)

    authors = relationship(
        "User", secondary=eval_authors, back_populates="authored_evals"
    )
    task_instances = relationship("TaskInstance", back_populates="eval")
    eval_runs = relationship("EvalRun", back_populates="eval")


class TaskInstance(Base):
    __tablename__ = "task_instances"
    id = Column(Integer, primary_key=True)
    is_public = Column(Boolean, nullable=False, default=False)
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
    validator_type = Column(SQLAlchemyEnum(ValidatorType), nullable=False)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    model = relationship("Model", back_populates="eval_runs")
    eval_id = Column(Integer, ForeignKey("evals.id"), nullable=False)
    eval = relationship("Eval", back_populates="eval_runs")
