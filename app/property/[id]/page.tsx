"use client";
import { Header } from "@/components/header";
import { PropertyCard } from "@/components/property-card";
import Image from "next/image";
import {
  ArrowLeft,
  Bed,
  Car,
  Waves,
  MapPin,
  Eye,
  Calendar,
  Star,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  fetchPropertyById,
  RawPropertyData,
  OwnerInfo,
  addFavorite,
} from "@/services/propertyService";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [property, setProperty] = useState<RawPropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: selected image index state (0 means first image)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kaa_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!propertyId) {
      setLoading(false);
      setError("No property ID provided.");
      return;
    }

    const loadProperty = async () => {
      try {
        setLoading(true);
        const data = await fetchPropertyById(propertyId);
        console.log("Dataaaaaaaaaaaaaaaaaaaaaa", data);
        setProperty(data);
      } catch (err) {
        console.error(err);
        setError("Could not load property details.");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, router]);

  // Reset selected image to 0 whenever property changes (so main image is first image by default)
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [property?.image_urls]);

  const isFavorite = useMemo(() => {
    const v: any =
      (property as any)?.is_favorite ??
      (property as any)?.isFavourite ??
      (property as any)?.is_favourite;
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v === 1;
    if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
    return false;
  }, [property]);

  async function toggleFavorite() {
    if (!property) return;
    const next = !isFavorite;
    // optimistic update
    setProperty({ ...property, is_favorite: next } as any);
    try {
      const resp = await addFavorite(property.id);
      const updated =
        resp?.data?.is_favorite ??
        resp?.is_favorite ??
        resp?.isFavourite ??
        resp?.is_favourite;
      const resolved = typeof updated === "boolean" ? updated : next;
      setProperty((prev) =>
        prev ? ({ ...prev, is_favorite: resolved } as any) : prev
      );
    } catch (err) {
      // revert on failure
      setProperty({ ...property, is_favorite: !next } as any);
      console.error("favorite toggle failed", err);
    }
  }

  // Helper to format the address
  const fullAddress = useMemo(() => {
    if (!property) return "N/A";
    const parts = [
      property.street_address,
      property.city,
      property.state,
      property.country,
    ];
    return parts.filter(Boolean).join(", ");
  }, [property]);

  // Handle Loading and Error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium">Loading Property...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">
            {error || "Property data is not available."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Go back to home
          </Link>
        </main>
      </div>
    );
  }

  // safe de-structure with defaults
  const {
    title = "Untitled",
    price = 0,
    currency,
    rent_cycle,
    category = "Unknown",
    image_urls,
    view_count = 0,
    description,
    contact_email,
    contact_phone_number,
    owner_info,
    created_at,
    listing_type = "N/A",
  } = property;

  // images array (may be undefined, ensure array)
  const images: string[] = Array.isArray(image_urls) ? image_urls : [];

  // Determine main image from selectedImageIndex or placeholder
  const mainImage =
    images.length > 0 && images[selectedImageIndex]
      ? images[selectedImageIndex]
      : "/placeholder.svg";

  // Thumbnails: show up to 4 additional images (but keep indices relative to `images` array)
  const thumbnailIndices =
    images.length > 1 ? images.slice(0, 5).map((_, i) => i) : []; // show up to 5 images (0..4) as thumbs if available

  // Format price robustly (price might be number or string)
  const priceNumber =
    typeof price === "string"
      ? Number(price.replace(/,/g, ""))
      : Number(price || 0);
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(priceNumber) ? Math.round(priceNumber) : 0);

  const listedDate = created_at ? new Date(created_at) : null;
  const today = new Date();
  const diffDays = listedDate
    ? Math.ceil(
        Math.abs(today.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : "N/A";

  // safe owner info
  const ownerName = owner_info?.full_name || "Property Owner";
  const ownerPicture = owner_info?.profile_picture_url || "/placeholder.svg";
  const ownerInitials =
    ownerName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PO";

  // recommendedProperties fallback (ensure it exists)
  const recommended = (property as any)?.recommended_properties || [];

  // Decide main image column span: if thumbnails exist, show thumbnail column
  const mainImageColSpan =
    thumbnailIndices.length > 0 ? "lg:col-span-2" : "lg:col-span-3";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Property Details</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Image */}
          <div className={`${mainImageColSpan}`}>
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-purple-100 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                  {category} - {listing_type}
                </span>
              </div>
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                aria-label={
                  property.is_favorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <svg
                  className={`h-6 w-6 ${
                    isFavorite
                      ? "text-red-600 fill-red-600"
                      : "text-muted-foreground"
                  }`}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.22 2.44C11.09 5 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <Image
                src={mainImage}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Thumbnails: only render if there are images */}
          {thumbnailIndices.length > 0 && (
            <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[400px]">
              {thumbnailIndices.map((idx) => (
                <button
                  key={images[idx] + idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`relative h-[90px] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity w-full block ${
                    selectedImageIndex === idx ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    src={images[idx]}
                    alt={`${title} view ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              {/* Title and Address */}
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{fullAddress}</span>
              </div>

              {/* Views and Listed Date */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{view_count} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {diffDays} days ago</span>
                </div>
              </div>
            </div>

            {/* Price and Rating (Placeholder for rating) */}
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-primary">
                {formattedPrice}
              </span>
              <div className="text-xl font-normal text-muted-foreground">
                /{rent_cycle || "Yearly"}
              </div>
              <div className="flex items-center gap-1 text-yellow-500 ml-4">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-foreground font-medium">
                  {view_count}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Description
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {description ||
                  "No detailed description provided for this property."}
              </p>
            </div>

            {/* Listing Agent */}
            <div className="bg-muted/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Listing Agent
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {/* <AvatarImage src={ownerPicture} /> */}
                    <AvatarFallback>{ownerInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      {ownerName}
                      <svg
                        className="h-4 w-4 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-white border border-border rounded-full hover:bg-muted transition-colors">
                    <Mail className="h-5 w-5 text-foreground" />
                  </button>
                  <button className="p-2.5 bg-white border border-border rounded-full hover:bg-muted transition-colors">
                    <Phone className="h-5 w-5 text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-sm sticky top-8">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">
                  Total Price ({listing_type})
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formattedPrice}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    /{rent_cycle || "N/A"}
                  </span>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full text-base font-medium">
                Contact Owner ({ownerName})
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
