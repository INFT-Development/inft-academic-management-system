import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import {
  StudentOrigin,
  studentAcademicDetailsSchema,
  type Student,
  type StudentImportPreviewResult,
  type StudentImportConfirmResult,
  type StudentImportRowError,
  type OnboardingStatus,
  type StudentAcademicDetailsInput,
  type UpdateStudentAcademicDetailsInput,
  type StudentStatus,
} from "@ams/shared";
import type { Student as PrismaStudent, User } from "../../generated/prisma/client";

function toStudentDto(student: PrismaStudent & { user?: User | null }): Student {
  return {
    id: student.id,
    organizationId: student.organizationId,
    userId: student.userId,
    rollNumber: student.rollNumber,
    studentFullName: student.studentFullName,
    email: student.email ?? undefined,
    year: student.year,
    semester: student.semester,
    division: student.division,
    branch: student.branch,
    batch: student.batch,
    specialization: student.specialization ?? undefined,
    status: student.status as StudentStatus,
    origin: student.origin as StudentOrigin,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
    userEmail: student.user?.email,
  };
}

interface ListStudentsOptions {
  year?: string;
  semester?: number;
  division?: string;
  branch?: string;
  batch?: number;
  search?: string;
  page: number;
  pageSize: number;
}

export async function listStudents(
  organizationId: string,
  { year, semester, division, branch, batch, search, page, pageSize }: ListStudentsOptions
): Promise<{ students: Student[]; total: number; page: number; pageSize: number }> {
  const where = {
    organizationId,
    ...(year ? { year } : {}),
    ...(semester ? { semester } : {}),
    ...(division ? { division } : {}),
    ...(branch ? { branch: { contains: branch, mode: "insensitive" as const } } : {}),
    ...(batch ? { batch } : {}),
    ...(search
      ? {
          OR: [
            { rollNumber: { contains: search, mode: "insensitive" as const } },
            { studentFullName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { user: true },
      orderBy: { rollNumber: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students: students.map(toStudentDto),
    total,
    page,
    pageSize,
  };
}

export async function getStudent(organizationId: string, studentId: string): Promise<Student> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student || student.organizationId !== organizationId) {
    throw new AppError("Student not found", 404);
  }

  return toStudentDto(student);
}

export async function createStudentByAdmin(
  organizationId: string,
  input: StudentAcademicDetailsInput
): Promise<Student> {
  const existing = await prisma.student.findUnique({
    where: { organizationId_rollNumber: { organizationId, rollNumber: input.rollNumber } },
  });

  if (existing) {
    throw new AppError("A student with this roll number already exists in this organization", 409);
  }

  if (input.email) {
    const emailConflict = await prisma.student.findUnique({
      where: { organizationId_email: { organizationId, email: input.email } },
    });

    if (emailConflict) {
      throw new AppError("A student with this email already exists in this organization", 409);
    }
  }

  const created = await prisma.student.create({
    data: { organizationId, ...input, origin: StudentOrigin.ADMIN },
    include: { user: true },
  });

  return toStudentDto(created);
}

export async function updateStudent(
  organizationId: string,
  studentId: string,
  input: UpdateStudentAcademicDetailsInput
): Promise<Student> {
  const existing = await prisma.student.findUnique({ where: { id: studentId } });

  if (!existing || existing.organizationId !== organizationId) {
    throw new AppError("Student not found", 404);
  }

  if (input.rollNumber && input.rollNumber !== existing.rollNumber) {
    const conflict = await prisma.student.findUnique({
      where: { organizationId_rollNumber: { organizationId, rollNumber: input.rollNumber } },
    });

    if (conflict) {
      throw new AppError("A student with this roll number already exists in this organization", 409);
    }
  }

  if (input.email && input.email !== existing.email) {
    const emailConflict = await prisma.student.findUnique({
      where: { organizationId_email: { organizationId, email: input.email } },
    });

    if (emailConflict) {
      throw new AppError("A student with this email already exists in this organization", 409);
    }
  }

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: input,
    include: { user: true },
  });

  return toStudentDto(updated);
}

export async function importPreview(
  organizationId: string,
  rawRows: Record<string, string>[]
): Promise<StudentImportPreviewResult> {
  if (rawRows.length === 0) {
    throw new AppError("The uploaded file has no data rows", 400);
  }

  if (rawRows.length > 1000) {
    throw new AppError("A single import is limited to 1000 rows", 400);
  }

  const validRows: Array<{ row: number; data: StudentAcademicDetailsInput }> = [];
  const invalidRows: StudentImportRowError[] = [];
  const firstSeenAtRow = new Map<string, number>();
  const firstSeenEmailAtRow = new Map<string, number>();

  rawRows.forEach((raw, index) => {
    // Row 1 is the header in the source file, so the first data row is row 2.
    const row = index + 2;
    const result = studentAcademicDetailsSchema.safeParse(raw);

    if (!result.success) {
      invalidRows.push({
        row,
        rollNumber: typeof raw.rollNumber === "string" ? raw.rollNumber : undefined,
        errors: result.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const { rollNumber, email } = result.data;
    const firstRow = firstSeenAtRow.get(rollNumber);

    if (firstRow) {
      invalidRows.push({
        row,
        rollNumber,
        errors: [`Duplicate roll number in file (first seen on row ${firstRow})`],
      });
      return;
    }

    if (email) {
      const firstEmailRow = firstSeenEmailAtRow.get(email);

      if (firstEmailRow) {
        invalidRows.push({
          row,
          rollNumber,
          errors: [`Duplicate email in file (first seen on row ${firstEmailRow})`],
        });
        return;
      }

      firstSeenEmailAtRow.set(email, row);
    }

    firstSeenAtRow.set(rollNumber, row);
    validRows.push({ row, data: result.data });
  });

  if (validRows.length > 0) {
    const validEmails = validRows.map((r) => r.data.email).filter((email): email is string => Boolean(email));

    const existing = await prisma.student.findMany({
      where: {
        organizationId,
        OR: [
          { rollNumber: { in: validRows.map((r) => r.data.rollNumber) } },
          ...(validEmails.length > 0 ? [{ email: { in: validEmails } }] : []),
        ],
      },
      select: { rollNumber: true, email: true },
    });
    const existingRollNumbers = new Set(existing.map((s) => s.rollNumber));
    const existingEmails = new Set(existing.map((s) => s.email).filter((email): email is string => Boolean(email)));

    for (let i = validRows.length - 1; i >= 0; i--) {
      const candidate = validRows[i];

      if (existingRollNumbers.has(candidate.data.rollNumber)) {
        validRows.splice(i, 1);
        invalidRows.push({
          row: candidate.row,
          rollNumber: candidate.data.rollNumber,
          errors: ["Roll number already exists in this organization"],
        });
      } else if (candidate.data.email && existingEmails.has(candidate.data.email)) {
        validRows.splice(i, 1);
        invalidRows.push({
          row: candidate.row,
          rollNumber: candidate.data.rollNumber,
          errors: ["Email already exists in this organization"],
        });
      }
    }
  }

  invalidRows.sort((a, b) => a.row - b.row);

  return {
    totalRows: rawRows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    validRows,
    invalidRows,
  };
}

export async function importConfirm(
  organizationId: string,
  rows: StudentAcademicDetailsInput[]
): Promise<StudentImportConfirmResult> {
  const rollNumbers = rows.map((row) => row.rollNumber);
  const duplicatesInBatch = [...new Set(rollNumbers.filter((rn, i) => rollNumbers.indexOf(rn) !== i))];

  if (duplicatesInBatch.length > 0) {
    throw new AppError(
      `Import aborted — duplicate roll numbers in this submission: ${duplicatesInBatch.join(", ")}`,
      409
    );
  }

  const emails = rows.map((row) => row.email).filter((email): email is string => Boolean(email));
  const duplicateEmailsInBatch = [...new Set(emails.filter((email, i) => emails.indexOf(email) !== i))];

  if (duplicateEmailsInBatch.length > 0) {
    throw new AppError(
      `Import aborted — duplicate emails in this submission: ${duplicateEmailsInBatch.join(", ")}`,
      409
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.student.findMany({
        where: {
          organizationId,
          OR: [
            { rollNumber: { in: rollNumbers } },
            ...(emails.length > 0 ? [{ email: { in: emails } }] : []),
          ],
        },
        select: { rollNumber: true, email: true },
      });

      if (existing.length > 0) {
        throw new AppError(
          `Import aborted — these roll numbers/emails already exist in this organization: ${existing
            .map((s) => s.email ?? s.rollNumber)
            .join(", ")}. Nothing was imported.`,
          409
        );
      }

      await tx.student.createMany({
        data: rows.map((row) => ({
          organizationId,
          rollNumber: row.rollNumber,
          studentFullName: row.studentFullName,
          email: row.email,
          year: row.year,
          semester: row.semester,
          division: row.division,
          branch: row.branch,
          batch: row.batch,
          specialization: row.specialization,
          status: row.status,
          origin: StudentOrigin.ADMIN,
        })),
      });

      const created = await tx.student.findMany({
        where: { organizationId, rollNumber: { in: rollNumbers } },
      });

      return { imported: created.length, students: created.map((s) => toStudentDto(s)) };
    },
    { maxWait: 10_000, timeout: 20_000 }
  );
}

/**
 * Ensures a user has a linked Student record in this organization: returns
 * the existing link if there is one, otherwise looks for an admin-imported
 * row matching the user's email (still unclaimed) and links it. Used both by
 * onboarding status and by auth's membership summary, so a student whose
 * email was pre-loaded never has to fill in the academic-details form.
 */
export async function autoLinkStudentByEmail(
  organizationId: string,
  userId: string,
  email: string
): Promise<Student | null> {
  const existing = await prisma.student.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    include: { user: true },
  });

  if (existing) return toStudentDto(existing);

  const normalizedEmail = email.trim().toLowerCase();
  const candidate = await prisma.student.findUnique({
    where: { organizationId_email: { organizationId, email: normalizedEmail } },
  });

  if (!candidate || candidate.userId) return null;

  const linked = await prisma.student.update({
    where: { id: candidate.id },
    data: { userId },
    include: { user: true },
  });

  return toStudentDto(linked);
}

export async function onboardingStatus(
  organizationId: string,
  userId: string,
  userEmail: string
): Promise<OnboardingStatus> {
  const student = await autoLinkStudentByEmail(organizationId, userId, userEmail);

  if (!student) {
    return { student: null, profileComplete: false, source: "new" };
  }

  return {
    student,
    profileComplete: true,
    source: student.origin === StudentOrigin.SELF ? "new" : "pre_registered",
  };
}

export async function matchByRollNumber(
  organizationId: string,
  userId: string,
  rollNumber: string
): Promise<Student> {
  const alreadyLinked = await prisma.student.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });

  if (alreadyLinked) {
    throw new AppError("You already have a student profile in this organization", 409);
  }

  const student = await prisma.student.findUnique({
    where: { organizationId_rollNumber: { organizationId, rollNumber } },
  });

  if (!student) {
    throw new AppError("No pre-existing student record found for this roll number", 404);
  }

  if (student.userId && student.userId !== userId) {
    throw new AppError("This roll number is already linked to another account", 409);
  }

  const linked = await prisma.student.update({
    where: { id: student.id },
    data: { userId },
    include: { user: true },
  });

  return toStudentDto(linked);
}

export async function createStudentBySelf(
  organizationId: string,
  userId: string,
  input: StudentAcademicDetailsInput
): Promise<Student> {
  const alreadyLinked = await prisma.student.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });

  if (alreadyLinked) {
    throw new AppError("You already have a student profile in this organization", 409);
  }

  const existingRollNumber = await prisma.student.findUnique({
    where: { organizationId_rollNumber: { organizationId, rollNumber: input.rollNumber } },
  });

  if (existingRollNumber) {
    throw new AppError(
      "This roll number is already registered in this organization. If this is your record, contact your admin.",
      409
    );
  }

  const created = await prisma.student.create({
    data: { organizationId, userId, ...input, origin: StudentOrigin.SELF },
    include: { user: true },
  });

  return toStudentDto(created);
}
