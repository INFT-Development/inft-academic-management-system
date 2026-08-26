import { Role } from "@ams/shared";

import { PageHeader } from "@/components/layout/PageHeader";
import { MembersTable } from "@/components/members/MembersTable";
import { useOrganization } from "@/hooks/useOrganization";

export function AdminTeachersPage() {
  const { currentMembership } = useOrganization();

  return (
    <div>
      <PageHeader title="Teachers" description="Manage teachers in your organization." />
      <MembersTable
        organizationId={currentMembership!.organizationId}
        role={Role.TEACHER}
        roleLabelSingular="teacher"
        roleLabelPlural="teachers"
        canAdd
        canChangeRole={false}
        canRemove
      />
    </div>
  );
}
