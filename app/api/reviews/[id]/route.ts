import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { eq, and } from "drizzle-orm"

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  return session
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const review = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, Number(id)), eq(reviews.userId, session.user.id)))
    .get()

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  return NextResponse.json(review)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { title } = body

  const existing = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, Number(id)), eq(reviews.userId, session.user.id)))
    .get()

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  const [updated] = await db
    .update(reviews)
    .set({ title, updatedAt: new Date() })
    .where(eq(reviews.id, Number(id)))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.id, Number(id)), eq(reviews.userId, session.user.id)))
    .get()

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  await db.delete(reviews).where(eq(reviews.id, Number(id)))

  return new NextResponse(null, { status: 204 })
}
