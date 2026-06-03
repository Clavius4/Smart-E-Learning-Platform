const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])
const DEFAULT_BACKEND_PORT = '5000'
const FALLBACK_API_ORIGIN = 'http://206.189.112.134:5000'

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const ensureApiSuffix = (value) => {
  const normalized = trimTrailingSlash(value)
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

const getBrowserLocation = () => (typeof window === 'undefined' ? null : window.location)

const resolveConfiguredBaseUrl = (rawValue) => {
  const browserLocation = getBrowserLocation()

  try {
    const parsed = browserLocation
      ? new URL(rawValue, browserLocation.origin)
      : new URL(rawValue)

    if (
      browserLocation &&
      LOOPBACK_HOSTS.has(parsed.hostname) &&
      !LOOPBACK_HOSTS.has(browserLocation.hostname)
    ) {
      parsed.hostname = browserLocation.hostname
    }

    const normalizedPath = trimTrailingSlash(parsed.pathname || '')
    parsed.pathname = normalizedPath.endsWith('/api') ? normalizedPath : `${normalizedPath}/api`
    parsed.search = ''
    parsed.hash = ''

    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return ensureApiSuffix(rawValue)
  }
}

export const resolveApiBaseUrl = () => {
  const rawBaseUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL

  if (rawBaseUrl) {
    return resolveConfiguredBaseUrl(rawBaseUrl)
  }

  const browserLocation = getBrowserLocation()
  if (browserLocation?.hostname) {
    return `${browserLocation.protocol}//${browserLocation.hostname}:${DEFAULT_BACKEND_PORT}/api`
  }

  return `${FALLBACK_API_ORIGIN}/api`
}

export const buildApiUrl = (path = '') => {
  const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : ''
  return `${resolveApiBaseUrl()}${normalizedPath}`
}
