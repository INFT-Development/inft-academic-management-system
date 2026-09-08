import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import organizationRoutes from "../modules/organization/organization.routes";
import studentRoutes from "../modules/student/student.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/organizations", studentRoutes);

export default router;
