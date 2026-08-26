import { apiClient } from "@/api/client";
import type {
  AddMemberInput,
  ApiSuccess,
  Member,
  MembershipSummary,
  OrganizationSummary,
  Role,
} from "@ams/shared";

export type CreateOrganizationResponse = ApiSuccess<{
  organization: OrganizationSummary;
}>;
export type SearchOrganizationsResponse = ApiSuccess<{
  organizations: OrganizationSummary[];
}>;
export type JoinOrganizationResponse = ApiSuccess<{
  membership: MembershipSummary;
}>;
export type ListMembersResponse = ApiSuccess<{
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
}>;
export type MemberResponse = ApiSuccess<{ member: Member }>;

export async function createOrganization(
  name: string,
): Promise<CreateOrganizationResponse> {
  return apiClient<CreateOrganizationResponse>("/organizations", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function searchOrganizations(
  search: string,
): Promise<SearchOrganizationsResponse> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";

  return apiClient<SearchOrganizationsResponse>(`/organizations${query}`);
}

export async function joinOrganization(
  organizationId: string,
): Promise<JoinOrganizationResponse> {
  return apiClient<JoinOrganizationResponse>(
    `/organizations/${organizationId}/join`,
    { method: "POST" },
  );
}

export interface ListMembersParams {
  role?: Role;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listMembers(
  organizationId: string,
  params: ListMembersParams = {},
): Promise<ListMembersResponse> {
  const query = new URLSearchParams();

  if (params.role) query.set("role", params.role);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const queryString = query.toString();

  return apiClient<ListMembersResponse>(
    `/organizations/${organizationId}/members${queryString ? `?${queryString}` : ""}`,
  );
}

export async function addMember(
  organizationId: string,
  input: AddMemberInput,
): Promise<MemberResponse> {
  return apiClient<MemberResponse>(`/organizations/${organizationId}/members`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMemberRole(
  organizationId: string,
  membershipId: string,
  role: Role,
): Promise<MemberResponse> {
  return apiClient<MemberResponse>(
    `/organizations/${organizationId}/members/${membershipId}`,
    { method: "PATCH", body: JSON.stringify({ role }) },
  );
}

export async function removeMember(
  organizationId: string,
  membershipId: string,
): Promise<ApiSuccess<undefined>> {
  return apiClient<ApiSuccess<undefined>>(
    `/organizations/${organizationId}/members/${membershipId}`,
    { method: "DELETE" },
  );
}
