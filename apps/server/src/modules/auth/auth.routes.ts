import { Router } from "express";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema,refreshSchema } from "./auth.schema";
import { validate } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post("/login",validate(loginSchema) ,authController.login);

router.get("/me", authMiddleware, authController.me);

router.post("/refresh", validate(refreshSchema), authController.refresh);

router.post(
  "/logout",
  authMiddleware,
  authController.logout
);

router.get(
  "/admin-test",
  authMiddleware,
  requireRole("ADMIN"),
  authController.adminTest
);
export default router;