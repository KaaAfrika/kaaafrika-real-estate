"use client"
import { Header } from "@/components/header"
import { ArrowLeft, MapPin, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchProperties, deleteProperty } from "@/services/propertyService"
import { Button } from "@/components/ui/button"

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
}

export default function MyPropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formatAmount = (value: string | number) => {
    const n = typeof value === 'string' ? Number(value) : value
    if (typeof n !== 'number' || isNaN(n)) return String(value)
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
  }
  const [properties, setProperties] = useState<ApiProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [firstPage, setFirstPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(9999)

  useEffect(() => {
    const p = Number(searchParams.get('page') || '1')
    setPage(Number.isNaN(p) || p < 1 ? 1 : p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
    try {
        const res = await fetchProperties({ page })
        // API response shape: { status, message, data: { data: [...] } }
        const payload: any = res?.data ?? res
        const container: any = payload?.data ?? payload
        const apiData: any[] = Array.isArray(container?.data) ? container.data : Array.isArray(container) ? container : []
        setProperties(apiData)
        const fp = container?.first_page ?? container?.firstPage ?? 1
        const lp = container?.last_page ?? container?.lastPage ?? page
        setFirstPage(typeof fp === 'number' && fp > 0 ? fp : 1)
        setLastPage(typeof lp === 'number' && lp >= page ? lp : page)
      } catch (err: any) {
        setError(err?.message || "Failed to load properties")
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
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">My Property</span>
          </Link>
          <Link href="/list-property">
            <Button className="bg-primary text-primary-foreground rounded-full">+ List Property</Button>
          </Link>
        </div>

        {loading && <div>Loading properties...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {deleteError && <div className="text-red-600 mb-4">{deleteError}</div>}
        <div className="space-y-4">
          {properties.map((property) => (
            <Link href={`/property/${property.id}`} key={property.id} className="block">
              <div className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="relative">
                  <span className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {property.listing_type || property.category}
                  </span>
                  <div className="relative h-24 w-32 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={property.image_urls?.[0] || "/placeholder.svg"}
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
                    <span>{property.city}, {property.state}, {property.country}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(property.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="text-xl font-bold text-primary">{formatAmount(property.price)}</div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteError(null);
                      setDeletingId(property.id);
                      try {
                        await deleteProperty(property.id as number)
                        setProperties((prev) => prev.filter((p) => p.id !== property.id))
                      } catch (err: any) {
                        const raw = err?.response?.data
                        if (raw) {
                          try { setDeleteError(typeof raw === 'string' ? raw : JSON.stringify(raw)) } catch { setDeleteError('Delete failed') }
                        } else {
                          setDeleteError(err?.message || 'Delete failed')
                        }
                      } finally {
                        setDeletingId(null)
                      }
                    }}
                    disabled={deletingId === property.id}
                  >
                    {deletingId === property.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
