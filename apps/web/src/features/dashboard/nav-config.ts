import type { Icon } from "@phosphor-icons/react";
import {
  House,
  ShieldCheck,
  ChalkboardTeacher,
  Student,
  Books,
  ChalkboardSimple,
  CalendarCheck,
  ChartBar,
  Gear,
  UserCircle,
} from "@phosphor-icons/react";
import { Role } from "@/constants/roles";

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** Present when the feature has no backend yet — rendered disabled with this as the reason. */
  comingSoon?: string;
}

const COURSES_REASON = "Courses aren't available yet.";
const CLASSES_REASON = "Classes aren't available yet.";
const ATTENDANCE_REASON = "Attendance isn't available yet.";
const GRADES_REASON = "Grades aren't available yet.";

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  [Role.SUPER_ADMIN]: [
    { label: "Dashboard", to: "/dashboard/super-admin", icon: House },
    { label: "Admins", to: "/dashboard/super-admin/admins", icon: ShieldCheck },
    { label: "Teachers", to: "/dashboard/super-admin/teachers", icon: ChalkboardTeacher },
    { label: "Students", to: "/dashboard/super-admin/students", icon: Student },
    { label: "Courses", to: "/dashboard/super-admin/courses", icon: Books, comingSoon: COURSES_REASON },
    { label: "Classes", to: "/dashboard/super-admin/classes", icon: ChalkboardSimple, comingSoon: CLASSES_REASON },
    { label: "Attendance", to: "/dashboard/super-admin/attendance", icon: CalendarCheck, comingSoon: ATTENDANCE_REASON },
    { label: "Grades", to: "/dashboard/super-admin/grades", icon: ChartBar, comingSoon: GRADES_REASON },
    { label: "Settings", to: "/dashboard/super-admin/settings", icon: Gear },
  ],
  [Role.ADMIN]: [
    { label: "Dashboard", to: "/dashboard/admin", icon: House },
    { label: "Students", to: "/dashboard/admin/students", icon: Student },
    { label: "Teachers", to: "/dashboard/admin/teachers", icon: ChalkboardTeacher },
    { label: "Courses", to: "/dashboard/admin/courses", icon: Books, comingSoon: COURSES_REASON },
    { label: "Classes", to: "/dashboard/admin/classes", icon: ChalkboardSimple, comingSoon: CLASSES_REASON },
    { label: "Attendance", to: "/dashboard/admin/attendance", icon: CalendarCheck, comingSoon: ATTENDANCE_REASON },
    { label: "Grades", to: "/dashboard/admin/grades", icon: ChartBar, comingSoon: GRADES_REASON },
  ],
  [Role.TEACHER]: [
    { label: "Dashboard", to: "/dashboard/teacher", icon: House },
    { label: "Courses", to: "/dashboard/teacher/courses", icon: Books, comingSoon: COURSES_REASON },
    { label: "Students", to: "/dashboard/teacher/students", icon: Student, comingSoon: "Assigned students need Courses, which aren't available yet." },
    { label: "Attendance", to: "/dashboard/teacher/attendance", icon: CalendarCheck, comingSoon: ATTENDANCE_REASON },
    { label: "Grades", to: "/dashboard/teacher/grades", icon: ChartBar, comingSoon: GRADES_REASON },
  ],
  [Role.STUDENT]: [
    { label: "Dashboard", to: "/dashboard/student", icon: House },
    { label: "Profile", to: "/dashboard/student/profile", icon: UserCircle },
    { label: "Courses", to: "/dashboard/student/courses", icon: Books, comingSoon: COURSES_REASON },
    { label: "Attendance", to: "/dashboard/student/attendance", icon: CalendarCheck, comingSoon: ATTENDANCE_REASON },
    { label: "Grades", to: "/dashboard/student/grades", icon: ChartBar, comingSoon: GRADES_REASON },
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Admin",
  [Role.TEACHER]: "Teacher",
  [Role.STUDENT]: "Student",
};
