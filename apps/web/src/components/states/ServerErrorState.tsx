import { WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

interface ServerErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ServerErrorState({ message, onRetry }: ServerErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <WarningCircle className="size-10 text-muted-foreground" weight="duotone" />
      <div className="space-y-1">
        <p className="font-medium">Something went wrong.</p>
        <p className="text-sm text-muted-foreground">
          {message || "Please try again."}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
