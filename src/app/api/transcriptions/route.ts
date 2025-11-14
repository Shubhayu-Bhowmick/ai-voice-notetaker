import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { transcriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const all = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.user_id, user.id))
      .orderBy(desc(transcriptions.created_at));

    return NextResponse.json({ transcriptions: all });
  } catch (error) {
    console.error("Get transcriptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

