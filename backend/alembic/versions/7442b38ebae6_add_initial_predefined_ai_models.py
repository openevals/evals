"""Add initial predefined AI models

Revision ID: 7442b38ebae6
Revises: 906654ad502d
Create Date: 2024-08-11 21:21:31.255092

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import String
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision: str = '7442b38ebae6'
down_revision: Union[str, None] = '906654ad502d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    models_table = table('models',
        column('model_developer', String),
        column('model_name', String)
    )
    op.bulk_insert(models_table,
        [
            {'model_developer': 'OpenAI', 'model_name': 'GPT-4'},
            {'model_developer': 'Google', 'model_name': 'Gemini-1.5-Pro-Exp-0801'},
            {'model_developer': 'OpenAI', 'model_name': 'GPT-4o-2024-05-13'},
            {'model_developer': 'OpenAI', 'model_name': 'GPT-4o-mini-2024-07-18'},
            {'model_developer': 'Anthropic', 'model_name': 'claude-3-sonnet-20240620'},
            {'model_developer': 'Google', 'model_name': 'Gemini-Advanced-0514'},
            {'model_developer': 'Anthropic', 'model_name': 'claude-3-opus-20240229'},
        ]
    )


def downgrade() -> None:
    op.execute("DELETE FROM models WHERE model_name IN ('GPT-4', 'Gemini-1.5-Pro-Exp-0801', 'GPT-4o-2024-05-13', 'GPT-4o-mini-2024-07-18', 'claude-3-sonnet-20240620', 'Gemini-Advanced-0514', 'claude-3-opus-20240229')")
