import { useNavigate } from "react-router-dom";
import { Buildings, CaretUpDown, Check, Plus } from "@phosphor-icons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useOrganization } from "@/hooks/useOrganization";
import { ROLE_LABELS } from "@/features/dashboard/nav-config";
import type { Role } from "@ams/shared";

export function OrganizationSwitcher() {
  const navigate = useNavigate();
  const { memberships, currentMembership, selectOrganization } = useOrganization();

  if (!currentMembership) {
    return null;
  }

  // A single organization stays simple — no picker, just the name.
  if (memberships.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Buildings className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {currentMembership.organizationName}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">
            {ROLE_LABELS[currentMembership.role as Role]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Buildings className="size-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">
                    {currentMembership.organizationName}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {ROLE_LABELS[currentMembership.role as Role]}
                  </p>
                </div>
                <CaretUpDown className="size-4 shrink-0 text-sidebar-foreground/70" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Your organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {memberships.map((membership) => (
              <DropdownMenuItem
                key={membership.id}
                onClick={() => selectOrganization(membership.organizationId)}
                className="gap-2"
              >
                <Buildings className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{membership.organizationName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[membership.role as Role]}
                  </p>
                </div>
                {membership.organizationId === currentMembership.organizationId && (
                  <Check className="size-4" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/onboarding")} className="gap-2">
              <Plus className="size-4" />
              Add organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
