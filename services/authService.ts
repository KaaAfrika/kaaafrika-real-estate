export type LoginResponse = {
  token: string
  data: any // user info and other fields from API
  user?: { id: string; name: string; email: string }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''


export async function login(phone_number: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countryCode: 'NG',
      phone_number,
      password,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Login failed')
  }

  return res.json()
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}
