export interface TokenCache {
  get(key: string): string | undefined;
  set(key: string, value: string, ttlSeconds: number): void;
}

export class InMemoryTokenCache implements TokenCache {
  private readonly store = new Map<string, { value: string; expiresAt: number }>();

  get(key: string): string | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;
    if (Date.now() >= item.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return item.value;
  }

  set(key: string, value: string, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

export interface AuthProvider {
  getAuthorizationHeader(): Promise<Record<string, string>>;
}

export class ApiKeyAuthProvider implements AuthProvider {
  constructor(private readonly apiKey: string, private readonly headerName = 'x-api-key') {}

  async getAuthorizationHeader(): Promise<Record<string, string>> {
    return { [this.headerName]: this.apiKey };
  }
}

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scope?: string;
}

export class OAuth2AuthProvider implements AuthProvider {
  constructor(
    private readonly config: OAuth2Config,
    private readonly cache: TokenCache = new InMemoryTokenCache(),
    private readonly cacheKey = 'oauth2_access_token'
  ) {}

  async getAuthorizationHeader(): Promise<Record<string, string>> {
    const cached = this.cache.get(this.cacheKey);
    if (cached) return { Authorization: `Bearer ${cached}` };

    const token = await this.fetchToken();
    this.cache.set(this.cacheKey, token.accessToken, token.expiresIn);
    return { Authorization: `Bearer ${token.accessToken}` };
  }

  private async fetchToken(): Promise<{ accessToken: string; expiresIn: number }> {
    if (this.config.tokenUrl.startsWith('stub://')) {
      return { accessToken: 'stubbed-oauth2-token', expiresIn: 3600 };
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: this.config.scope ?? ''
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    if (!response.ok) {
      throw new Error(`failed to fetch oauth token: ${response.status}`);
    }

    const result = (await response.json()) as { access_token: string; expires_in: number };
    return { accessToken: result.access_token, expiresIn: result.expires_in };
  }
}
