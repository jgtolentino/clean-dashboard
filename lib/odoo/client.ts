import axios, { AxiosInstance } from 'axios';

interface OdooConfig {
  url: string;
  db: string;
  username?: string;
  password?: string;
}

interface OdooResponse<T = any> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: any;
  };
}

class OdooClient {
  private client: AxiosInstance;
  private config: OdooConfig;
  private uid: number | null = null;
  private sessionId: string | null = null;

  constructor(config: OdooConfig) {
    this.config = {
      url: config.url || import.meta.env.VITE_ODOO_URL || '',
      db: config.db || import.meta.env.VITE_ODOO_DB || '',
      username: config.username || import.meta.env.VITE_ODOO_USERNAME,
      password: config.password || import.meta.env.VITE_ODOO_PASSWORD,
    };

    this.client = axios.create({
      baseURL: this.config.url,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  }

  /**
   * Authenticate with Odoo
   */
  async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    try {
      const response = await this.call<number>('/web/session/authenticate', {
        db: this.config.db,
        login: this.config.username,
        password: this.config.password,
      });

      this.uid = response;
      return response;
    } catch (error) {
      console.error('Odoo authentication failed:', error);
      throw new Error('Failed to authenticate with Odoo');
    }
  }

  /**
   * Make a JSON-RPC call to Odoo
   */
  private async call<T>(endpoint: string, params: any): Promise<T> {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params,
      id: Math.floor(Math.random() * 1000000),
    };

    try {
      const { data } = await this.client.post<OdooResponse<T>>(endpoint, payload);

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.result as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Odoo API error:', error.response?.data || error.message);
      }
      throw error;
    }
  }

  /**
   * Search and read records
   */
  async searchRead<T = any>(
    model: string,
    domain: any[] = [],
    fields: string[] = [],
    options: { limit?: number; offset?: number; order?: string } = {}
  ): Promise<T[]> {
    await this.authenticate();

    return this.call<T[]>('/web/dataset/search_read', {
      model,
      domain,
      fields,
      limit: options.limit || 80,
      offset: options.offset || 0,
      sort: options.order || '',
    });
  }

  /**
   * Create a new record
   */
  async create(model: string, values: any): Promise<number> {
    await this.authenticate();

    return this.call<number>('/web/dataset/call_kw', {
      model,
      method: 'create',
      args: [values],
      kwargs: {},
    });
  }

  /**
   * Update existing records
   */
  async write(model: string, ids: number[], values: any): Promise<boolean> {
    await this.authenticate();

    return this.call<boolean>('/web/dataset/call_kw', {
      model,
      method: 'write',
      args: [ids, values],
      kwargs: {},
    });
  }

  /**
   * Delete records
   */
  async unlink(model: string, ids: number[]): Promise<boolean> {
    await this.authenticate();

    return this.call<boolean>('/web/dataset/call_kw', {
      model,
      method: 'unlink',
      args: [ids],
      kwargs: {},
    });
  }

  /**
   * Call any Odoo model method
   */
  async callMethod<T = any>(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<T> {
    await this.authenticate();

    return this.call<T>('/web/dataset/call_kw', {
      model,
      method,
      args,
      kwargs,
    });
  }

  /**
   * Get current user info
   */
  async getUserInfo() {
    return this.call('/web/session/get_session_info', {});
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    this.uid = null;
    this.sessionId = null;
    await this.call('/web/session/destroy', {});
  }
}

// Singleton instance
let odooClient: OdooClient | null = null;

export function getOdooClient(config?: OdooConfig): OdooClient {
  if (!odooClient) {
    odooClient = new OdooClient(config || {
      url: import.meta.env.VITE_ODOO_URL,
      db: import.meta.env.VITE_ODOO_DB,
    });
  }
  return odooClient;
}

export default OdooClient;
