import type { Icon } from "@phosphor-icons/react";
import { Tray } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: IconComponent = Tray,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <IconComponent
        className="size-10 text-muted-foreground"
        weight="duotone"
      />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
