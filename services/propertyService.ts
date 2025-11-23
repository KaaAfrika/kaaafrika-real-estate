import api from "./Interceptor";

export type Property = {
  id: string;
  title: string;
  address?: string;
  price?: number;
  image?: string;
};

export type OwnerInfo = {
  id: number;
  full_name: string;
  profile_picture_url: string | null;
};

export type RawPropertyData = {
  id: number; // Note: API returns number, your Property type uses string
  user_id: number;
  title: string;
  description: string;
  condition: string;
  listing_type: string;
  category: string;
  country: string;
  state: string;
  city: string;
  street_address: string;
  price: string; // Note: API returns string for price
  negotiable: string;
  contact_email: string;
  contact_phone_number: string;
  image_urls: string[];
  proof_of_ownership_urls: string[];
  status: string;
  currency: string;
  rent_cycle: string;
  second_address: string;
  view_count: number;
  listed_by: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  owner_info: OwnerInfo;
};

export type PropertyApiResponse = {
  status: boolean;
  message: string;
  data: RawPropertyData;
};

export interface ISearchFilter {
  page?: number;
  limit?: number;
  listing?: string;
  category?: string;
  city?: string;
  state?: string;
  min?: number;
  max?: number | string ;
  search?: string;
  sort?: string;
}

// lib/api.ts
export type CreatePropertyBody = {
  title: string;
  description: string;
  condition?: string;
  listing_type: string;
  category: string;
  country?: string;
  state?: string;
  city?: string;
  street_address?: string;
  price: number;
  negotiable?: string;
  contact_email?: string;
  contact_phone_number: string;
  image_urls?: string[];
  proof_of_ownership_urls?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function fetchProperties(
  filters: ISearchFilter = {}
): Promise<any> {
  try {
    // Map internal filter keys to API parameter names
    const paramMap: Record<string, string> = {
      listing: "listing_type",
      min: "min_price",
      max: "max_price",
      search: "search_term",
      sort: "sort_by",
    };

    // Clean and rename keys for the API
    const params = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(typeof value === "number" && isNaN(value))
      ) {
        const apiKey = paramMap[key] || key; // map if needed, otherwise keep same key
        acc[apiKey] = value;
      }
      return acc;
    }, {} as Record<string, string | number>);

    const res = await api.get(`${API_BASE}/properties`, { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPropertyById(id: string): Promise<RawPropertyData> {
  try {
    const res = await api.get(`${API_BASE}/properties/${id}`);
    return res.data.data;
  } catch (error) {
    throw error;
  }
}

export async function createProperty(
  propertyData: Record<string, any>
): Promise<any> {
  try {
    const res = await api.post(`${API_BASE}/properties`, propertyData);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProperty(
  propertyId: number
): Promise<any> {
  try {
    const res = await api.post(`${API_BASE}/properties`, propertyId);
    return res.data;
  } catch (error) {
    throw error;
  }
}


export async function uploadMedia(mediaData: FormData): Promise<any> {
  try {
    // IMPORTANT: do NOT set Content-Type header manually here.
    // Let axios/browser set the multipart boundary.
    const res = await api.post(`${API_BASE}/media`, mediaData);
    return res.data;
  } catch (err: any) {
    console.error("[uploadMedia] axios error:", err);

    // Surface backend validation errors if present
    if (err?.response?.data) {
      const data = err.response.data;
      if (data.message || data.errors) {
        const errMsg =
          (typeof data.message === "string"
            ? data.message
            : JSON.stringify(data.message || "")) +
          (data.errors ? ` — ${JSON.stringify(data.errors)}` : "");
        throw new Error(errMsg);
      }
      // fallback: stringify the response body
      throw new Error(JSON.stringify(data));
    }

    // final fallback
    throw err;
  }
}


export async function convertCredit(
  amount: number
): Promise<any> {
  try {
    const res = await api.post(`${API_BASE}/credits/convert`, {amount}) ;
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function creditBalance(
): Promise<any> {
  try {
    const res = await api.get(`${API_BASE}/credits/balance`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCreditsHistory(page?: number): Promise<any> {
  try {
    const res = await api.get(`${API_BASE}/credits/history`, { params: page ? { page } : undefined });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function addFavorite(
  propertyId: number
): Promise<any> {
  try {
    const res = await api.post(`${API_BASE}/properties/${propertyId}/favorites`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getFavorites(page?: number): Promise<any> {
  try {
    const res = await api.get(`${API_BASE}/properties/user/favorites`, { params: page ? { page } : undefined });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function removeFavorite(
  propertyId: number
): Promise<any> {
  try {
    const res = await api.delete(`${API_BASE}/properties/${propertyId}/favorites`);
    return res.data;
  } catch (error) {
    throw error;
  }
}


export async function deductCredits(
  creditsData: Record<string, any>
): Promise<any> {
  try {
    const res = await api.post(`${API_BASE}/admin/credits/manual-deduct-and-grant-access`, creditsData);
    return res.data;
  } catch (error) {
    throw error;
  }
}