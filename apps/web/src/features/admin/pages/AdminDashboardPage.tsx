import { ChalkboardTeacher, Student } from "@phosphor-icons/react";
import { Role } from "@ams/shared";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { useOrganization } from "@/hooks/useOrganization";
import { useMemberCounts } from "@/features/organization/useMemberCounts";

const ROLES = [Role.TEACHER, Role.STUDENT];

export function AdminDashboardPage() {
  const { currentMembership } = useOrganization();
  const { counts } = useMemberCounts(currentMembership!.organizationId, ROLES);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome to ${currentMembership!.organizationName}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Teachers"
          value={counts[Role.TEACHER]}
          icon={ChalkboardTeacher}
          to="/dashboard/admin/teachers"
        />
        <StatCard
          label="Students"
          value={counts[Role.STUDENT]}
          icon={Student}
          to="/dashboard/admin/students"
        />
      </div>
    </div>
  );
}
