import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { eq, and } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { ReviewView } from "@/components/review-view"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/login")

  const { id } = await params
  const review = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, Number(id)), eq(reviews.userId, session.user.id)))
    .get()

  if (!review) notFound()

  const regions = JSON.parse(review.regions)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {review.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {review.fileName} &middot;{" "}
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReviewView reviewId={review.id} initialTitle={review.title} />
            <Link href="/reviews">
              <Button variant="outline" size="sm">
                All Reviews
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="w-full">
            <div className="sticky top-6">
              {/* Client components imported by ReviewView handle the image reference */}
              <ReviewView
                reviewId={review.id}
                initialTitle={review.title}
                imageUrl={review.imageUrl}
                regions={regions}
                analysisText={review.analysisText}
                mode="content"
              />
            </div>
          </div>

          <div>
            <ReviewView
              reviewId={review.id}
              initialTitle={review.title}
              analysisText={review.analysisText}
              mode="analysis"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
