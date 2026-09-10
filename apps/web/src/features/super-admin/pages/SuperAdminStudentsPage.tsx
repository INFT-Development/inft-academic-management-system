import { PageHeader } from "@/components/layout/PageHeader";
import { StudentsTable } from "@/features/students/components/StudentsTable";
import { useOrganization } from "@/hooks/useOrganization";

export function SuperAdminStudentsPage() {
  const { currentMembership } = useOrganization();

  return (
    <div>
      <PageHeader title="Students" description="Students who have joined your organization." />
      <StudentsTable
        organizationId={currentMembership!.organizationId}
        importPath="/dashboard/super-admin/students/import"
      />
    </div>
  );
}
