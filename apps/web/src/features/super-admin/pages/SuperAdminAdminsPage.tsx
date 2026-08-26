import { Role } from "@ams/shared";

import { PageHeader } from "@/components/layout/PageHeader";
import { MembersTable } from "@/components/members/MembersTable";
import { useOrganization } from "@/hooks/useOrganization";

export function SuperAdminAdminsPage() {
  const { currentMembership } = useOrganization();

  return (
    <div>
      <PageHeader title="Admins" description="Manage who can administer your organization." />
      <MembersTable
        organizationId={currentMembership!.organizationId}
        role={Role.ADMIN}
        roleLabelSingular="admin"
        roleLabelPlural="admins"
        canAdd
        canChangeRole
        canRemove
      />
    </div>
  );
}
