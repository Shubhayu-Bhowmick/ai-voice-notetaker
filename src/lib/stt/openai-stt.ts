import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeBuffer(
  fileBuffer: Buffer,
  filename: string = "slice.webm",
  dictionary?: string[]
) {
  // Create a File object from the buffer
  // In Node.js, we can use File if available, otherwise use the buffer directly
  // The OpenAI SDK accepts File, Blob, Buffer, or a stream
  let file: File | Buffer = fileBuffer;
  
  // Try to create a File object (available in Node.js 18+)
  if (typeof File !== "undefined") {
    // Convert Buffer to Uint8Array for File constructor
    const uint8Array = new Uint8Array(fileBuffer);
    file = new File([uint8Array], filename, { type: "audio/webm" });
  }
  
  const transcription = await client.audio.transcriptions.create({
    file: file as any, // SDK accepts multiple types
    model: "whisper-1",
    language: "en",
    // Note: OpenAI Whisper doesn't directly support custom vocabulary in the API
    // Dictionary terms are handled in post-processing during formatting
  });
  
  return transcription.text;
}

