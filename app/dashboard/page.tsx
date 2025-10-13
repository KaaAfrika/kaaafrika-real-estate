"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { HeroBanner } from "@/components/hero-banner"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
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
  view_count: number
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchProperties()
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
        <div className="mb-8">
          <HeroBanner />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <span className="text-primary">🏠</span> Home
          </span>
          <span>•</span>
          <span>📍 Calabar</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button variant="default" className="bg-primary text-primary-foreground rounded-full">
              All
            </Button>
            <Button variant="outline" className="rounded-full bg-transparent">
              House
            </Button>
            <Button variant="outline" className="rounded-full bg-transparent">
              Apartment
            </Button>
            <Button variant="outline" className="rounded-full bg-transparent">
              Bungalo
            </Button>
          </div>
          <div className="ml-auto">
            <Link href="/list-property">
              <Button className="bg-primary text-primary-foreground rounded-full">+ List Properties</Button>
            </Link>
          </div>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search for products" className="pl-12 pr-12 h-12 rounded-xl bg-muted/50 border-0" />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Properties section now uses API data */}
        {error && <div className="text-red-600">{error}</div>}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Properties</h2>
            <span className="text-primary font-medium hover:underline cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[340px] w-full rounded-xl" />
                ))
              : properties.map((property) => (
                  <Link href={`/property/${property.id}`} key={property.id} passHref legacyBehavior>
                    <a style={{ textDecoration: "none" }}>
                      <PropertyCard
                        id={property.id.toString()}
                        title={property.title}
                        address={property.city + ', ' + property.state + ', ' + property.country}
                        price={Number(property.price) || 0}
                        image={property.image_urls?.[0] || "/placeholder.svg"}
                        description={property.description}
                        agentName={""}
                        agentAvatar={"/placeholder.svg?height=40&width=40"}
                        views={(property.view_count ?? 0).toString()}
                      />
                    </a>
                  </Link>
                ))}
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" className="rounded-full px-8 bg-transparent">
            View More
          </Button>
        </div>
      </main>
    </div>
  )
}
