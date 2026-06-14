from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Rule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    prompt: str
    code: str
    call_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
