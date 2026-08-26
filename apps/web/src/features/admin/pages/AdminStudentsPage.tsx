import { Role } from "@ams/shared";

import { PageHeader } from "@/components/layout/PageHeader";
import { MembersTable } from "@/components/members/MembersTable";
import { useOrganization } from "@/hooks/useOrganization";

export function AdminStudentsPage() {
  const { currentMembership } = useOrganization();

  return (
    <div>
      <PageHeader title="Students" description="Students who have joined your organization." />
      <MembersTable
        organizationId={currentMembership!.organizationId}
        role={Role.STUDENT}
        roleLabelSingular="student"
        roleLabelPlural="students"
        canAdd={false}
        canChangeRole={false}
        canRemove
      />
    </div>
  );
}
