import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/prisma";
import type { Role } from "@ams/shared";

/**
 * Resolves the caller's Membership for `:organizationId` in the route path and
 * attaches it to `req.membership`. The frontend's selected organization is only
 * a UI convenience — this lookup is the actual authorization boundary, so an
 * organizationId a user isn't a member of never grants access to that org's data.
 */
export function requireMembership(...allowedRoles: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const organizationId = req.params.organizationId as string | undefined;

      if (!organizationId) {
        throw new AppError("Organization id is required", 400);
      }

      const membership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: req.user.id,
            organizationId,
          },
        },
      });

      if (!membership) {
        throw new AppError("You are not a member of this organization", 403);
      }

      if (allowedRoles.length && !allowedRoles.includes(membership.role)) {
        throw new AppError("Forbidden", 403);
      }

      req.membership = {
        id: membership.id,
        organizationId: membership.organizationId,
        role: membership.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
