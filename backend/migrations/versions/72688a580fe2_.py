"""empty message

Revision ID: 72688a580fe2
Revises: 2c6e7660da0d
Create Date: 2018-03-18 09:41:39.370660

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '72688a580fe2'
down_revision = '2c6e7660da0d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('deposit', 'end_date',
               existing_type=sa.DATE(),
               nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('deposit', 'end_date',
               existing_type=sa.DATE(),
               nullable=True)
    # ### end Alembic commands ###