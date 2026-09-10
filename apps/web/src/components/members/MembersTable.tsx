import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMemberSchema, type AddMemberInput, type Member, type Role } from "@ams/shared";
import { DotsThree, MagnifyingGlass, Plus, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmptyState, ServerErrorState, TableSkeleton } from "@/components/states";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  addMember,
  listMembers,
  removeMember,
  updateMemberRole,
} from "@/features/organization/organization.api";
import { REASSIGNABLE_ROLES } from "@/constants/roles";

const PAGE_SIZE = 10;

interface MembersTableProps {
  organizationId: string;
  role: Role;
  roleLabelSingular: string;
  roleLabelPlural: string;
  /** Only pass true when `role` is ADMIN or TEACHER — STUDENT is join-only. */
  canAdd: boolean;
  canChangeRole: boolean;
  canRemove: boolean;
}

export function MembersTable({
  organizationId,
  role,
  roleLabelSingular,
  roleLabelPlural,
  canAdd,
  canChangeRole,
  canRemove,
}: MembersTableProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, role, page, search]);

  async function load() {
    setStatus("loading");

    try {
      const response = await listMembers(organizationId, {
        role,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      });

      setMembers(response.data.members);
      setTotal(response.data.total);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${roleLabelPlural}`}
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {canAdd && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger
              render={
                <Button className="gap-1.5">
                  <Plus className="size-4" />
                  Add {roleLabelSingular}
                </Button>
              }
            />
            <AddMemberDialogContent
              role={role as AddMemberInput["role"]}
              roleLabelSingular={roleLabelSingular}
              organizationId={organizationId}
              onSuccess={() => {
                setAddOpen(false);
                void load();
              }}
            />
          </Dialog>
        )}
      </div>

      {status === "loading" && <TableSkeleton rows={6} columns={canAdd || canChangeRole || canRemove ? 4 : 3} />}

      {status === "error" && <ServerErrorState onRetry={() => void load()} />}

      {status === "success" && members.length === 0 && (
        <EmptyState
          title={`No ${roleLabelPlural} yet`}
          description={
            canAdd
              ? `${roleLabelPlural[0].toUpperCase()}${roleLabelPlural.slice(1)} added to your organization will appear here.`
              : `${roleLabelPlural[0].toUpperCase()}${roleLabelPlural.slice(1)} who join your organization will appear here.`
          }
          action={
            canAdd ? (
              <Button onClick={() => setAddOpen(true)} className="gap-1.5">
                <Plus className="size-4" />
                Add {roleLabelSingular}
              </Button>
            ) : undefined
          }
        />
      )}

      {status === "success" && members.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {(canChangeRole || canRemove) && (
                    <TableHead className="w-12" />
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    {(canChangeRole || canRemove) && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <DotsThree className="size-4" />
                                <span className="sr-only">Row actions</span>
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            {canChangeRole && (
                              <DropdownMenuItem onClick={() => setRoleTarget(member)}>
                                Change role
                              </DropdownMenuItem>
                            )}
                            {canRemove && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setRemoveTarget(member)}
                              >
                                <Trash className="size-4" />
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <RemoveMemberDialog
        organizationId={organizationId}
        member={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onRemoved={() => {
          setRemoveTarget(null);
          void load();
        }}
      />

      <ChangeRoleDialog
        organizationId={organizationId}
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onChanged={() => {
          setRoleTarget(null);
          void load();
        }}
      />
    </div>
  );
}

function AddMemberDialogContent({
  role,
  roleLabelSingular,
  organizationId,
  onSuccess,
}: {
  role: AddMemberInput["role"];
  roleLabelSingular: string;
  organizationId: string;
  onSuccess: () => void;
}) {
  const [serverError, setServerError] = useState("");

  const form = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "", role },
  });

  async function onSubmit(values: AddMemberInput) {
    setServerError("");

    try {
      await addMember(organizationId, values);
      toast.success(`Added ${values.email} as ${roleLabelSingular}`);
      form.reset({ email: "", role });
      onSuccess();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to add member",
      );
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add {roleLabelSingular}</DialogTitle>
        <DialogDescription>
          The person must already have an account. They'll be added to this
          organization as {roleLabelSingular === "admin" ? "an" : "a"} {roleLabelSingular}.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="person@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? "Adding..." : `Add ${roleLabelSingular}`}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

function RemoveMemberDialog({
  organizationId,
  member,
  onClose,
  onRemoved,
}: {
  organizationId: string;
  member: Member | null;
  onClose: () => void;
  onRemoved: () => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    if (!member) return;

    setIsRemoving(true);
    setError("");

    try {
      await removeMember(organizationId, member.id);
      toast.success(`Removed ${member.user.email}`);
      onRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove member</DialogTitle>
          <DialogDescription>
            {member && (
              <>
                This removes <strong>{member.user.email}</strong> from the
                organization. They'll lose access immediately.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={isRemoving} onClick={handleRemove}>
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangeRoleDialog({
  organizationId,
  member,
  onClose,
  onChanged,
}: {
  organizationId: string;
  member: Member | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [nextRole, setNextRole] = useState<Role | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNextRole(member?.role ?? "");
    setError("");
  }, [member]);

  async function handleSave() {
    if (!member || !nextRole) return;

    setIsSaving(true);
    setError("");

    try {
      await updateMemberRole(organizationId, member.id, nextRole);
      toast.success(`Updated ${member.user.email} to ${nextRole}`);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            {member && <>Update the role for <strong>{member.user.email}</strong>.</>}
          </DialogDescription>
        </DialogHeader>

        <Select value={nextRole} onValueChange={(value) => setNextRole(value as Role)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {REASSIGNABLE_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isSaving || !nextRole || nextRole === member?.role}
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
