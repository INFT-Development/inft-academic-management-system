import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileCsv, FileXls, UploadSimple, ArrowLeft } from "@phosphor-icons/react";
import type { StudentImportPreviewResult } from "@ams/shared";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadStudentTemplate, importConfirm, importPreview } from "../students.api";

interface StudentImportPageProps {
  organizationId: string;
  /** Where to return after a successful import, e.g. "/dashboard/admin/students". */
  backPath: string;
}

export function StudentImportPage({ organizationId, backPath }: StudentImportPageProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "parsing" | "previewed" | "confirming">("idle");
  const [preview, setPreview] = useState<StudentImportPreviewResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function handleFileSelected(file: File) {
    setError("");
    setPreview(null);
    setFileName(file.name);
    setStatus("parsing");

    try {
      const response = await importPreview(organizationId, file);
      setPreview(response.data);
      setStatus("previewed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setStatus("idle");
    }
  }

  async function handleConfirm() {
    if (!preview || preview.validCount === 0) return;

    setStatus("confirming");
    setError("");

    try {
      const result = await importConfirm(
        organizationId,
        preview.validRows.map((row) => row.data),
      );
      toast.success(`Imported ${result.data.imported} student${result.data.imported === 1 ? "" : "s"}`);
      navigate(backPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import students");
      setStatus("previewed");
    }
  }

  function reset() {
    setPreview(null);
    setFileName("");
    setError("");
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      <PageHeader
        title="Bulk import students"
        description="Upload a CSV or Excel file of your organization's student roster."
        action={
          <Button variant="outline" className="gap-1.5" onClick={() => navigate(backPath)}>
            <ArrowLeft className="size-4" />
            Back to students
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">1. Download the template</p>
              <p className="text-sm text-muted-foreground">
                Fill it in and remove the example rows before uploading.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => void downloadStudentTemplate(organizationId, "csv")}
              >
                <FileCsv className="size-4" />
                Download CSV template
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => void downloadStudentTemplate(organizationId, "xlsx")}
              >
                <FileXls className="size-4" />
                Download Excel template
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">2. Upload your file</p>
              <p className="text-sm text-muted-foreground">.csv or .xlsx, up to 1000 rows.</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileSelected(file);
                }}
              />
              <Button
                variant="outline"
                className="gap-1.5"
                disabled={status === "parsing" || status === "confirming"}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadSimple className="size-4" />
                {status === "parsing" ? "Parsing..." : "Choose file"}
              </Button>
              {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {preview && (
          <Card>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">3. Review and confirm</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">Total rows: {preview.totalRows}</Badge>
                  <Badge variant="secondary">Valid: {preview.validCount}</Badge>
                  <Badge variant="destructive">Invalid: {preview.invalidCount}</Badge>
                </div>
              </div>

              {preview.invalidRows.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>Roll number</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.invalidRows.map((row) => (
                        <TableRow key={row.row}>
                          <TableCell>{row.row}</TableCell>
                          <TableCell>{row.rollNumber || "—"}</TableCell>
                          <TableCell className="text-destructive">
                            {row.errors.join("; ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} disabled={status === "confirming"}>
                  Choose a different file
                </Button>
                <Button
                  className="gap-1.5"
                  disabled={preview.validCount === 0 || status === "confirming"}
                  onClick={() => void handleConfirm()}
                >
                  {status === "confirming"
                    ? "Importing..."
                    : `Confirm import (${preview.validCount})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
