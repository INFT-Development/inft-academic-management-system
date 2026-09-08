import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import ExcelJS from "exceljs";
import {
  STUDENT_YEARS,
  STUDENT_DIVISIONS,
  STUDENT_SEMESTERS,
  STUDENT_BRANCHES,
  STUDENT_SPECIALIZATIONS,
} from "@ams/shared";
import { AppError } from "../../utils/AppError";

export const IMPORT_TEMPLATE_COLUMNS = [
  "roll_number",
  "student_full_name",
  "email",
  "year",
  "semester",
  "division",
  "branch",
  "batch",
  "specialization",
] as const;

/** Maps the template's snake_case column headers to the shared Zod schema's camelCase field names. */
const COLUMN_FIELD_MAP: Record<string, string> = {
  roll_number: "rollNumber",
  student_full_name: "studentFullName",
  email: "email",
  year: "year",
  semester: "semester",
  division: "division",
  branch: "branch",
  batch: "batch",
  specialization: "specialization",
};

function normalizeHeader(header: string): string {
  return header.toString().trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object" && "result" in (value as Record<string, unknown>)) {
    // ExcelJS formula cell: { formula, result }
    return cellToString((value as { result: unknown }).result);
  }

  if (typeof value === "object" && "text" in (value as Record<string, unknown>)) {
    // ExcelJS rich-text cell: { richText: [...] } is handled via .text by the caller;
    // this covers hyperlink cells: { text, hyperlink }
    return String((value as { text: unknown }).text ?? "");
  }

  return String(value).trim();
}

function mapRawRow(raw: Record<string, unknown>): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const [rawHeader, value] of Object.entries(raw)) {
    const field = COLUMN_FIELD_MAP[normalizeHeader(rawHeader)];
    if (field) mapped[field] = cellToString(value);
  }

  return mapped;
}

function parseCsvBuffer(buffer: Buffer): Record<string, unknown>[] {
  return parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[];
}

async function parseXlsxBuffer(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new AppError("The uploaded file has no sheets", 400);

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cellToString(cell.value);
  });

  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const isEmpty = row.values === undefined || (Array.isArray(row.values) && row.values.every((v) => v === null || v === undefined || v === ""));
    if (isEmpty) return;

    const record: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) record[header] = cell.value;
    });

    rows.push(record);
  });

  return rows;
}

/** Parses an uploaded student-import file into rows keyed by the shared schema's field names, ready for Zod validation. */
export async function parseStudentImportFile(
  buffer: Buffer,
  extension: ".csv" | ".xlsx"
): Promise<Record<string, string>[]> {
  const rawRows = extension === ".csv" ? parseCsvBuffer(buffer) : await parseXlsxBuffer(buffer);
  return rawRows.map(mapRawRow);
}

export function buildCsvTemplate(): string {
  return stringify(
    [
      {
        roll_number: "101",
        student_full_name: "Rahul Sharma",
        email: "rahul.sharma@example.edu",
        year: "2nd",
        semester: "3",
        division: "A",
        branch: "INFT",
        batch: "2027",
        specialization: "AI & ML",
      },
      {
        roll_number: "102",
        student_full_name: "Aman Patel",
        email: "aman.patel@example.edu",
        year: "2nd",
        semester: "3",
        division: "B",
        branch: "CMPN",
        batch: "2027",
        specialization: "",
      },
    ],
    { header: true, columns: IMPORT_TEMPLATE_COLUMNS as unknown as string[] }
  );
}

export async function buildXlsxTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Students");
  sheet.columns = IMPORT_TEMPLATE_COLUMNS.map((key) => ({ header: key, key, width: 20 }));
  sheet.addRow({
    roll_number: "101",
    student_full_name: "Rahul Sharma",
    email: "rahul.sharma@example.edu",
    year: "2nd",
    semester: 3,
    division: "A",
    branch: "INFT",
    batch: 2027,
    specialization: "AI & ML",
  });
  sheet.addRow({
    roll_number: "102",
    student_full_name: "Aman Patel",
    email: "aman.patel@example.edu",
    year: "2nd",
    semester: 3,
    division: "B",
    branch: "CMPN",
    batch: 2027,
    specialization: "",
  });
  sheet.getRow(1).font = { bold: true };

  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [
    { header: "Field", key: "field", width: 20 },
    { header: "Allowed values", key: "values", width: 60 },
  ];
  instructions.addRow({
    field: "email",
    values: "Optional — if provided, the student's account auto-links to this record when they register or join with that email.",
  });
  instructions.addRow({ field: "year", values: STUDENT_YEARS.join(", ") });
  instructions.addRow({ field: "semester", values: STUDENT_SEMESTERS.join(", ") });
  instructions.addRow({ field: "division", values: STUDENT_DIVISIONS.join(", ") });
  instructions.addRow({ field: "branch", values: STUDENT_BRANCHES.join(", ") });
  instructions.addRow({
    field: "batch",
    values: "4-digit admission year, e.g. 2027 (accepts \"2027\", \"27 batch\", \"2027 batch\")",
  });
  instructions.addRow({
    field: "specialization",
    values: `Optional — leave blank if not applicable. Otherwise one of: ${STUDENT_SPECIALIZATIONS.join(", ")}`,
  });
  instructions.addRow({ field: "", values: "" });
  instructions.addRow({
    field: "Note",
    values: "Remove the example rows on the Students sheet before uploading.",
  });
  instructions.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
