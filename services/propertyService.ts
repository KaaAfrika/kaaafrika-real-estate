export type Property = {
  id: string
  title: string
  address?: string
  price?: number
  image?: string
}

export type OwnerInfo = {
  id: number
  full_name: string
  profile_picture_url: string | null
}

export type RawPropertyData = {
  id: number // Note: API returns number, your Property type uses string
  user_id: number
  title: string
  description: string
  condition: string
  listing_type: string
  category: string
  country: string
  state: string
  city: string
  street_address: string
  price: string // Note: API returns string for price
  negotiable: string
  contact_email: string
  contact_phone_number: string
  image_urls: string[]
  proof_of_ownership_urls: string[]
  status: string
  currency: string
  rent_cycle: string
  second_address: string
  view_count: number
  listed_by: string
  created_at: string
  updated_at: string
  is_favorite: boolean
  owner_info: OwnerInfo
}

export type PropertyApiResponse = {
  status: boolean
  message: string
  data: RawPropertyData
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

export async function fetchProperties(): Promise<any> {
  const res = await fetch(`${API_BASE}/properties`)
  if (!res.ok) throw new Error('Failed to load properties')
  return res.json()
}

export async function fetchPropertyById(id: string): Promise<RawPropertyData> {
  const res = await fetch(`${API_BASE}/properties/${id}`)
  if (!res.ok) throw new Error('Property not found')
  const json: PropertyApiResponse = await res.json()
  return json.data
}

