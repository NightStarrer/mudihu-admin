"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProposalAction } from "@/app/actions/proposals";
import type { Client } from "@/types/database";
import { toast } from "sonner";

export function NewProposalForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const preselect = searchParams.get("client");
    if (preselect) setClientId(preselect);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clientId) {
      toast.error("Select a client");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("client_id", clientId);

    try {
      const id = await createProposalAction(formData);
      toast.success("Proposal created");
      router.push(`/dashboard/proposals/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>Client *</Label>
        <Select
          value={clientId}
          onValueChange={(v) => setClientId(v ?? "")}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Proposal title *</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Website & Platform Development Proposal"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gst_rate">GST %</Label>
        <Input id="gst_rate" name="gst_rate" type="number" defaultValue={18} />
      </div>
      <Button type="submit" disabled={loading} className="bg-primary">
        {loading ? "Creating…" : "Create proposal"}
      </Button>
    </form>
  );
}
