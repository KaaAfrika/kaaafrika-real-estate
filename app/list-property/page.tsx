"use client"

import { useState } from "react"
import { X, Upload, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export default function ListPropertyPage() {
  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleContinue = () => {
    setStep(2)
  }

  const handleSubmit = () => {
    setShowSuccess(true)
  }

  const handleGoHome = () => {
    router.push("/")
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-32 w-32 rounded-full bg-green-600 flex items-center justify-center">
              <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-8">
            You've Successfully List
            <br />
            Your Property
          </h1>
          <Button
            onClick={handleGoHome}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 h-12 text-base font-medium"
          >
            Go back home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 relative">
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">List Property</h1>
          <p className="text-muted-foreground">List your property and find the right buyer fast</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-1 w-20 rounded-full ${step === 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-1 w-20 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <Input placeholder="Title" className="h-12 rounded-xl bg-muted/50 border-0" />
            <Textarea
              placeholder="Property Description"
              className="min-h-[100px] rounded-xl bg-muted/50 border-0 resize-none"
            />
            <Input placeholder="Enter Amount" className="h-12 rounded-xl bg-muted/50 border-0" />
            <div className="relative">
              <Input placeholder="Condition" className="h-12 rounded-xl bg-muted/50 border-0 pr-10" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <Input placeholder="Negotiable" className="h-12 rounded-xl bg-muted/50 border-0 pr-10" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
            <Button
              onClick={handleContinue}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full text-base font-medium mt-6"
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Upload Property images</p>
              <p className="text-xs text-muted-foreground">
                Drop your images here, or{" "}
                <span className="text-primary cursor-pointer hover:underline">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed
              </p>
            </div>

            <div className="relative">
              <Input placeholder="Property type" className="h-12 rounded-xl bg-muted/50 border-0 pr-10" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <Input placeholder="For Rent" className="h-12 rounded-xl bg-muted/50 border-0 pr-10" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            <div className="relative">
              <Input placeholder="Property Address" className="h-12 rounded-xl bg-muted/50 border-0 pr-10" />
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>

            <div className="border-2 border-dashed border-muted rounded-xl p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Proof of ownership</p>
              <p className="text-xs text-muted-foreground">
                Upload document here, or{" "}
                <span className="text-primary cursor-pointer hover:underline">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are allowed
              </p>
            </div>

            <Input placeholder="Contact phone no" className="h-12 rounded-xl bg-muted/50 border-0" />

            <Button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-full text-base font-medium mt-6"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
