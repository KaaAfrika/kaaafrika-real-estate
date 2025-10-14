"use client"
import { Header } from "@/components/header"
import { ArrowLeft, MapPin, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { fetchProperties } from "@/services/propertyService"

type ApiProperty = {
  id: number
  title: string
  description: string
  city: string
  state: string
  country: string
  price: string
  image_urls: string[]
  created_at: string
  status: string
  category: string
  listing_type: string
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchProperties()
        // API response shape: { status, message, data: { data: [...] } }
        const apiData = res?.data?.data || []
        setProperties(apiData)
      } catch (err: any) {
        setError(err?.message || "Failed to load properties")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">My Property</span>
        </Link>

        {loading && <div>Loading properties...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="relative">
                <span className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {property.listing_type || property.category}
                </span>
                <div className="relative h-24 w-32 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={property.image_urls?.[0] || "/placeholder.svg"}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground mb-1">{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{property.description}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{property.city}, {property.state}, {property.country}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-primary">{property.price}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
