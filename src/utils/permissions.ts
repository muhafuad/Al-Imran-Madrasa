import type { UserRole } from "../types";

/**
 * Role-Based Printing & Document Issuance Authorization Rules
 *
 * Strict hierarchy for institutional printing to prevent unauthorized
 * badge forgery, fake certificate generation, or altered financial receipts.
 */

// Roles permitted to print official student/staff ID cards & PVC badges
export const ID_CARD_PRINT_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
];

// Roles permitted to issue and print official Ijazahs, Sanads & Khatmah Diplomas
export const CERTIFICATE_PRINT_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
];

// Roles permitted to issue and print official Madrasa financial receipts and payment vouchers
export const FINANCE_RECEIPT_PRINT_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "finance_officer",
];

// Roles permitted to print sealed term report cards and grade transcripts
export const REPORT_CARD_PRINT_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
  "teacher",
  "hifz_teacher",
];

// Roles permitted to print master student rosters and administrative dossiers
export const STUDENT_DOSSIER_PRINT_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
];

// Roles permitted to run batch mass-printing operations (high ink/PVC volume)
export const BATCH_PRINT_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
];

/**
 * Functional Operational Roles Definitions
 */

// Roles authorized to assign, edit, grade, and delete homework assignments
export const HOMEWORK_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "teacher",
  "hifz_teacher",
];

// Roles authorized to take daily roll call, mark student attendance status, and save rosters
export const ATTENDANCE_TAKE_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
  "teacher",
  "hifz_teacher",
];

// Roles authorized to see backend database status, live sync banners, and trigger sync
export const DATABASE_VIEW_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
  "finance_officer",
  "teacher",
  "hifz_teacher",
];

// Roles authorized to configure cloud database credentials, keys, and SQL migrations
export const DATABASE_ADMIN_ROLES: UserRole[] = ["super_admin", "principal"];

// Roles authorized to log official evaluated Sabaq / Sabqi sessions
export const HIFZ_RECORD_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "hifz_teacher",
  "teacher",
];

// Roles authorized to create and score exams
export const EXAM_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "teacher",
  "hifz_teacher",
  "registrar",
];

// Roles authorized to enroll, edit, or archive students
export const STUDENT_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "registrar",
  "finance_officer",
  "teacher",
  "hifz_teacher",
];

// Roles authorized to manage faculty and ustazs
export const STAFF_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
];

// Roles authorized to create fee structures, post payments, and adjust accounts
export const FINANCE_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "principal",
  "vice_principal",
  "finance_officer",
];

/**
 * Authorization Helper Functions
 */

export const canManageHomework = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return HOMEWORK_MANAGE_ROLES.includes(role);
};

export const canCreateHomework = (role?: UserRole | null): boolean => {
  return canManageHomework(role);
};

export const canTakeAttendance = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return ATTENDANCE_TAKE_ROLES.includes(role);
};

export const canViewDatabaseBanner = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return DATABASE_VIEW_ROLES.includes(role);
};

export const canAdministerDatabase = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return DATABASE_ADMIN_ROLES.includes(role);
};

export const canRecordHifz = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return HIFZ_RECORD_ROLES.includes(role);
};

export const canManageExams = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return EXAM_MANAGE_ROLES.includes(role);
};

export const canManageStudents = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return STUDENT_MANAGE_ROLES.includes(role);
};

export const canManageStaff = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return STAFF_MANAGE_ROLES.includes(role);
};

export const canManageFinance = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return FINANCE_MANAGE_ROLES.includes(role);
};

/**
 * Helper checking if a given role is authorized to print ID cards
 */
export const canPrintIDCards = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return ID_CARD_PRINT_ROLES.includes(role);
};

/**
 * Helper checking if a given role is authorized to print official certificates
 */
export const canPrintCertificates = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return CERTIFICATE_PRINT_ROLES.includes(role);
};

/**
 * Helper checking if a given role is authorized to print financial receipts
 */
export const canPrintFinancialReceipts = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return FINANCE_RECEIPT_PRINT_ROLES.includes(role);
};

/**
 * Helper checking if a given role is authorized to print report cards
 */
export const canPrintReportCards = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return REPORT_CARD_PRINT_ROLES.includes(role);
};

/**
 * Helper checking if a given role is authorized to print student dossiers
 */
export const canPrintStudentDossiers = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return STUDENT_DOSSIER_PRINT_ROLES.includes(role);
};

/**
 * Helper checking if a given role is authorized for batch printing
 */
export const canBatchPrint = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return BATCH_PRINT_ROLES.includes(role);
};

/**
 * Formats a human-readable list of required roles for printing authorization
 */
export const getAuthorizedRolesLabel = (roles: UserRole[]): string => {
  const roleNames: Record<UserRole, string> = {
    super_admin: "Super Admin (المدير العام)",
    principal: "Principal (المدير)",
    vice_principal: "Vice Principal (نائب المدير)",
    registrar: "Registrar (مسؤول القبول والتسجيل)",
    finance_officer: "Finance Officer (المسؤول المالي)",
    teacher: "Academic Teacher (المدرس)",
    hifz_teacher: "Hifz Ustaz (أستاذ التحفيظ)",
    parent: "Parent (ولي الأمر)",
    student: "Student (الطالب)",
  };

  return roles.map((r) => roleNames[r] || r).join(", ");
};
