import type { Request, Response, NextFunction } from "express";
import * as studentService from "./student.service";
import { parseStudentImportFile, buildCsvTemplate, buildXlsxTemplate } from "./student.import.util";
import { AppError } from "../../utils/AppError";

function param(req: Request, name: string): string {
  return req.params[name] as string;
}

function parseStudentsQuery(req: Request) {
  const stringParam = (name: string) => (typeof req.query[name] === "string" ? (req.query[name] as string) : undefined);

  const semesterRaw = stringParam("semester");
  const batchRaw = stringParam("batch");

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

  return {
    year: stringParam("year"),
    semester: semesterRaw ? Number(semesterRaw) : undefined,
    division: stringParam("division"),
    branch: stringParam("branch"),
    batch: batchRaw ? Number(batchRaw) : undefined,
    search: stringParam("search"),
    page,
    pageSize,
  };
}

export async function listStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.listStudents(param(req, "organizationId"), parseStudentsQuery(req));

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await studentService.getStudent(param(req, "organizationId"), param(req, "studentId"));

    return res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: { student },
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await studentService.createStudentByAdmin(param(req, "organizationId"), req.body);

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: { student },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await studentService.updateStudent(
      param(req, "organizationId"),
      param(req, "studentId"),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: { student },
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const format = req.query.format === "xlsx" ? "xlsx" : "csv";

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="student-import-template.csv"');
      return res.status(200).send(buildCsvTemplate());
    }

    const buffer = await buildXlsxTemplate();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="student-import-template.xlsx"');
    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
}

export async function importPreview(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError("A file is required", 400);
    }

    const extension = req.file.originalname.slice(req.file.originalname.lastIndexOf(".")).toLowerCase();
    if (extension !== ".csv" && extension !== ".xlsx") {
      throw new AppError("Only .csv and .xlsx files are supported", 400);
    }

    const rawRows = await parseStudentImportFile(req.file.buffer, extension);
    const preview = await studentService.importPreview(param(req, "organizationId"), rawRows);

    return res.status(200).json({
      success: true,
      message: "File parsed successfully",
      data: preview,
    });
  } catch (error) {
    next(error);
  }
}

export async function importConfirm(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await studentService.importConfirm(param(req, "organizationId"), req.body.rows);

    return res.status(201).json({
      success: true,
      message: `Imported ${result.imported} student${result.imported === 1 ? "" : "s"} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function onboardingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const status = await studentService.onboardingStatus(
      param(req, "organizationId"),
      req.user.id,
      req.user.email
    );

    return res.status(200).json({
      success: true,
      message: "Onboarding status retrieved successfully",
      data: status,
    });
  } catch (error) {
    next(error);
  }
}

export async function matchByRollNumber(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const student = await studentService.matchByRollNumber(
      param(req, "organizationId"),
      req.user.id,
      req.body.rollNumber
    );

    return res.status(200).json({
      success: true,
      message: "Student record linked successfully",
      data: { student, profileComplete: true, source: "pre_registered" },
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudentBySelf(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const student = await studentService.createStudentBySelf(
      param(req, "organizationId"),
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: { student, profileComplete: true, source: "new" },
    });
  } catch (error) {
    next(error);
  }
}
