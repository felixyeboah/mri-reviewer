import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink } from "better-auth/plugins"
import { Resend } from "resend"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { renderMagicLinkEmail } from "@/lib/email/magic-link"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const html = renderMagicLinkEmail({ url })

        if (process.env.NODE_ENV === "development" || !resend) {
          console.log("\n──────────────────────────────────────")
          console.log("  Magic Link Email")
          console.log("──────────────────────────────────────")
          console.log(`  To:   ${email}`)
          console.log(`  Link: ${url}`)
          console.log("──────────────────────────────────────\n")
          return
        }

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "MRI Reviewer <noreply@resend.dev>",
          to: email,
          subject: "Sign in to MRI Reviewer",
          html,
        })
      },
    }),
  ],
})
