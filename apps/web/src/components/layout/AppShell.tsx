import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Role } from "@ams/shared";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOrganization } from "@/hooks/useOrganization";
import { NAV_ITEMS, ROLE_LABELS } from "@/features/dashboard/nav-config";
import { OrganizationSwitcher } from "@/features/organization/components/OrganizationSwitcher";
import { UserMenu } from "@/components/layout/UserMenu";

export function AppShell() {
  const { currentMembership } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentMembership) {
    return null;
  }

  const navItems = NAV_ITEMS[currentMembership.role as Role];
  const activeItem = navItems.find((item) => item.to === location.pathname);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <OrganizationSwitcher />
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarContent>
            <SidebarMenu className="px-2">
              {navItems.map((item) => {
                const isActive = item.to === location.pathname;

                if (item.comingSoon) {
                  return (
                    <SidebarMenuItem key={item.to}>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <SidebarMenuButton
                              disabled
                              className="cursor-not-allowed opacity-50"
                            >
                              <item.icon />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          }
                        />
                        <TooltipContent side="right">{item.comingSoon}</TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.to)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">
                {activeItem?.label ?? ROLE_LABELS[currentMembership.role as Role]}
              </span>
            </div>
            <UserMenu />
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
