import { Router } from "express";
import * as organizationController from "./organization.controller";
import {
  createOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "./organization.schema";
import { validate } from "../../middleware/validate.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireMembership } from "../../middleware/role.middleware";
import { Role } from "@ams/shared";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createOrganizationSchema), organizationController.create);
router.get("/", organizationController.search);
router.post("/:organizationId/join", organizationController.join);

router.get(
  "/:organizationId/members",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  organizationController.listMembers
);

router.post(
  "/:organizationId/members",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  validate(addMemberSchema),
  organizationController.addMember
);

router.patch(
  "/:organizationId/members/:membershipId",
  requireMembership(Role.SUPER_ADMIN),
  validate(updateMemberRoleSchema),
  organizationController.updateMemberRole
);

router.delete(
  "/:organizationId/members/:membershipId",
  requireMembership(Role.SUPER_ADMIN, Role.ADMIN),
  organizationController.removeMember
);

export default router;
