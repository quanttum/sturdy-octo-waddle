export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface RetryPolicy {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const defaultRetryPolicy: RetryPolicy = {
  retries: 3,
  baseDelayMs: 200,
  maxDelayMs: 2000
};

export class HttpClient {
  constructor(private readonly retryPolicy: RetryPolicy = defaultRetryPolicy) {}

  async request<T>(request: HttpRequest): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.retryPolicy.retries) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers ?? {})
          },
          body: request.body ? JSON.stringify(request.body) : undefined
        });

        if (!response.ok) {
          if (response.status >= 500 && attempt < this.retryPolicy.retries) {
            throw new Error(`retryable server error: ${response.status}`);
          }
          throw new Error(`http error: ${response.status}`);
        }

        if (response.status === 204) {
          return {} as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error;
        if (attempt >= this.retryPolicy.retries) break;
        const delay = Math.min(
          this.retryPolicy.baseDelayMs * Math.pow(2, attempt),
          this.retryPolicy.maxDelayMs
        );
        await sleep(delay);
      }
      attempt += 1;
    }

    throw lastError instanceof Error ? lastError : new Error('request failed');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
