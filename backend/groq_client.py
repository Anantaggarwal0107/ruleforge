import os
import re
from groq import AsyncGroq

SYSTEM_PROMPT = (
    "You are a Python code generator. Generate a single Python function called "
    "`run(data: dict) -> dict`. The function receives a JSON object as `data` and "
    "returns a dict with keys: `passed` (bool), `result` (dict, the transformed/"
    "filtered data or {}), `error` (str or None). Only use Python standard library. "
    "Do not import os, sys, subprocess, socket, or shutil. Do not write any code "
    "outside the function. Return only the raw Python code, no markdown, no explanation."
)


async def generate_rule_code(prompt: str) -> str:
    client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])
    chat_completion = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        model="llama3-70b-8192",
        temperature=0.2,
        max_tokens=1024,
    )
    code: str = chat_completion.choices[0].message.content or ""
    # Strip markdown fences if present
    code = re.sub(r"^```python\s*", "", code.strip())
    code = re.sub(r"\s*```$", "", code.strip())
    return code.strip()
