"use client";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { HeroBanner } from "@/components/hero-banner";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { fetchProperties, ISearchFilter } from "@/services/propertyService";

type ApiProperty = {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  country: string;
  price: string;
  image_urls: string[];
  created_at: string;
  status: string;
  category: string;
  listing_type: string;
  view_count: number;
};

export default function DashboardPage() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ISearchFilter>({
    page: 1,
    limit: 10,
    listing: "",
    category: "",
    city: "",
    state: "",
    min: 0,
    max: 100000000,
    search: "",
    sort: "",
  });

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // debounce for search
  const searchDebounceRef = useRef<number | null>(null);

  // internal query state for the immediate input (so typing doesn't immediately change filters.search)
  const [searchInput, setSearchInput] = useState(filters.search);

  // load properties function
  async function loadProperties(currentFilters: ISearchFilter) {
    setLoading(true);
    setError(null);
    try {
      console.log("[loadProperties] calling with filters:", currentFilters);
      const res = await fetchProperties(currentFilters);
      console.log("[loadProperties] fetchProperties returned:", res);
      const apiData = res?.data?.data || res?.data || [];
      setProperties(apiData);
    } catch (err: any) {
      console.error("[loadProperties] error:", err);
      setError(err?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  // initial load and when filters (except search input) change.
  // We'll trigger load when `filters` changes. `search` will be set in a debounced manner below.
  useEffect(() => {
    loadProperties(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // stringify to compare nested object safely

  // handle search input with debounce
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    // debounce 500ms
    searchDebounceRef.current = window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, page: 1, search: searchInput }));
    }, 500);

    return () => {
      if (searchDebounceRef.current)
        window.clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  // handlers
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value);
  }

  function openFilters() {
    setIsDrawerOpen(true);
  }

  function closeFilters() {
    setIsDrawerOpen(false);
  }

  function handleFilterChange<K extends keyof ISearchFilter>(
    key: K,
    value: ISearchFilter[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function applyFilters() {
    // drawer inputs should already be writing into `filters` via handleFilterChange.
    // We'll close the drawer. The effect on filters triggers the fetch.
    setIsDrawerOpen(false);
  }

  function clearFilters() {
    const cleared: ISearchFilter = {
      page: 1,
      limit: 10,
      listing: "",
      category: "",
      city: "",
      state: "",
      min: 0,
      max: 1000000000,
      search: "",
      sort: "",
    };
    setSearchInput("");
    setFilters(cleared);
  }

  function goToPage(nextPage: number) {
    setFilters((prev) => ({ ...prev, page: nextPage }));
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <HeroBanner />
        </div>

        {/* <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <span className="text-primary">🏠</span> Home
          </span>
          <span>•</span>
          <span>📍 Calabar</span>
        </div> */}

        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* <div className="flex gap-2">
            <Button
              variant="default"
              className="bg-primary text-primary-foreground rounded-full"
            >
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
          </div> */}
          <div className="ml-auto">
            <Link href="/list-property">
              <Button className="bg-primary text-primary-foreground rounded-full">
                + List Properties
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mb-12">
          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search for properties"
              className="pl-12 pr-12 h-12 rounded-xl bg-muted/50 border-0 w-full"
            />
            <button
              onClick={openFilters}
              aria-label="Open filters"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Drawer / Panel for advanced filters */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex">
              {/* backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={closeFilters}
                aria-hidden
              />
              <div className="relative ml-auto w-full max-w-md bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>

                <label className="block mb-2">
                  <span className="text-sm">Listing type</span>
                  <select
                    value={filters.listing}
                    onChange={(e) =>
                      handleFilterChange("listing", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border px-2 py-1"
                  >
                    <option value="">Any</option>
                    <option value="Rent">Rent</option>
                    <option value="Sell">Sell</option>
                  </select>
                </label>

                <label className="block mb-2">
                  <span className="text-sm">Category</span>
                  <input
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    placeholder="e.g. apartment"
                    className="mt-1 w-full rounded-md border px-2 py-1"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <label>
                    <span className="text-sm">City</span>
                    <input
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border px-2 py-1"
                    />
                  </label>
                  <label>
                    <span className="text-sm">State</span>
                    <input
                      value={filters.state}
                      onChange={(e) =>
                        handleFilterChange("state", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border px-2 py-1"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <label>
                    <span className="text-sm">Min price</span>
                    <input
                      type="number"
                      value={filters.min}
                      onChange={(e) =>
                        handleFilterChange("min", Number(e.target.value || 0))
                      }
                      className="mt-1 w-full rounded-md border px-2 py-1"
                    />
                  </label>
                  <label>
                    <span className="text-sm">Max price</span>
                    <input
                      type="number"
                      value={filters.max}
                      onChange={(e) =>
                        handleFilterChange("max", Number(e.target.value || 0))
                      }
                      className="mt-1 w-full rounded-md border px-2 py-1"
                    />
                  </label>
                </div>

                <label className="block mb-4">
                  <span className="text-sm">Sort</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="mt-1 w-full rounded-md border px-2 py-1"
                  >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="views_desc">Newest</option>
                    <option value="createdAt_desc">Recently Created</option>
                  </select>
                </label>

                <div className="flex justify-between gap-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-md border"
                    type="button"
                  >
                    Clear
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={closeFilters}
                      className="px-4 py-2 rounded-md border"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 rounded-md bg-primary text-white"
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties section now uses API data */}
        {error && <div className="text-red-600">{error}</div>}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Properties</h2>
            <span className="text-primary font-medium hover:underline cursor-pointer">
              View All
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[340px] w-full rounded-xl" />
                ))
              : properties.map((property) => (
                  <Link
                    href={`/property/${property.id}`}
                    key={property.id}
                    passHref
                    legacyBehavior
                  >
                    <PropertyCard
                      id={property.id.toString()}
                      title={property.title}
                      address={
                        property.city +
                        ", " +
                        property.state +
                        ", " +
                        property.country
                      }
                      price={Number(property.price) || 0}
                      image={property.image_urls?.[0] || "/placeholder.svg"}
                      description={property.description}
                      agentName={""}
                      agentAvatar={"/placeholder.svg?height=40&width=40"}
                      views={(property.view_count ?? 0).toString()}
                    />
                  </Link>
                ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            className="rounded-full px-8 bg-transparent"
          >
            View More
          </Button>
        </div>
      </main>
    </div>
  );
}
