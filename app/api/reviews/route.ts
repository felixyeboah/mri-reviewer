import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { desc, eq } from "drizzle-orm"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allReviews = await db
    .select({
      id: reviews.id,
      title: reviews.title,
      fileName: reviews.fileName,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
    })
    .from(reviews)
    .where(eq(reviews.userId, session.user.id))
    .orderBy(desc(reviews.createdAt))

  return NextResponse.json(allReviews)
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { title, fileName, imageUrl, analysisText, regions } = body

  if (!title || !fileName || !imageUrl || !analysisText) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    )
  }

  const [created] = await db
    .insert(reviews)
    .values({
      userId: session.user.id,
      title,
      fileName,
      imageUrl,
      analysisText,
      regions:
        typeof regions === "string" ? regions : JSON.stringify(regions),
    })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
