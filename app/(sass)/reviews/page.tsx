export const dynamic = "force-dynamic"

import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { desc, eq } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { ReviewCard } from "@/components/review-card"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/login")

  const allReviews = await db
    .select({
      id: reviews.id,
      title: reviews.title,
      fileName: reviews.fileName,
      analysisText: reviews.analysisText,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.userId, session.user.id))
    .orderBy(desc(reviews.createdAt))

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              MRI Reviewer
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered medical image analysis
            </p>
          </div>
          <Link href="/reviews/new">
            <Button size="sm">New Review</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {allReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="text-4xl">🩻</div>
              <h2 className="text-lg font-medium">No reviews yet</h2>
              <p className="text-sm text-muted-foreground">
                Upload an MRI or X-ray to get started with your first analysis.
              </p>
              <Link href="/reviews/new">
                <Button>Start New Review</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
