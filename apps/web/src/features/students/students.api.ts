import { apiClient, apiDownload } from "@/api/client";
import type {
  ApiSuccess,
  OnboardingStatus,
  Student,
  StudentAcademicDetailsInput,
  StudentImportConfirmResult,
  StudentImportPreviewResult,
} from "@ams/shared";

export type ListStudentsResponse = ApiSuccess<{
  students: Student[];
  total: number;
  page: number;
  pageSize: number;
}>;
export type StudentResponse = ApiSuccess<{ student: Student }>;
export type ImportPreviewResponse = ApiSuccess<StudentImportPreviewResult>;
export type ImportConfirmResponse = ApiSuccess<StudentImportConfirmResult>;
export type OnboardingStatusResponse = ApiSuccess<OnboardingStatus>;
export type MatchResponse = ApiSuccess<{
  student: Student;
  profileComplete: true;
  source: "pre_registered";
}>;
export type CreateSelfResponse = ApiSuccess<{
  student: Student;
  profileComplete: true;
  source: "new";
}>;

export interface ListStudentsParams {
  year?: string;
  semester?: number;
  division?: string;
  branch?: string;
  batch?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listStudents(
  organizationId: string,
  params: ListStudentsParams = {},
): Promise<ListStudentsResponse> {
  const query = new URLSearchParams();

  if (params.year) query.set("year", params.year);
  if (params.semester) query.set("semester", String(params.semester));
  if (params.division) query.set("division", params.division);
  if (params.branch) query.set("branch", params.branch);
  if (params.batch) query.set("batch", String(params.batch));
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const queryString = query.toString();

  return apiClient<ListStudentsResponse>(
    `/organizations/${organizationId}/students${queryString ? `?${queryString}` : ""}`,
  );
}

export async function getStudent(
  organizationId: string,
  studentId: string,
): Promise<StudentResponse> {
  return apiClient<StudentResponse>(
    `/organizations/${organizationId}/students/${studentId}`,
  );
}

export async function createStudent(
  organizationId: string,
  input: StudentAcademicDetailsInput,
): Promise<StudentResponse> {
  return apiClient<StudentResponse>(`/organizations/${organizationId}/students`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateStudent(
  organizationId: string,
  studentId: string,
  input: Partial<StudentAcademicDetailsInput>,
): Promise<StudentResponse> {
  return apiClient<StudentResponse>(
    `/organizations/${organizationId}/students/${studentId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function importPreview(
  organizationId: string,
  file: File,
): Promise<ImportPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ImportPreviewResponse>(
    `/organizations/${organizationId}/students/import`,
    { method: "POST", body: formData },
  );
}

export async function importConfirm(
  organizationId: string,
  rows: StudentAcademicDetailsInput[],
): Promise<ImportConfirmResponse> {
  return apiClient<ImportConfirmResponse>(
    `/organizations/${organizationId}/students/import/confirm`,
    { method: "POST", body: JSON.stringify({ rows }) },
  );
}

export async function downloadStudentTemplate(
  organizationId: string,
  format: "csv" | "xlsx",
): Promise<void> {
  const blob = await apiDownload(
    `/organizations/${organizationId}/students/import/template?format=${format}`,
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `student-import-template.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function getOnboardingStatus(
  organizationId: string,
): Promise<OnboardingStatusResponse> {
  return apiClient<OnboardingStatusResponse>(
    `/organizations/${organizationId}/students/me`,
  );
}

export async function matchByRollNumber(
  organizationId: string,
  rollNumber: string,
): Promise<MatchResponse> {
  return apiClient<MatchResponse>(
    `/organizations/${organizationId}/students/me/match`,
    { method: "POST", body: JSON.stringify({ rollNumber }) },
  );
}

export async function createStudentBySelf(
  organizationId: string,
  input: StudentAcademicDetailsInput,
): Promise<CreateSelfResponse> {
  return apiClient<CreateSelfResponse>(
    `/organizations/${organizationId}/students/me`,
    { method: "POST", body: JSON.stringify(input) },
  );
}
