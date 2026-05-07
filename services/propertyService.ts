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
  id: number;
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
  price: string;
  negotiable: string;
  contact_email: string;
  contact_phone_number: string;
  image_urls: string[];
  video_url?: string;
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
  video_url?: string;
  proof_of_ownership_urls?: string[];
};

// --- FIX: Removed API_BASE variable entirely ---

export async function fetchProperties(
  filters: ISearchFilter = {}
): Promise<any> {
  try {
    const paramMap: Record<string, string> = {
      listing: "listing_type",
      min: "min_price",
      max: "max_price",
      search: "search_term",
      sort: "sort_by",
    };

    const params = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(typeof value === "number" && isNaN(value))
      ) {
        const apiKey = paramMap[key] || key;
        acc[apiKey] = value;
      }
      return acc;
    }, {} as Record<string, string | number>);

    // FIX: Removed ${API_BASE}
    const res = await api.get(`/properties`, { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPropertyById(id: string): Promise<RawPropertyData> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.get(`/properties/${id}`);
    return res.data.data;
  } catch (error) {
    throw error;
  }
}

export async function createProperty(
  propertyData: Record<string, any>
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.post(`/properties`, propertyData);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProperty(
  propertyId: number
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.post(`/properties`, propertyId);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function uploadMedia(mediaData: FormData): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.post(`/media`, mediaData);
    return res.data;
  } catch (err: any) {
    console.error("[uploadMedia] axios error:", err);
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
      throw new Error(JSON.stringify(data));
    }
    throw err;
  }
}

export async function convertCredit(
  amount: number
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.post(`/credits/convert`, {amount}) ;
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function creditBalance(
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.get(`/credits/balance`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCreditsHistory(page?: number): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.get(`/credits/history`, { params: page ? { page } : undefined });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function addFavorite(
  propertyId: number
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.post(`/properties/${propertyId}/favorites`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getFavorites(page?: number): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.get(`/properties/user/favorites`, { params: page ? { page } : undefined });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function removeFavorite(
  propertyId: number
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.delete(`/properties/${propertyId}/favorites`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deductCredits(
  creditsData: Record<string, any>
): Promise<any> {
  try {
    // FIX: Removed ${API_BASE}
    const res = await api.post(`/admin/credits/manual-deduct-and-grant-access`, creditsData);
    return res.data;
  } catch (error) {
    throw error;
  }
}