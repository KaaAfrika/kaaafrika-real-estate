"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/horizontal_logo.svg" alt="KaaAfrika Logo" className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-base font-medium transition-colors ${
                isActive("/") ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Home
            </Link>
            <Link
              href="/rent"
              className={`text-base font-medium transition-colors ${
                isActive("/rent") ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Rent
            </Link>
            <Link
              href="/buy"
              className={`text-base font-medium transition-colors ${
                isActive("/buy") ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Buy
            </Link>
            <Link
              href="/my-properties"
              className={`text-base font-medium transition-colors ${
                isActive("/my-properties") ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              My Properties
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
              <Heart className="h-5 w-5 text-foreground" />
            </button>
            <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
