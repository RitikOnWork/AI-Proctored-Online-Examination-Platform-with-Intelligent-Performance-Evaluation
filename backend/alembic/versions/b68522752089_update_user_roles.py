"""update_user_roles

Revision ID: b68522752089
Revises: 530c0a02676c
Create Date: 2026-07-02 21:08:41.177158

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b68522752089'
down_revision: Union[str, Sequence[str], None] = '530c0a02676c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop index on role column
    op.drop_index('ix_user_role', table_name='user')
    # Drop role column
    op.drop_column('user', 'role')
    # Drop old user_role type
    op.execute("DROP TYPE user_role")
    # Create new user_role type
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'examiner', 'student')")
    # Re-add role column with new enum type
    op.add_column('user', sa.Column('role', sa.Enum('admin', 'examiner', 'student', name='user_role'), nullable=False))
    # Re-create index on role column
    op.create_index(op.f('ix_user_role'), 'user', ['role'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop index on role column
    op.drop_index(op.f('ix_user_role'), table_name='user')
    # Drop role column
    op.drop_column('user', 'role')
    # Drop new user_role type
    op.execute("DROP TYPE user_role")
    # Create old user_role type
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'proctor', 'candidate')")
    # Re-add role column with old enum type
    op.add_column('user', sa.Column('role', sa.Enum('admin', 'proctor', 'candidate', name='user_role'), nullable=False))
    # Re-create index on role column
    op.create_index('ix_user_role', 'user', ['role'], unique=False)
