import { useEffect, useState } from "react";
import type { Student } from "@ams/shared";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerErrorState } from "@/components/states";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { getOnboardingStatus } from "@/features/students/students.api";

export function StudentProfilePage() {
  const { user } = useAuth();
  const { currentMembership } = useOrganization();

  const [student, setStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!currentMembership) return;
    void load(currentMembership.organizationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMembership?.organizationId]);

  async function load(organizationId: string) {
    setStatus("loading");

    try {
      const response = await getOnboardingStatus(organizationId);
      setStudent(response.data.student);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (!user || !currentMembership) return null;

  return (
    <div>
      <PageHeader title="Profile" description="Your account and academic details." />

      <Card className="max-w-lg">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg">
                {user.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{student?.studentFullName ?? user.email}</p>
              <p className="text-sm text-muted-foreground">{currentMembership.role}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Organization" value={currentMembership.organizationName} />
            <Row label="Email" value={user.email} />

            {status === "loading" && (
              <div className="space-y-3 border-t pt-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}

            {status === "error" && (
              <div className="border-t pt-3">
                <ServerErrorState onRetry={() => void load(currentMembership.organizationId)} />
              </div>
            )}

            {status === "success" && student && (
              <>
                <Row label="Roll number" value={student.rollNumber} />
                <Row label="Year" value={student.year} />
                <Row label="Semester" value={String(student.semester)} />
                <Row label="Division" value={student.division} />
                <Row label="Branch" value={student.branch} />
                <Row label="Batch" value={String(student.batch)} />
                {student.specialization && (
                  <Row label="Specialization" value={student.specialization} />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t pt-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
