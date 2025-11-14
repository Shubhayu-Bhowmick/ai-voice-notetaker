"use client";

import { useEffect, useRef, useState } from "react";

interface RecordingAnimationProps {
  isRecording: boolean;
  stream: MediaStream | null;
}

export function RecordingAnimation({ isRecording, stream }: RecordingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!isRecording || !stream) {
      setVolume(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    microphone.connect(analyser);

    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!isRecording || !analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedVolume = average / 255; // Normalize to 0-1
      setVolume(normalizedVolume);

      // Draw visualization on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          ctx.clearRect(0, 0, width, height);

          // Draw bars based on frequency data
          const barCount = 50;
          const barWidth = width / barCount;
          const barGap = 2;

          for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * dataArray.length);
            const barHeight = (dataArray[dataIndex] / 255) * height * 0.8;

            // Color based on volume intensity
            const intensity = dataArray[dataIndex] / 255;
            const hue = 200 + intensity * 60; // Blue to cyan
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

            ctx.fillRect(
              i * barWidth + barGap,
              height - barHeight,
              barWidth - barGap * 2,
              barHeight
            );
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, stream]);

  if (!isRecording) {
    return null;
  }

  // Calculate pulse size based on volume (0.5 to 1.0 scale)
  const pulseScale = 0.5 + volume * 0.5;

  return (
    <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-4 sm:py-6">
      {/* Pulsing circle indicator */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full bg-red-500 opacity-20"
          style={{
            transform: `scale(${pulseScale})`,
            transition: "transform 0.1s ease-out",
          }}
        />
        <div
          className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-600 flex items-center justify-center"
          style={{
            boxShadow: `0 0 ${20 + volume * 30}px rgba(239, 68, 68, ${0.5 + volume * 0.5})`,
          }}
        >
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white" />
        </div>
      </div>

      {/* Audio waveform visualization */}
      <div className="w-full max-w-md px-2">
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full h-20 sm:h-24 rounded-lg bg-muted/30"
        />
      </div>

      {/* Volume indicator text */}
      <div className="text-xs sm:text-sm text-muted-foreground">
        <span className="font-medium">Recording</span>
        <span className="mx-2">•</span>
        <span>Volume: {Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}

