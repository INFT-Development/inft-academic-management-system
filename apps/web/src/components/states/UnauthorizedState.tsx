import { SignIn } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function UnauthorizedState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <SignIn className="size-10 text-muted-foreground" weight="duotone" />
      <p className="font-medium">You need to sign in to continue.</p>
      <Button className="mt-2" render={<Link to="/login">Sign In</Link>} />
    </div>
  );
}
