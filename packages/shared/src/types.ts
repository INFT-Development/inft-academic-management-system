import type { Role } from "./role";
import type { StudentOrigin, StudentStatus } from "./student";
import type { StudentAcademicDetailsInput } from "./schemas/student.schema";

export interface User {
  id: string;
  email: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
}

/** One of the current user's org memberships, as returned by /auth/me, /auth/login, /auth/refresh. */
export interface MembershipSummary {
  id: string;
  organizationId: string;
  organizationName: string;
  role: Role;
  /** Only meaningful for STUDENT-role memberships: whether a Student academic-details record is linked yet. */
  profileComplete?: boolean;
}

/** A row in an organization's member list (Students / Teachers / Admins tables). */
export interface Member {
  id: string;
  role: Role;
  createdAt: string;
  user: User;
}

export interface AuthSession {
  user: User;
  memberships: MembershipSummary[];
  accessToken: string;
  refreshToken: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}

/** A student's academic details within one organization. */
export interface Student {
  id: string;
  organizationId: string;
  userId: string | null;
  rollNumber: string;
  studentFullName: string;
  /** Email the student is expected to register with — used to auto-link their account on signup/join. */
  email?: string;
  year: string;
  semester: number;
  division: string;
  branch: string;
  batch: number;
  specialization?: string;
  status: StudentStatus;
  origin: StudentOrigin;
  createdAt: string;
  updatedAt: string;
  /** The linked account's email, if any — convenience for admin list/detail views. */
  userEmail?: string;
}

export interface StudentImportRowError {
  row: number;
  rollNumber?: string;
  errors: string[];
}

export interface StudentImportPreviewResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  validRows: Array<{ row: number; data: StudentAcademicDetailsInput }>;
  invalidRows: StudentImportRowError[];
}

export interface StudentImportConfirmResult {
  imported: number;
  students: Student[];
}

/** Response of GET /organizations/:organizationId/students/me — tells the frontend whether to show the academic-details form. */
export interface OnboardingStatus {
  student: Student | null;
  profileComplete: boolean;
  source: "pre_registered" | "new";
}
