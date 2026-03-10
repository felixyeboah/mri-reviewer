"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifiedRef = useRef(false)

  useEffect(() => {
    if (verifiedRef.current) return
    verifiedRef.current = true

    const token = searchParams.get("token")
    if (!token) {
      toast.error("Missing verification token")
      router.push("/auth/login")
      return
    }

    authClient.magicLink
      .verify({ token, callbackURL: "/reviews" })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message ?? "Verification failed")
          router.push("/auth/login")
        } else {
          toast.success("Signed in successfully!")
          router.push("/reviews")
        }
      })
  }, [searchParams, router])

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
      <p className="text-sm text-muted-foreground">Verifying your link...</p>
    </div>
  )
}
