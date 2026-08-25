import { LockSimple } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function ForbiddenState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <LockSimple className="size-10 text-muted-foreground" weight="duotone" />
      <div className="space-y-1">
        <p className="font-medium">You don't have permission to access this page.</p>
      </div>
      <Button variant="outline" className="mt-2" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </div>
  );
}
