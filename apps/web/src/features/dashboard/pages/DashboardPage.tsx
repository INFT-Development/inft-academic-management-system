import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>

            <CardDescription>
              You are successfully authenticated.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Email
                  </p>

                  <p className="font-medium">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Role
                  </p>

                  <p className="font-medium">
                    {user?.role}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    User ID
                  </p>

                  <p className="break-all font-mono text-sm">
                    {user?.id}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}