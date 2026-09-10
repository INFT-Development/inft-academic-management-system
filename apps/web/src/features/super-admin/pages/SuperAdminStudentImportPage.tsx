import { StudentImportPage } from "@/features/students/pages/StudentImportPage";
import { useOrganization } from "@/hooks/useOrganization";

export function SuperAdminStudentImportPage() {
  const { currentMembership } = useOrganization();

  return (
    <StudentImportPage
      organizationId={currentMembership!.organizationId}
      backPath="/dashboard/super-admin/students"
    />
  );
}
