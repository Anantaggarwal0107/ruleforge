from contextlib import asynccontextmanager
from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select
from dotenv import load_dotenv

from db import create_db, engine, get_session
from executor import execute_rule, register_rule_route, validate_code
from groq_client import generate_rule_code
from models import Rule

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    with Session(engine) as session:
        rules = session.exec(select(Rule)).all()
        for rule in rules:
            register_rule_route(app, rule)
    yield


app = FastAPI(title="RuleForge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    prompt: str


class CreateRuleRequest(BaseModel):
    name: str
    prompt: str
    code: str


class RuleOut(BaseModel):
    id: int
    name: str
    prompt: str
    code: str
    call_count: int
    created_at: datetime
    endpoint_url: str

    class Config:
        from_attributes = True


def rule_to_out(rule: Rule) -> RuleOut:
    return RuleOut(
        id=rule.id,
        name=rule.name,
        prompt=rule.prompt,
        code=rule.code,
        call_count=rule.call_count,
        created_at=rule.created_at,
        endpoint_url=f"/rules/{rule.id}/run",
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
async def generate(req: GenerateRequest):
    code = await generate_rule_code(req.prompt)
    return {"code": code}


@app.post("/rules", response_model=RuleOut, status_code=201)
def create_rule(
    req: CreateRuleRequest,
    session: Session = Depends(get_session),
):
    try:
        validate_code(req.code)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    rule = Rule(name=req.name, prompt=req.prompt, code=req.code)
    session.add(rule)
    session.commit()
    session.refresh(rule)
    register_rule_route(app, rule)
    return rule_to_out(rule)


@app.get("/rules", response_model=List[RuleOut])
def list_rules(session: Session = Depends(get_session)):
    rules = session.exec(select(Rule)).all()
    return [rule_to_out(r) for r in rules]


@app.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, session: Session = Depends(get_session)):
    rule = session.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")
    session.delete(rule)
    session.commit()
    app.routes = [
        r for r in app.routes
        if not (hasattr(r, "path") and r.path == f"/rules/{rule_id}/run")
    ]
    return {"deleted": True}
