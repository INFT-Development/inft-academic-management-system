import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, Buildings } from "@phosphor-icons/react";
import type { OrganizationSummary } from "@ams/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ServerErrorState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import { searchOrganizations, joinOrganization } from "../organization.api";

export function JoinOrganizationForm() {
  const navigate = useNavigate();
  const { selectOrganization, refreshMemberships } = useOrganization();

  const [search, setSearch] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => void loadOrganizations(), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function loadOrganizations() {
    setStatus("loading");

    try {
      const response = await searchOrganizations(search);
      setOrganizations(response.data.organizations);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  async function handleJoin(organizationId: string) {
    setJoinError("");
    setJoiningId(organizationId);

    try {
      const response = await joinOrganization(organizationId);

      await refreshMemberships();
      selectOrganization(response.data.membership.organizationId);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : "Failed to join organization");
      setJoiningId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search organizations by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {joinError && <p className="text-sm text-destructive">{joinError}</p>}

      {status === "loading" && (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {status === "error" && (
        <ServerErrorState onRetry={() => void loadOrganizations()} />
      )}

      {status === "success" && organizations.length === 0 && (
        <EmptyState
          icon={Buildings}
          title="No organizations found"
          description="Try a different search, or ask your organization's admin for its exact name."
        />
      )}

      {status === "success" && organizations.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {organizations.map((org) => (
            <li key={org.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Buildings className="size-5 text-muted-foreground" />
                <span className="font-medium">{org.name}</span>
              </div>
              <Button
                size="sm"
                disabled={joiningId === org.id}
                onClick={() => handleJoin(org.id)}
              >
                {joiningId === org.id ? "Joining..." : "Join"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
