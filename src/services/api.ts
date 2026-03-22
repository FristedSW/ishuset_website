// API service for Ishuset Marselisborg Havn frontend

const API_BASE_URL = 'http://localhost:8080/api';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export interface MediaPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  platform: 'facebook' | 'instagram' | 'news';
  publish_date: string;
  tags?: string;
  likes: number;
  comments: number;
  shares: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaPostRequest {
  title: string;
  content: string;
  image_url?: string;
  platform: 'facebook' | 'instagram' | 'news';
  publish_date: string;
  tags?: string;
  is_published: boolean;
}

export interface OpeningHours {
  id: number;
  day: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  special_message?: string;
}

export interface OpeningHoursRequest {
  day: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  special_message?: string;
}

export interface TextContent {
  id: number;
  key: string;
  value: string;
  group: string;
}

export interface TextContentRequest {
  key: string;
  value: string;
  group: string;
}

// Utility functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

// Contact API
export const contactAPI = {
  submit: async (contact: ContactRequest): Promise<{ message: string; id: number }> => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    return handleResponse(response);
  },

  getAll: async (): Promise<ContactMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/contact`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateStatus: async (id: number, status: string): Promise<ContactMessage> => {
    const response = await fetch(`${API_BASE_URL}/admin/contact/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/contact/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Media API
export const mediaAPI = {
  getAll: async (filters?: { platform?: string; published?: boolean }): Promise<MediaPost[]> => {
    const params = new URLSearchParams();
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.published !== undefined) params.append('published', filters.published.toString());
    
    const response = await fetch(`${API_BASE_URL}/media?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  create: async (post: MediaPostRequest): Promise<MediaPost> => {
    const response = await fetch(`${API_BASE_URL}/admin/media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(post),
    });
    return handleResponse(response);
  },

  update: async (id: string, post: MediaPostRequest): Promise<MediaPost> => {
    const response = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(post),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Opening Hours API
export const openingHoursAPI = {
  getAll: async (): Promise<OpeningHours[]> => {
    const response = await fetch(`${API_BASE_URL}/opening-hours`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  update: async (id: number, hours: OpeningHoursRequest): Promise<OpeningHours> => {
    const response = await fetch(`${API_BASE_URL}/admin/opening-hours/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(hours),
    });
    return handleResponse(response);
  },
};

// Text Content API
export const textContentAPI = {
  getAll: async (): Promise<TextContent[]> => {
    const response = await fetch(`${API_BASE_URL}/text`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  create: async (content: TextContentRequest): Promise<TextContent> => {
    const response = await fetch(`${API_BASE_URL}/admin/text`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(content),
    });
    return handleResponse(response);
  },

  update: async (id: number, content: TextContentRequest): Promise<TextContent> => {
    const response = await fetch(`${API_BASE_URL}/admin/text/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(content),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/text/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
}; 