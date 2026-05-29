// export const BASE_URL = 'http://localhost:8000/api'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
