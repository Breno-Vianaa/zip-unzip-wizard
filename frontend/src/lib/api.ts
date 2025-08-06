/**
 * Configuração da API para comunicação com o backend
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Classe para gerenciar chamadas à API
 */
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Define o token de autenticação
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Headers padrão para requisições
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Método genérico para fazer requisições
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * Métodos HTTP
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Métodos específicos de autenticação
   */
  async login(email: string, password: string) {
    const response = await this.post<{
      token: string;
      user: any;
      message: string;
    }>('/auth/login', { email, password });
    
    this.setToken(response.token);
    return response;
  }

  async logout() {
    await this.post('/auth/logout');
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.get<{ user: any }>('/auth/me');
  }

  async refreshToken() {
    const response = await this.post<{
      token: string;
      message: string;
    }>('/auth/refresh');
    
    this.setToken(response.token);
    return response;
  }
}

// Instância singleton da API
export const api = new ApiClient(API_BASE_URL);

// Configurações e constantes
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
};

// Tipos para TypeScript
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'gerente' | 'vendedor';
  avatar_url?: string;
  telefone?: string;
  endereco?: string;
  ativo: boolean;
  data_cadastro: string;
  ultimo_login?: string;
}