const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'http://localhost:8080';
  }
})();

export type Locale = 'da' | 'en' | 'de';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface AdminUser {
  id: number;
  email: string;
  role: 'admin' | 'staff';
  created_at?: string;
  updated_at?: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  role: 'admin' | 'staff';
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
  status: 'new' | 'read' | 'replied' | 'accepted' | 'deleted';
  accepted_at?: string;
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

export interface GiftCard {
  id: number;
  code: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  recipient_name: string;
  recipient_email: string;
  original_amount: string;
  balance_amount: string;
  message?: string;
  allow_email: boolean;
  allow_phone: boolean;
  status: string;
  payment_status?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  email_sent?: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftCardRequest {
  name: string;
  email: string;
  phone?: string;
  recipient_name: string;
  recipient_email: string;
  gift_amount: string;
  allow_email: boolean;
  allow_phone: boolean;
  message?: string;
}

export interface GiftCardCheckoutRequest extends GiftCardRequest {
  locale: Locale;
}

export interface GiftCardCheckoutResponse {
  checkout_url: string;
  session_id: string;
  gift_card_id: number;
}

export interface GiftCardCheckoutStatus {
  payment_status: string;
  status: string;
  card: GiftCard;
}

export interface GiftCardUpdateRequest {
  balance_amount: string;
  status?: string;
}

export interface MediaAsset {
  id: number;
  title: string;
  description?: string;
  alt_text?: string;
  file_url: string;
  asset_type: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetRequest {
  title: string;
  description?: string;
  alt_text?: string;
  file_url: string;
  asset_type?: string;
  source?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  alt_text?: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemRequest {
  title: string;
  description?: string;
  alt_text?: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface FreezerBooking {
  id: number;
  contact_message_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  occasion?: string;
  freezer_size: 'small' | 'large';
  start_date: string;
  end_date: string;
  notes?: string;
  price?: string;
  status: string;
  payment_status: 'paid' | 'unpaid';
  accepted_at: string;
  created_at: string;
  updated_at: string;
}

export interface FreezerBookingCreateRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  occasion?: string;
  freezer_size: 'small' | 'large';
  start_date: string;
  end_date: string;
  notes?: string;
  price?: string;
  payment_status: 'paid' | 'unpaid';
}

export interface FreezerBookingUpdateRequest {
  notes: string;
  price: string;
  payment_status: 'paid' | 'unpaid';
}

export interface AcceptContactRequest {
  start_date: string;
  end_date: string;
  freezer_size: 'small' | 'large';
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

export const resolveMediaUrl = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${API_ORIGIN}${trimmed}`;
  }
  return `${API_ORIGIN}/${trimmed}`;
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
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('auth_token'),

  getCurrentUser: (): AdminUser | null => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminUser;
    } catch {
      return null;
    }
  },
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

export const giftCardAPI = {
  create: async (item: GiftCardRequest): Promise<{ card: GiftCard; email_sent: boolean; warning?: string }> => {
    const response = await fetch(`${API_BASE_URL}/gift-cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  getAll: async (filters?: { code?: string; status?: string }): Promise<GiftCard[]> => {
    const params = new URLSearchParams();
    if (filters?.code) params.append('code', filters.code);
    if (filters?.status) params.append('status', filters.status);
    const response = await fetch(`${API_BASE_URL}/admin/gift-cards?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (id: number, item: GiftCardUpdateRequest): Promise<GiftCard> => {
    const response = await fetch(`${API_BASE_URL}/admin/gift-cards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  createFromAdmin: async (item: GiftCardRequest): Promise<{ card: GiftCard; email_sent: boolean; warning?: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/gift-cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  createCheckoutSession: async (item: GiftCardCheckoutRequest): Promise<GiftCardCheckoutResponse> => {
    const response = await fetch(`${API_BASE_URL}/gift-cards/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  getCheckoutStatus: async (sessionId: string): Promise<GiftCardCheckoutStatus> => {
    const params = new URLSearchParams({ session_id: sessionId });
    const response = await fetch(`${API_BASE_URL}/gift-cards/checkout-status?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
};

export const mediaAssetAPI = {
  getAll: async (): Promise<MediaAsset[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/media-assets`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  upload: async (file: File): Promise<{ file_url: string; filename: string }> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/admin/media-assets/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return handleResponse(response);
  },

  create: async (item: MediaAssetRequest): Promise<MediaAsset> => {
    const response = await fetch(`${API_BASE_URL}/admin/media-assets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  update: async (id: number, item: MediaAssetRequest): Promise<MediaAsset> => {
    const response = await fetch(`${API_BASE_URL}/admin/media-assets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/media-assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const freezerBookingAPI = {
  getAll: async (): Promise<FreezerBooking[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/freezer-bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (payload: FreezerBookingCreateRequest): Promise<FreezerBooking> => {
    const response = await fetch(`${API_BASE_URL}/admin/freezer-bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  update: async (id: number, payload: FreezerBookingUpdateRequest): Promise<FreezerBooking> => {
    const response = await fetch(`${API_BASE_URL}/admin/freezer-bookings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },
};

export const contactAdminAPI = {
  accept: async (id: number, payload: AcceptContactRequest): Promise<FreezerBooking> => {
    const response = await fetch(`${API_BASE_URL}/admin/contact/${id}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },
};

export const galleryAPI = {
  getAll: async (includeInactive = false): Promise<GalleryItem[]> => {
    const path = includeInactive
      ? `${API_BASE_URL}/admin/gallery?include_inactive=true`
      : `${API_BASE_URL}/gallery`;
    const response = await fetch(path, {
      headers: includeInactive ? getAuthHeaders() : { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  create: async (item: GalleryItemRequest): Promise<GalleryItem> => {
    const response = await fetch(`${API_BASE_URL}/admin/gallery`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  update: async (id: number, item: GalleryItemRequest): Promise<GalleryItem> => {
    const response = await fetch(`${API_BASE_URL}/admin/gallery/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export const userAPI = {
  getAll: async (): Promise<AdminUser[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (user: UserCreateRequest): Promise<AdminUser> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },
};
