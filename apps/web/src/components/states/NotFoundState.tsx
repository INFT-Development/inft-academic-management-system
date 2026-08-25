import { Compass } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Compass className="size-10 text-muted-foreground" weight="duotone" />
      <p className="font-medium">This page could not be found.</p>
      <Button
        className="mt-2"
        render={<Link to="/dashboard">Go to Dashboard</Link>}
      />
    </div>
  );
}
