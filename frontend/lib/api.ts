import type { DeployResponse, GenerateResponse, Rule, TestResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function generateCode(prompt: string): Promise<GenerateResponse> {
  return request<GenerateResponse>("/generate", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function deployRule(
  name: string,
  prompt: string,
  code: string,
): Promise<DeployResponse> {
  return request<DeployResponse>("/rules", {
    method: "POST",
    body: JSON.stringify({ name, prompt, code }),
  });
}

export async function listRules(): Promise<Rule[]> {
  return request<Rule[]>("/rules");
}

export async function deleteRule(id: number): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(`/rules/${id}`, { method: "DELETE" });
}

export async function testRule(
  id: number,
  data: Record<string, unknown>,
): Promise<TestResponse> {
  return request<TestResponse>(`/rules/${id}/run`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}
