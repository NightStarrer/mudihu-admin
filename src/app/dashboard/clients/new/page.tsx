import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="New client"
        description="Add a new client to your agency"
      />
      <Card className="border-border/60">
        <CardContent className="pt-6">
          <ClientForm />
        </CardContent>
      </Card>
    </>
  );
}
