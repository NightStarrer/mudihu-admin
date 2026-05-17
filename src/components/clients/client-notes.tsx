"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addClientNoteAction } from "@/app/actions/clients";
import type { ClientNote } from "@/types/database";
import { toast } from "sonner";

export function ClientNotes({
  clientId,
  notes,
}: {
  clientId: string;
  notes: ClientNote[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addClientNoteAction(clientId, content.trim());
      setContent("");
      toast.success("Note added");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Add note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Project update, payment note…"
            rows={3}
          />
          <Button onClick={handleAdd} disabled={loading} className="bg-primary">
            {loading ? "Saving…" : "Add note"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id} className="border-border/60">
            <CardContent className="pt-4">
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {format(new Date(note.created_at), "PPp")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
