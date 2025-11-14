import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth/getUserFromReq";
import { db } from "@/lib/db/client";
import { slices, transcriptions } from "@/lib/db/schema";
import { transcribeBuffer } from "@/lib/stt/openai-stt";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("audio") as File;
    const indexStr = form.get("sliceIndex") as string;
    const transcriptionId = form.get("transcriptionId") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "No audio" }, { status: 400 });
    }
    const sliceIndex = Number(indexStr ?? 0);

    // If no transcriptionId provided, create new transcription
    let tId = transcriptionId;
    if (!tId) {
      const [t] = await db.insert(transcriptions).values({ user_id: user.id }).returning();
      tId = t.id;
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // call STT
    const partialText = await transcribeBuffer(buffer, file.name);

    // store slice
    await db.insert(slices).values({
      transcription_id: tId,
      slice_index: sliceIndex,
      partial_text: partialText,
    });

    return NextResponse.json({ transcriptionId: tId, index: sliceIndex, text: partialText });
  } catch (error: any) {
    console.error("Transcribe slice error:", error);
    
    // Handle OpenAI API errors
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { 
          error: "OpenAI API quota exceeded. Please check your billing and add credits to your OpenAI account.",
          code: "insufficient_quota"
        },
        { status: 429 }
      );
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.",
          code: "invalid_api_key"
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to transcribe audio. Please try again." },
      { status: 500 }
    );
  }
}

