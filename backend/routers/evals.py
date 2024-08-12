from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.db.db import get_db
from backend.db.models import Eval, TaskInstance, EvalRun
from backend.validation_schemas.evals import EvalSchema, EvalResponseSchema

evals_router = APIRouter()


@evals_router.post("/create/", response_model=EvalResponseSchema, status_code=200)
def create_eval(eval: EvalSchema, db: Session = Depends(get_db)) -> dict:
    """
    Create new evaluation
    """
    new_eval = Eval(
        name=eval.name,
        description=eval.description,
        validator_type=eval.validator_type
    )
    db.add(new_eval)
    try:
        # Register all associated task instances
        for task in eval.task_instances:
            new_task_instance = TaskInstance(
                is_public=task.is_public,
                input=task.input,
                ideal=task.ideal,
                eval=new_eval
            )
            db.add(new_task_instance)

        # Register all associated runs per model
        for model in eval.models:
            new_eval_run = EvalRun(
                score=0,
                datetime=datetime.now,
                system_prompt=model.system_prompt if model.system_prompt else eval.system_prompt,
                user_prompt=model.user_prompt if model.user_prompt else eval.user_prompt,
                validator_type=model.validator_type if model.validator_type else eval.validator_type,
                model_id=model.model_id,
                eval=new_eval
            )
            db.add(new_eval_run)
        db.commit()
        return new_eval
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail={
                            'error': 'eval-not-created'})
