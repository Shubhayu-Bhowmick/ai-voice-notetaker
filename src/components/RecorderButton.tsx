"use client";

import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface RecorderButtonProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecorderButton({ isRecording, onStart, onStop }: RecorderButtonProps) {
  return (
    <Button
      onClick={isRecording ? onStop : onStart}
      size="lg"
      className={`w-full sm:w-auto min-w-[180px] sm:min-w-[200px] text-sm sm:text-base ${
        isRecording
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {isRecording ? (
        <>
          <Square className="mr-2 h-5 w-5" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="mr-2 h-5 w-5" />
          Start Recording
        </>
      )}
    </Button>
  );
}

