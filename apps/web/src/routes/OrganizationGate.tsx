import { Navigate, Outlet } from "react-router-dom";
import { Buildings } from "@phosphor-icons/react";

import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Sits below ProtectedRoute. Sends users with no organization membership to
 * onboarding, and — for the rare case of multiple memberships with none
 * selected yet (e.g. right after a fresh login) — asks them to pick one
 * before rendering any dashboard route.
 */
export function OrganizationGate() {
  const { memberships, currentMembership, selectOrganization } = useOrganization();

  if (memberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!currentMembership) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Choose an organization</CardTitle>
            <CardDescription>Select which organization to continue in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {memberships.map((membership) => (
              <Button
                key={membership.id}
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => selectOrganization(membership.organizationId)}
              >
                <Buildings className="size-4" />
                {membership.organizationName}
              </Button>
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  return <Outlet />;
}
