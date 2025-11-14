import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { dictionary } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await db.select().from(dictionary).where(eq(dictionary.user_id, user.id));
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Get dictionary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { phrase, replacement } = await req.json();
    if (!phrase || !replacement) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [entry] = await db
      .insert(dictionary)
      .values({ user_id: user.id, phrase, replacement })
      .returning();

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Create dictionary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Verify entry belongs to user
    const [entry] = await db.select().from(dictionary).where(eq(dictionary.id, id)).limit(1);
    if (!entry || entry.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(dictionary).where(eq(dictionary.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete dictionary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

