// export const BASE_URL = 'http://localhost:8000/api'

const getSanitizedBaseUrl = (): string => {
  let rawUrl = import.meta.env.VITE_API_URL || '/api'
  if (rawUrl.startsWith('http')) {
    if (!rawUrl.endsWith('/api') && !rawUrl.endsWith('/api/')) {
      if (rawUrl.endsWith('/')) {
        rawUrl += 'api'
      } else {
        rawUrl += '/api'
      }
    }
  } else {
    // For relative paths, force it to be /api
    if (rawUrl !== '/api') {
      rawUrl = '/api'
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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
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
