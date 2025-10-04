import { Header } from "@/components/header"
import { ArrowLeft, MapPin, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const myProperties = [
  {
    id: "1",
    title: "Modern 4-Bedroom Flat",
    description: "Luxury duplex with contemporary...",
    location: "Victoria Island, Lagos",
    views: "4.9k views",
    listedDate: "7days ago",
    price: "$720,000",
    image: "/placeholder.svg?key=myprop1",
  },
  {
    id: "2",
    title: "Modern 4-Bedroom Flat",
    description: "Luxury duplex with contemporary...",
    location: "Victoria Island, Lagos",
    views: "4.9k views",
    listedDate: "7days ago",
    price: "$720,000",
    image: "/placeholder.svg?key=myprop2",
  },
  {
    id: "3",
    title: "Modern 4-Bedroom Flat",
    description: "Luxury duplex with contemporary...",
    location: "Victoria Island, Lagos",
    views: "4.9k views",
    listedDate: "7days ago",
    price: "$720,000",
    image: "/placeholder.svg?key=myprop3",
  },
  {
    id: "4",
    title: "Modern 4-Bedroom Flat",
    description: "Luxury duplex with contemporary...",
    location: "Victoria Island, Lagos",
    views: "4.9k views",
    listedDate: "7days ago",
    price: "$720,000",
    image: "/placeholder.svg?key=myprop4",
  },
]

export default function MyPropertiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">My Property</span>
        </Link>

        <div className="space-y-4">
          {myProperties.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="relative">
                <span className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  For Sale
                </span>
                <div className="relative h-24 w-32 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={property.image || "/placeholder.svg"}
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
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{property.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{property.listedDate}</span>
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
