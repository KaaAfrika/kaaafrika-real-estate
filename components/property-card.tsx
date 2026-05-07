"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { KeyboardEvent, MouseEvent } from "react";
import { Heart, MapPin, Eye, Play } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  address?: string;
  price: number;
  views?: number | string;
  image?: string;
  videoUrl?: string;
  agentName?: string;
  agentAvatar?: string;
  description?: string;
  negotiable?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, next: boolean) => void;
}

const currencyFormat = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export function PropertyCard({
  id,
  title,
  address = "",
  price,
  views = 0,
  image,
  videoUrl,
  agentName = "Agent",
  agentAvatar,
  description = "",
  negotiable = false,
  isFavorite,
  onToggleFavorite,
}: PropertyCardProps) {
  const router = useRouter();

  // navigate to property details
  function goToDetails() {
    router.push(`/property/${id}`);
  }

  // Keyboard accessibility: Enter or Space should activate the card
  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetails();
    }
  }

  // prevent navigation when interacting with the favorite button
  function handleFavClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(id, !isFavorite);
    }
  }

  return (
    <article
      tabIndex={0}
      role="link"
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      aria-label={`View details for ${title}`}
    >
      <div className="relative h-56 group">
        <Image
          src={image ?? "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL="/placeholder.svg"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
            <div className="bg-white/90 p-2.5 rounded-full shadow-lg">
              <Play className="h-6 w-6 text-primary fill-primary" />
            </div>
            <span className="absolute bottom-4 left-4 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
              VIDEO
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleFavClick}
          aria-label="Add to favorites"
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors z-10"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-600 fill-red-600' : 'text-primary'}`} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
              {title}
            </h3>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{address}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
           <span>{new Intl.NumberFormat().format(Number(views ?? 0))} views</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              {currencyFormat(price)}
            </span>
            {negotiable && (
              <span className="text-sm text-muted-foreground ml-1">
                Negotiable
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToDetails();
            }}
            className="rounded-full px-6 py-2 bg-[#4E008E] hover:bg-primary/90 text-primary-foreground"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
