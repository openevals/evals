"""Add github fields to user model

Revision ID: 855fd5c69bde
Revises: c32eded9245f
Create Date: 2024-08-14 15:00:47.476855

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '855fd5c69bde'
down_revision: Union[str, None] = 'c32eded9245f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('github_access_token', sa.String(), nullable=False))
    op.add_column('users', sa.Column('github_id', sa.Integer(), nullable=False))
    op.add_column('users', sa.Column('github_login', sa.String(), nullable=False))
    op.add_column('users', sa.Column('github_avatar', sa.String(), nullable=True))
    op.create_unique_constraint(None, 'users', ['github_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'users', type_='unique')
    op.drop_column('users', 'github_avatar')
    op.drop_column('users', 'github_login')
    op.drop_column('users', 'github_id')
    op.drop_column('users', 'github_access_token')
    # ### end Alembic commands ###
