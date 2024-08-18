from datetime import datetime
from typing import List, Optional

from controllers.evals import run_eval_task
from controllers.jwt import validate_optional_token, validate_token
from db.db import get_db
from db.models import (
    Eval,
    EvalRun,
    EvalRunStatus,
    EvalUpvote,
    TaskInstance,
    TaskInstanceOutput,
    eval_authors,
    EvalUpvote,
    Author,
)
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from validation_schemas.evals import (
    EvalListItemResponseSchema,
    EvalResponseSchema,
    EvalRunResponseSchema,
    EvalSchema,
    EvalUpdateSchema,
    EvalUpvotesResponseSchema,
)

evals_router = APIRouter()


def get_or_create_author(db, user):
    """Get or create new author entry"""
    author = db.query(Author).filter(Author.user_id == user.id).first()
    if not author:
        author = db.query(Author).filter(Author.email == user.email).first()
    if not author:
        author = Author(
            username=user.username,
            email=user.email,
            avatar=user.github_avatar,
            github_login=user.github_login,
            user_id=user.id,
        )
        db.add(author)
    else:
        author.username = user.username
        author.email = user.email
        author.avatar = user.github_avatar
        author.github_login = user.github_login
    db.commit()
    return author


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
        name=eval.name,
        description=eval.description,
        validator_type=eval.validator_type,
        owner_id=auth["user"].id,
    )
    db.add(new_eval)

    try:
        # Register all associated task instances
        for task in eval.task_instances:
            new_task_instance = TaskInstance(
                is_public=task.is_public,
                input=task.input,
                ideal=task.ideal,
                system_prompt=eval.model_systems[0].system_prompt,
                eval=new_eval,
                owner_id=auth["user"].id,
            )
            db.add(new_task_instance)

        # Register all associated runs per model
        for model in eval.model_systems:
            new_eval_run = EvalRun(
                score=0,
                datetime=datetime.now(),
                validator_type=eval.validator_type,
                status=EvalRunStatus.Queued,
                model_id=model.model_id,
                eval=new_eval,
                owner_id=auth["user"].id,
            )
            db.add(new_eval_run)
        db.commit()

        # Add author/eval relationship
        author = get_or_create_author(db, auth["user"])
        new_author_eval = eval_authors.insert().values(
            author_id=author.id, eval_id=new_eval.id
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
        .options(
            joinedload(EvalRun.task_instance_outputs).joinedload(
                TaskInstanceOutput.task_instance
            )
        )
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
            "authors": eval.authors,
        }
        for eval in evals
    ]
    return results


@evals_router.get(
    "/created",
    response_model=List[EvalListItemResponseSchema],
    status_code=200,
)
def get_user_evals(
    db: Session = Depends(get_db), auth: dict = Depends(validate_token)
) -> dict:
    """
    Get evals that a user has created
    """
    author = get_or_create_author(db, auth["user"])
    evals = author.authored_evals
    return get_evals_upvoted(evals, auth)


@evals_router.get(
    "/upvoted",
    response_model=List[EvalListItemResponseSchema],
    status_code=200,
)
def get_user_evals(
    db: Session = Depends(get_db), auth: dict = Depends(validate_token)
) -> dict:
    """
    Get evals that a user has upvoted
    """
    evals = auth["user"].eval_upvotes
    upvoted_evals = [
        {
            "id": eval.eval.id,
            "name": eval.eval.name,
            "description": eval.eval.description,
            "validator_type": eval.eval.validator_type,
            "upvotes": eval.eval.upvotes,
            "upvoted": True,
            "authors": eval.eval.authors,
        }
        for eval in evals
    ]
    return upvoted_evals


@evals_router.get(
    "/all", response_model=List[EvalListItemResponseSchema], status_code=200
)
def get_evals(
    db: Session = Depends(get_db), auth: dict = Depends(validate_optional_token)
) -> dict:
    """
    Get all evals
    """
    evals = db.query(Eval).options(joinedload(Eval.authors)).all()
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
        db.query(Eval)
        .filter(Eval.description.ilike(f"%{query}%"))
        .options(joinedload(Eval.authors))
        .all()
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


@evals_router.get(
    "/trending", response_model=List[EvalListItemResponseSchema], status_code=200
)
def get_trending_evals(
    db: Session = Depends(get_db),
    auth: dict = Depends(validate_optional_token),
    limit=20,
) -> List[Eval]:
    """
    Get top 20 trending evals with the most votes
    """
    evals = (
        db.query(Eval)
        .order_by(Eval.upvotes.desc())
        .limit(limit)
        .options(joinedload(Eval.authors))
        .all()
    )
    if evals:
        return get_evals_upvoted(evals, auth)
    raise HTTPException(status_code=404, detail={"error": "evals-not-found"})


@evals_router.delete("/{eval_id}")
def delete_eval(
    eval_id: int,
    db: Session = Depends(get_db),
    auth: dict = Depends(validate_token),
) -> JSONResponse:
    """
    Delete an evaluation and its associated data if the current user is an author
    """
    eval = (
        db.query(Eval)
        .options(
            joinedload(Eval.task_instances),
            joinedload(Eval.eval_runs),
            joinedload(Eval.authors),
        )
        .filter(Eval.id == eval_id)
        .first()
    )

    if not eval:
        raise HTTPException(status_code=404, detail={"error": "eval-not-found"})

    if auth["user"] not in eval.authors:
        raise HTTPException(status_code=403, detail={"error": "not-authorized"})

    try:
        for task_instance in eval.task_instances:
            db.query(TaskInstanceOutput).filter(
                TaskInstanceOutput.task_instance_id == task_instance.id
            ).delete()
        db.query(TaskInstance).filter(TaskInstance.eval_id == eval_id).delete()

        for eval_run in eval.eval_runs:
            db.query(TaskInstanceOutput).filter(
                TaskInstanceOutput.eval_run_id == eval_run.id
            ).delete()
        db.query(EvalRun).filter(EvalRun.eval_id == eval_id).delete()

        db.query(EvalUpvote).filter(EvalUpvote.eval_id == eval_id).delete()

        db.delete(eval)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=400, detail={"error": "eval-delete-failed"}
        ) from error

    return JSONResponse(
        content={
            "status": "success",
            "message": f"Eval {eval_id} has been successfully deleted",
        },
        status_code=200,
    )


@evals_router.put("/{eval_id}", response_model=EvalResponseSchema)
def update_eval(
    eval_id: int,
    eval_update: EvalUpdateSchema,
    db: Session = Depends(get_db),
    auth: dict = Depends(validate_token),
) -> Eval:
    """
    Update an evaluation if the current user is an author
    """
    eval = (
        db.query(Eval)
        .options(joinedload(Eval.authors))
        .filter(Eval.id == eval_id)
        .first()
    )

    if not eval:
        raise HTTPException(status_code=404, detail={"error": "eval-not-found"})

    if auth["user"] not in eval.authors:
        raise HTTPException(status_code=403, detail={"error": "not-authorized"})

    # Update fields if provided
    if eval_update.name is not None:
        eval.name = eval_update.name
    if eval_update.description is not None:
        eval.description = eval_update.description
    if eval_update.validator_type is not None:
        eval.validator_type = eval_update.validator_type

    try:
        db.commit()
        db.refresh(eval)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=400, detail={"error": "eval-update-failed"}
        ) from error

    return eval
