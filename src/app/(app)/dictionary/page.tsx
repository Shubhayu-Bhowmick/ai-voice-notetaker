"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";

interface DictionaryEntry {
  id: string;
  phrase: string;
  replacement: string;
  created_at: Date;
}

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [phrase, setPhrase] = useState("");
  const [replacement, setReplacement] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhrase, setEditPhrase] = useState("");
  const [editReplacement, setEditReplacement] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/dictionary");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching dictionary:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase || !replacement) return;

    setLoading(true);
    try {
      const res = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase, replacement }),
      });

      if (res.ok) {
        setPhrase("");
        setReplacement("");
        fetchEntries();
      }
    } catch (error) {
      console.error("Error adding entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/dictionary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleEdit = (entry: DictionaryEntry) => {
    setEditingId(entry.id);
    setEditPhrase(entry.phrase);
    setEditReplacement(entry.replacement);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPhrase("");
    setEditReplacement("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editPhrase || !editReplacement) return;

    try {
      const res = await fetch(`/api/dictionary/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: editPhrase, replacement: editReplacement }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchEntries();
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dictionary</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Add custom word replacements to help the AI transcribe your speech more accurately.
        </p>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Add New Entry</CardTitle>
          <CardDescription className="text-sm">
            Define how you want specific words or phrases to be transcribed
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phrase">Phrase (as spoken)</Label>
                <Input
                  id="phrase"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  placeholder="e.g., 'AI'"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replacement">Replacement (how it should appear)</Label>
                <Input
                  id="replacement"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="e.g., 'artificial intelligence'"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Dictionary Entries</h2>
        {fetching ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-4 hidden sm:block" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No dictionary entries yet. Add your first entry above!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card key={entry.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {editingId === entry.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Phrase</Label>
                          <Input
                            value={editPhrase}
                            onChange={(e) => setEditPhrase(e.target.value)}
                            placeholder="e.g., 'AI'"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Replacement</Label>
                          <Input
                            value={editReplacement}
                            onChange={(e) => setEditReplacement(e.target.value)}
                            placeholder="e.g., 'artificial intelligence'"
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(entry.id)}
                          className="h-8"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-8"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium break-words">{entry.phrase}</span>
                          <span className="text-muted-foreground hidden sm:inline">→</span>
                          <span className="text-muted-foreground break-words">{entry.replacement}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

