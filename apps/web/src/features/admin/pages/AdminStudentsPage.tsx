import { PageHeader } from "@/components/layout/PageHeader";
import { StudentsTable } from "@/features/students/components/StudentsTable";
import { useOrganization } from "@/hooks/useOrganization";

export function AdminStudentsPage() {
  const { currentMembership } = useOrganization();

  return (
    <div>
      <PageHeader title="Students" description="Students who have joined your organization." />
      <StudentsTable
        organizationId={currentMembership!.organizationId}
        importPath="/dashboard/admin/students/import"
      />
    </div>
  );
}
