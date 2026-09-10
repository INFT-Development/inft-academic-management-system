import type { Icon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: Icon;
  to?: string;
}

export function StatCard({ label, value, icon: IconComponent, to }: StatCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={to ? "cursor-pointer transition-colors hover:bg-accent/50" : undefined}
      onClick={to ? () => navigate(to) : undefined}
    >
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconComponent className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {value === undefined ? (
            <Skeleton className="mt-1 h-7 w-10" />
          ) : (
            <p className="text-2xl font-semibold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
