import Link from "next/link"
import { redirect } from "next/navigation"

export default function HomePage() {
  // redirect default route to /login
  redirect('/login')
}

const topProperties = [
  {
    id: "1",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/modern-apartment-building.png",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "2",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/luxury-cabin-house-at-night.jpg",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "3",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/modern-white-house-pool.png",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
]

const recommendedProperties = [
  {
    id: "4",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/modern-house-with-warm-lighting.jpg",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "5",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/white-farmhouse-style-home.jpg",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
  {
    id: "6",
    title: "Glass Horizon",
    address: "4140 Parker Rd. Allentown,",
    price: 720000,
    views: "4.9k",
    image: "/modern-white-minimalist-house.jpg",
    agentName: "Glass Horizon",
    agentAvatar: "/placeholder.svg?height=40&width=40",
    description: "spacious family home with modern amenities, beautiful garden, and excellent security. perfect for",
  },
]

// legacy home content removed; route redirects to /login by default
