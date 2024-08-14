import json
import logging
from pathlib import Path
from typing import Generator, List

import yaml

from backend.db.db import SessionLocal
from backend.db.models import Eval, TaskInstance, ValidatorType

JSONL_DATA_PATH = "/Users/amydeng/Documents/Projects/openai-evals/evals/registry/data"
YAML_PATH = "/Users/amydeng/Documents/Projects/openai-evals/evals/registry/evals"

logger = logging.getLogger(__name__)


class OpenAIIntegration:

    def get_eval_class(self, yaml_data: dict) -> str | None:
        root_key = next(iter(yaml_data))
        eval_id = yaml_data[root_key].get("id")

        if eval_id and eval_id in yaml_data:
            return yaml_data[eval_id].get("class", "")

        return None

    def parse_metadata(self, path: Path) -> dict:
        with open(path, "r") as file:
            yaml_data = yaml.safe_load(file)
            eval_class = self.get_eval_class(yaml_data)

            yaml_data["eval_class"] = eval_class

            return yaml_data

    def parse_samples(self, path: Path) -> List[dict]:
        samples = []
        with open(path, "r") as file:
            for line in file:
                samples.append(json.loads(line))
        return samples

    def create_eval(self, metadata: dict) -> Eval:
        eval_key = next(iter(metadata))
        eval_data = metadata[eval_key]
        eval_class = metadata.get("eval_class", "")
        print(f"Eval class: {eval_class}")

        validator_type = self.map_class_to_validator_type(eval_class)

        return Eval(
            name=eval_key,
            description=eval_data.get("description", ""),
            validator_type=validator_type,
        )

    def map_class_to_validator_type(self, eval_class: str) -> ValidatorType | None:
        eval_class_lower = eval_class.lower()

        if "exactmatch" in eval_class_lower:
            return ValidatorType.ExactMatch
        elif "includes" in eval_class_lower:
            return ValidatorType.Includes
        elif "fuzzymatch" in eval_class_lower:
            return ValidatorType.FuzzyMatch
        elif "match" in eval_class_lower:
            return ValidatorType.FuzzyMatch
        elif "modelgraded" in eval_class_lower:
            return ValidatorType.ModelGraded
        elif "multiplechoice" in eval_class_lower:
            return ValidatorType.MultipleChoice
        else:
            print(f"Unable to map eval class to validator type: {eval_class}")
            return ValidatorType.Custom

    def create_task_instances(
        self, eval: Eval, samples: List[dict]
    ) -> List[TaskInstance]:
        task_instances = []
        for sample in samples:
            input_messages = sample.get("input", [])
            system_prompt = ""
            user_input = ""

            for message in input_messages:
                if message["role"] == "system":
                    system_prompt += message["content"] + "\n\n"
                elif message["role"] == "user":
                    user_input += message["content"] + "\n\n"

            system_prompt = system_prompt.strip()
            user_input = user_input.strip()

            task_instances.append(
                TaskInstance(
                    eval=eval,
                    input=user_input,
                    system_prompt=system_prompt,
                    ideal=sample.get("ideal", ""),
                    is_public=True,
                )
            )
        return task_instances

    def get_openai_evals(self) -> Generator[tuple[Path, Path], None, None]:
        yaml_dir = Path(YAML_PATH)
        jsonl_dir = Path(JSONL_DATA_PATH)
        for yaml_file in yaml_dir.glob("*.yaml"):
            yaml_name = yaml_file.stem
            jsonl_file = None
            for potential_dir in jsonl_dir.iterdir():
                if potential_dir.is_dir() and potential_dir.name.startswith(yaml_name):
                    potential_file = potential_dir / "samples.jsonl"
                    if potential_file.exists():
                        jsonl_file = potential_file
                        break
            if jsonl_file:
                yield yaml_file, jsonl_file
            else:
                print(f"Warning: No matching samples.jsonl file found for {yaml_file}")

    @staticmethod
    def main():
        logging.basicConfig(level=logging.INFO)
        integration = OpenAIIntegration()
        with SessionLocal() as db:
            for yaml_file, jsonl_file in integration.get_openai_evals():
                logger.info(f"Processing: {yaml_file.name} with {jsonl_file}")

                try:
                    metadata = integration.parse_metadata(yaml_file)
                    samples = integration.parse_samples(jsonl_file)

                    eval_obj = integration.create_eval(metadata)
                    logger.info(
                        f"Eval: {eval_obj.name} (Type: {eval_obj.validator_type})"
                    )
                    logger.info(f"Description: {eval_obj.description[:100]}...")

                    db.add(eval_obj)
                    db.flush()
                    task_instances = integration.create_task_instances(
                        eval_obj, samples
                    )
                    db.add_all(task_instances)

                    logger.info(f"Total TaskInstances: {len(task_instances)}")
                    for i, task in enumerate(task_instances[:3], 1):
                        logger.info(f"\nTaskInstance {i}:")
                        logger.info(f"System Prompt: {task.system_prompt[:50]}...")
                        logger.info(f"User Input: {task.input[:50]}...")
                        logger.info(f"Ideal: {task.ideal[:50]}...")

                    if len(task_instances) > 3:
                        logger.info("\n... (more TaskInstances)")

                    try:
                        db.commit()
                        logger.info(
                            f"Successfully added {yaml_file.name} to the database."
                        )
                    except Exception as e:
                        db.rollback()
                        logger.error(
                            f"Error committing {yaml_file.name} to database: {str(e)}"
                        )
                        logger.error("Rolling back and continuing with next eval.")
                except Exception as e:
                    logger.error(f"Error processing {yaml_file.name}: {str(e)}")
                    logger.error("Continuing with next eval.")

        logger.info("Finished processing all evals.")


if __name__ == "__main__":
    OpenAIIntegration.main()
