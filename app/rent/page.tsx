import { Header } from "@/components/header"
import { HeroBanner } from "@/components/hero-banner"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

const topProperties = [
  {
    id: "10",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/placeholder.svg?key=rent1",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "11",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/placeholder.svg?key=rent2",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "12",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/placeholder.svg?key=rent3",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
]

const recommendedProperties = [
  {
    id: "13",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/placeholder.svg?key=rent4",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "14",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/placeholder.svg?key=rent5",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "15",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/placeholder.svg?key=rent6",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
]

export default function RentPage() {
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

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Top Property</h2>
            <span className="text-primary font-medium hover:underline cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Recommended for you</h2>
            <span className="text-primary font-medium hover:underline cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
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
