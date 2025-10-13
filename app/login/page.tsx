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
      // Ensure phone number is sent as 234XXXXXXXXXX
      let apiPhone = phone
      // If phone starts with '0' and is 11 digits, convert to '234' + rest
      if (/^0\d{10}$/.test(phone)) {
        apiPhone = '234' + phone.slice(1)
      } else if (/^\d{10}$/.test(phone)) {
        apiPhone = '234' + phone
      }
      const res = await login(apiPhone, password)
      // store token (simple example)
      if (res?.data.token) {
        localStorage.setItem('kaa_token', res.data.token)
        if (res?.data) {
          localStorage.setItem('kaa_user', JSON.stringify(res.data))
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
          <label className="text-sm font-medium">Phone Number</label>
          <Input value={phone} onChange={(e) => setPhone((e.target as HTMLInputElement).value)} placeholder="e.g. 1234567890" />

          <label className="text-sm font-medium">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} placeholder="••••••••" />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
