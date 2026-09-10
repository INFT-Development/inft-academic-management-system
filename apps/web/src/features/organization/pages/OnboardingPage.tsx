import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateOrganizationForm } from "../components/CreateOrganizationForm";
import { JoinOrganizationForm } from "../components/JoinOrganizationForm";

export function OnboardingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Get started</CardTitle>
          <CardDescription>
            Create a new organization, or join one you've been invited to.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1">
                Create
              </TabsTrigger>
              <TabsTrigger value="join" className="flex-1">
                Join
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="pt-4">
              <CreateOrganizationForm />
            </TabsContent>

            <TabsContent value="join" className="pt-4">
              <JoinOrganizationForm />
            </TabsContent>
          </Tabs>

          <Button
            variant="ghost"
            className="mt-6 w-full text-muted-foreground"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
