"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { addFavorite, getFavorites } from "@/services/propertyService"

type FavProperty = {
  id: number
  title: string
  description: string
  city: string
  state: string
  country: string
  price: string
  image_urls: string[]
  view_count?: number
  is_favorite?: boolean
}

export default function FavoritesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<FavProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [firstPage, setFirstPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(9999)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kaa_token') : null
    if (!token) {
      router.replace('/login')
      return
    }
    const p = Number(searchParams.get('page') || '1')
    setPage(Number.isNaN(p) || p < 1 ? 1 : p)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await getFavorites(page)
        const payload: any = res?.data ?? res
        const container: any = payload?.data ?? payload
        const apiData: any[] = Array.isArray(container?.data) ? container.data : Array.isArray(container) ? container : []
        setProperties(apiData)
        const fp = container?.first_page ?? container?.firstPage ?? 1
        const lp = container?.last_page ?? container?.lastPage ?? page
        setFirstPage(typeof fp === 'number' && fp > 0 ? fp : 1)
        setLastPage(typeof lp === 'number' && lp >= page ? lp : page)
      } catch (err: any) {
        setError(err?.message || 'Failed to load favorites')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  function goToPage(next: number) {
    const n = Math.max(firstPage, Math.min(lastPage, next))
    setPage(n)
    const q = new URLSearchParams(Array.from(searchParams?.entries?.() || []))
    q.set('page', String(n))
    router.push(`?${q.toString()}`)
  }

  function getPages(current: number, first: number, last: number) {
    const c = Math.max(first, Math.min(last, current))
    const maxButtons = 7
    const pages: (number | string)[] = []
    if (last - first + 1 <= maxButtons) {
      for (let i = first; i <= last; i++) pages.push(i)
      return pages
    }
    pages.push(first)
    const start = Math.max(first + 1, c - 1)
    const end = Math.min(last - 1, c + 1)
    if (start > first + 1) pages.push('…')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < last - 1) pages.push('…')
    pages.push(last)
    return pages
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Favorites</h1>
          <Link href="/list-property">
            <Button className="bg-primary text-primary-foreground rounded-full">+ List Property</Button>
          </Link>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <div>Loading favorites...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <Link href={`/property/${p.id}`} key={p.id} passHref legacyBehavior>
                <PropertyCard
                  id={p.id.toString()}
                  title={p.title}
                  address={`${p.city}, ${p.state}, ${p.country}`}
                  price={Number(p.price) || 0}
                  image={p.image_urls?.[0] || "/placeholder.svg"}
                  description={p.description}
                  agentName={""}
                  agentAvatar={"/placeholder.svg?height=40&width=40"}
                  views={(p.view_count ?? 0).toString()}
                  isFavorite={!!p.is_favorite}
                  onToggleFavorite={async (id) => {
                    try {
                      const resp = await addFavorite(Number(id))
                      const updated = (resp?.data?.is_favorite ?? resp?.is_favorite ?? resp?.isFavourite ?? resp?.is_favourite)
                      const becameFav = typeof updated === 'boolean' ? updated : false
                      // If it became unfavorited, remove from list; if favorited, keep
                      if (!becameFav) {
                        setProperties((prev) => prev.filter((x) => x.id.toString() !== id))
                      } else {
                        setProperties((prev) => prev.map((x) => x.id.toString() === id ? { ...x, is_favorite: true } : x))
                      }
                    } catch (err) {
                      console.error('toggle favorite failed', err)
                    }
                  }}
                />
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <Button variant="outline" className="rounded-full" onClick={() => goToPage(page - 1)} disabled={page <= firstPage}>
            Previous
          </Button>
          {getPages(page, firstPage, lastPage).map((p, idx) => (
            typeof p === 'number' ? (
              <Button
                key={idx}
                variant={page === p ? 'default' : 'outline'}
                className="rounded-full min-w-10"
                disabled={page === p}
                onClick={() => goToPage(p)}
              >
                {p}
              </Button>
            ) : (
              <Button key={idx} variant="outline" className="rounded-full" disabled>
                {p as string}
              </Button>
            )
          ))}
          <Button variant="outline" className="rounded-full" onClick={() => goToPage(page + 1)} disabled={page >= lastPage}>
            Next
          </Button>
        </div>
      </main>
    </div>
  )
}
