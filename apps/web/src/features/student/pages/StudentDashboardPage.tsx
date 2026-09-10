import { Books } from "@phosphor-icons/react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";

export function StudentDashboardPage() {
  const { currentMembership } = useOrganization();
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome, ${user?.email} — ${currentMembership!.organizationName}`}
      />

      <EmptyState
        icon={Books}
        title="Courses are coming soon"
        description="Your courses, attendance, and grades will appear here once they're available."
      />
    </div>
  );
}
