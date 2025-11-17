"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getProfile } from "@/services/authService";
import { AxiosError } from "axios";

export function Header() {
  const [profileData, setProfileData] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const getProfileData = async () => {
    try {
      const data = await getProfile();
      setProfileData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Determine login state from localStorage token
    const token =
      typeof window !== "undefined" ? localStorage.getItem("kaa_token") : null;
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    // Only fetch profile data if user is logged in to avoid 401 redirect
    if (loggedIn) {
      getProfileData();
      try {
        const raw = localStorage.getItem("kaa_user");
        if (raw) {
          const parsed: any = JSON.parse(raw);
          const user = parsed?.user || parsed?.data?.user || parsed?.data;
          const medias = user?.medias;
          let url: string | undefined;
          if (Array.isArray(medias)) {
            const profileMedia = medias.find(
              (m: any) => m?.media_for === "profile_image"
            );
            url =
              profileMedia?.url ||
              profileMedia?.media_url ||
              profileMedia?.path;
          } else if (medias && typeof medias === "object") {
            if (medias?.media_for === "profile_image") {
              url = medias?.url || medias?.media_url || medias?.path;
            }
          }
          setAvatarUrl(url);
        }
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("kaa_token");
        localStorage.removeItem("kaa_user");
      }
    } catch {}
    setIsLoggedIn(false);
    setAvatarUrl(undefined);
    router.push("/login");
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/horizontal_logo.svg"
              alt="KaaAfrika Logo"
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-base font-medium transition-colors ${
                isActive("/")
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Home
            </Link>
            {/* <Link
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
            </Link> */}
            {isLoggedIn && (
              <Link
                href="/my-properties"
                className={`text-base font-medium transition-colors ${
                  isActive("/my-properties")
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                My Properties
              </Link>
            )}
            {isLoggedIn && (
              <Link
                href="/favorites"
                className={`text-base font-medium transition-colors ${
                  isActive("/favorites")
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                Favorites
              </Link>
            )}
            {/* Credits nav removed */}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            {/* <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
              <Heart className="h-5 w-5 text-foreground" />
            </button>
            <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button> */}
            {!isLoggedIn && (
              <Link
                href="/login"
                className="text-base font-medium text-foreground hover:text-primary"
              >
                Login
              </Link>
            )}
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <img
                    src={avatarUrl || "/placeholder-user.jpg"}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover border"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    className="hover:!bg-red-600 hover:!text-white focus:!bg-red-600 focus:!text-white"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <span className="material-symbols-outlined text-[28px] leading-none">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`px-2 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive("/")
                    ? 'bg-secondary text-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                Home
              </Link>
              {isLoggedIn && (
                <Link
                  href="/my-properties"
                  onClick={() => setMobileOpen(false)}
                  className={`px-2 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive("/my-properties")
                      ? 'bg-secondary text-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  My Properties
                </Link>
              )}
              {isLoggedIn && (
                <Link
                  href="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className={`px-2 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive("/favorites")
                      ? 'bg-secondary text-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  Favorites
                </Link>
              )}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-2 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
