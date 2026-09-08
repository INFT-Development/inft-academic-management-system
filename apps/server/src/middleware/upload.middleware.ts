import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError";

const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];
const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Browsers/OSes are inconsistent about the mimetype they report for .csv;
  // the extension check below is the real gate, this list just narrows it.
  "application/octet-stream",
];

function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) {
  const extension = file.originalname.slice(file.originalname.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(new AppError("Only .csv and .xlsx files are supported", 400));
  }

  callback(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single("file");

export function uploadStudentImportFile(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (error: unknown) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("File must be under 5MB", 400));
    }

    return next(error);
  });
}
