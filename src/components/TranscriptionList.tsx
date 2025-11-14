"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Check, Trash2 } from "lucide-react";

interface Transcription {
  id: string;
  final_text: string | null;
  status: string;
  created_at: Date;
}

export function TranscriptionList() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transcriptions");
      const data = await res.json();
      setTranscriptions(data.transcriptions || []);
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transcriptions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from local state
        setTranscriptions(transcriptions.filter((t) => t.id !== id));
      } else {
        console.error("Error deleting transcription");
      }
    } catch (error) {
      console.error("Error deleting transcription:", error);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No transcriptions yet. Start recording to create your first transcription!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcriptions.map((transcription) => {
        const isProcessing = transcription.status === "processing" && !transcription.final_text;
        const isOld = new Date(transcription.created_at).getTime() < Date.now() - 5 * 60 * 1000; // 5 minutes ago
        
        return (
          <Card key={transcription.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg">
                    {new Date(transcription.created_at).toLocaleString()}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm">
                    {isProcessing && isOld ? (
                      <span className="text-muted-foreground italic">
                        Incomplete (may have failed)
                      </span>
                    ) : (
                      `Status: ${transcription.status}`
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {transcription.final_text && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transcription.final_text!, transcription.id)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === transcription.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transcription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this transcription? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(transcription.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            {transcription.final_text ? (
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{transcription.final_text}</p>
              </CardContent>
            ) : isProcessing ? (
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground italic">
                  {isOld 
                    ? "This transcription was never completed. It may have failed during processing."
                    : "Processing transcription..."}
                </p>
              </CardContent>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

