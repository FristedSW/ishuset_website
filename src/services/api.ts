const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export type Locale = 'da' | 'en' | 'de';

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
  event_type?: string;
  recipient_name?: string;
  gift_amount?: string;
  preferred_from?: string;
  preferred_to?: string;
  preferred_date?: string;
  guest_count?: number;
  allow_email: boolean;
  allow_phone: boolean;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  event_type?: string;
  recipient_name?: string;
  gift_amount?: string;
  preferred_from?: string;
  preferred_to?: string;
  preferred_date?: string;
  guest_count?: number;
  allow_email: boolean;
  allow_phone: boolean;
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
  is_featured?: boolean;
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
  is_featured?: boolean;
}

export interface OpeningHours {
  id: number;
  day: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  is_unknown?: boolean;
  is_estimated?: boolean;
  special_message?: string;
}

export interface OpeningHoursRequest {
  day: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
  is_unknown?: boolean;
  is_estimated?: boolean;
  special_message?: string;
}

export interface TextContent {
  id: number;
  key: string;
  base_key: string;
  value: string;
  group: string;
  locale: Locale;
}

export interface TextContentRequest {
  key: string;
  value: string;
  group: string;
  locale: Locale;
}

export interface Flavour {
  id: number;
  slug: string;
  name_da: string;
  name_en?: string;
  name_de?: string;
  description_da: string;
  description_en?: string;
  description_de?: string;
  category: 'milk-based' | 'sorbet';
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface FlavourRequest {
  slug: string;
  name_da: string;
  name_en?: string;
  name_de?: string;
  description_da: string;
  description_en?: string;
  description_de?: string;
  category: 'milk-based' | 'sorbet';
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface PriceItem {
  id: number;
  key: string;
  label_da: string;
  label_en?: string;
  label_de?: string;
  description?: string;
  price: string;
  sort_order: number;
  is_active: boolean;
}

export interface PriceItemRequest {
  key: string;
  label_da: string;
  label_en?: string;
  label_de?: string;
  description?: string;
  price: string;
  sort_order: number;
  is_active: boolean;
}

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

  isAuthenticated: (): boolean => !!localStorage.getItem('auth_token'),
};

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

export const mediaAPI = {
  getAll: async (filters?: { platform?: string; published?: boolean }): Promise<MediaPost[]> => {
    const params = new URLSearchParams();
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.published !== undefined) params.append('published', filters.published.toString());

    const response = await fetch(`${API_BASE_URL}/media?${params.toString()}`, {
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

export const flavourAPI = {
  getAll: async (includeInactive = false): Promise<Flavour[]> => {
    const path = includeInactive
      ? `${API_BASE_URL}/admin/flavours?include_inactive=true`
      : `${API_BASE_URL}/flavours`;
    const response = await fetch(path, {
      headers: includeInactive ? getAuthHeaders() : { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  create: async (flavour: FlavourRequest): Promise<Flavour> => {
    const response = await fetch(`${API_BASE_URL}/admin/flavours`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(flavour),
    });
    return handleResponse(response);
  },

  update: async (id: number, flavour: FlavourRequest): Promise<Flavour> => {
    const response = await fetch(`${API_BASE_URL}/admin/flavours/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(flavour),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/flavours/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const priceAPI = {
  getAll: async (includeInactive = false): Promise<PriceItem[]> => {
    const path = includeInactive
      ? `${API_BASE_URL}/admin/prices?include_inactive=true`
      : `${API_BASE_URL}/prices`;
    const response = await fetch(path, {
      headers: includeInactive ? getAuthHeaders() : { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  create: async (item: PriceItemRequest): Promise<PriceItem> => {
    const response = await fetch(`${API_BASE_URL}/admin/prices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  update: async (id: number, item: PriceItemRequest): Promise<PriceItem> => {
    const response = await fetch(`${API_BASE_URL}/admin/prices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/prices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
