from datetime import datetime
from backend.db.db import SessionLocal
from backend.db.models import Eval, TaskInstanceOutput, EvalRunStatus
from backend.models.model_provider import query, ModelQueryInput, ModelProviderType, ModelProvider
from backend.controllers.validation import validate_response


def run_eval_task(eval_id):
    ''' Run the eval as background task '''
    db = SessionLocal()
    try:
        # Look for the target eval
        eval = db.query(Eval).filter(Eval.id == eval_id).first()
        if eval:
            # Iterate over all eval runs
            for eval_run in eval.eval_runs:
                try:
                    model_provider = ModelProviderType[eval_run.model.model_developer.upper(
                    )]
                    model_query = ModelQueryInput(
                        model_provider=model_provider,
                        model_name=eval_run.model.model_name,
                        input_message="",
                        temperature=None,
                        max_tokens=None,
                        stop_sequences=None,
                        api_key=ModelProvider._api_key(
                            model_provider=model_provider),
                    )

                    # Update the eval run status
                    eval_run.status = EvalRunStatus.Running
                    eval_run.datetime = datetime.now()
                    db.commit()

                    # Iterate all task instances
                    valid_responses = 0
                    for task_instance in eval.task_instances:
                        try:
                            # Call the model for the task instance
                            model_query.input_message = task_instance.input
                            [input_data, output_data] = query(model_query)

                            # Check if the response is valid
                            is_valid = validate_response(
                                eval.validator_type, task_instance.ideal, output_data.value)
                            if is_valid:
                                valid_responses += 1

                            # Generate the output object
                            task_instance_output = TaskInstanceOutput(
                                output=output_data.value,
                                status=EvalRunStatus.Finished,
                                task_instance_id=task_instance.id,
                                model_id=eval_run.model.id,
                                num_tokens=input_data.num_tokens + output_data.num_tokens,
                                eval_run_id=eval_run.id
                            )
                        except Exception as e:
                            print(f"Error querying the model: {e}")
                            # Generate the output object with the error message
                            task_instance_output = TaskInstanceOutput(
                                output=e,
                                status=EvalRunStatus.Failed,
                                task_instance_id=task_instance.id,
                                model_id=eval_run.model.id,
                                num_tokens=0,
                                eval_run_id=eval_run.id
                            )

                        db.add(task_instance_output)
                        db.commit()

                    # Update the eval run object
                    eval_run.score = valid_responses/len(eval.task_instances)
                    eval_run.datetime = datetime.now()
                    eval_run.status = EvalRunStatus.Finished
                    db.commit()
                except Exception as e:
                    print(f"Error processing the eval run: {e}")
                    eval_run.status = EvalRunStatus.Failed
                    db.commit()

        else:
            raise Exception('Eval object not found')
    except Exception as e:
        print(f"Error processing eval execution for ID={eval_id}: {e}")
    finally:
        db.close()
