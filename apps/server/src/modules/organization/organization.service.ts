import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { Role, type Member, type OrganizationSummary } from "@ams/shared";

export async function createOrganization(userId: string, name: string) {
  const existing = await prisma.organization.findUnique({ where: { name } });

  if (existing) {
    throw new AppError("An organization with this name already exists", 409);
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      memberships: {
        create: {
          userId,
          role: Role.SUPER_ADMIN,
        },
      },
    },
  });

  return { id: organization.id, name: organization.name };
}

export async function searchOrganizations(
  search: string | undefined
): Promise<OrganizationSummary[]> {
  const organizations = await prisma.organization.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { name: "asc" },
    take: 20,
  });

  return organizations.map((org) => ({ id: org.id, name: org.name }));
}

export async function joinOrganization(userId: string, organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const existingMembership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });

  if (existingMembership) {
    throw new AppError("You are already a member of this organization", 409);
  }

  const membership = await prisma.membership.create({
    data: {
      userId,
      organizationId,
      role: Role.STUDENT,
    },
  });

  return {
    id: membership.id,
    organizationId: organization.id,
    organizationName: organization.name,
    role: membership.role,
  };
}

interface ListMembersOptions {
  role?: Role;
  search?: string;
  page: number;
  pageSize: number;
}

export async function listMembers(
  organizationId: string,
  { role, search, page, pageSize }: ListMembersOptions
): Promise<{ members: Member[]; total: number; page: number; pageSize: number }> {
  const where = {
    organizationId,
    ...(role ? { role } : {}),
    ...(search
      ? { user: { email: { contains: search, mode: "insensitive" as const } } }
      : {}),
  };

  const [memberships, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.membership.count({ where }),
  ]);

  return {
    members: memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      createdAt: membership.createdAt.toISOString(),
      user: { id: membership.user.id, email: membership.user.email },
    })),
    total,
    page,
    pageSize,
  };
}

export async function addMember(
  actorRole: Role,
  organizationId: string,
  input: { email: string; role: typeof Role.ADMIN | typeof Role.TEACHER }
) {
  if (input.role === Role.ADMIN && actorRole !== Role.SUPER_ADMIN) {
    throw new AppError("Only the Super Admin can add admins", 403);
  }

  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    throw new AppError(
      "No account found for this email. The person must sign up before they can be added.",
      404
    );
  }

  const existingMembership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
  });

  if (existingMembership) {
    throw new AppError("This person is already a member of this organization", 409);
  }

  const membership = await prisma.membership.create({
    data: { userId: user.id, organizationId, role: input.role },
  });

  return {
    id: membership.id,
    role: membership.role,
    createdAt: membership.createdAt.toISOString(),
    user: { id: user.id, email: user.email },
  };
}

async function getMembershipInOrg(organizationId: string, membershipId: string) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!membership || membership.organizationId !== organizationId) {
    throw new AppError("Member not found", 404);
  }

  return membership;
}

export async function updateMemberRole(
  organizationId: string,
  membershipId: string,
  role: typeof Role.ADMIN | typeof Role.TEACHER | typeof Role.STUDENT
) {
  const membership = await getMembershipInOrg(organizationId, membershipId);

  if (membership.role === Role.SUPER_ADMIN) {
    throw new AppError("The organization's Super Admin role cannot be changed here", 400);
  }

  const updated = await prisma.membership.update({
    where: { id: membershipId },
    data: { role },
    include: { user: true },
  });

  return {
    id: updated.id,
    role: updated.role,
    createdAt: updated.createdAt.toISOString(),
    user: { id: updated.user.id, email: updated.user.email },
  };
}

export async function removeMember(
  actorRole: Role,
  organizationId: string,
  membershipId: string
) {
  const membership = await getMembershipInOrg(organizationId, membershipId);

  if (membership.role === Role.SUPER_ADMIN) {
    throw new AppError("The organization's Super Admin cannot be removed", 400);
  }

  if (membership.role === Role.ADMIN && actorRole !== Role.SUPER_ADMIN) {
    throw new AppError("Only the Super Admin can remove admins", 403);
  }

  await prisma.membership.delete({ where: { id: membershipId } });
}
