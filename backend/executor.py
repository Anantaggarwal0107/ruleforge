import ast
import concurrent.futures
from typing import Any
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session
from db import engine
from models import Rule

BLOCKED_IMPORTS = {
    "os", "sys", "subprocess", "socket", "shutil",
    "importlib", "builtins", "eval", "exec",
}

SAFE_BUILTINS: dict[str, Any] = {
    "print": print,
    "len": len,
    "str": str,
    "int": int,
    "float": float,
    "bool": bool,
    "list": list,
    "dict": dict,
    "set": set,
    "tuple": tuple,
    "range": range,
    "enumerate": enumerate,
    "zip": zip,
    "map": map,
    "filter": filter,
    "sorted": sorted,
    "min": min,
    "max": max,
    "sum": sum,
    "abs": abs,
    "round": round,
    "isinstance": isinstance,
    "type": type,
    "ValueError": ValueError,
    "TypeError": TypeError,
    "KeyError": KeyError,
}


def validate_code(code: str) -> None:
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        raise ValueError(f"Syntax error in generated code: {exc}") from exc

    has_run = False
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names: list[str] = []
            if isinstance(node, ast.Import):
                names = [alias.name.split(".")[0] for alias in node.names]
            else:
                if node.module:
                    names = [node.module.split(".")[0]]
            for name in names:
                if name in BLOCKED_IMPORTS:
                    raise ValueError(f"Import of '{name}' is not allowed.")
        if isinstance(node, ast.FunctionDef) and node.name == "run":
            has_run = True

    if not has_run:
        raise ValueError("Generated code must define a function named 'run'.")


def _run_in_namespace(code: str, data: dict) -> dict:
    namespace: dict[str, Any] = {"__builtins__": SAFE_BUILTINS}
    exec(code, namespace)  # noqa: S102
    result = namespace["run"](data)
    if not isinstance(result, dict):
        raise TypeError("run() must return a dict.")
    return result


def execute_rule(code: str, data: dict) -> dict:
    validate_code(code)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_run_in_namespace, code, data)
        try:
            return future.result(timeout=5)
        except concurrent.futures.TimeoutError:
            return {"passed": False, "result": {}, "error": "Execution timed out after 5 seconds."}
        except Exception as exc:  # noqa: BLE001
            return {"passed": False, "result": {}, "error": str(exc)}


def register_rule_route(app: FastAPI, rule: Rule) -> None:
    rule_id = rule.id
    rule_code = rule.code
    path = f"/rules/{rule_id}/run"

    async def rule_endpoint(request: Request) -> JSONResponse:
        body = await request.json()
        data = body.get("data", {})
        outcome = execute_rule(rule_code, data)
        with Session(engine) as session:
            db_rule = session.get(Rule, rule_id)
            if db_rule:
                db_rule.call_count += 1
                session.add(db_rule)
                session.commit()
        return JSONResponse(content=outcome)

    app.add_api_route(
        path,
        rule_endpoint,
        methods=["POST"],
        name=f"rule_{rule_id}_run",
    )
