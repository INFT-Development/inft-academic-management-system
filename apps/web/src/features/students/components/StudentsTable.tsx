import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, Plus, UploadSimple, PencilSimple } from "@phosphor-icons/react";
import type { Student } from "@ams/shared";

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
import { EmptyState, ServerErrorState, TableSkeleton } from "@/components/states";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { listStudents } from "../students.api";
import { StudentFormDialog } from "./StudentFormDialog";

const PAGE_SIZE = 10;

interface StudentsTableProps {
  organizationId: string;
  /** Route to the bulk-import page, relative to the app root, e.g. "/dashboard/admin/students/import". */
  importPath: string;
}

export function StudentsTable({ organizationId, importPath }: StudentsTableProps) {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, page, search]);

  async function load() {
    setStatus("loading");

    try {
      const response = await listStudents(organizationId, {
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      });

      setStudents(response.data.students);
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
            placeholder="Search by roll number or name"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => navigate(importPath)}>
            <UploadSimple className="size-4" />
            Bulk import
          </Button>
          <Button
            className="gap-1.5"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add student
          </Button>
        </div>
      </div>

      {status === "loading" && <TableSkeleton rows={6} columns={8} />}

      {status === "error" && <ServerErrorState onRetry={() => void load()} />}

      {status === "success" && students.length === 0 && (
        <EmptyState
          title="No students yet"
          description="Add a student, or bulk import your organization's roster from a spreadsheet."
          action={
            <Button onClick={() => setFormOpen(true)} className="gap-1.5">
              <Plus className="size-4" />
              Add student
            </Button>
          }
        />
      )}

      {status === "success" && students.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll no.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Year / Sem / Div</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>{student.studentFullName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.year} / Sem {student.semester} / {student.division}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.branch}</TableCell>
                    <TableCell className="text-muted-foreground">{student.batch}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "ACTIVE" ? "secondary" : "outline"}>
                        {student.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.userEmail ? (
                        <span className="text-sm">{student.userEmail}</span>
                      ) : student.email ? (
                        <span className="text-sm text-muted-foreground">{student.email} (pending)</span>
                      ) : (
                        <Badge variant="secondary">Not yet registered</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditTarget(student);
                          setFormOpen(true);
                        }}
                      >
                        <PencilSimple className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
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

      <StudentFormDialog
        organizationId={organizationId}
        student={editTarget}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          setFormOpen(false);
          void load();
        }}
      />
    </div>
  );
}
