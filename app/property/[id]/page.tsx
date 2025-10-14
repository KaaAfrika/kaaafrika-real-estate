"use client"
import { Header } from "@/components/header"
import { PropertyCard } from "@/components/property-card"
import Image from "next/image"
import { ArrowLeft, Bed, Car, Waves, MapPin, Eye, Calendar, Star, Mail, Phone, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchPropertyById, RawPropertyData, OwnerInfo } from "@/services/propertyService"
import { useParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'

const recommendedProperties = [

  {
    id: "7",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/modern-beach-house-with-pool.jpg",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "8",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/luxury-white-villa-with-pool.jpg",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "9",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/traditional-white-house.png",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
]

const fallbackThumbnails = [
  "/modern-bedroom.png",
  "/bright-living-room.jpg",
  "/modern-kitchen-island.png",
]



export default function PropertyDetailsPage() {
  const params = useParams()
  const propertyId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [property, setProperty] = useState<RawPropertyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) {
      setLoading(false)
      setError("No property ID provided.")
      return
    }

    const loadProperty = async () => {
      try {
        setLoading(true)
        const data = await fetchPropertyById(propertyId)
        setProperty(data)
      } catch (err) {
        console.error(err)
        setError("Could not load property details.")
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [propertyId])

  // Helper to format the address
  const fullAddress = useMemo(() => {
    if (!property) return "N/A"
    const parts = [property.street_address, property.city, property.state, property.country]
    return parts.filter(p => p).join(', ')
  }, [property])

  // Handle Loading and Error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium">Loading Property...</span>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 lg:px-8 py-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-muted-foreground">{error || "Property data is not available."}</p>
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mt-4">
                <ArrowLeft className="h-5 w-5" />
                Go back to home
            </Link>
        </main>
      </div>
    )
  }

  const {
    title,
    price,
    currency,
    rent_cycle,
    category,
    image_urls,
    view_count,
    description,
    contact_email,
    contact_phone_number,
    owner_info,
    created_at,
    listing_type,
  } = property

  // Determine main image and thumbnails
  const mainImage = image_urls[0] || "/placeholder.svg"
  const thumbnails = image_urls.slice(1, 5).length > 0 ? image_urls.slice(1, 5) : fallbackThumbnails
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency || 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price.split('.')[0])) 
  
  const listedDate = new Date(created_at)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - listedDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Property Details</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2">
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-purple-100 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                  {category} - {listing_type}
                </span>
              </div>
              <button className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors">
                {/* Favorite icon SVG */}
                <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <Image src={mainImage} alt={title} fill className="object-cover" />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="space-y-4">
            {thumbnails.map((thumb: string, index: number) => (
              <div
                key={index}
                className="relative h-[90px] rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src={thumb}
                  alt={`${title} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              {/* Title and Address */}
              <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
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
              <span className="text-4xl font-bold text-primary">{formattedPrice}</span>
              <div className="text-xl font-normal text-muted-foreground">/{rent_cycle || 'Yearly'}</div>
              <div className="flex items-center gap-1 text-yellow-500 ml-4">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-foreground font-medium">{view_count}</span>
                {/* <span className="text-muted-foreground">(345 reviews)</span> */}
              </div>
            </div>

            {/* Property Information (Kept Placeholder Info for lack of specific API fields) */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Property Information</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Bed className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">3</div>
                  <div className="text-sm text-muted-foreground">Beds Room</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Car className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">4</div>
                  <div className="text-sm text-muted-foreground">Parking Space</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Waves className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground mb-1">1</div>
                  <div className="text-sm text-muted-foreground">Swimming pool</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {description || "No detailed description provided for this property."}
              </p>
            </div>

            {/* Listing Agent */}
            <div className="bg-muted/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Listing Agent</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={owner_info.profile_picture_url || "/placeholder.svg"} />
                    <AvatarFallback>{owner_info.full_name.substring(0, 2).toUpperCase() || 'OG'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      {owner_info.full_name || 'Property Owner'}
                      <svg className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-muted-foreground">{contact_email || 'Email not listed'}</div>
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
                <div className="text-sm text-muted-foreground mb-1">Total Price ({listing_type})</div>
                <div className="text-3xl font-bold text-primary">
                  {formattedPrice} <span className="text-base font-normal text-muted-foreground">/{rent_cycle || 'N/A'}</span>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full text-base font-medium">
                Contact Owner ({owner_info.full_name})
              </Button>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Phone: **{contact_phone_number}**
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Properties */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recommended for you</h2>
            <Link href="/buy" className="text-primary font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.map((prop) => (
              <PropertyCard key={prop.id} {...prop} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}