import type { Request, Response, NextFunction } from "express";
import * as organizationService from "./organization.service";
import { AppError } from "../../utils/AppError";
import { Role } from "@ams/shared";

function param(req: Request, name: string): string {
  return req.params[name] as string;
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const organization = await organizationService.createOrganization(
      req.user.id,
      req.body.name
    );

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
}

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const organizations = await organizationService.searchOrganizations(search);

    return res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
      data: { organizations },
    });
  } catch (error) {
    next(error);
  }
}

export async function join(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const membership = await organizationService.joinOrganization(
      req.user.id,
      param(req, "organizationId")
    );

    return res.status(201).json({
      success: true,
      message: "Joined organization successfully",
      data: { membership },
    });
  } catch (error) {
    next(error);
  }
}

function parseMembersQuery(req: Request) {
  const role =
    typeof req.query.role === "string" && req.query.role in Role
      ? (req.query.role as Role)
      : undefined;

  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

  return { role, search, page, pageSize };
}

export async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await organizationService.listMembers(
      param(req, "organizationId"),
      parseMembersQuery(req)
    );

    return res.status(200).json({
      success: true,
      message: "Members retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.membership) throw new AppError("Authentication required", 401);

    const member = await organizationService.addMember(
      req.membership.role,
      param(req, "organizationId"),
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await organizationService.updateMemberRole(
      param(req, "organizationId"),
      param(req, "membershipId"),
      req.body.role
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.membership) throw new AppError("Authentication required", 401);

    await organizationService.removeMember(
      req.membership.role,
      param(req, "organizationId"),
      param(req, "membershipId")
    );

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
}
