from abc import ABC, abstractmethod
from pathlib import Path
from typing import List

from backend.db.models import Eval, TaskInstance


class Integration(ABC):
    @abstractmethod
    def parse_metadata(self, path: Path) -> dict:
        pass

    @abstractmethod
    def parse_samples(self, path: Path) -> List[dict]:
        pass

    @abstractmethod
    def create_eval(self, metadata: dict) -> Eval:
        pass

    @abstractmethod
    def create_task_instances(
        self, eval: Eval, samples: List[dict]
    ) -> List[TaskInstance]:
        pass

    @abstractmethod
    def integrate(self, eval_dir: Path):
        pass
