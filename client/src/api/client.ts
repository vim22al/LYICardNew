// export const BASE_URL = 'http://localhost:8000/api'

const getSanitizedBaseUrl = (): string => {
  let rawUrl = import.meta.env.VITE_API_URL
  const isProdHost = typeof window !== 'undefined' && (
    window.location.hostname.endsWith('lyicard.avptechsolution.com') ||
    window.location.hostname.includes('avptechsolution.com')
  )
  const isProd = isProdHost || import.meta.env.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')

  if (isProdHost) {
    // Force production backend API when running on the production domain
    rawUrl = 'http://tun11p4kzvckrqoxake01e35.31.97.235.52.sslip.io/api'
  } else if (!rawUrl || !rawUrl.startsWith('http')) {
    // If VITE_API_URL is missing, relative, or not absolute, default to absolute URL based on environment
    rawUrl = isProd
      ? 'http://tun11p4kzvckrqoxake01e35.31.97.235.52.sslip.io/api'
      : 'http://localhost:8000/api'
  }

  if (!rawUrl.endsWith('/api') && !rawUrl.endsWith('/api/')) {
    if (rawUrl.endsWith('/')) {
      rawUrl += 'api'
    } else {
      rawUrl += '/api'
    }
  }

  // Ensure no trailing slash for clean endpoint concatenation
  if (rawUrl.endsWith('/')) {
    rawUrl = rawUrl.slice(0, -1)
  }
  return rawUrl
}

export const BASE_URL = getSanitizedBaseUrl()

export async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { headers, body, ...rest } = options

  const isFormData = body instanceof FormData

  let token = null
  try {
    const authData = localStorage.getItem('cardlyi-auth')
    token = authData ? JSON.parse(authData).state.token : null
  } catch (e) {
    console.error('Error parsing auth data from localStorage', e)
  }

  const url = `${BASE_URL}${endpoint}`
  console.log("API URL:", url)

  const response = await fetch(url, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
    ...rest,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong')
  }

  return data
}
