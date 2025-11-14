"use client";

import { useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { RecorderButton } from "@/components/RecorderButton";
import { TranscriptionList } from "@/components/TranscriptionList";
import { RecordingAnimation } from "@/components/RecordingAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2 } from "lucide-react";

export default function DictationPage() {
  const { isRecording, mergedText, isTranscribing, isProcessing, start, stop, stream } = useAudioRecorder();
  const [copied, setCopied] = useState(false);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Voice Dictation</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Click the button below to start recording. Your speech will be transcribed in real-time.
        </p>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Recording Box</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex justify-center">
            <RecorderButton isRecording={isRecording} onStart={start} onStop={stop} />
          </div>
          
          {/* Recording Animation */}
          {isRecording && <RecordingAnimation isRecording={isRecording} stream={stream} />}
          
          {/* First Loading State: Converting voice to text */}
          {isTranscribing && !isProcessing && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Converting your voice to text...
              </p>
            </div>
          )}
          
          {/* Second Loading State: Formatting text */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Formatting your text...
              </p>
            </div>
          )}
          
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 border rounded-lg bg-muted/50 min-h-[150px] sm:min-h-[200px] relative">
            {/* Copy Button - Always visible when there's text */}
            {mergedText && !isProcessing && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(mergedText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (error) {
                      console.error("Error copying to clipboard:", error);
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            
            <p className="text-xs sm:text-sm whitespace-pre-wrap pr-10 sm:pr-12">
              {mergedText || (
                <span className="text-muted-foreground italic">
                  {isRecording
                    ? "Listening... Speak into your microphone."
                    : isTranscribing
                    ? "Converting voice to text..."
                    : isProcessing
                    ? "Formatting text..."
                    : "Click 'Start Recording' to begin dictation."}
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Previous Transcriptions</h2>
        <TranscriptionList />
      </div>
    </div>
  );
}

