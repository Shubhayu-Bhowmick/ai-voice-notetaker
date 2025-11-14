"use client";

import { useEffect, useRef, useState } from "react";

type PartialMap = Record<number, string>;

export function useAudioRecorder({ sliceMs = 5000 } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const partialsRef = useRef<PartialMap>({});
  const [mergedText, setMergedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const sliceIndexRef = useRef(0);
  const transcriptionIdRef = useRef<string | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalIdRef = useRef<number | undefined>(undefined);
  const pendingSlicesRef = useRef(0);

  const updateMerged = () => {
    const keys = Object.keys(partialsRef.current)
      .map((k) => Number(k))
      .sort((a, b) => a - b);
    const text = keys.map((k) => partialsRef.current[k]).filter(Boolean).join(" ");
    setMergedText(text);
  };

  async function sendSlice(blob: Blob, index: number) {
    const form = new FormData();
    form.append("audio", blob, `slice-${index}.webm`);
    form.append("sliceIndex", String(index));
    if (transcriptionIdRef.current) {
      form.append("transcriptionId", transcriptionIdRef.current);
    }

    pendingSlicesRef.current++;
    setIsTranscribing(true);

    try {
      const res = await fetch("/api/transcribe-slice", { method: "POST", body: form });
      const data = await res.json();
      if (data.transcriptionId) {
        transcriptionIdRef.current = data.transcriptionId;
      }
      if (typeof data.index !== "undefined") {
        partialsRef.current[data.index] = data.text || "";
        updateMerged();
      }
    } catch (error) {
      console.error("Error sending slice:", error);
    } finally {
      pendingSlicesRef.current--;
      if (pendingSlicesRef.current === 0) {
        setIsTranscribing(false);
      }
    }
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      partialsRef.current = {};
      sliceIndexRef.current = 0;
      transcriptionIdRef.current = undefined;
      setMergedText("");

      let chunkBuffer: BlobPart[] = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunkBuffer.push(e.data);
        }
      };

      mr.onstop = async () => {
        // Send final chunk if any
        if (chunkBuffer.length > 0) {
          const blob = new Blob(chunkBuffer, { type: "audio/webm" });
          const idx = sliceIndexRef.current++;
          await sendSlice(blob, idx);
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setStream(null);
        }

        // Wait for all slices to finish transcribing before formatting
        const waitForTranscription = async () => {
          while (pendingSlicesRef.current > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        };
        
        await waitForTranscription();

        // Complete transcription (formatting step)
        if (transcriptionIdRef.current) {
          setIsProcessing(true);
          try {
            const res = await fetch("/api/transcription/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transcriptionId: transcriptionIdRef.current }),
            });
            const data = await res.json();
            if (data.finalText) {
              setMergedText(data.finalText);
              partialsRef.current = {};
              transcriptionIdRef.current = undefined;
              sliceIndexRef.current = 0;
            }
          } catch (error) {
            console.error("Error completing transcription:", error);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      mr.start();

      // Every sliceMs send current buffer
      intervalIdRef.current = window.setInterval(async () => {
        if (chunkBuffer.length === 0) return;
        const blob = new Blob(chunkBuffer, { type: "audio/webm" });
        const idx = sliceIndexRef.current++;
        sendSlice(blob, idx).catch(console.error);
        chunkBuffer = [];
      }, sliceMs);
    } catch (error) {
      console.error("Error starting recorder:", error);
      setIsRecording(false);
    }
  }

  async function stop() {
    setIsRecording(false);
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    // Clear interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = undefined;
    }

    // Stop the recorder => triggers onstop handler
    if (mr.state !== "inactive") {
      mr.stop();
    }

    mediaRecorderRef.current = null;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording,
    mergedText,
    isTranscribing,
    isProcessing,
    start,
    stop,
    stream,
  };
}

