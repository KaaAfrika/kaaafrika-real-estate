"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { creditBalance, convertCredit } from "@/services/propertyService"

type Balances = {
  credit: number | null
  wallet: number | null
}

type UserInfo = {
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [balances, setBalances] = useState<Balances>({ credit: null, wallet: null })
  const [loadingBalances, setLoadingBalances] = useState<boolean>(true)
  const [balanceError, setBalanceError] = useState<string | null>(null)

  const [showConvert, setShowConvert] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>("")
  const [converting, setConverting] = useState<boolean>(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [convertResponse, setConvertResponse] = useState<any>(null)

  const [user, setUser] = useState<UserInfo>({})

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kaa_token') : null
    if (!token) {
      router.replace('/login')
      return
    }

    try {
      const raw = localStorage.getItem('kaa_user')
      if (raw) {
        const parsed: any = JSON.parse(raw)
        const u = parsed?.user || parsed?.data?.user || parsed?.data
        const firstName = u?.first_name || u?.firstName
        const lastName = u?.last_name || u?.lastName
        let avatarUrl: string | undefined
        const medias = u?.medias
        if (Array.isArray(medias)) {
          const m = medias.find((m: any) => m?.media_for === 'profile_image')
          avatarUrl = m?.url || m?.media_url || m?.path
        } else if (medias && typeof medias === 'object') {
          if (medias?.media_for === 'profile_image') {
            avatarUrl = medias?.url || medias?.media_url || medias?.path
          }
        }
        setUser({ firstName, lastName, avatarUrl })
      }
    } catch {}
  }, [router])

  async function loadBalances() {
    setLoadingBalances(true)
    setBalanceError(null)
    try {
      const res = await creditBalance()
      const payload: any = res?.data ?? res
      const credit = payload?.data?.credit_balance ?? payload?.credit_balance ?? null
      const wallet = payload?.data?.wallet_balance ?? payload?.wallet_balance ?? null
      setBalances({ credit, wallet })
    } catch (err: any) {
      setBalanceError(err?.message || "Failed to load balances")
    } finally {
      setLoadingBalances(false)
    }
  }

  useEffect(() => {
    loadBalances()
  }, [])

  async function onConvertSubmit(e: React.FormEvent) {
    e.preventDefault()
    setConvertError(null)
    setConvertResponse(null)
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) {
      setConvertError("Enter a valid amount greater than 0")
      return
    }
    try {
      setConverting(true)
      const res = await convertCredit(value)
      setConvertResponse(res)
      await loadBalances()
    } catch (err: any) {
      const raw = err?.response?.data
      if (raw) {
        try {
          setConvertError(typeof raw === 'string' ? raw : JSON.stringify(raw))
        } catch {
          setConvertError('Conversion failed')
        }
      } else {
        setConvertError(err?.message || 'Conversion failed')
      }
    } finally {
      setConverting(false)
    }
  }

  const fullName = useMemo(() => {
    const f = user.firstName?.trim() || ''
    const l = user.lastName?.trim() || ''
    return `${f} ${l}`.trim() || 'User'
  }, [user.firstName, user.lastName])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col items-start gap-4">
          <img
            src={user.avatarUrl || '/placeholder-user.jpg'}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border"
          />
          <div>
            <h1 className="text-2xl font-semibold">{fullName}</h1>
            <p className="text-muted-foreground">Your profile and credits</p>
          </div>
        </div>

        <section className="space-y-2">
          {loadingBalances && <div>Loading balances...</div>}
          {balanceError && <div className="text-red-600">{balanceError}</div>}
          {!loadingBalances && !balanceError && (
            <>
              <div className="text-foreground">Credit Balance: <span className="font-semibold">{balances.credit == null ? '-' : new Intl.NumberFormat('en-US').format(Number(balances.credit))}</span></div>
              <div className="text-foreground">Wallet Balance: <span className="font-semibold">{balances.wallet == null ? '-' : new Intl.NumberFormat('en-US').format(Number(balances.wallet))}</span></div>
            </>
          )}
        </section>

        <section className="space-y-3">
          {!showConvert && (
            <Button onClick={() => setShowConvert(true)}>Convert Credit</Button>
          )}
          {showConvert && (
            <form onSubmit={onConvertSubmit} className="flex flex-col sm:flex-row items-start gap-3 max-w-md">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to convert"
                className="w-full sm:w-64"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={converting}>{converting ? 'Converting...' : 'Convert'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowConvert(false); setAmount(''); setConvertError(null); }}>Cancel</Button>
              </div>
            </form>
          )}
          {convertError && <div className="text-red-600">{convertError}</div>}
        </section>

        {convertResponse && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Conversion Response</h2>
            <pre className="bg-muted/40 rounded-lg p-4 overflow-auto text-sm">{JSON.stringify(convertResponse, null, 2)}</pre>
          </section>
        )}
      </main>
    </div>
  )
}
