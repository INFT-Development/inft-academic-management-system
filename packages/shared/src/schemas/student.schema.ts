import { z } from "zod";
import {
  STUDENT_YEARS,
  STUDENT_DIVISIONS,
  STUDENT_SEMESTERS,
  STUDENT_BRANCHES,
  STUDENT_SPECIALIZATIONS,
  STUDENT_STATUSES,
} from "../student";

const rollNumberSchema = z
  .string()
  .trim()
  .min(1, { message: "Roll number is required" })
  .max(50, { message: "Roll number must be under 50 characters" });

const studentFullNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Student full name is required" })
  .max(200, { message: "Student full name must be under 200 characters" });

// `.transform().pipe()` (rather than `z.preprocess`/`z.coerce`) keeps a
// well-typed *input* type (`string | number` instead of `unknown`), which
// react-hook-form's resolver typing needs to infer controlled-field types
// correctly — see StudentFormDialog / CompleteStudentProfilePage.
const semesterSchema = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === "number" ? value : Number(value)))
  .pipe(
    z
      .number({ message: "Semester is required" })
      .int({ message: "Semester must be a whole number" })
      .refine((value) => (STUDENT_SEMESTERS as readonly number[]).includes(value), {
        message: "Semester must be between 1 and 8",
      }),
  );

/**
 * Accepts loose batch formats admins actually type ("2027", "27 batch",
 * "2026 batch") and normalizes them to the canonical 4-digit year used in
 * the database, so the same string never gets stored two different ways.
 */
const batchSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "number") return value;

    const digits = value.match(/\d+/g)?.join("") ?? value.trim();
    if (digits.length === 2) return Number(`20${digits}`);
    if (digits.length === 0) return NaN;
    return Number(digits);
  })
  .pipe(
    z
      .number({ message: "Batch is required" })
      .int()
      .min(2000, { message: "Batch must be a valid 4-digit year" })
      .max(2100, { message: "Batch must be a valid 4-digit year" }),
  );

// Import-file cells can vary in case ("infT" / "cmpn"); normalize before
// checking against the fixed department code list.
const branchSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z.enum(STUDENT_BRANCHES, {
      message: "Branch must be one of INFT, CMPN, EXTC, EXCS, BIOM",
    }),
  );

// "" represents "no specialization" (an empty import cell, or the web
// form's "None" option) and is normalized to undefined in the output.
const specializationSchema = z
  .union([z.enum(STUDENT_SPECIALIZATIONS), z.literal("")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

// "" represents "no email yet" (an empty import cell) and is normalized to
// undefined — email is what lets a student's account auto-link to this
// record on registration, but isn't required for the record to exist.
const emailSchema = z
  .union([z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }), z.literal("")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const statusSchema = z.enum(STUDENT_STATUSES, {
  message: `Status must be one of ${STUDENT_STATUSES.join(", ")}`,
});

export const studentAcademicDetailsSchema = z
  .object({
    rollNumber: rollNumberSchema,
    studentFullName: studentFullNameSchema,
    email: emailSchema,
    year: z.enum(STUDENT_YEARS, { message: "Year must be 1st, 2nd, 3rd, or 4th" }),
    semester: semesterSchema,
    division: z.enum(STUDENT_DIVISIONS, { message: "Division must be A, B, or C" }),
    branch: branchSchema,
    batch: batchSchema,
    specialization: specializationSchema,
    status: statusSchema.default("ACTIVE"),
  })
  .strict();

export const updateStudentAcademicDetailsSchema = studentAcademicDetailsSchema.partial();

export const matchRollNumberSchema = z
  .object({
    rollNumber: rollNumberSchema,
  })
  .strict();

export const importConfirmSchema = z
  .object({
    rows: z
      .array(studentAcademicDetailsSchema)
      .min(1, { message: "At least one row is required" })
      .max(1000, { message: "A single import is limited to 1000 rows" }),
  })
  .strict();

export type StudentAcademicDetailsInput = z.infer<typeof studentAcademicDetailsSchema>;
/** The pre-validation shape react-hook-form should use for controlled fields (batch/semester accept string | number before parsing). */
export type StudentAcademicDetailsFormInput = z.input<typeof studentAcademicDetailsSchema>;
export type UpdateStudentAcademicDetailsInput = z.infer<typeof updateStudentAcademicDetailsSchema>;
export type MatchRollNumberInput = z.infer<typeof matchRollNumberSchema>;
export type ImportConfirmInput = z.infer<typeof importConfirmSchema>;
