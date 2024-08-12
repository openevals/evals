"""Add status field to EvalRun

Revision ID: 5b1952a1c551
Revises: 7442b38ebae6
Create Date: 2024-08-12 00:06:57.479443

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b1952a1c551'
down_revision: Union[str, None] = '7442b38ebae6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('eval_runs', sa.Column('status', sa.Enum('Queued', 'Running', 'Failed', 'Finished', name='evalrunstatus'), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('eval_runs', 'status')
    # ### end Alembic commands ###