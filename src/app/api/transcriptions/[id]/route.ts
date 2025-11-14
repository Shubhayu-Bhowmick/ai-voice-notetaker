import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { transcriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: transcriptionId } = await params;
    if (!transcriptionId) {
      return NextResponse.json({ error: "Missing transcription ID" }, { status: 400 });
    }

    // Verify transcription belongs to user
    const [transcription] = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.id, transcriptionId))
      .limit(1);

    if (!transcription || transcription.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete transcription (cascade will delete slices)
    await db.delete(transcriptions).where(eq(transcriptions.id, transcriptionId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

