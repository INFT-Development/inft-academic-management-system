import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useOrganization } from "@/hooks/useOrganization";

export function SuperAdminSettingsPage() {
  const { currentMembership } = useOrganization();

  return (
    <div>
      <PageHeader title="Organization settings" description="Basic information about your organization." />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{currentMembership!.organizationName}</CardTitle>
          <CardDescription>
            Students can find and join this organization by searching for its exact name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-t pt-3">
            <span className="text-muted-foreground">Organization ID</span>
            <span className="font-mono">{currentMembership!.organizationId}</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-muted-foreground">Your role</span>
            <span className="font-medium">{currentMembership!.role}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
