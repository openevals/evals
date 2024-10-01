"""Add o1 models

Revision ID: ae2a8d3bd293
Revises: a8a5742172e1
Create Date: 2024-09-30 23:24:10.500739

"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy import String
from sqlalchemy.sql import column, table

# revision identifiers, used by Alembic.
revision: str = "ae2a8d3bd293"
down_revision: Union[str, None] = "a8a5742172e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    models_table = table(
        "models", column("model_developer", String), column("model_name", String)
    )
    op.bulk_insert(
        models_table,
        [
            {"model_developer": "OpenAI", "model_name": "o1-preview"},
            {"model_developer": "OpenAI", "model_name": "o1-mini"},
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM models WHERE model_name IN ('o1-preview', 'o1-mini')")
