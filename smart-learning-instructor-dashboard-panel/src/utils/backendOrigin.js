const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
const DEFAULT_BACKEND_PORT = '5000';
const FALLBACK_BACKEND_ORIGIN = 'http://206.189.112.134:5000';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getBrowserLocation = () => (typeof window === 'undefined' ? null : window.location);

const normalizeConfiguredOrigin = (rawValue) => {
  const browserLocation = getBrowserLocation();

  try {
    const parsed = browserLocation
      ? new URL(rawValue, browserLocation.origin)
      : new URL(rawValue);

    if (
      browserLocation &&
      LOOPBACK_HOSTS.has(parsed.hostname) &&
      !LOOPBACK_HOSTS.has(browserLocation.hostname)
    ) {
      parsed.hostname = browserLocation.hostname;
    }

    const normalizedPath = trimTrailingSlash(parsed.pathname || '');
    parsed.pathname = normalizedPath.endsWith('/api')
      ? normalizedPath.slice(0, -4) || '/'
      : normalizedPath || '/';
    parsed.search = '';
    parsed.hash = '';

    return trimTrailingSlash(`${parsed.origin}${parsed.pathname === '/' ? '' : parsed.pathname}`);
  } catch {
    return trimTrailingSlash(rawValue.replace(/\/api$/, ''));
  }
};

export const resolveBackendOrigin = () => {
  const rawBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.API_BASE_URL;

  if (rawBaseUrl) {
    return normalizeConfiguredOrigin(rawBaseUrl);
  }

  const browserLocation = getBrowserLocation();
  if (browserLocation?.hostname) {
    return `${browserLocation.protocol}//${browserLocation.hostname}:${DEFAULT_BACKEND_PORT}`;
  }

  return FALLBACK_BACKEND_ORIGIN;
};
