const ADMIN_TOKEN_KEY = 'admin_auth_token';
const LEGACY_TOKEN_KEY = 'token';

const isBrowser = () => typeof window !== 'undefined';

export const getStoredAdminToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
};

export const setStoredAdminToken = (token: string) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const clearStoredAdminToken = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};
