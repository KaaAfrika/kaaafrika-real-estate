import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface PropertyCardProps {
  id: string
  title: string
  address: string
  price: number
  views: string
  image: string
  agentName: string
  agentAvatar: string
  description: string
}

export function PropertyCard({
  id,
  title,
  address,
  price,
  views,
  image,
  agentName,
  agentAvatar,
  description,
}: PropertyCardProps) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-56 group">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <button className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors">
          <Heart className="h-5 w-5 text-primary" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agentAvatar || "/placeholder.svg"} />
            <AvatarFallback>{agentName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-1 truncate">{title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{address}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{views} views</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">₦ {price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-1">Negotiable</span>
          </div>
          <Link href={`/property/${id}`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
