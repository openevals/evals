from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import update
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from db.db import get_db
from db.models import (
    Eval,
    TaskInstance,
    EvalRun,
    EvalRunStatus,
    eval_authors,
    EvalUpvote,
)
from validation_schemas.evals import (
    EvalSchema,
    EvalResponseSchema,
    EvalRunResponseSchema,
    EvalListItemResponseSchema,
    EvalUpvotesResponseSchema,
)
from controllers.evals import run_eval_task
from controllers.jwt import validate_token, validate_optional_token

evals_router = APIRouter()


@evals_router.post("/create", response_model=EvalResponseSchema, status_code=200)
def create_eval(
    background_tasks: BackgroundTasks,
    eval: EvalSchema,
    db: Session = Depends(get_db),
    auth: dict = Depends(validate_token),
) -> dict:
    """
    Create new evaluation
    """
    new_eval = Eval(
        name=eval.name, description=eval.description, validator_type=eval.validator_type
    )
    db.add(new_eval)

    try:
        # Register all associated task instances
        for task in eval.task_instances:
            new_task_instance = TaskInstance(
                is_public=task.is_public,
                input=task.input,
                ideal=task.ideal,
                eval=new_eval,
            )
            db.add(new_task_instance)

        # Register all associated runs per model
        for model in eval.model_systems:
            new_eval_run = EvalRun(
                score=0,
                datetime=datetime.now(),
                system_prompt=model.system_prompt,
                user_prompt=model.user_prompt,
                validator_type=eval.validator_type,
                status=EvalRunStatus.Queued,
                model_id=model.model_id,
                eval=new_eval,
            )
            db.add(new_eval_run)
        db.commit()

        # Add user/eval relationship
        new_author_eval = eval_authors.insert().values(
            user_id=auth["user"].id, eval_id=new_eval.id
        )
        db.execute(new_author_eval)
        db.commit()

        background_tasks.add_task(run_eval_task, new_eval.id)
        return new_eval
    except Exception as e:
        print(f"Error creating new eval: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail={"error": "eval-not-created"})


@evals_router.get("/{eval_id}/get", response_model=EvalResponseSchema, status_code=200)
def get_eval_details(eval_id: int, db: Session = Depends(get_db)) -> dict:
    """
    Get eval base details
    """
    # Look for the target eval
    eval = db.query(Eval).filter(Eval.id == eval_id).first()
    if eval:
        return eval
    raise HTTPException(status_code=404, detail={"error": "eval-not-found"})


@evals_router.get(
    "/{eval_id}/run/{eval_run_id}/get",
    response_model=EvalRunResponseSchema,
    status_code=200,
)
def get_eval_run_details(
    eval_id: int, eval_run_id: int, db: Session = Depends(get_db)
) -> dict:
    """
    Get eval run result/status details
    """
    # Look for the target eval run
    eval_run = (
        db.query(EvalRun)
        .filter(EvalRun.id == eval_run_id, EvalRun.eval_id == eval_id)
        .first()
    )
    if eval_run:
        return eval_run
    raise HTTPException(status_code=404, detail={"error": "eval-run-not-found"})


def get_evals_upvoted(evals, auth):
    """Check if the evals were upvoted by the current user"""
    if not "user" in auth:
        user_upvotes = []
    else:
        user_upvotes = [upvoted.eval_id for upvoted in auth["user"].eval_upvotes]
    results = [
        {
            "id": eval.id,
            "name": eval.name,
            "description": eval.description,
            "validator_type": eval.validator_type,
            "upvotes": eval.upvotes,
            "upvoted": eval.id in user_upvotes,
        }
        for eval in evals
    ]
    return results


@evals_router.get(
    "/all", response_model=List[EvalListItemResponseSchema], status_code=200
)
def get_evals(
    db: Session = Depends(get_db), auth: dict = Depends(validate_optional_token)
) -> dict:
    """
    Get all evals
    """
    evals = db.query(Eval).all()
    if evals:
        return get_evals_upvoted(evals, auth)

    raise HTTPException(status_code=404, detail={"error": "evals-not-found"})


@evals_router.post(
    "/search", response_model=List[EvalListItemResponseSchema], status_code=200
)
def search_evals(
    query: str,
    db: Session = Depends(get_db),
    auth: dict = Depends(validate_optional_token),
) -> Optional[List[Eval]]:
    """
    Search evals by name and description. Evals with name matches are returned first.
    """
    name_matched_evals = db.query(Eval).filter(Eval.name.ilike(f"%{query}%")).all()
    description_matched_evals = (
        db.query(Eval).filter(Eval.description.ilike(f"%{query}%")).all()
    )
    # dedup the evals while preserving the order
    evals = list(
        {
            eval.id: eval for eval in name_matched_evals + description_matched_evals
        }.values()
    )
    return get_evals_upvoted(evals, auth)


@evals_router.post(
    "/{eval_id}/upvote", response_model=EvalUpvotesResponseSchema, status_code=200
)
def eval_upvote(
    eval_id: int, db: Session = Depends(get_db), auth: dict = Depends(validate_token)
) -> dict:
    """
    Upvote an eval
    """
    # Look for the target eval
    eval = db.query(Eval).filter(Eval.id == eval_id).first()
    if not eval:
        raise HTTPException(status_code=404, detail={"error": "eval-not-found"})

    # Check if the user already has upvoted the eval
    eval_upvote = (
        db.query(EvalUpvote)
        .filter(EvalUpvote.eval_id == eval_id, EvalUpvote.user_id == auth["user"].id)
        .first()
    )
    if not eval_upvote:
        # Register the new upvote
        eval_upvote = EvalUpvote(
            eval_id=eval_id,
            user_id=auth["user"].id,
        )
        db.add(eval_upvote)
        inc = 1
    else:
        db.delete(eval_upvote)
        inc = -1

    # Increment the eval upvotes number
    db.execute(
        update(Eval).where(Eval.id == eval_id).values(upvotes=Eval.upvotes + inc)
    )
    db.commit()

    return {"upvotes": eval.upvotes, "upvoted": inc == 1}
