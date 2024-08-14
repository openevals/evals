"""Add system_prompt and user_prompt to TaskInstance

Revision ID: 55cc6aff377d
Revises: e72237300681
Create Date: 2024-08-12 10:58:18.362236

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "55cc6aff377d"
down_revision: Union[str, None] = "e72237300681"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "task_instances", sa.Column("system_prompt", sa.String(), nullable=True)
    )
    op.add_column(
        "task_instances", sa.Column("user_prompt", sa.String(), nullable=True)
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("task_instances", "user_prompt")
    op.drop_column("task_instances", "system_prompt")
    # ### end Alembic commands ###