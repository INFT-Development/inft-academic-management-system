import { StudentImportPage } from "@/features/students/pages/StudentImportPage";
import { useOrganization } from "@/hooks/useOrganization";

export function AdminStudentImportPage() {
  const { currentMembership } = useOrganization();

  return (
    <StudentImportPage
      organizationId={currentMembership!.organizationId}
      backPath="/dashboard/admin/students"
    />
  );
}
