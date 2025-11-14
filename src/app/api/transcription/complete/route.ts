import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { transcriptions, slices, dictionary } from "@/lib/db/schema";
import { mergePartials } from "@/lib/processing/merge";
import { formatText } from "@/lib/processing/formatter";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcriptionId } = await req.json();
    if (!transcriptionId) {
      return NextResponse.json({ error: "Missing transcriptionId" }, { status: 400 });
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

    // load slices
    const sliceRows = await db
      .select()
      .from(slices)
      .where(eq(slices.transcription_id, transcriptionId));

    const partials: Record<number, string> = {};
    sliceRows.forEach((s) => {
      partials[s.slice_index] = s.partial_text || "";
    });

    // merge ordered
    const merged = mergePartials(partials);

    // load dictionary
    const dictRows = await db.select().from(dictionary).where(eq(dictionary.user_id, user.id));
    const dict = dictRows.map((r) => ({ phrase: r.phrase, replacement: r.replacement }));

    // format (LLM)
    const formatted = await formatText(merged, dict);

    // store final text
    await db
      .update(transcriptions)
      .set({ final_text: formatted, status: "done", updated_at: new Date() })
      .where(eq(transcriptions.id, transcriptionId));

    return NextResponse.json({ ok: true, finalText: formatted });
  } catch (error) {
    console.error("Complete transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

