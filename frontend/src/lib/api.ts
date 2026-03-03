/** Clean and format API URL from env var */
const getApiBaseUrl = () => {
  // Use the env var if it exists AND is not empty, otherwise default to the Render backend
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://prathyuksha-edutech-hack-backend.onrender.com';

  // Check if the user accidentally put the /login frontend URL
  if (url.includes('vercel.app')) {
    console.warn('API URL seems to point to frontend, falling back to correct Render backend');
    url = 'https://prathyuksha-edutech-hack-backend.onrender.com';
  }
  // Remove any trailing slashes or /api paths that might have been accidentally added
  url = url.trim().replace(/\/+$/, '').replace(/\/api$/, '');

  // Ensure we have a protocol
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  return url;
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
