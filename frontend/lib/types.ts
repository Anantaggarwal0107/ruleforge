export interface Rule {
  id: number;
  name: string;
  prompt: string;
  code: string;
  call_count: number;
  created_at: string;
  endpoint_url: string;
}

export interface GenerateResponse {
  code: string;
}

export interface DeployResponse extends Rule {
  endpoint_url: string;
}

export interface TestResponse {
  passed: boolean;
  result: Record<string, unknown>;
  error: string | null;
}
