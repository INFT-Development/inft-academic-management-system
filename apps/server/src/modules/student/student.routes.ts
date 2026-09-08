import { Router } from "express";
import * as studentController from "./student.controller";
import {
  studentAcademicDetailsSchema,
  updateStudentAcademicDetailsSchema,
  matchRollNumberSchema,
  importConfirmSchema,
} from "./student.schema";
import { validate } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireMembership } from "../../middleware/role.middleware";
import { uploadStudentImportFile } from "../../middleware/upload.middleware";
import { Role } from "@ams/shared";

const router = Router();

router.use(authMiddleware);

// Import/template routes are registered before the generic "/:studentId"
// route so a literal segment (e.g. "import") is never matched as an id.
router.get(
  "/:organizationId/students/import/template",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  studentController.downloadTemplate
);

router.post(
  "/:organizationId/students/import",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  uploadStudentImportFile,
  studentController.importPreview
);

router.post(
  "/:organizationId/students/import/confirm",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  validate(importConfirmSchema),
  studentController.importConfirm
);

// Self-onboarding routes ("/me"...) are also registered before "/:studentId"
// for the same reason — "me" is not a student id.
router.get(
  "/:organizationId/students/me",
  requireMembership(Role.STUDENT),
  studentController.onboardingStatus
);

router.post(
  "/:organizationId/students/me/match",
  requireMembership(Role.STUDENT),
  validate(matchRollNumberSchema),
  studentController.matchByRollNumber
);

router.post(
  "/:organizationId/students/me",
  requireMembership(Role.STUDENT),
  validate(studentAcademicDetailsSchema),
  studentController.createStudentBySelf
);

router.get(
  "/:organizationId/students",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  studentController.listStudents
);

router.post(
  "/:organizationId/students",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  validate(studentAcademicDetailsSchema),
  studentController.createStudent
);

router.get(
  "/:organizationId/students/:studentId",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  studentController.getStudent
);

router.patch(
  "/:organizationId/students/:studentId",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  validate(updateStudentAcademicDetailsSchema),
  studentController.updateStudent
);

export default router;
