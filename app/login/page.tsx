"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login } from "@/services/authService"
import { useToast } from "@/hooks/use-toast"


export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const sanitizedPhone = phone.replace(/\D/g, '')
      if (sanitizedPhone.length !== 10) {
        const msg = 'Phone number must be exactly 10 digits'
        setError(msg)
        toast({
          title: 'Invalid phone number',
          description: msg,
          variant: 'destructive',
        })
        return
      }
      const apiPhone = '234' + sanitizedPhone
      const res = await login(apiPhone, password)
      // store token (simple example)
      if (res?.data.token) {
        localStorage.setItem('kaa_token', res.data.token)
        if (res?.data) {
          localStorage.setItem('kaa_user', JSON.stringify(res.data))
          try {
            const d: any = res.data
            const user = d?.user || d?.data?.user || d?.data || d
            const email = user?.email || d?.email || ''
            const phone = user?.phone_number || d?.phone_number || ''
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('kaa_email', String(email || ''))
              sessionStorage.setItem('kaa_phone', String(phone || ''))
            }
          } catch {}
        }
        router.push('/dashboard')
      }
    } catch (err: any) {
      let apiMsg = err?.message || 'Login failed'
      // If the error message is a JSON string, extract the 'message' field
      try {
        const parsed = JSON.parse(apiMsg)
        if (parsed && typeof parsed === 'object' && parsed.message) {
          apiMsg = parsed.message
        }
      } catch {}
      setError(apiMsg)
      toast({
        title: 'Login Error',
        description: apiMsg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image src="/kaaafrika_vertical_logo.svg" alt="KaaAfrika" width={80} height={48} />
          <h1 className="text-2xl font-bold">Sign in to KaaAfrika</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">+234</span>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)
                  setPhone(digits)
                }}
                placeholder="1234567890"
                inputMode="numeric"
                maxLength={10}
              />
            </div>
          </div>

          <label className="text-sm font-medium">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} placeholder="••••••••" />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-[#4E008E] text-white hover:bg-[#4E008E]/90"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:flex-1">
              <a
                href="https://play.google.com/store/apps/details?id=com.drivekaaafrika.user.kaaafrika"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign up on Android
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:flex-1">
              <a
                href="https://apps.apple.com/app/id6749592675"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign up on Apple
              </a>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
