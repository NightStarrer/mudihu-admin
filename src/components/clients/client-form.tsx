"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createClientAction,
  updateClientAction,
} from "@/app/actions/clients";
import type { Client } from "@/types/database";
import { toast } from "sonner";

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (client) {
        await updateClientAction(client.id, formData);
        toast.success("Client updated");
        router.refresh();
      } else {
        const id = await createClientAction(formData);
        toast.success("Client created");
        router.push(`/dashboard/clients/${id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company_name">Company name *</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={client?.company_name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact person</Label>
          <Input
            id="contact_person"
            name="contact_person"
            defaultValue={client?.contact_person ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_category">Business category</Label>
          <Input
            id="business_category"
            name="business_category"
            defaultValue={client?.business_category ?? ""}
            placeholder="e.g. dentist, retail"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gst_number">GST number</Label>
          <Input
            id="gst_number"
            name="gst_number"
            defaultValue={client?.gst_number ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={client?.address ?? ""}
            rows={2}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={client?.notes ?? ""}
            rows={3}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="bg-primary">
        {loading ? "Saving…" : client ? "Update client" : "Create client"}
      </Button>
    </form>
  );
}
