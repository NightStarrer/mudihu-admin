"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { CheckboxGroup } from "@/components/clients/checkbox-group";
import { updateClientBriefAction } from "@/app/actions/clients";
import type { Client } from "@/types/database";
import {
  parseProjectBrief,
  type ClientProjectBrief,
} from "@/types/client-project-brief";
import {
  AUTH_LEVEL_OPTIONS,
  BUDGET_TIER_OPTIONS,
  CMS_OPTIONS,
  COMMERCE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  FEATURE_OPTIONS,
  INTEGRATION_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  SITE_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/clients/brief-options";
import { toast } from "sonner";

function SelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  defaultValue: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <Wrapper className="space-y-2">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value || undefined}
        onValueChange={(v) => setValue(v ?? "")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Wrapper>
  );
}

function Wrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={className}>{children}</section>;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Wrapper className="space-y-4 rounded-lg border border-border/60 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </Wrapper>
  );
}

export function ClientProjectBriefForm({ client }: { client: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const brief: ClientProjectBrief = parseProjectBrief(client.project_brief);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateClientBriefAction(client.id, formData);
      toast.success("Project brief saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Section title="Project intent">
        <Wrapper className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="primary_goal"
            label="Primary goal *"
            options={PRIMARY_GOAL_OPTIONS}
            defaultValue={brief.primary_goal}
          />
          <SelectField
            name="site_type"
            label="Site type *"
            options={SITE_TYPE_OPTIONS}
            defaultValue={brief.site_type}
          />
          <SelectField
            name="commerce"
            label="Commerce"
            options={COMMERCE_OPTIONS}
            defaultValue={brief.commerce}
          />
        </Wrapper>
        <Wrapper className="space-y-2">
          <Label htmlFor="requirements_text">Requirements & notes</Label>
          <Textarea
            id="requirements_text"
            name="requirements_text"
            defaultValue={brief.requirements_text ?? ""}
            rows={4}
            placeholder="Goals, pages, special requests…"
          />
        </Wrapper>
      </Section>

      <Section title="Scope">
        <Wrapper className="space-y-3">
          <Label>Must-have features</Label>
          <CheckboxGroup
            name="must_have_features"
            options={FEATURE_OPTIONS}
            defaultValues={brief.must_have_features}
          />
        </Wrapper>
        <Wrapper className="space-y-3">
          <Label>Nice-to-have features</Label>
          <CheckboxGroup
            name="nice_to_have_features"
            options={FEATURE_OPTIONS}
            defaultValues={brief.nice_to_have_features}
          />
        </Wrapper>
        <Wrapper className="space-y-3">
          <Label>Content types</Label>
          <CheckboxGroup
            name="content_types"
            options={CONTENT_TYPE_OPTIONS}
            defaultValues={brief.content_types}
          />
        </Wrapper>
      </Section>

      <Section title="Technical">
        <Wrapper className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="cms_preference"
            label="CMS preference"
            options={CMS_OPTIONS}
            defaultValue={brief.cms_preference}
          />
          <SelectField
            name="auth_level"
            label="User accounts"
            options={AUTH_LEVEL_OPTIONS}
            defaultValue={brief.auth_level}
          />
        </Wrapper>
        <Wrapper className="space-y-3">
          <Label>Integrations</Label>
          <CheckboxGroup
            name="integrations"
            options={INTEGRATION_OPTIONS}
            defaultValues={brief.integrations}
          />
        </Wrapper>
      </Section>

      <Section title="Commercial & context">
        <Wrapper className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="budget_tier"
            label="Budget tier"
            options={BUDGET_TIER_OPTIONS}
            defaultValue={brief.budget_tier}
          />
          <SelectField
            name="timeline_expectation"
            label="Timeline"
            options={TIMELINE_OPTIONS}
            defaultValue={brief.timeline_expectation}
          />
        </Wrapper>
        <Wrapper className="space-y-2">
          <Label htmlFor="industry_tags">Industry tags</Label>
          <Input
            id="industry_tags"
            name="industry_tags"
            defaultValue={(client.industry_tags ?? []).join(", ")}
            placeholder="healthcare, local-retail, B2B"
          />
          <p className="text-xs text-muted-foreground">Comma-separated</p>
        </Wrapper>
      </Section>

      <Button type="submit" disabled={loading} className="w-full bg-primary sm:w-auto">
        {loading ? "Saving…" : "Save project brief"}
      </Button>
    </form>
  );
}
