/** Clean and format API URL from env var */
const getApiBaseUrl = () => {
  return 'http://localhost:8000';
};

/** Central API config - use for all backend calls */
export const API_BASE = getApiBaseUrl();

/** Get auth token - tries localStorage first, then cookie */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const fromStorage = localStorage.getItem('accessToken')
  if (fromStorage) return fromStorage
  const match = document.cookie.match(/access_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Headers for authenticated API requests */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
