import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { dictionary } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: entryId } = await params;
    const { phrase, replacement } = await req.json();

    if (!phrase || !replacement) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify entry belongs to user
    const [entry] = await db.select().from(dictionary).where(eq(dictionary.id, entryId)).limit(1);
    if (!entry || entry.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update entry
    const [updated] = await db
      .update(dictionary)
      .set({ phrase, replacement })
      .where(eq(dictionary.id, entryId))
      .returning();

    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error("Update dictionary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

