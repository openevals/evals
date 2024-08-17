"""Add created_at field to all models

Revision ID: 1e7ccf0d7d62
Revises: 6a412247b949
Create Date: 2024-08-16 22:32:35.791912

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1e7ccf0d7d62'
down_revision: Union[str, None] = '6a412247b949'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('authors', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('eval_runs', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('evals', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('evals_upvotes', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('models', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('task_instance_outputs', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('task_instances', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('users', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'created_at')
    op.drop_column('task_instances', 'created_at')
    op.drop_column('task_instance_outputs', 'created_at')
    op.drop_column('models', 'created_at')
    op.drop_column('evals_upvotes', 'created_at')
    op.drop_column('evals', 'created_at')
    op.drop_column('eval_runs', 'created_at')
    op.drop_column('authors', 'created_at')
    # ### end Alembic commands ###