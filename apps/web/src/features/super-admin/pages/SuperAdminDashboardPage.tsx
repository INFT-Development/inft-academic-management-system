import { ShieldCheck, ChalkboardTeacher, Student } from "@phosphor-icons/react";
import { Role } from "@ams/shared";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { useOrganization } from "@/hooks/useOrganization";
import { useMemberCounts } from "@/features/organization/useMemberCounts";

const ROLES = [Role.ADMIN, Role.TEACHER, Role.STUDENT];

export function SuperAdminDashboardPage() {
  const { currentMembership } = useOrganization();
  const { counts } = useMemberCounts(currentMembership!.organizationId, ROLES);

  return (
    <div>
      <PageHeader
        title="Organization overview"
        description={`Welcome to ${currentMembership!.organizationName}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Admins"
          value={counts[Role.ADMIN]}
          icon={ShieldCheck}
          to="/dashboard/super-admin/admins"
        />
        <StatCard
          label="Teachers"
          value={counts[Role.TEACHER]}
          icon={ChalkboardTeacher}
          to="/dashboard/super-admin/teachers"
        />
        <StatCard
          label="Students"
          value={counts[Role.STUDENT]}
          icon={Student}
          to="/dashboard/super-admin/students"
        />
      </div>
    </div>
  );
}
