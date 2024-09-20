import json
import logging
import os
import subprocess
import re
from collections import defaultdict
from pathlib import Path
from typing import Generator, List

import yaml
from db.db import SessionLocal
from db.models import Eval, TaskInstance, Author, ValidatorType, eval_authors
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

JSONL_DATA_PATH = os.getenv(key="JSONL_DATA_PATH")
YAML_PATH = os.getenv(key="YAML_PATH")

logger = logging.getLogger(__name__)

TO_UPPER = ["svg", "3d", "hsl", "2d", "fcc", "ab", "nfl", "ph"]


def word_prettifier(word):
    return word.upper() if word in TO_UPPER else word.capitalize()


def name_prettifier(name):
    words = re.split("[-_]", name)
    return " ".join(word_prettifier(word) for word in words)


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
            name=name_prettifier(eval_key),
            description=eval_data.get("description", "None"),
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
            input_messages = sample.get("input", {})
            system_prompt = ""
            user_input = ""

            for message in input_messages:
                if type(message).__name__ != "dict":
                    continue
                if message.get("role") == "system":
                    system_prompt += message.get("content", "") + "\n\n"
                elif message.get("role") == "user":
                    user_input += message.get("content", "") + "\n\n"

            system_prompt = system_prompt.strip()
            user_input = user_input.strip()

            ideal = sample.get("ideal", "")
            if isinstance(ideal, list):
                ideal = json.dumps(ideal)

            task_instances.append(
                TaskInstance(
                    eval=eval,
                    input=user_input,
                    system_prompt=system_prompt,
                    ideal=ideal,
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

    def get_primary_author(self, file_path: Path) -> tuple[str, str]:
        if not file_path.exists():
            return "Unknown", ""
        try:
            result = subprocess.run(
                [
                    "git",
                    "blame",
                    "-w",
                    "-M",
                    "-C",
                    "-C",
                    "--line-porcelain",
                    str(file_path),
                ],
                capture_output=True,
                text=True,
                check=True,
                cwd=os.path.dirname(file_path),
            )
            authors = defaultdict(int)
            emails = {}
            for line in result.stdout.split("\n"):
                if line.startswith("author "):
                    author = line.split("author ", 1)[1]
                    authors[author] += 1
                elif line.startswith("author-mail "):
                    email = line.split("author-mail ", 1)[1].strip("<>")
                    emails[author] = email
            primary_author = max(authors, key=authors.get) if authors else "Unknown"
            return primary_author, emails.get(primary_author, "")
        except subprocess.CalledProcessError:
            return "Unknown", ""

    def get_or_create_author(
        self,
        db: SessionLocal,
        name: str,
        email: str,
        avatar: str = None,
        github_login: str = None,
    ) -> Author:
        author = db.query(Author).filter(Author.email == email).first()
        if not author:
            author = Author(
                username=name, email=email, avatar=avatar, github_login=github_login
            )
            db.add(author)
        return author

    @staticmethod
    def main(dry_run: bool = True):
        logging.basicConfig(level=logging.INFO)
        integration = OpenAIIntegration()
        with SessionLocal() as db:
            # Create an author for OpenAI
            openai_author = integration.get_or_create_author(
                db,
                name="openai/evals",
                email="evals@openai.com",
                avatar="https://www.svgrepo.com/show/306500/openai.svg",
                github_login="openai",
            )
            authors_map = {}
            registered_authors = []
            for yaml_file, jsonl_file in integration.get_openai_evals():
                logger.info(f"Processing: {yaml_file.name}")
                try:
                    metadata = integration.parse_metadata(yaml_file)
                    primary_author, author_email = integration.get_primary_author(
                        yaml_file
                    )

                    # Check if author was not used before
                    if primary_author not in authors_map:
                        authors_map[primary_author] = integration.get_or_create_author(
                            db, primary_author, author_email
                        )
                        registered_authors.append(primary_author)

                    author = authors_map[primary_author]
                    eval_obj = integration.create_eval(metadata)

                    logger.info(
                        f"Eval: {eval_obj.name} (Type: {eval_obj.validator_type})"
                    )
                    logger.info(f"Primary Author: {author.username}")
                    logger.info(f"Description: {eval_obj.description[:100]}...")

                    if jsonl_file:
                        samples = integration.parse_samples(jsonl_file)
                        task_instances = integration.create_task_instances(
                            eval_obj, samples
                        )

                        logger.info(f"Total TaskInstances: {len(task_instances)}")
                        for i, task in enumerate(task_instances[:3], 1):
                            logger.info(f"\nTaskInstance {i}:")
                            logger.info(f"System Prompt: {task.system_prompt[:50]}...")
                            logger.info(f"User Input: {task.input[:50]}...")
                            logger.info(f"Ideal: {task.ideal[:50]}...")

                        if len(task_instances) > 3:
                            logger.info("\n... (more TaskInstances)")
                    else:
                        logger.info("No JSONL file found. Skipping task instances.")

                    if not dry_run:
                        db.add(eval_obj)
                        if jsonl_file:
                            db.add_all(task_instances)
                        try:
                            db.commit()

                            # Register authors
                            openai_author_eval = eval_authors.insert().values(
                                author_id=openai_author.id, eval_id=eval_obj.id
                            )
                            db.execute(openai_author_eval)
                            author_eval = eval_authors.insert().values(
                                author_id=author.id, eval_id=eval_obj.id
                            )
                            db.execute(author_eval)
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
                    else:
                        logger.info("Dry run: Not committing to database.")

                except Exception as e:
                    logger.error(f"Error processing {yaml_file.name}: {str(e)}")
                    logger.error("Continuing with next eval.")

        logger.info("Finished processing all evals.")


if __name__ == "__main__":
    OpenAIIntegration.main(
        dry_run=False
    )  # Set to False to actually commit to the database
