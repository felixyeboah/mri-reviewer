"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  PanelCard,
  PanelCardHeader,
  PanelCardTitle,
  PanelCardContent,
  PanelCardBody,
  PanelCardSection,
  PanelCardFooter,
} from "@/components/ui/panel-card"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isSent, setIsSent] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "" },
    mode: "onChange",
  })

  const isSubmitting = form.formState.isSubmitting
  const isValid = form.formState.isValid
  const isBusy = isSubmitting || googleLoading

  async function onSubmit(values: RegisterValues) {
    const { error } = await authClient.signIn.magicLink({
      email: values.email,
      name: values.name,
      callbackURL: "/reviews",
    })

    if (error) {
      toast.error(error.message ?? "Something went wrong")
    } else {
      setIsSent(true)
      toast.success("Magic link sent! Check your inbox.")
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/reviews",
      })
    } catch {
      toast.error("Failed to start Google sign in")
      setGoogleLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <PanelCard>
          <PanelCardHeader>
            <PanelCardTitle>Check your email</PanelCardTitle>
          </PanelCardHeader>
          <PanelCardContent>
            <PanelCardBody className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                We sent a magic link to{" "}
                <span className="font-medium text-foreground">
                  {form.getValues("email")}
                </span>
                . Click the link to complete your registration.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Use a different email
              </button>
            </PanelCardBody>
          </PanelCardContent>
        </PanelCard>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <PanelCard>
        <PanelCardHeader>
          <PanelCardTitle>Create your account</PanelCardTitle>
        </PanelCardHeader>
        <PanelCardContent>
          <PanelCardBody>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full"
                  disabled={!isValid || isBusy}
                  type="submit"
                >
                  {isSubmitting && (
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="size-4 animate-spin"
                    />
                  )}
                  {isSubmitting ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            </Form>
          </PanelCardBody>
          <PanelCardSection>
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-muted-foreground dark:bg-[#171717]">
                  or
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={isBusy}
            >
              {googleLoading ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2 size-4 animate-spin"
                />
              ) : (
                <svg className="mr-2 size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </Button>
          </PanelCardSection>
        </PanelCardContent>
        <PanelCardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </PanelCardFooter>
      </PanelCard>
    </div>
  )
}
