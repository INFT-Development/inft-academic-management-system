import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";

export function StudentProfilePage() {
  const { user } = useAuth();
  const { currentMembership } = useOrganization();

  if (!user || !currentMembership) return null;

  return (
    <div>
      <PageHeader title="Profile" description="Your account information." />

      <Card className="max-w-lg">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg">
                {user.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">{currentMembership.role}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">Organization</span>
              <span className="font-medium">{currentMembership.organizationName}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">User ID</span>
              <span className="break-all font-mono text-xs">{user.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
