import { useEffect, useState } from "react";
import type { Role } from "@ams/shared";
import { listMembers } from "./organization.api";

export type MemberCounts = Partial<Record<Role, number>>;

/** Fetches just the `total` for each role (pageSize 1) — cheap counts for dashboard stat cards. */
export function useMemberCounts(organizationId: string, roles: Role[]) {
  const [counts, setCounts] = useState<MemberCounts>({});
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");

      try {
        const results = await Promise.all(
          roles.map((role) => listMembers(organizationId, { role, pageSize: 1 })),
        );

        if (cancelled) return;

        const next: MemberCounts = {};
        roles.forEach((role, i) => {
          next[role] = results[i].data.total;
        });

        setCounts(next);
        setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, roles.join(",")]);

  return { counts, status };
}
