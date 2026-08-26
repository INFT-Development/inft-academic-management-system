import { ChalkboardTeacher } from "@phosphor-icons/react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";

export function TeacherDashboardPage() {
  const { currentMembership } = useOrganization();
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome, ${user?.email} — ${currentMembership!.organizationName}`}
      />

      <EmptyState
        icon={ChalkboardTeacher}
        title="Academic tools are coming soon"
        description="Courses, attendance, and grades will appear here once they're available."
      />
    </div>
  );
}
