import axios from 'axios';

const BASE_URLS = {
  USER_SERVICE: 'https://user-service-661768391098.us-central1.run.app',
  PROFILE_SERVICE: 'https://profile-service-661768391098.us-central1.run.app',
  QR_SERVICE: 'https://qr-service-661768391098.us-central1.run.app',
  ANALYTICS_SERVICE: 'https://analytics-service-661768391098.us-central1.run.app',
};

/**
 * Register a new user account.
 * POST /users/register with email, username, and password.
 * Returns the created user object.
 */
export async function register(email, username, password) {
  try {
    const response = await axios.post(`${BASE_URLS.USER_SERVICE}/users/register`, {
      email,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Log in with email and password.
 * POST /users/login — returns the JWT access token string.
 */
export async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URLS.USER_SERVICE}/users/login`, {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Fetch the public profile for a given username.
 * GET /profile/{username} — no auth required.
 * Returns the profile object.
 */
export async function getProfile(username) {
  try {
    const response = await axios.get(`${BASE_URLS.PROFILE_SERVICE}/profile/${username}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Create or update the authenticated user's profile.
 * POST /profile with a Bearer token and profile data fields.
 * Returns the updated profile object.
 */
export async function updateProfile(token, profileData) {
  try {
    const response = await axios.post(`${BASE_URLS.PROFILE_SERVICE}/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

/**
 * Return the URL of the QR code PNG image for a given username.
 * The URL points to GET /qr/{username} on the QR service.
 * Callers can use this URL directly in an <Image> component.
 */
export function getQRCode(username) {
  return `${BASE_URLS.QR_SERVICE}/qr/${username}`;
}

/**
 * Fetch scan statistics for a given username.
 * GET /analytics/{username}/stats — no auth required.
 * Returns an object with total_scans, scans_this_week, scans_this_month.
 */
export async function getScanStats(username) {
  try {
    const response = await axios.get(
      `${BASE_URLS.ANALYTICS_SERVICE}/analytics/${username}/stats`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}
