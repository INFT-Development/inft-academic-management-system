export const STUDENT_YEARS = ["1st", "2nd", "3rd", "4th"] as const;
export type StudentYear = (typeof STUDENT_YEARS)[number];

export const STUDENT_DIVISIONS = ["A", "B", "C"] as const;
export type StudentDivision = (typeof STUDENT_DIVISIONS)[number];

export const STUDENT_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type StudentSemester = (typeof STUDENT_SEMESTERS)[number];

export const STUDENT_BRANCHES = ["INFT", "CMPN", "EXTC", "EXCS", "BIOM"] as const;
export type StudentBranch = (typeof STUDENT_BRANCHES)[number];

export const STUDENT_SPECIALIZATIONS = ["AI & ML", "Cyber Security"] as const;
export type StudentSpecialization = (typeof STUDENT_SPECIALIZATIONS)[number];

export const STUDENT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

/** How a Student record came to exist. ADMIN rows start unlinked (userId is null) until a student claims them by roll number. */
export const StudentOrigin = {
  ADMIN: "ADMIN",
  SELF: "SELF",
} as const;

export type StudentOrigin = (typeof StudentOrigin)[keyof typeof StudentOrigin];
