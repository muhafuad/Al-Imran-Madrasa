import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Student,
  Teacher,
  HifzSession,
  AttendanceRecord,
  ExamRecord,
  StudentExamMark,
  PaymentTransaction,
  InventoryItem,
  LibraryBook,
  Announcement,
  NotificationItem,
  HomeworkAssignment,
  HomeworkSubmission,
  CertificateRecord,
  UserProfile,
  UserRole,
  DonationCause,
  DonationRecord,
  AdmissionInquiry,
  EntranceApplication,
  AssessmentResult,
  EntranceApplicationStatus,
  PlacementDetails,
  AuditLogEntry,
  AuditLogCategory,
} from '../types';
import type { RecitationSubmission } from '../types/quranTypes';
import type { Language, Translations } from '../i18n/translations';
import { translations } from '../i18n/translations';
import {
  INITIAL_DONATION_CAUSES,
  INITIAL_DONATIONS,
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_ENTRANCE_APPLICATIONS,
  INITIAL_HOMEWORK,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { INITIAL_RECITATIONS } from '../data/quranJuzData';
import {
  getSupabaseClient,
  ensureSupabaseClient,
  syncServerSupabaseConfig,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  syncAllToSupabase,
  fetchAllFromSupabase,
  isSupabaseConfigured,
  subscribeToDatabaseChanges,
  dbUpsertUserProfile,
  dbDeleteUserProfile,
  dbUpdateUserPassword,
  fetchUserProfileByLoginIdentifier,
  dbUpsertStudent,
  dbDeleteStudent,
  dbUpsertTeacher,
  dbDeleteTeacher,
  dbUpsertHifzSession,
  dbDeleteHifzSession,
  dbUpsertAttendanceRecords,
  dbDeleteAttendanceRecord,
  dbUpsertPayment,
  dbDeletePayment,
  dbUpsertExam,
  dbDeleteExam,
  dbUpsertExamMarks,
  dbDeleteExamMark,
  dbUpsertAnnouncement,
  dbDeleteAnnouncement,
  dbUpsertCertificate,
  dbDeleteCertificate,
  dbUpsertDonation,
  dbDeleteDonation,
  dbUpsertDonationCause,
  dbUpsertAdmissionInquiry,
  dbDeleteAdmissionInquiry,
  dbUpsertEntranceApplication,
  dbDeleteEntranceApplication,
  dbUpsertHomework,
  dbDeleteHomework,
  dbUpsertInventoryItem,
  dbDeleteInventoryItem,
  dbUpsertLibraryBook,
  dbDeleteLibraryBook,
  uploadAudioRecitation,
  dbUpsertRecitation,
  dbFetchRecitations,
  dbDeleteRecitation,
  
} from '../lib/supabase';
import {
  hashPassword,
  verifyPassword,
  generateSessionSignature,
  verifySessionSignature,
  isValidTransactionRef,
} from '../utils/security';
import {
  idbSet,
  idbGet,
  idbSaveMediaBlob,
  idbGetMediaBlob,
  idbGetMediaUrl,
  idbGetStorageEstimate,
} from '../lib/indexedDb';

// Persistent Local Storage Keys
const STORAGE_USERS_KEY = 'alimran_madrasa_users_v2';
const STORAGE_DELETED_USERS_KEY = 'alimran_deleted_user_ids';
const STORAGE_CURRENT_USER_KEY = 'alimran_madrasa_current_user_v2';
const STORAGE_STUDENTS_KEY = 'alimran_madrasa_students_v2';
const STORAGE_TEACHERS_KEY = 'alimran_madrasa_teachers_v2';
const STORAGE_HIFZ_KEY = 'alimran_madrasa_hifz_v2';
const STORAGE_ATTENDANCE_KEY = 'alimran_madrasa_attendance_v2';
const STORAGE_PAYMENTS_KEY = 'alimran_madrasa_payments_v2';
const STORAGE_EXAMS_KEY = 'alimran_madrasa_exams_v2';
const STORAGE_EXAM_MARKS_KEY = 'alimran_madrasa_exam_marks_v2';
const STORAGE_NOTIFICATIONS_KEY = 'alimran_madrasa_notifs_v2';
const STORAGE_ANNOUNCEMENTS_KEY = 'alimran_madrasa_announcements_v2';
const STORAGE_CERTIFICATES_KEY = 'alimran_madrasa_certificates_v2';
const STORAGE_DONATIONS_KEY = 'alimran_madrasa_donations_v2';
const STORAGE_DONATION_CAUSES_KEY = 'alimran_madrasa_donation_causes_v2';
const STORAGE_INQUIRIES_KEY = 'alimran_madrasa_inquiries_v2';
const STORAGE_ENTRANCE_APPLICATIONS_KEY = 'alimran_madrasa_entrance_apps_v2';
const STORAGE_HOMEWORK_KEY = 'alimran_madrasa_homework_v2';
const STORAGE_RECITATIONS_KEY = 'alimran_quran_recitations_v2';
const STORAGE_THEME_KEY = 'alimran_theme_mode';
const STORAGE_LANG_KEY = 'alimran_language';
const STORAGE_CUSTOM_LOGO_KEY = 'alimran_custom_logo';
const STORAGE_BRANCH_KEY = 'alimran_current_branch';
const STORAGE_LAST_SYNC_KEY = 'alimran_last_cloud_sync';
const STORAGE_AUDIT_LOGS_KEY = 'alimran_madrasa_audit_logs_v2';

interface MadrasaContextType {
  // Supabase Cloud Integration
  isSupabaseActive: boolean;
  isSyncing: boolean;
  lastCloudSync: string | null;
  pushAllToCloud: () => Promise<{ success: boolean; count: number; errors: string[] }>;
  pullAllFromCloud: () => Promise<{ success: boolean; message: string }>;

  // Authentication & RBAC
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  allUsers: UserProfile[];
  registerFirstAdmin: (adminData: {
    name: string;
    arabicName?: string;
    email: string;
    password?: string;
    phone: string;
    madrasaBranchName: string;
  }) => Promise<UserProfile>;
  registerUserByAdmin: (userData: {
    name: string;
    arabicName?: string;
    email: string;
    password?: string;
    role: UserRole;
    phone: string;
    assignedClasses?: string[];
    assignedSubjects?: string[];
    assignedHifzHalqah?: string;
  }) => Promise<UserProfile>;
  deleteUserAccount: (userId: string) => void;
  updateUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  loginUser: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; message?: string; source?: 'supabase' | 'local' }>;
  logoutUser: () => void;
  switchRole: (role: UserRole) => void;
  isFirstTimeSetup: boolean;

  // Language & Internationalization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';

  // Theme (Day / Night)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Custom Logo & Branding
  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;
  currentMadrasaBranch: string;
  setMadrasaBranch: (branch: string) => void;

  // Core Madrasa Entities
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'admissionNumber'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  hifzSessions: HifzSession[];
  recordHifzSession: (session: Omit<HifzSession, 'id'>) => void;

  attendanceRecords: AttendanceRecord[];
  recordBatchAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  exams: ExamRecord[];
  addExam: (exam: Omit<ExamRecord, 'id'>) => void;
  examMarks: StudentExamMark[];
  recordExamMarks: (marks: Omit<StudentExamMark, 'id'>[]) => void;
  publishExamResults: (examId: string, isPublished: boolean) => void;

  payments: PaymentTransaction[];
  recordPayment: (payment: Omit<PaymentTransaction, 'id' | 'receiptNumber'>) => string;

  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;

  libraryBooks: LibraryBook[];
  addLibraryBook: (book: Omit<LibraryBook, 'id'>) => void;

  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedAt'>) => void;

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: NotificationItem['type']) => void;
  sendNotification: (notification: Partial<NotificationItem> & { title: string; message: string }) => void;

  homeworkList: HomeworkAssignment[];
  addHomework: (hw: Omit<HomeworkAssignment, 'id' | 'assignedDate' | 'submissionsCount'>) => void;
  updateHomework: (id: string, updates: Partial<HomeworkAssignment>) => void;
  deleteHomework: (id: string) => void;
  submitHomeworkResponse: (
    homeworkId: string,
    submission: {
      studentId: string;
      studentName: string;
      notes?: string;
      audioRecitationRecorded?: boolean;
      audioBlob?: Blob;
      audioBlobKey?: string;
      audioUrl?: string;
    }
  ) => Promise<void>;
  gradeHomeworkSubmission: (homeworkId: string, submissionId: string, score: number, feedback?: string, status?: 'reviewed' | 'needs_revision') => void;

  // Audio Recitation & Binary Media Storage
  recitations: RecitationSubmission[];
  addRecitation: (recitation: Omit<RecitationSubmission, 'id'> | RecitationSubmission) => Promise<string>;
  updateRecitation: (id: string, updates: Partial<RecitationSubmission>) => Promise<void>;
  deleteRecitation: (id: string) => Promise<void>;
  saveAudioRecitationBlob: (submissionId: string, blob: Blob) => Promise<{ blobKey: string; publicUrl?: string }>;
  getAudioRecitationUrl: (blobKeyOrUrl: string) => Promise<string | null>;
  storageStats: { usageMB: number; quotaMB: number; percentUsed: number; isUnlimited: boolean };
  refreshStorageStats: () => Promise<void>;

  certificates: CertificateRecord[];
  issueCertificate: (cert: Omit<CertificateRecord, 'id' | 'certificateNumber'>) => string;

  // Donations & Waqf Funds
  donations: DonationRecord[];
  donationCauses: DonationCause[];
  admissionInquiries: AdmissionInquiry[];
  addDonation: (donation: Omit<DonationRecord, 'id' | 'receiptNumber' | 'date' | 'status'>) => string;
  updateDonationCauseRaised: (causeId: string, amount: number) => void;
  submitAdmissionInquiry: (inquiry: Omit<AdmissionInquiry, 'id' | 'createdAt' | 'status'>) => string;

  // Online Entrance Applications & Placement Assessments
  entranceApplications: EntranceApplication[];
  submitEntranceApplication: (app: Omit<EntranceApplication, 'id' | 'applicationNumber' | 'createdAt' | 'status'>) => string;
  updateEntranceApplication: (id: string, updates: Partial<EntranceApplication>) => void;
  deleteEntranceApplication: (id: string) => void;
  scheduleEntranceAssessment: (
    id: string,
    ustazId: string,
    ustazName: string,
    date: string,
    time: string,
    mode: 'In-Person (Campus)' | 'Online (Video / Zoom / Telegram)' | 'Oral Board',
    roomOrLink?: string,
    adminNotes?: string
  ) => void;
  submitAssessmentResult: (id: string, result: AssessmentResult) => void;
  approveRegistrationRequest: (id: string, notes?: string, conditionalTerms?: string) => void;
  rejectRegistrationRequest: (id: string, reason: string) => void;
  waitlistRegistrationRequest: (id: string, notes?: string) => void;
  postPlacementResult: (
    id: string,
    placement: PlacementDetails,
    options?: { publishNow?: boolean; diagnosticMarks?: Partial<AssessmentResult> }
  ) => void;
  publishAssessmentResult: (id: string, isPublished: boolean) => void;
  bulkApproveRegistrationRequests: (ids: string[], notes?: string) => void;
  bulkPostPlacementResults: (ids: string[], isPublished: boolean) => void;
  bulkEnrollApplicants: (ids: string[], defaultClass?: string, defaultLevel?: string) => Promise<{ successCount: number; errors: string[] }>;
  enrollApplicantDirectly: (
    id: string,
    classAssigned: string,
    levelAssigned: string,
    hifzCircleAssigned?: string,
    assignedUstazId?: string
  ) => Promise<{ success: boolean; studentId: string; message: string }>;

  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // System Audit Trail
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: {
    category: AuditLogCategory;
    action: string;
    details: string;
    targetEntityId?: string;
    targetEntityName?: string;
    severity?: 'info' | 'success' | 'warning' | 'critical';
    actorId?: string;
    actorName?: string;
    actorEmail?: string;
    actorRole?: UserRole;
  }) => void;
  clearAuditLogs: () => void;

  // Data helpers
  loadStarterSampleData: () => void;
  clearAllDemoData: () => void;
  resetAllData: () => void;
}

const MadrasaContext = createContext<MadrasaContextType | undefined>(undefined);

export const MadrasaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'am' || saved === 'ar') return saved as Language;
    }
    return 'en';
  });

  // Custom Logo URL
  const [customLogoUrl, setCustomLogoUrlState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_CUSTOM_LOGO_KEY) || null;
    }
    return null;
  });

  // Current Branch
  const [currentMadrasaBranch, setCurrentMadrasaBranchState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_BRANCH_KEY) || 'Al-Imran CMC Main Campus (Addis Ababa)';
    }
    return 'Al-Imran CMC Main Campus (Addis Ababa)';
  });

  // Users & Auth (Fuad Nuru - Super Admin, Teachers, Parents, Finance Officers)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      const deletedRaw = localStorage.getItem(STORAGE_DELETED_USERS_KEY);
      let deletedSet = new Set<string>();
      if (deletedRaw) {
        try {
          const parsedDeleted = JSON.parse(deletedRaw);
          if (Array.isArray(parsedDeleted)) {
            deletedSet = new Set(parsedDeleted.map((s: string) => String(s).toLowerCase().trim()));
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Respect stored users list and filter out any explicitly deleted accounts
            return parsed.filter(
              (u: UserProfile) =>
                !deletedSet.has(u.id.toLowerCase().trim()) &&
                !deletedSet.has((u.email || '').toLowerCase().trim())
            );
          }
        } catch (e) {
          console.error(e);
        }
      }
      // If never saved before in this browser, initialize with initial users minus any deleted
      return INITIAL_USERS.filter(
        (u: UserProfile) =>
          !deletedSet.has(u.id.toLowerCase().trim()) &&
          !deletedSet.has((u.email || '').toLowerCase().trim())
      );
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      const signature = localStorage.getItem('alimran_session_sig');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          if (user && user.id && user.role) {
            // Verify session integrity to protect against client-side role tampering
            if (signature && !verifySessionSignature(user.id, user.role, user.email, signature)) {
              console.warn('Tampered or invalid session signature detected. Session reset for security.');
              localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
              localStorage.removeItem('alimran_session_sig');
              return null;
            }
            return user;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return null;
  });

  // Madrasa Data states initialized from persistent localStorage
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const isRealMode = localStorage.getItem('alimran_real_data_mode') === 'true';
      const saved = localStorage.getItem(STORAGE_STUDENTS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
      if (isRealMode) return [];
    }
    return INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    if (typeof window !== 'undefined') {
      const isRealMode = localStorage.getItem('alimran_real_data_mode') === 'true';
      const saved = localStorage.getItem(STORAGE_TEACHERS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
      if (isRealMode) return [];
    }
    return INITIAL_TEACHERS;
  });

  const [hifzSessions, setHifzSessions] = useState<HifzSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_HIFZ_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [exams, setExams] = useState<ExamRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_EXAMS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [examMarks, setExamMarks] = useState<StudentExamMark[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_EXAM_MARKS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_PAYMENTS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== 'undefined') {
      const isRealMode = localStorage.getItem('alimran_real_data_mode') === 'true';
      const saved = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
      if (isRealMode) return [];
    }
    return [
      {
        id: 'notif-1',
        title: 'Ramadan 1446 Hifz Intensive Schedule',
        message: 'Assalamu Alaikum. Daily morning Halqah will commence at 6:30 AM with extra Murajaah sessions after Asr.',
        timestamp: '2 hours ago',
        sentDate: '2026-03-01',
        type: 'announcement',
        read: false,
        isRead: false,
        targetAudience: 'parents',
        channel: 'sms',
        priority: 'high',
      },
      {
        id: 'notif-2',
        title: 'Mid-Term Tajweed & Memorization Exams',
        message: 'Exam schedule for Class 1-A through Class 4-B has been published. Please review student test dates in the portal.',
        timestamp: '1 day ago',
        sentDate: '2026-02-28',
        type: 'exam',
        read: true,
        isRead: true,
        targetAudience: 'parents',
        channel: 'all',
        priority: 'normal',
      },
      {
        id: 'notif-3',
        title: 'Monthly Tuition Fee Reminder (Yekatit / Megabit)',
        message: 'Kindly settle monthly tuition via Telebirr or CBE Birr. Invoices and official receipts are available online.',
        timestamp: '3 days ago',
        sentDate: '2026-02-26',
        type: 'payment',
        read: true,
        isRead: true,
        targetAudience: 'parents',
        channel: 'sms',
        priority: 'urgent',
      },
    ];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_ANNOUNCEMENTS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [certificates, setCertificates] = useState<CertificateRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CERTIFICATES_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [donationCauses, setDonationCauses] = useState<DonationCause[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_DONATION_CAUSES_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_DONATION_CAUSES;
  });

  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_DONATIONS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_DONATIONS;
  });

  const [admissionInquiries, setAdmissionInquiries] = useState<AdmissionInquiry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_INQUIRIES_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const [entranceApplications, setEntranceApplications] = useState<EntranceApplication[]>(() => {
    if (typeof window !== 'undefined') {
      const isRealMode = localStorage.getItem('alimran_real_data_mode') === 'true';
      const saved = localStorage.getItem(STORAGE_ENTRANCE_APPLICATIONS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
      if (isRealMode) return [];
    }
    return INITIAL_ENTRANCE_APPLICATIONS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>(() => {
    if (typeof window !== 'undefined') {
      const isRealMode = localStorage.getItem('alimran_real_data_mode') === 'true';
      const saved = localStorage.getItem(STORAGE_HOMEWORK_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
      if (isRealMode) return [];
    }
    return INITIAL_HOMEWORK;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [recitations, setRecitations] = useState<RecitationSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      const isRealMode = localStorage.getItem('alimran_real_data_mode') === 'true';
      const saved = localStorage.getItem(STORAGE_RECITATIONS_KEY);
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
      if (isRealMode) return [];
    }
    return INITIAL_RECITATIONS;
  });

  // Hydrate high-fidelity recitations from IndexedDB on initial load
  useEffect(() => {
    idbGet<RecitationSubmission[]>(STORAGE_RECITATIONS_KEY, []).then((stored) => {
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setRecitations((prev) => {
          const map = new Map<string, RecitationSubmission>();
          prev.forEach((r) => map.set(r.id, r));
          stored.forEach((r) => map.set(r.id, r));
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      }
    }).catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Supabase Cloud State
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => isSupabaseConfigured());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
    }
    return null;
  });

  // Storage Stats (IndexedDB High Capacity Telemetry)
  const [storageStats, setStorageStats] = useState<{
    usageMB: number;
    quotaMB: number;
    percentUsed: number;
    isUnlimited: boolean;
  }>({
    usageMB: 0,
    quotaMB: 1024,
    percentUsed: 0,
    isUnlimited: true,
  });

  const refreshStorageStats = async () => {
    const stats = await idbGetStorageEstimate();
    setStorageStats(stats);
  };

  useEffect(() => {
    refreshStorageStats();
  }, [students.length, attendanceRecords.length, hifzSessions.length, homeworkList.length]);

  // Helper to retrieve deleted account IDs & emails
  const getDeletedIdentifiers = (): Set<string> => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_DELETED_USERS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return new Set(parsed.map((s: string) => String(s).toLowerCase().trim()));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return new Set<string>();
  };

  // Helper to unmark deleted identifiers when an account is registered or re-registered
  const unmarkDeletedIdentifier = (...identifiers: (string | undefined | null)[]) => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_DELETED_USERS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const toRemove = new Set(
              identifiers
                .filter(Boolean)
                .map(id => String(id).toLowerCase().trim())
            );
            const updated = parsed.filter(item => !toRemove.has(String(item).toLowerCase().trim()));
            localStorage.setItem(STORAGE_DELETED_USERS_KEY, JSON.stringify(updated));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Check Supabase availability on mount, auto-hydrate from database, and listen to real-time events
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);

    // Listen for database operational errors
    const handleDbWarning = (e: any) => {
      const detail = e.detail;
      if (detail) {
        addNotification(
          `Database Storage Warning (${detail.table})`,
          `Supabase reported: "${detail.message}". Ensure table exists and RLS allows writes.`,
          'announcement'
        );
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('madrasa-db-sync-warning', handleDbWarning);
    }

    if (configured) {
      // Auto-pull live database records on initial application load
      pullAllFromCloud();

      // Subscribe to real-time Postgres changes across all tables
      const unsubscribe = subscribeToDatabaseChanges((tableName, eventType) => {
        console.log(`[Supabase Realtime] Event: ${eventType} on table: ${tableName}`);
        // Refresh cloud state on remote table changes
        fetchAllFromSupabase().then((res) => {
          if (res.success && res.data) {
            const deletedSet = getDeletedIdentifiers();
            if (tableName === 'students' && res.data.students) setStudents(res.data.students);
            if (tableName === 'teachers' && res.data.teachers) {
              const filteredTeachers = res.data.teachers.filter(
                t => !deletedSet.has(t.id.toLowerCase().trim()) && !deletedSet.has((t.email || '').toLowerCase().trim())
              );
              setTeachers(filteredTeachers);
            }
            if (tableName === 'hifz_sessions' && res.data.hifzSessions) setHifzSessions(res.data.hifzSessions);
            if (tableName === 'attendance_records' && res.data.attendanceRecords) setAttendanceRecords(res.data.attendanceRecords);
            if (tableName === 'payments' && res.data.payments) setPayments(res.data.payments);
            if (tableName === 'exams' && res.data.exams) setExams(res.data.exams);
            if (tableName === 'exam_marks' && res.data.examMarks) setExamMarks(res.data.examMarks);
            if (tableName === 'announcements' && res.data.announcements) setAnnouncements(res.data.announcements);
            if (tableName === 'certificates' && res.data.certificates) setCertificates(res.data.certificates);
            if (tableName === 'profiles' && res.data.profiles) {
              const filteredProfiles = res.data.profiles.filter(
                p => !deletedSet.has(p.id.toLowerCase().trim()) && !deletedSet.has((p.email || '').toLowerCase().trim())
              );
              setAllUsers(filteredProfiles);
            }
            if (tableName === 'donations' && res.data.donations) setDonations(res.data.donations);
            if (tableName === 'admission_inquiries' && res.data.inquiries) setAdmissionInquiries(res.data.inquiries);
            if (tableName === 'entrance_applications' && res.data.entranceApplications) setEntranceApplications(res.data.entranceApplications);
            if (tableName === 'inventory' && res.data.inventory) setInventory(res.data.inventory);
            if (tableName === 'library_books' && res.data.libraryBooks) setLibraryBooks(res.data.libraryBooks);
            if (tableName === 'homework_assignments' && res.data.homeworkList) setHomeworkList(res.data.homeworkList);
            if (tableName === 'recitation_submissions' && res.data.recitations && res.data.recitations.length > 0) {
              setRecitations((prev) => {
                const map = new Map<string, RecitationSubmission>();
                prev.forEach((r) => map.set(r.id, r));
                 if (res.data?.recitations) {
                            res.data.recitations.forEach((r) => map.set(r.id, r));
                   }
                const merged = Array.from(map.values()).sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                if (typeof window !== 'undefined') {
                  localStorage.setItem(STORAGE_RECITATIONS_KEY, JSON.stringify(merged));
                }
                idbSet(STORAGE_RECITATIONS_KEY, merged).catch(() => {});
                idbSet('alimran_quran_recitation_submissions', merged).catch(() => {});
                return merged;
              });
            }
          }
        });
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
        if (typeof window !== 'undefined') {
          window.removeEventListener('madrasa-db-sync-warning', handleDbWarning);
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('madrasa-db-sync-warning', handleDbWarning);
      }
    };
  }, []);

  // Push all local data to Supabase Cloud
  const pushAllToCloud = async (): Promise<{ success: boolean; count: number; errors: string[] }> => {
    setIsSyncing(true);
    try {
      let recitationsToSync: RecitationSubmission[] | undefined = undefined;
      try {
        const savedRecs = await idbGet<RecitationSubmission[]>('alimran_quran_recitation_submissions', []);
        if (savedRecs && savedRecs.length > 0) recitationsToSync = savedRecs;
      } catch {}

      const result = await syncAllToSupabase({
        users: allUsers,
        students,
        teachers,
        hifzSessions,
        attendanceRecords,
        exams,
        examMarks,
        payments,
        inventory,
        libraryBooks,
        announcements,
        certificates,
        donations,
        donationCauses,
        inquiries: admissionInquiries,
        entranceApplications,
        homeworkList,
        recitations: recitations.length > 0 ? recitations : recitationsToSync,
      });

      if (result.success || result.syncedCount > 0) {
        const now = new Date().toLocaleTimeString();
        setLastCloudSync(now);
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, now);
        setIsSupabaseActive(true);
        addNotification(
          'Cloud Sync Complete',
          `Successfully synchronized ${result.syncedCount} records with Supabase database.`,
          'announcement'
        );
      }
      setIsSyncing(false);
      return { success: result.success, count: result.syncedCount, errors: result.errors };
    } catch (e: any) {
      setIsSyncing(false);
      return { success: false, count: 0, errors: [e?.message || 'Sync error'] };
    }
  };

  // Pull all data from Supabase Cloud
  const pullAllFromCloud = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const result = await fetchAllFromSupabase();
      if (!result.success || !result.data) {
        setIsSyncing(false);
        return { success: false, message: result.error || 'Failed to fetch data from Supabase.' };
      }

      const deletedSet = getDeletedIdentifiers();

      if (result.data.students !== undefined) {
        setStudents(result.data.students);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(result.data.students));
        }
      }
      if (result.data.teachers !== undefined) {
        const validTeachers = result.data.teachers.filter(
          t => !deletedSet.has(t.id.toLowerCase().trim()) && !deletedSet.has((t.email || '').toLowerCase().trim())
        );
        setTeachers(validTeachers);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(validTeachers));
        }
      }
      if (result.data.hifzSessions !== undefined) {
        setHifzSessions(result.data.hifzSessions);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_HIFZ_KEY, JSON.stringify(result.data.hifzSessions));
        }
      }
      if (result.data.attendanceRecords !== undefined) {
        setAttendanceRecords(result.data.attendanceRecords);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(result.data.attendanceRecords));
        }
      }
      if (result.data.payments !== undefined) {
        setPayments(result.data.payments);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(result.data.payments));
        }
      }
      if (result.data.exams !== undefined) {
        setExams(result.data.exams);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_EXAMS_KEY, JSON.stringify(result.data.exams));
        }
      }
      if (result.data.examMarks !== undefined) {
        setExamMarks(result.data.examMarks);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_EXAM_MARKS_KEY, JSON.stringify(result.data.examMarks));
        }
      }
      if (result.data.announcements !== undefined) {
        setAnnouncements(result.data.announcements);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(result.data.announcements));
        }
      }
      if (result.data.certificates !== undefined) {
        setCertificates(result.data.certificates);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_CERTIFICATES_KEY, JSON.stringify(result.data.certificates));
        }
      }
      if (result.data.profiles !== undefined) {
        const validProfiles = result.data.profiles.filter(
          p => !deletedSet.has(p.id.toLowerCase().trim()) && !deletedSet.has((p.email || '').toLowerCase().trim())
        );
        if (validProfiles.length > 0) {
          setAllUsers(validProfiles);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(validProfiles));
          }
        }
      }
      if (result.data.donations !== undefined) {
        setDonations(result.data.donations);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(result.data.donations));
        }
      }
      if (result.data.donationCauses !== undefined) {
        setDonationCauses(result.data.donationCauses);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_DONATION_CAUSES_KEY, JSON.stringify(result.data.donationCauses));
        }
      }
      if (result.data.inquiries !== undefined) {
        setAdmissionInquiries(result.data.inquiries);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_INQUIRIES_KEY, JSON.stringify(result.data.inquiries));
        }
      }
      if (result.data.entranceApplications !== undefined) {
        setEntranceApplications(result.data.entranceApplications);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ENTRANCE_APPLICATIONS_KEY, JSON.stringify(result.data.entranceApplications));
        }
      }
      if (result.data.inventory !== undefined) {
        setInventory(result.data.inventory);
      }
      if (result.data.libraryBooks !== undefined) {
        setLibraryBooks(result.data.libraryBooks);
      }
      if (result.data.homeworkList !== undefined) {
        setHomeworkList(result.data.homeworkList);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(result.data.homeworkList));
        }
      }
      if (result.data.recitations !== undefined && result.data.recitations.length > 0) {
        setRecitations((prev) => {
          const map = new Map<string, RecitationSubmission>();
          prev.forEach((r) => map.set(r.id, r));
          if(result.data?.recitations)
          result.data.recitations!.forEach((r) => map.set(r.id, r));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_RECITATIONS_KEY, JSON.stringify(merged));
          }
          idbSet(STORAGE_RECITATIONS_KEY, merged).catch(() => {});
          idbSet('alimran_quran_recitation_submissions', merged).catch(() => {});
          return merged;
        });
      }

      const now = new Date().toLocaleTimeString();
      setLastCloudSync(now);
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, now);
      setIsSupabaseActive(true);
      setIsSyncing(false);

      return { success: true, message: 'All records updated from Supabase.' };
    } catch (e: any) {
      setIsSyncing(false);
      return { success: false, message: e?.message || 'Error pulling data from cloud.' };
    }
  };

  // Sync theme changes to HTML document element and body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    }
  }, [theme]);

  // Sync language changes and direction
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem(STORAGE_LANG_KEY, language);
    }
  }, [language]);

  // Asynchronous IndexedDB Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(allUsers));
    idbSet(STORAGE_USERS_KEY, allUsers);
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      const sig = generateSessionSignature(currentUser.id, currentUser.role, currentUser.email);
      localStorage.setItem('alimran_session_sig', sig);
      idbSet(STORAGE_CURRENT_USER_KEY, currentUser);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      localStorage.removeItem('alimran_session_sig');
      idbSet(STORAGE_CURRENT_USER_KEY, null);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(students));
    idbSet(STORAGE_STUDENTS_KEY, students);
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(teachers));
    idbSet(STORAGE_TEACHERS_KEY, teachers);
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HIFZ_KEY, JSON.stringify(hifzSessions));
    idbSet(STORAGE_HIFZ_KEY, hifzSessions);
  }, [hifzSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(attendanceRecords));
    idbSet(STORAGE_ATTENDANCE_KEY, attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
    idbSet(STORAGE_PAYMENTS_KEY, payments);
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_EXAMS_KEY, JSON.stringify(exams));
    idbSet(STORAGE_EXAMS_KEY, exams);
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_EXAM_MARKS_KEY, JSON.stringify(examMarks));
    idbSet(STORAGE_EXAM_MARKS_KEY, examMarks);
  }, [examMarks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    idbSet(STORAGE_NOTIFICATIONS_KEY, notifications);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    idbSet(STORAGE_ANNOUNCEMENTS_KEY, announcements);
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CERTIFICATES_KEY, JSON.stringify(certificates));
    idbSet(STORAGE_CERTIFICATES_KEY, certificates);
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(donations));
    idbSet(STORAGE_DONATIONS_KEY, donations);
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DONATION_CAUSES_KEY, JSON.stringify(donationCauses));
    idbSet(STORAGE_DONATION_CAUSES_KEY, donationCauses);
  }, [donationCauses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_INQUIRIES_KEY, JSON.stringify(admissionInquiries));
    idbSet(STORAGE_INQUIRIES_KEY, admissionInquiries);
  }, [admissionInquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ENTRANCE_APPLICATIONS_KEY, JSON.stringify(entranceApplications));
    idbSet(STORAGE_ENTRANCE_APPLICATIONS_KEY, entranceApplications);
  }, [entranceApplications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(homeworkList));
    idbSet(STORAGE_HOMEWORK_KEY, homeworkList);
  }, [homeworkList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_AUDIT_LOGS_KEY, JSON.stringify(auditLogs));
    idbSet(STORAGE_AUDIT_LOGS_KEY, auditLogs);
  }, [auditLogs]);

  // Hydrate from IndexedDB on startup
  useEffect(() => {
    const hydrateFromIDB = async () => {
      try {
        const [
          idbStudents,
          idbTeachers,
          idbHifz,
          idbAttendance,
          idbHomework,
          idbPayments,
        ] = await Promise.all([
          idbGet<Student[] | null>(STORAGE_STUDENTS_KEY, null),
          idbGet<Teacher[] | null>(STORAGE_TEACHERS_KEY, null),
          idbGet<HifzSession[] | null>(STORAGE_HIFZ_KEY, null),
          idbGet<AttendanceRecord[] | null>(STORAGE_ATTENDANCE_KEY, null),
          idbGet<HomeworkAssignment[] | null>(STORAGE_HOMEWORK_KEY, null),
          idbGet<PaymentTransaction[] | null>(STORAGE_PAYMENTS_KEY, null),
        ]);

        if (idbStudents && idbStudents.length > 0) setStudents(idbStudents);
        if (idbTeachers && idbTeachers.length > 0) setTeachers(idbTeachers);
        if (idbHifz && idbHifz.length > 0) setHifzSessions(idbHifz);
        if (idbAttendance && idbAttendance.length > 0) setAttendanceRecords(idbAttendance);
        if (idbHomework && idbHomework.length > 0) setHomeworkList(idbHomework);
        if (idbPayments && idbPayments.length > 0) setPayments(idbPayments);

        refreshStorageStats();
      } catch (err) {
        console.warn('[IndexedDB] Hydration notice:', err);
      }
    };
    hydrateFromIDB();
    // Sync Supabase configuration across browsers (Chrome, Edge, etc.)
    syncServerSupabaseConfig().then(connected => {
      if (connected) {
        pullAllFromCloud().catch(() => {});
      }
    });
  }, []);

  // Listen to Supabase Auth State changes (e.g. email verification callback, password login, session restore)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
        const authUser = session.user;
        const userEmail = (authUser.email || '').toLowerCase().trim();
        unmarkDeletedIdentifier(authUser.id, userEmail);

        // Fetch user profile from Supabase profiles table
        let profileData: any = null;
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.ilike.${userEmail},id.eq.${authUser.id}`)
            .limit(1)
            .maybeSingle();
          profileData = pData;
        } catch (e) {
          console.warn('Supabase profile fetch error:', e);
        }

        // If not in profiles, check teachers table
        let teacherData: any = null;
        if (!profileData || !profileData.role) {
          try {
            const { data: tData } = await supabase
              .from('teachers')
              .select('*')
              .ilike('email', userEmail)
              .limit(1)
              .maybeSingle();
            teacherData = tData;
          } catch (e) {}
        }

        // Determine real role from profile > teacher > metadata > fallback 'teacher'
        const metaRole = authUser.user_metadata?.role as UserRole | undefined;
        const resolvedRole: UserRole =
          (profileData?.role as UserRole) ||
          (teacherData?.role as UserRole) ||
          metaRole ||
          'teacher';

        const resolvedName =
          profileData?.full_name ||
          teacherData?.full_name ||
          authUser.user_metadata?.full_name ||
          userEmail.split('@')[0];

        const restoredUser: UserProfile = {
          id: profileData?.id || authUser.id,
          name: resolvedName,
          arabicName: profileData?.arabic_name || teacherData?.arabic_name || resolvedName,
          email: profileData?.email || userEmail,
          role: resolvedRole,
          phone: profileData?.phone || teacherData?.phone || authUser.phone || '+251 911 000000',
          madrasaBranchId: 'cmc-main',
          madrasaBranchName: profileData?.madrasa_branch_name || currentMadrasaBranch,
          assignedClasses: profileData?.assigned_classes || teacherData?.assigned_classes || [],
          assignedSubjects: profileData?.assigned_subjects || teacherData?.subjects || [],
          assignedHifzHalqah: profileData?.assigned_hifz_halqah || '',
          avatarUrl: profileData?.avatar_url || teacherData?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          status: 'active',
          createdAt: profileData?.created_at || new Date().toISOString(),
        };

        setAllUsers(prev => {
          const filtered = prev.filter(u => u.email.toLowerCase().trim() !== userEmail && u.id !== restoredUser.id);
          const updated = [...filtered, restoredUser];
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
          }
          return updated;
        });

        setCurrentUserState(restoredUser);
        // Note: Do not override activeTab to dashboard on background session restore,
        // visitors must see the public landing page first until they explicitly access their portal.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if first-time setup is required (no admin has registered yet)
  const isFirstTimeSetup = allUsers.length === 0 || !allUsers.some(u => u.role === 'super_admin');

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCustomLogoUrl = (url: string | null) => {
    setCustomLogoUrlState(url);
    if (url) {
      localStorage.setItem(STORAGE_CUSTOM_LOGO_KEY, url);
    } else {
      localStorage.removeItem(STORAGE_CUSTOM_LOGO_KEY);
    }
  };

  const setMadrasaBranch = (branch: string) => {
    setCurrentMadrasaBranchState(branch);
    localStorage.setItem(STORAGE_BRANCH_KEY, branch);
  };

  // Auth Operations
  const registerFirstAdmin = async (adminData: {
    name: string;
    arabicName?: string;
    email: string;
    password?: string;
    phone: string;
    madrasaBranchName: string;
  }): Promise<UserProfile> => {
    const rawPass = adminData.password || 'Admin@123';
    const hashedPass = await hashPassword(rawPass);
    const adminUser: UserProfile = {
      id: `usr-admin-${Date.now()}`,
      name: adminData.name,
      arabicName: adminData.arabicName || adminData.name,
      email: adminData.email.toLowerCase().trim(),
      password: hashedPass,
      role: 'super_admin',
      phone: adminData.phone,
      madrasaBranchId: 'cmc-main',
      madrasaBranchName: adminData.madrasaBranchName || 'Al-Imran CMC Main Campus (HQ)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Unmark any previous deletion mark to permit clean re-registration
    unmarkDeletedIdentifier(adminUser.id, adminUser.email, adminData.email);

    setAllUsers([adminUser]);
    setCurrentUserState(adminUser);

    addNotification(
      'System Initialized',
      `Super Administrator ${adminUser.name} registered successfully. You have full management privileges.`,
      'announcement'
    );

    // If Supabase client is connected, sync user profile
    await dbUpsertUserProfile(adminUser, rawPass);

    return adminUser;
  };

  const registerUserByAdmin = async (userData: {
    name: string;
    arabicName?: string;
    email: string;
    password?: string;
    role: UserRole;
    phone: string;
    assignedClasses?: string[];
    assignedSubjects?: string[];
    assignedHifzHalqah?: string;
  }): Promise<UserProfile> => {
    const rawPass = userData.password || 'Alimran2026!';
    const hashedPass = await hashPassword(rawPass);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: userData.name,
      arabicName: userData.arabicName || userData.name,
      email: userData.email.toLowerCase().trim(),
      password: hashedPass,
      role: userData.role,
      phone: userData.phone,
      madrasaBranchId: 'cmc-main',
      madrasaBranchName: currentMadrasaBranch,
      assignedClasses: userData.assignedClasses || [],
      assignedSubjects: userData.assignedSubjects || [],
      assignedHifzHalqah: userData.assignedHifzHalqah,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Unmark from deleted users tracking so re-registration is 100% permitted
    unmarkDeletedIdentifier(newUser.id, newUser.email, userData.email);

    setAllUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase().trim() !== newUser.email && u.id !== newUser.id);
      const updated = [...filtered, newUser];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    let createdTeacherObj: Teacher | null = null;
    // If the registered user is a teacher or hifz teacher, also add to Teachers directory & table
    if (userData.role === 'teacher' || userData.role === 'hifz_teacher') {
      createdTeacherObj = {
        id: `tch-${newUser.id.slice(-6)}`,
        fullName: newUser.name,
        arabicName: newUser.arabicName || newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        gender: 'male',
        role: userData.role,
        qualifications: ['B.A. Islamic Studies', 'Al-Azhar Certification'],
        islamicCertificates: ["Ijazah Hafs 'an Asim", "Tajweed & Qira'at"],
        experienceYears: 4,
        subjects: userData.assignedSubjects || ["Qur'an Recitation", 'Tajweed', 'Aqeedah'],
        assignedClasses: userData.assignedClasses || ['Class 1-A', 'Class 2-B'],
        monthlySalary: 12500,
        joinDate: new Date().toISOString().split('T')[0],
        photoUrl: newUser.avatarUrl || '',
        status: 'active',
      };
      setTeachers(prev => {
        const filtered = prev.filter(t => t.email?.toLowerCase().trim() !== createdTeacherObj!.email.toLowerCase().trim() && t.id !== createdTeacherObj!.id);
        const updated = [...filtered, createdTeacherObj!];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(updated));
        }
        return updated;
      });
      // Direct upsert to teachers table
      await dbUpsertTeacher(createdTeacherObj);
    } else if (userData.role === 'student') {
      // If the registered user is a student, also record in Students directory & database table
      const nameParts = newUser.name.trim().split(/\s+/);
      const fName = nameParts[0] || newUser.name;
      const lName = nameParts.slice(1).join(' ') || 'Student';
      const createdStudentObj: Student = {
        id: `std-${newUser.id.slice(-6)}`,
        admissionNumber: `AIM-2026-${String(students.length + 101).padStart(3, '0')}`,
        firstName: fName,
        lastName: lName,
        arabicName: newUser.arabicName || newUser.name,
        gender: 'male',
        dob: '2014-01-01',
        placeOfBirth: 'Addis Ababa',
        nationality: 'Ethiopian',
        region: 'Addis Ababa',
        subCity: 'Yeka Sub-City',
        woreda: 'Woreda 08',
        address: 'CMC Area, Addis Ababa',
        guardianName: `${fName}'s Guardian`,
        guardianRelationship: 'Parent',
        guardianPhone: newUser.phone || '+251 911 000000',
        guardianEmail: newUser.email,
        emergencyContact: newUser.phone || '+251 911 000000',
        bloodGroup: 'O+',
        enrollmentDate: new Date().toISOString().split('T')[0],
        currentLevel: 'Elementary Level',
        currentClass: (newUser.assignedClasses && newUser.assignedClasses[0]) || 'Class 1-A',
        hifzCircleName: newUser.assignedHifzHalqah || 'Halqah Abu Bakr',
        status: 'active',
        photoUrl: newUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        quranProgress: {
          juzCompleted: 0,
          currentSurahNumber: 1,
          currentSurahName: 'Al-Fatihah',
          currentAyah: 1,
          memorizationScoreAvg: 90,
          tajweedScoreAvg: 90,
          isReadyForIjazah: false,
        },
        academicGPA: 3.5,
        attendanceRate: 100,
        feeBalance: 0,
      };
      setStudents(prev => {
        const filtered = prev.filter(s => s.guardianEmail?.toLowerCase().trim() !== createdStudentObj.guardianEmail?.toLowerCase().trim() && s.id !== createdStudentObj.id);
        const updated = [createdStudentObj, ...filtered];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
        }
        return updated;
      });
      // Direct upsert to students table
      await dbUpsertStudent(createdStudentObj);
    }

    addNotification(
      'Staff Account Registered',
      `${newUser.name} registered as ${newUser.role.replace('_', ' ').toUpperCase()} by Admin.`,
      'admission'
    );

    addAuditLog({
      category: 'AUTH',
      action: 'Account Registered by Admin',
      details: `Created profile for ${newUser.name} (${newUser.email}) with role: ${newUser.role}`,
      targetEntityId: newUser.id,
      targetEntityName: newUser.name,
      severity: 'success',
    });

    // Sync to Supabase profiles table and Auth service
    const upsertRes = await dbUpsertUserProfile(newUser, userData.password || 'Alimran2026!');
    if (upsertRes.id && upsertRes.id !== newUser.id) {
      newUser.id = upsertRes.id;
      setAllUsers(prev => {
        const updated = prev.map(u => (u.email === newUser.email ? { ...u, id: upsertRes.id! } : u));
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    }

    return newUser;
  };

  const deleteUserAccount = async (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    
    // 1. Update state and write directly to localStorage
    const updatedUsers = allUsers.filter(u => u.id !== userId);
    setAllUsers(updatedUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
      
      // 2. Track in deleted IDs set
      try {
        const deletedRaw = localStorage.getItem(STORAGE_DELETED_USERS_KEY);
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedList.includes(userId)) {
          deletedList.push(userId);
        }
        if (userToDelete?.email && !deletedList.includes(userToDelete.email.toLowerCase().trim())) {
          deletedList.push(userToDelete.email.toLowerCase().trim());
        }
        localStorage.setItem(STORAGE_DELETED_USERS_KEY, JSON.stringify(deletedList));
      } catch (e) {
        console.error(e);
      }
    }

    // 3. If the user was a teacher or has a matching teacher profile, remove from teachers list as well
    if (userToDelete?.email || userToDelete?.role === 'teacher' || userToDelete?.role === 'hifz_teacher') {
      setTeachers(prev => {
        const updatedTeachers = prev.filter(t => 
          t.id !== userId && 
          (!userToDelete?.email || t.email?.toLowerCase().trim() !== userToDelete.email.toLowerCase().trim())
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(updatedTeachers));
        }
        return updatedTeachers;
      });
    }

    // 4. If current logged in user was deleted, reset current user session
    if (currentUser?.id === userId || (userToDelete?.email && currentUser?.email?.toLowerCase().trim() === userToDelete.email.toLowerCase().trim())) {
      setCurrentUserState(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
        localStorage.removeItem('alimran_session_sig');
      }
    }

    // 5. Supabase Cloud complete database erasure
    await dbDeleteUserProfile(userId, userToDelete?.email);

    addNotification('User Account Removed', `${userToDelete?.name || 'Staff account'} has been permanently removed.`, 'admission');
  };

  const updateUserPassword = async (
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const hashed = await hashPassword(newPassword);

    // Update in local state
    setAllUsers(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, password: hashed } : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (currentUser?.id === userId) {
      setCurrentUserState(prev => (prev ? { ...prev, password: hashed } : null));
    }

    // Sync to Supabase
    const targetUser = allUsers.find(u => u.id === userId) || currentUser;
    if (targetUser && targetUser.email) {
      await dbUpdateUserPassword(userId, targetUser.email, newPassword);
    }

    addNotification('Password Updated', 'Your security password has been synchronized with the cloud database.', 'announcement');
    return { success: true, message: 'Password updated successfully across all browsers and devices.' };
  };

  const loginUser = async (
    emailOrPhone: string,
    password?: string
  ): Promise<{ success: boolean; message?: string; source?: 'supabase' | 'local' }> => {
    if (!emailOrPhone || !emailOrPhone.trim()) {
      return { success: false, message: 'Please enter your email, phone number, or username.' };
    }

    const cleanInput = emailOrPhone.trim();
    const cleanLower = cleanInput.toLowerCase();
    const cleanDigits = cleanInput.replace(/[^0-9+]/g, '');
    
    // Ensure Supabase client is initialized (including checking server config for Chrome/cross-browser)
    const supabase = await ensureSupabaseClient();

    // 1. Check Supabase Database & Auth FIRST if cloud database is configured
    if (supabase) {
      try {
        // A. If identifier is an email, try direct Supabase Auth signIn
        if (cleanLower.includes('@') && password) {
          try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email: cleanLower,
              password: password,
            });

            if (!authError && authData?.user) {
              const authUser = authData.user;
              unmarkDeletedIdentifier(authUser.id, cleanLower, authUser.email);

              // Check profiles table for full details
              const { data: pData } = await supabase
                .from('profiles')
                .select('*')
                .or(`email.ilike.${cleanLower},id.eq.${authUser.id}`)
                .limit(1)
                .maybeSingle();

              const verifiedUser: UserProfile = {
                id: pData?.id || authUser.id,
                name: pData?.full_name || authUser.user_metadata?.full_name || cleanLower.split('@')[0],
                arabicName: pData?.arabic_name || authUser.user_metadata?.arabic_name,
                email: pData?.email || authUser.email || cleanLower,
                role: (pData?.role as UserRole) || (authUser.user_metadata?.role as UserRole) || 'teacher',
                phone: pData?.phone || authUser.user_metadata?.phone || authUser.phone || '+251 911 000000',
                madrasaBranchId: 'cmc-main',
                madrasaBranchName: pData?.madrasa_branch_name || currentMadrasaBranch,
                assignedClasses: pData?.assigned_classes || authUser.user_metadata?.assigned_classes || [],
                assignedSubjects: pData?.assigned_subjects || authUser.user_metadata?.assigned_subjects || [],
                avatarUrl: pData?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                status: 'active',
                password: await hashPassword(password),
                createdAt: pData?.created_at || new Date().toISOString(),
              };

              setAllUsers(prev => {
                const filtered = prev.filter(u => u.email.toLowerCase().trim() !== cleanLower && u.id !== verifiedUser.id);
                const updated = [...filtered, verifiedUser];
                if (typeof window !== 'undefined') {
                  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
                }
                return updated;
              });

              setCurrentUserState(verifiedUser);
              setActiveTab('dashboard');
              pullAllFromCloud().catch(() => {});

              return {
                success: true,
                message: `Signed in successfully as ${verifiedUser.role.replace('_', ' ').toUpperCase()}.`,
                source: 'supabase',
              };
            }
          } catch (authE) {
            console.warn('Direct Supabase Auth notice:', authE);
          }
        }

        // B. Query database tables across profiles, teachers, and students
        const dbResult = await fetchUserProfileByLoginIdentifier(cleanInput);

        if (dbResult.found && dbResult.profile) {
          const dbProfile = dbResult.profile;
          unmarkDeletedIdentifier(dbProfile.id, dbProfile.email);

          let passwordVerified = false;

          if (password) {
            // Check against stored password hash or stored plain password from database
            if (dbResult.storedPasswordHash) {
              passwordVerified = await verifyPassword(
                password,
                dbResult.storedPasswordHash,
                dbProfile.email
              );
            }

            // Also attempt Supabase Auth signIn if direct hash wasn't matched
            if (!passwordVerified && dbProfile.email && dbProfile.email.includes('@')) {
              try {
                const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
                  email: dbProfile.email.toLowerCase().trim(),
                  password: password,
                });
                if (!authErr && authData?.user) {
                  passwordVerified = true;
                }
              } catch {
                // ignore
              }
            }

            // Fallback default system credentials for initial setup
            if (!passwordVerified && !dbResult.storedPasswordHash) {
              passwordVerified = await verifyPassword(password);
            }
          } else {
            // No password provided
            if (!dbResult.storedPasswordHash) {
              passwordVerified = true;
            }
          }

          if (passwordVerified) {
            // Successfully verified! Save profile into local state & storage for this browser
            const verifiedUser: UserProfile = {
              ...dbProfile,
              password: password ? await hashPassword(password) : dbProfile.password,
              status: 'active',
            };

            setAllUsers(prev => {
              const filtered = prev.filter(
                u => u.email.toLowerCase().trim() !== verifiedUser.email.toLowerCase().trim() && u.id !== verifiedUser.id
              );
              const updated = [...filtered, verifiedUser];
              if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
              }
              return updated;
            });

            setCurrentUserState(verifiedUser);
            setActiveTab('dashboard');

            // Trigger background pull to fetch all campus data on this browser
            pullAllFromCloud().catch(() => {});

            return {
              success: true,
              message: `Signed in successfully as ${verifiedUser.role.replace('_', ' ').toUpperCase()}.`,
              source: 'supabase',
            };
          } else if (password) {
            return {
              success: false,
              message: 'Incorrect password. Please verify your credentials or contact the administrator.',
            };
          }
        }
      } catch (err) {
        console.warn('Database login check error:', err);
      }
    }

    // 2. Check local users fallback
    const found = allUsers.find(
      u =>
        u.email?.toLowerCase().trim() === cleanLower ||
        (u.phone && cleanDigits.length >= 7 && u.phone.replace(/[^0-9+]/g, '').includes(cleanDigits)) ||
        u.name.toLowerCase().trim() === cleanLower ||
        (u.name && u.name.toLowerCase().trim() === cleanLower)
    );

    if (found) {
      unmarkDeletedIdentifier(found.id, found.email);

      if (password && found.password) {
        const isValid = await verifyPassword(password, found.password, found.email);
        if (isValid) {
          setCurrentUserState(found);
          setActiveTab('dashboard');
          return { success: true, message: `Signed in as ${found.role.replace('_', ' ').toUpperCase()}.`, source: 'local' };
        }
      } else if (!password || !found.password) {
        setCurrentUserState(found);
        setActiveTab('dashboard');
        return { success: true, message: `Signed in as ${found.role.replace('_', ' ').toUpperCase()}.`, source: 'local' };
      }

      if (!supabase) {
        return {
          success: false,
          message: 'Incorrect password for local demo account. Note: Supabase Cloud Database is not connected on this browser. Click "Connect Supabase" in DB Setup to sign in with cloud credentials.',
        };
      }
      return { success: false, message: 'Incorrect password. Please verify your credentials or contact the administrator.' };
    }

    if (!supabase) {
      return {
        success: false,
        message: 'Account not found locally. To sign in with your Supabase cloud credentials on Chrome, please click "Connect Database" to link your Supabase project.',
      };
    }

    return { success: false, message: 'No active account found with this email, phone, or username in the database.' };
  };

  const logoutUser = () => {
    setCurrentUserState(null);
    setActiveTab('landing');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      localStorage.removeItem('alimran_session_sig');
    }
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const switchRole = (role: UserRole) => {
    const matching = allUsers.find(u => u.role === role);
    if (matching) {
      setCurrentUserState(matching);
    } else {
      // Create a temporary role session for testing
      const tempUser: UserProfile = {
        id: `usr-${role}`,
        name: `Al-Imran ${role.replace('_', ' ').toUpperCase()}`,
        email: `${role}@alimran-madrasa.et`,
        role: role,
        phone: '+251 911 000 000',
        madrasaBranchId: 'cmc-main',
        madrasaBranchName: currentMadrasaBranch,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'active',
      };
      setCurrentUserState(tempUser);
    }
  };

  // Student Operations (Admin Only)
  const addStudent = async (studentData: Omit<Student, 'id' | 'admissionNumber'>) => {
    // Strict Admin Authorization Check
    const allowedRoles: UserRole[] = ['super_admin', 'principal', 'vice_principal', 'registrar'];
    if (currentUser && !allowedRoles.includes(currentUser.role)) {
      alert('Access Denied: Only Madrasa Administrators (Super Admin / Principal / Registrar) are authorized to register students.');
      return;
    }

    const newId = `std-${Date.now().toString().slice(-4)}`;
    const newAdmission = `AIM-2026-${String(students.length + 101).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      admissionNumber: newAdmission,
    };
    
    setStudents(prev => {
      const updated = [newStudent, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    // Dual table sync: 1. Students Table
    await dbUpsertStudent(newStudent);

    addAuditLog({
      category: 'STUDENT',
      action: 'Student Admitted',
      details: `Enrolled ${newStudent.firstName} ${newStudent.lastName} (#${newAdmission}) into class ${newStudent.currentClass}`,
      targetEntityId: newStudent.id,
      targetEntityName: `${newStudent.firstName} ${newStudent.lastName}`,
      severity: 'success',
    });

    // Dual table sync: 2. Profiles Table & Auth (if guardian or student email is provided)
    if (newStudent.guardianEmail) {
      const studentProfileUser: UserProfile = {
        id: `usr-${newStudent.id}`,
        name: `${newStudent.firstName} ${newStudent.lastName}`,
        arabicName: newStudent.arabicName || `${newStudent.firstName} ${newStudent.lastName}`,
        email: newStudent.guardianEmail.toLowerCase().trim(),
        password: 'Alimran2026!',
        role: 'parent',
        phone: newStudent.guardianPhone || '+251 911 000000',
        madrasaBranchId: 'cmc-main',
        madrasaBranchName: currentMadrasaBranch,
        assignedClasses: [newStudent.currentClass],
        avatarUrl: newStudent.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setAllUsers(prev => {
        const filtered = prev.filter(u => u.email.toLowerCase().trim() !== studentProfileUser.email && u.id !== studentProfileUser.id);
        const updated = [...filtered, studentProfileUser];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
        }
        return updated;
      });

      await dbUpsertUserProfile(studentProfileUser, 'Alimran2026!');
    }

    addNotification('New Student Admitted', `${newStudent.firstName} ${newStudent.lastName} registered (#${newAdmission})`, 'admission');
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    const student = students.find(s => s.id === id);
    if (student) {
      const merged = { ...student, ...updates };
      await dbUpsertStudent(merged);
    }
  };

  const deleteStudent = async (id: string) => {
    // Only Super Admin and Principal can delete students
    if (currentUser && currentUser.role !== 'super_admin' && currentUser.role !== 'principal') {
      alert('Access Denied: Only the Super Admin and Principal are permitted to delete student records.');
      return;
    }
    const studentToDelete = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    await dbDeleteStudent(id, studentToDelete?.guardianEmail);

    addAuditLog({
      category: 'STUDENT',
      action: 'Student Record Deleted',
      details: `Removed student record #${id} (${studentToDelete?.firstName} ${studentToDelete?.lastName}) from database`,
      targetEntityId: id,
      targetEntityName: studentToDelete ? `${studentToDelete.firstName} ${studentToDelete.lastName}` : id,
      severity: 'warning',
    });
  };

  // Teacher Operations
  const addTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch-${Date.now().toString().slice(-4)}`,
    };

    // Unmark any previous deletion tracking to permit re-registration
    unmarkDeletedIdentifier(newTeacher.id, newTeacher.email, teacherData.email);

    setTeachers(prev => {
      const filtered = prev.filter(t => t.id !== newTeacher.id && (!newTeacher.email || t.email?.toLowerCase().trim() !== newTeacher.email.toLowerCase().trim()));
      const updated = [...filtered, newTeacher];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    addAuditLog({
      category: 'TEACHER',
      action: 'Faculty Member Added',
      details: `Added ${newTeacher.fullName} as ${newTeacher.role.replace('_', ' ').toUpperCase()} to faculty`,
      targetEntityId: newTeacher.id,
      targetEntityName: newTeacher.fullName,
      severity: 'success',
    });

    // Also automatically register a profile account for the teacher if email is present
    if (newTeacher.email) {
      const correspondingUser: UserProfile = {
        id: `usr-${newTeacher.id}`,
        name: newTeacher.fullName,
        arabicName: newTeacher.arabicName || newTeacher.fullName,
        email: newTeacher.email.toLowerCase().trim(),
        password: 'Alimran2026!',
        role: newTeacher.role,
        phone: newTeacher.phone,
        madrasaBranchId: 'cmc-main',
        madrasaBranchName: currentMadrasaBranch,
        assignedClasses: newTeacher.assignedClasses,
        assignedSubjects: newTeacher.subjects,
        avatarUrl: newTeacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setAllUsers(prev => {
        const filtered = prev.filter(u => u.email.toLowerCase().trim() !== correspondingUser.email && u.id !== correspondingUser.id);
        const updated = [...filtered, correspondingUser];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    }

    addNotification('Staff Member Added', `Ustaz ${newTeacher.fullName} added to faculty records.`, 'admission');

    // Dual-Table Sync to Supabase: Teachers Table + Profiles Table
    await dbUpsertTeacher(newTeacher);

    if (newTeacher.email) {
      const correspondingUser: UserProfile = {
        id: `usr-${newTeacher.id}`,
        name: newTeacher.fullName,
        arabicName: newTeacher.arabicName || newTeacher.fullName,
        email: newTeacher.email.toLowerCase().trim(),
        password: 'Alimran2026!',
        role: newTeacher.role,
        phone: newTeacher.phone,
        madrasaBranchId: 'cmc-main',
        madrasaBranchName: currentMadrasaBranch,
        assignedClasses: newTeacher.assignedClasses,
        assignedSubjects: newTeacher.subjects,
        avatarUrl: newTeacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await dbUpsertUserProfile(correspondingUser, 'Alimran2026!');
    }
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    unmarkDeletedIdentifier(id, updates.email);
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
      const merged = { ...teacher, ...updates };
      await dbUpsertTeacher(merged);
    }
  };

  const deleteTeacher = async (id: string) => {
    const teacherToDelete = teachers.find(t => t.id === id);
    const updatedTeachers = teachers.filter(t => t.id !== id);
    setTeachers(updatedTeachers);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify(updatedTeachers));
      
      // Track in permanent deleted set
      try {
        const deletedRaw = localStorage.getItem(STORAGE_DELETED_USERS_KEY);
        const deletedList: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
        if (!deletedList.includes(id)) deletedList.push(id);
        if (teacherToDelete?.email && !deletedList.includes(teacherToDelete.email.toLowerCase().trim())) {
          deletedList.push(teacherToDelete.email.toLowerCase().trim());
        }
        localStorage.setItem(STORAGE_DELETED_USERS_KEY, JSON.stringify(deletedList));
      } catch (e) {
        console.error(e);
      }
    }

    if (teacherToDelete?.email) {
      setAllUsers(prev => {
        const updated = prev.filter(u => u.email?.toLowerCase().trim() !== teacherToDelete.email?.toLowerCase().trim() && u.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    }

    await dbDeleteTeacher(id);
    if (teacherToDelete?.email) {
      await dbDeleteUserProfile(id, teacherToDelete.email);
    }
  };

  // Hifz Operations
  const recordHifzSession = (sessionData: Omit<HifzSession, 'id'>) => {
    const newSession: HifzSession = {
      ...sessionData,
      id: `hifz-${Date.now()}`,
    };
    setHifzSessions(prev => [newSession, ...prev]);

    // Automatically update student's Quran progress
    setStudents(prev =>
      prev.map(s => {
        if (s.id === sessionData.studentId) {
          const newJuz = Math.max(s.quranProgress.juzCompleted, sessionData.juz);
          const updatedStudent = {
            ...s,
            quranProgress: {
              ...s.quranProgress,
              juzCompleted: sessionData.sessionType === 'sabaq' && sessionData.juz > s.quranProgress.juzCompleted ? sessionData.juz : s.quranProgress.juzCompleted,
              currentSurahNumber: sessionData.surahNumber,
              currentSurahName: sessionData.surahName,
              currentAyah: sessionData.ayahEnd,
              memorizationScoreAvg: Math.round((s.quranProgress.memorizationScoreAvg * 4 + sessionData.fluencyScore) / 5),
              tajweedScoreAvg: Math.round((s.quranProgress.tajweedScoreAvg * 4 + sessionData.tajweedScore) / 5),
              isReadyForIjazah: newJuz >= 30,
            },
          };
          dbUpsertStudent(updatedStudent).catch(() => {});
          return updatedStudent;
        }
        return s;
      })
    );

    dbUpsertHifzSession(newSession).catch(() => {});

    addNotification(
      'Hifz Session Logged',
      `${sessionData.studentName}: ${sessionData.surahName} (${sessionData.ayahStart}-${sessionData.ayahEnd}) - ${sessionData.memorizationQuality}`,
      'memorization'
    );
  };

  // Attendance
  const recordBatchAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    const timestamp = Date.now();
    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `att-${timestamp}-${idx}`,
    }));
    setAttendanceRecords(prev => [...newRecords, ...prev]);
    dbUpsertAttendanceRecords(newRecords).catch(() => {});
    addNotification('Attendance Submitted', `Attendance recorded for ${records.length} students in ${records[0]?.className || 'Class'}`, 'attendance');
  };

  // Exams
  const addExam = (examData: Omit<ExamRecord, 'id'>) => {
    const newExam: ExamRecord = {
      ...examData,
      id: `ex-${Date.now().toString().slice(-4)}`,
    };
    setExams(prev => [newExam, ...prev]);
    dbUpsertExam(newExam).catch(() => {});
  };

  const recordExamMarks = (marks: Omit<StudentExamMark, 'id'>[]) => {
    const timestamp = Date.now();
    const newMarks: StudentExamMark[] = marks.map((m, idx) => ({
      ...m,
      id: `mrk-${timestamp}-${idx}`,
    }));
    setExamMarks(prev => [...newMarks, ...prev]);
    dbUpsertExamMarks(newMarks).catch(() => {});
  };

  const publishExamResults = (examId: string, isPublished: boolean) => {
    const pubTime = new Date().toISOString();
    const pubUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Exam Board';
    setExams(prev =>
      prev.map(ex => {
        if (ex.id === examId) {
          const updated = { ...ex, isPublished, publishedAt: pubTime, publishedBy: pubUser };
          dbUpsertExam(updated).catch(() => {});
          return updated;
        }
        return ex;
      })
    );
    const targetExam = exams.find(e => e.id === examId);
    if (isPublished) {
      addNotification(
        'Exam Results Officially Published',
        `Official grades and report card scores for "${targetExam?.title || 'Exam'}" have been posted to student and parent portals.`,
        'announcement'
      );
    } else {
      addNotification(
        'Exam Results Unpublished',
        `Exam results for "${targetExam?.title || 'Exam'}" reverted to draft status.`,
        'announcement'
      );
    }
  };

  // Finance & Payments
  const recordPayment = (paymentData: Omit<PaymentTransaction, 'id' | 'receiptNumber'>) => {
    const receiptNum = `REC-2026-${String(payments.length + 896).padStart(4, '0')}`;
    const newPayment: PaymentTransaction = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
    };
    setPayments(prev => [newPayment, ...prev]);
    dbUpsertPayment(newPayment).catch(() => {});

    // Update student's fee balance
    setStudents(prev =>
      prev.map(s => {
        if (s.id === paymentData.studentId) {
          const newBalance = Math.max(0, s.feeBalance - paymentData.amount);
          const updated = { ...s, feeBalance: newBalance };
          dbUpsertStudent(updated).catch(() => {});
          return updated;
        }
        return s;
      })
    );

    addNotification(
      'Payment Received',
      `ETB ${paymentData.amount.toLocaleString()} received via ${paymentData.paymentMethod} from ${paymentData.studentName} (Receipt #${receiptNum})`,
      'payment'
    );

    addAuditLog({
      category: 'FINANCE',
      action: 'Tuition Fee Payment Recorded',
      details: `Received ETB ${paymentData.amount.toLocaleString()} via ${paymentData.paymentMethod} from ${paymentData.studentName} (Receipt #${receiptNum})`,
      targetEntityId: paymentData.studentId,
      targetEntityName: paymentData.studentName,
      severity: 'success',
    });

    return receiptNum;
  };

  // Inventory & Library
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now().toString().slice(-4)}`,
    };
    setInventory(prev => [newItem, ...prev]);
    dbUpsertInventoryItem(newItem).catch(() => {});
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          dbUpsertInventoryItem(updated).catch(() => {});
          return updated;
        }
        return item;
      })
    );
  };

  const addLibraryBook = (bookData: Omit<LibraryBook, 'id'>) => {
    const newBook: LibraryBook = {
      ...bookData,
      id: `bk-${Date.now().toString().slice(-4)}`,
    };
    setLibraryBooks(prev => [newBook, ...prev]);
    dbUpsertLibraryBook(newBook).catch(() => {});
  };

  // Announcements & Notifications
  const addAnnouncement = (ancData: Omit<Announcement, 'id' | 'publishedAt'>) => {
    const newAnc: Announcement = {
      ...ancData,
      id: `anc-${Date.now().toString().slice(-4)}`,
      publishedAt: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnc, ...prev]);
    dbUpsertAnnouncement(newAnc).catch(() => {});
    addNotification('New Announcement', newAnc.title, 'announcement');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      sentDate: new Date().toISOString().split('T')[0],
      type,
      read: false,
      isRead: false,
      targetAudience: 'parents',
      channel: 'app',
      priority: 'normal',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const sendNotification = (notifData: Partial<NotificationItem> & { title: string; message: string }) => {
    const newNotif: NotificationItem = {
      id: notifData.id || `notif-${Date.now()}`,
      title: notifData.title,
      message: notifData.message,
      timestamp: 'Just now',
      sentDate: notifData.sentDate || new Date().toISOString().split('T')[0],
      type: notifData.type || 'announcement',
      read: notifData.read ?? notifData.isRead ?? false,
      isRead: notifData.isRead ?? notifData.read ?? false,
      targetAudience: notifData.targetAudience || 'parents',
      channel: notifData.channel || 'sms',
      priority: notifData.priority || 'normal',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Homework & Assignments
  const addHomework = (hwData: Omit<HomeworkAssignment, 'id' | 'assignedDate' | 'submissionsCount'>) => {
    const newHw: HomeworkAssignment = {
      ...hwData,
      id: `hw-${Date.now().toString().slice(-4)}`,
      assignedDate: new Date().toISOString().split('T')[0],
      submissionsCount: 0,
      submissions: [],
    };
    setHomeworkList(prev => [newHw, ...prev]);
    dbUpsertHomework(newHw).catch(() => {});
    addNotification(
      'New Homework Assigned',
      `"${newHw.title}" has been assigned to ${newHw.className} (Due: ${newHw.dueDate}).`,
      'announcement'
    );
  };

  const updateHomework = (id: string, updates: Partial<HomeworkAssignment>) => {
    setHomeworkList(prev =>
      prev.map(hw => {
        if (hw.id === id) {
          const updated = { ...hw, ...updates };
          dbUpsertHomework(updated).catch(() => {});
          return updated;
        }
        return hw;
      })
    );
  };

  const deleteHomework = async (id: string) => {
    setHomeworkList(prev => prev.filter(hw => hw.id !== id));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('homework_assignments').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete homework note:', err);
      }
    }
  };

  const saveAudioRecitationBlob = async (
    submissionId: string,
    blob: Blob
  ): Promise<{ blobKey: string; publicUrl?: string }> => {
    const blobKey = `recitation_${submissionId}_${Date.now()}`;
    await idbSaveMediaBlob(blobKey, blob, 'audio/webm', { submissionId });
    return { blobKey };
  };

  const getAudioRecitationUrl = async (blobKeyOrUrl: string): Promise<string | null> => {
    if (!blobKeyOrUrl) return null;
    if (blobKeyOrUrl.startsWith('http://') || blobKeyOrUrl.startsWith('https://') || blobKeyOrUrl.startsWith('blob:')) {
      return blobKeyOrUrl;
    }
    return await idbGetMediaUrl(blobKeyOrUrl);
  };

  const addRecitation = async (recData: Omit<RecitationSubmission, 'id'> | RecitationSubmission): Promise<string> => {
    const existingId = (recData as any).id;
    const recId = (existingId && typeof existingId === 'string' && existingId.trim().length > 0)
      ? existingId
      : `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRec: RecitationSubmission = { ...recData, id: recId };
    setRecitations((prev) => {
      const filtered = prev.filter((r) => r.id !== recId);
      const updated = [newRec, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_RECITATIONS_KEY, JSON.stringify(updated));
          localStorage.setItem('alimran_quran_recitations_v2', JSON.stringify(updated));
        } catch (e) {
          console.warn('[MadrasaContext] localStorage save error:', e);
        }
      }
      idbSet(STORAGE_RECITATIONS_KEY, updated).catch(() => {});
      idbSet('alimran_quran_recitation_submissions', updated).catch(() => {});
      return updated;
    });
    if (isSupabaseConfigured()) {
      dbUpsertRecitation(newRec).catch((e) => console.warn('[MadrasaContext] dbUpsertRecitation error:', e));
    }
    return recId;
  };

  const updateRecitation = async (id: string, updates: Partial<RecitationSubmission>): Promise<void> => {
    setRecitations((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_RECITATIONS_KEY, JSON.stringify(updated));
      }
      idbSet(STORAGE_RECITATIONS_KEY, updated).catch(() => {});
      idbSet('alimran_quran_recitation_submissions', updated).catch(() => {});
      const target = updated.find((r) => r.id === id);
      if (target && isSupabaseConfigured()) {
        dbUpsertRecitation(target).catch((e) => console.warn('[MadrasaContext] dbUpsertRecitation error:', e));
      }
      return updated;
    });
  };

  const deleteRecitation = async (id: string): Promise<void> => {
    setRecitations((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_RECITATIONS_KEY, JSON.stringify(filtered));
      }
      idbSet(STORAGE_RECITATIONS_KEY, filtered).catch(() => {});
      idbSet('alimran_quran_recitation_submissions', filtered).catch(() => {});
      return filtered;
    });
    if (isSupabaseConfigured()) {
      dbDeleteRecitation(id).catch((e) => console.warn('[MadrasaContext] dbDeleteRecitation error:', e));
    }
  };

  const submitHomeworkResponse = async (
    homeworkId: string,
    submission: {
      studentId: string;
      studentName: string;
      notes?: string;
      audioRecitationRecorded?: boolean;
      audioBlob?: Blob;
      audioBlobKey?: string;
      audioUrl?: string;
    }
  ) => {
    let finalBlobKey = submission.audioBlobKey;
    let finalAudioUrl = submission.audioUrl;
    const subId = `sub-${Date.now().toString().slice(-4)}`;

    // 1. If audio blob is attached, save to local IndexedDB
    if (submission.audioBlob) {
      const savedBlob = await saveAudioRecitationBlob(subId, submission.audioBlob);
      finalBlobKey = savedBlob.blobKey;

      // 2. If Supabase cloud is configured, upload to Supabase storage bucket
      if (isSupabaseActive) {
        try {
          const uploadRes = await uploadAudioRecitation(submission.studentId, homeworkId, submission.audioBlob);
          if (uploadRes.success && uploadRes.publicUrl) {
            finalAudioUrl = uploadRes.publicUrl;
          }
        } catch (uploadErr) {
          console.warn('[Storage] Supabase audio upload fallback to IndexedDB:', uploadErr);
        }
      }
    }

    setHomeworkList(prev =>
      prev.map(hw => {
        if (hw.id !== homeworkId) return hw;
        const existingSubmissions = hw.submissions || [];
        const filtered = existingSubmissions.filter(s => s.studentId !== submission.studentId);
        const newSub: HomeworkSubmission = {
          id: subId,
          homeworkId,
          studentId: submission.studentId,
          studentName: submission.studentName,
          submittedAt: new Date().toLocaleString(),
          notes: submission.notes || '',
          status: 'submitted',
          maxScore: hw.totalPoints || 20,
          audioRecitationRecorded: submission.audioRecitationRecorded || Boolean(finalBlobKey || finalAudioUrl),
          audioBlobKey: finalBlobKey,
          audioUrl: finalAudioUrl,
        };
        const updatedSubs = [newSub, ...filtered];
        const updatedHw = {
          ...hw,
          submissions: updatedSubs,
          submissionsCount: updatedSubs.length,
        };
        dbUpsertHomework(updatedHw).catch(() => {});
        return updatedHw;
      })
    );
    refreshStorageStats().catch(() => {});
    addNotification('Homework Submitted', `${submission.studentName} turned in their task.`, 'announcement');
  };

  const gradeHomeworkSubmission = (
    homeworkId: string,
    submissionId: string,
    score: number,
    feedback?: string,
    status: 'reviewed' | 'needs_revision' = 'reviewed'
  ) => {
    setHomeworkList(prev =>
      prev.map(hw => {
        if (hw.id !== homeworkId) return hw;
        const subs = (hw.submissions || []).map(s => {
          if (s.id === submissionId) {
            return {
              ...s,
              score,
              feedback,
              status,
            };
          }
          return s;
        });
        const updatedHw = { ...hw, submissions: subs };
        dbUpsertHomework(updatedHw).catch(() => {});
        return updatedHw;
      })
    );
  };

  // Certificates
  const issueCertificate = (certData: Omit<CertificateRecord, 'id' | 'certificateNumber'>) => {
    const certNum = `AIM-${certData.type.startsWith('Hifz') ? 'SANAD' : 'CERT'}-2026-${String(certificates.length + 105).padStart(3, '0')}`;
    const newCert: CertificateRecord = {
      ...certData,
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
    };
    setCertificates(prev => [newCert, ...prev]);
    dbUpsertCertificate(newCert).catch(() => {});
    return certNum;
  };

  // Donations & Waqf Funds
  const addDonation = (donationData: Omit<DonationRecord, 'id' | 'receiptNumber' | 'date' | 'status'>) => {
    const receiptNum = `AIM-WAQF-2026-${String(donations.length + 105).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const newDonation: DonationRecord = {
      ...donationData,
      id: `don-${Date.now()}`,
      receiptNumber: receiptNum,
      date: today,
      status: 'completed',
      hijriDate: '29 Safar 1448 AH',
    };

    setDonations(prev => [newDonation, ...prev]);
    dbUpsertDonation(newDonation).catch(() => {});

    // Update cause raised amount & donor count
    if (donationData.cause) {
      setDonationCauses(prev =>
        prev.map(c => {
          if (c.id === donationData.cause) {
            return {
              ...c,
              raisedAmountETB: c.raisedAmountETB + donationData.amount,
              donorsCount: c.donorsCount + 1,
            };
          }
          return c;
        })
      );
    }

    addNotification(
      'New Waqf Donation Received',
      `JazakAllah Khair to ${donationData.isAnonymous ? 'an Anonymous donor' : donationData.donorName} for donating ${donationData.amount.toLocaleString()} ${donationData.currency} to ${donationData.causeTitle}.`,
      'payment'
    );

    return receiptNum;
  };

  const updateDonationCauseRaised = (causeId: string, amount: number) => {
    setDonationCauses(prev =>
      prev.map(c => (c.id === causeId ? { ...c, raisedAmountETB: c.raisedAmountETB + amount, donorsCount: c.donorsCount + 1 } : c))
    );
  };

  const submitAdmissionInquiry = (inquiryData: Omit<AdmissionInquiry, 'id' | 'createdAt' | 'status'>) => {
    const inquiryId = `inq-${Date.now()}`;
    const newInquiry: AdmissionInquiry = {
      ...inquiryData,
      id: inquiryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setAdmissionInquiries(prev => [newInquiry, ...prev]);
    dbUpsertAdmissionInquiry(newInquiry).catch(() => {});
    addNotification(
      'New Admission Inquiry',
      `Inquiry received from ${inquiryData.guardianName} for applicant ${inquiryData.studentName} (${inquiryData.programInterested}).`,
      'announcement'
    );
    return inquiryId;
  };

  // Online Entrance Applications & Placement Assessments
  const submitEntranceApplication = (appData: Omit<EntranceApplication, 'id' | 'applicationNumber' | 'createdAt' | 'status'>) => {
    const newId = `app-${Date.now().toString().slice(-5)}`;
    const appNum = `APP-2026-${String(entranceApplications.length + 101).padStart(3, '0')}`;
    const newApp: EntranceApplication = {
      ...appData,
      id: newId,
      applicationNumber: appNum,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setEntranceApplications(prev => [newApp, ...prev]);
    dbUpsertEntranceApplication(newApp).catch(() => {});
    addNotification(
      'New Entrance Application Received',
      `Application #${appNum} submitted for prospective student ${newApp.fullName} (${newApp.targetProgram}). Status: Pending Admin Review.`,
      'admission'
    );
    return appNum;
  };

  const updateEntranceApplication = (id: string, updates: Partial<EntranceApplication>) => {
    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updated = { ...app, ...updates };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );
  };

  const deleteEntranceApplication = (id: string) => {
    setEntranceApplications(prev => prev.filter(app => app.id !== id));
    dbDeleteEntranceApplication(id).catch(() => {});
  };

  const scheduleEntranceAssessment = (
    id: string,
    ustazId: string,
    ustazName: string,
    date: string,
    time: string,
    mode: 'In-Person (Campus)' | 'Online (Video / Zoom / Telegram)' | 'Oral Board',
    roomOrLink?: string,
    adminNotes?: string
  ) => {
    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updated = {
            ...app,
            assignedUstazId: ustazId,
            assignedUstazName: ustazName,
            assessmentDate: date,
            assessmentTime: time,
            assessmentMode: mode,
            assessmentRoomOrLink: roomOrLink,
            adminNotes: adminNotes,
            status: 'scheduled' as EntranceApplicationStatus,
            scheduledAt: new Date().toISOString(),
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      'Assessment Scheduled',
      `Oral Entrance Assessment for ${targetApp?.fullName || 'Applicant'} assigned to ${ustazName} on ${date} at ${time} (${mode}).`,
      'admission'
    );
  };

  const submitAssessmentResult = (id: string, result: AssessmentResult) => {
    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updated = {
            ...app,
            assessmentResult: result,
            status: 'assessed' as EntranceApplicationStatus,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      'Assessment Results Submitted',
      `${result.assessedByUstazName} recorded evaluation for ${targetApp?.fullName || 'Applicant'} (Score: ${result.overallScore}/100 - ${result.decision}).`,
      'memorization'
    );
  };

  const approveRegistrationRequest = (id: string, notes?: string, conditionalTerms?: string) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();
    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const nextStatus: EntranceApplicationStatus = app.assessmentResult
            ? 'approved_for_admission'
            : 'approved_for_assessment';
          const updated:EntranceApplication = {
            ...app,
            status: nextStatus,
            adminDecision: conditionalTerms ? 'Conditional' : 'Approved',
            adminDecisionNotes: notes || app.adminDecisionNotes,
            conditionalTerms: conditionalTerms || app.conditionalTerms,
            adminDecisionDate: now,
            adminDecisionBy: adminUser,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      'Student Registration Approved',
      `Application ${targetApp?.applicationNumber || id} for ${targetApp?.fullName || 'Student'} approved by ${adminUser}.`,
      'admission'
    );
  };

  const rejectRegistrationRequest = (id: string, reason: string) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();
    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updated:EntranceApplication = {
            ...app,
            status: 'rejected' as EntranceApplicationStatus,
            adminDecision: 'Rejected',
            rejectionReason: reason,
            adminDecisionDate: now,
            adminDecisionBy: adminUser,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      'Application Status Updated: Rejected',
      `Application for ${targetApp?.fullName || 'Student'} was declined (${reason}).`,
      'admission'
    );
  };

  const waitlistRegistrationRequest = (id: string, notes?: string) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();
    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updated:EntranceApplication = {
            ...app,
            status: 'waitlisted' as EntranceApplicationStatus,
            adminDecision: 'Waitlisted',
            adminDecisionNotes: notes || 'Placed on waiting list for upcoming cohort.',
            adminDecisionDate: now,
            adminDecisionBy: adminUser,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      'Applicant Waitlisted',
      `Application for ${targetApp?.fullName || 'Student'} placed on waiting list.`,
      'admission'
    );
  };

  const postPlacementResult = (
    id: string,
    placement: PlacementDetails,
    options?: { publishNow?: boolean; diagnosticMarks?: Partial<AssessmentResult> }
  ) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();
    const shouldPublish = options?.publishNow !== undefined ? options.publishNow : true;

    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updatedAssessment = options?.diagnosticMarks && app.assessmentResult
            ? { ...app.assessmentResult, ...options.diagnosticMarks }
            : app.assessmentResult;

          const updatedStatus: EntranceApplicationStatus = shouldPublish
            ? 'result_published'
            : (app.status === 'pending' ? 'assessed' : app.status);

          const updated:EntranceApplication = {
            ...app,
            status: updatedStatus,
            placementDetails: {
              ...placement,
              placedAt: now,
              placedBy: adminUser,
            },
            assessmentResult: updatedAssessment,
            isResultPublished: shouldPublish,
            resultPublishedAt: shouldPublish ? now : app.resultPublishedAt,
            resultPublishedBy: shouldPublish ? adminUser : app.resultPublishedBy,
            adminDecision: 'Approved',
            adminDecisionDate: now,
            adminDecisionBy: adminUser,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      shouldPublish ? 'Placement Result Published' : 'Placement Details Saved',
      `Official placement for ${targetApp?.fullName || 'Student'} placed into ${placement.assignedClass} (${placement.assignedHalqah}) ${shouldPublish ? 'and published to parent portal.' : 'as draft.'}`,
      'admission'
    );
  };

  const publishAssessmentResult = (id: string, isPublished: boolean) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();

    setEntranceApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          const updated = {
            ...app,
            isResultPublished: isPublished,
            resultPublishedAt: isPublished ? now : app.resultPublishedAt,
            resultPublishedBy: isPublished ? adminUser : app.resultPublishedBy,
            status: isPublished ? ('result_published' as EntranceApplicationStatus) : ('assessed' as EntranceApplicationStatus),
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    const targetApp = entranceApplications.find(a => a.id === id);
    addNotification(
      isPublished ? 'Assessment Result Published' : 'Assessment Result Unpublished',
      `Results for ${targetApp?.fullName || 'Candidate'} (${targetApp?.applicationNumber}) ${isPublished ? 'published to public tracker & parent portal.' : 'reverted to internal review.'}`,
      'admission'
    );
  };

  const bulkApproveRegistrationRequests = (ids: string[], notes?: string) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();

    setEntranceApplications(prev =>
      prev.map(app => {
        if (ids.includes(app.id)) {
          const nextStatus: EntranceApplicationStatus = app.assessmentResult
            ? 'approved_for_admission'
            : 'approved_for_assessment';
          const updated:EntranceApplication = {
            ...app,
            status: nextStatus,
            adminDecision: 'Approved',
            adminDecisionNotes: notes || app.adminDecisionNotes,
            adminDecisionDate: now,
            adminDecisionBy: adminUser,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    addNotification(
      'Bulk Applications Approved',
      `Successfully approved ${ids.length} registration application(s).`,
      'admission'
    );
  };

  const bulkPostPlacementResults = (ids: string[], isPublished: boolean) => {
    const adminUser = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration';
    const now = new Date().toISOString();

    setEntranceApplications(prev =>
      prev.map(app => {
        if (ids.includes(app.id)) {
          const updated = {
            ...app,
            isResultPublished: isPublished,
            resultPublishedAt: isPublished ? now : app.resultPublishedAt,
            resultPublishedBy: isPublished ? adminUser : app.resultPublishedBy,
            status: isPublished ? ('result_published' as EntranceApplicationStatus) : app.status,
          };
          dbUpsertEntranceApplication(updated).catch(() => {});
          return updated;
        }
        return app;
      })
    );

    addNotification(
      'Bulk Results Posting Updated',
      `${isPublished ? 'Published' : 'Unpublished'} results for ${ids.length} candidate(s).`,
      'admission'
    );
  };

  const bulkEnrollApplicants = async (
    ids: string[],
    defaultClass = 'Class 1-A',
    defaultLevel = "Ibtida'i 1 (Primary)"
  ): Promise<{ successCount: number; errors: string[] }> => {
    let successCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      const app = entranceApplications.find(a => a.id === id);
      if (!app) {
        errors.push(`Application ${id} not found.`);
        continue;
      }
      if (app.status === 'enrolled') {
        continue;
      }
      const targetClass = app.placementDetails?.assignedClass || app.assessmentResult?.recommendedClass || defaultClass;
      const targetLevel = app.placementDetails?.assignedLevel || app.assessmentResult?.recommendedLevel || defaultLevel;
      const targetHalqah = app.placementDetails?.assignedHalqah || app.assessmentResult?.recommendedHifzCircle || 'General Tahfeez Circle';
      const targetUstaz = app.placementDetails?.assignedUstazId || app.assignedUstazId || 'tch-1';

      const res = await enrollApplicantDirectly(id, targetClass, targetLevel, targetHalqah, targetUstaz);
      if (res.success) {
        successCount++;
      } else {
        errors.push(`${app.fullName}: ${res.message}`);
      }
    }

    addNotification(
      'Bulk Student Enrollment Complete',
      `Directly registered and enrolled ${successCount} student(s) into active classes.`,
      'admission'
    );

    return { successCount, errors };
  };

  const enrollApplicantDirectly = async (
    id: string,
    classAssigned: string,
    levelAssigned: string,
    hifzCircleAssigned?: string,
    assignedUstazId?: string
  ): Promise<{ success: boolean; studentId: string; message: string }> => {
    const targetApp = entranceApplications.find(a => a.id === id);
    if (!targetApp) {
      return { success: false, studentId: '', message: 'Application record not found.' };
    }

    const newId = `std-${Date.now().toString().slice(-4)}`;
    const newAdmission = `AIM-2026-${String(students.length + 101).padStart(3, '0')}`;

    // Split name into first and last
    const nameParts = targetApp.fullName.trim().split(' ');
    const firstName = nameParts[0] || targetApp.fullName;
    const lastName = nameParts.slice(1).join(' ') || 'Student';

    const newStudent: Student = {
      id: newId,
      admissionNumber: newAdmission,
      firstName,
      lastName,
      arabicName: targetApp.arabicName || targetApp.fullName,
      gender: targetApp.gender || 'male',
      dob: targetApp.dob || '2015-01-01',
      placeOfBirth: 'Addis Ababa',
      nationality: targetApp.nationality || 'Ethiopian',
      region: 'Addis Ababa',
      subCity: targetApp.subCity || 'Yeka',
      woreda: targetApp.woreda || '08',
      address: targetApp.address || 'CMC, Addis Ababa',
      guardianName: targetApp.guardianName || 'Guardian',
      guardianRelationship: targetApp.guardianRelationship || 'Parent',
      guardianPhone: targetApp.guardianPhone || '+251 911 000 000',
      guardianEmail: targetApp.guardianEmail || '',
      emergencyContact: targetApp.emergencyContact || targetApp.guardianPhone || '+251 911 000 000',
      bloodGroup: 'O+',
      medicalNotes: targetApp.hasSpecialNeedsOrMedical,
      enrollmentDate: new Date().toISOString().split('T')[0],
      currentLevel: levelAssigned || targetApp.assessmentResult?.recommendedLevel || "Ibtida'i 1 (Primary)",
      currentClass: classAssigned || targetApp.assessmentResult?.recommendedClass || 'Class 1-A',
      hifzCircleName: hifzCircleAssigned || targetApp.assessmentResult?.recommendedHifzCircle || 'General Tahfeez Circle',
      assignedHifzTeacherId: assignedUstazId || targetApp.assignedUstazId || 'tch-1',
      status: 'active',
      photoUrl:
        targetApp.photoUrl ||
        (targetApp.gender === 'female'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'),
      quranProgress: {
        juzCompleted: targetApp.memorizedJuzCount || 0,
        currentSurahNumber: 1,
        currentSurahName: 'Al-Fatihah',
        currentAyah: 1,
        memorizationScoreAvg: targetApp.assessmentResult?.memorizationScore || 85,
        tajweedScoreAvg: targetApp.assessmentResult?.tajweedMakharijScore || 85,
        isReadyForIjazah: false,
      },
      academicGPA: 4.0,
      attendanceRate: 100,
      feeBalance: 0,
    };

    // Add to students state
    setStudents(prev => [newStudent, ...prev]);
    dbUpsertStudent(newStudent).catch(() => {});

    // Update application record
    const updatedTargetApp: EntranceApplication = {
      ...targetApp,
      status: 'enrolled' as EntranceApplicationStatus,
      enrolledStudentId: newId,
      enrolledAt: new Date().toISOString(),
      enrolledBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Madrasa Administration',
      enrolledClass: classAssigned,
      enrolledLevel: levelAssigned,
    };

    setEntranceApplications(prev =>
      prev.map(app => (app.id === id ? updatedTargetApp : app))
    );
    dbUpsertEntranceApplication(updatedTargetApp).catch(() => {});

    addNotification(
      'Student Directly Enrolled from Assessment',
      `Alhamdulillah! ${targetApp.fullName} has been officially enrolled into ${classAssigned} (${newAdmission}) following entrance assessment.`,
      'admission'
    );

    return {
      success: true,
      studentId: newId,
      message: `Successfully enrolled ${targetApp.fullName} into ${classAssigned}. Admission ID: ${newAdmission}`,
    };
  };

  // Optional: Load sample starter records for demo
  const loadStarterSampleData = () => {
    const sampleStudents: Student[] = [
      {
        id: 'std-101',
        admissionNumber: 'AIM-2026-001',
        firstName: 'Abdurahman',
        lastName: 'Mohammed',
        arabicName: 'عبد الرحمن محمد',
        gender: 'male',
        dob: '2012-04-15',
        placeOfBirth: 'Addis Ababa',
        nationality: 'Ethiopian',
        region: 'Addis Ababa',
        subCity: 'Yeka',
        woreda: '08',
        address: 'CMC Road, near Michael Church',
        guardianName: 'Mohammed Ahmed',
        guardianRelationship: 'Father',
        guardianPhone: '+251 911 234567',
        guardianEmail: 'mohammed.ahmed@ethionet.et',
        emergencyContact: '+251 912 345678',
        bloodGroup: 'O+',
        enrollmentDate: '2024-09-10',
        currentLevel: "Ibtida'i 3 (Elementary)",
        currentClass: 'Class 8-A',
        hifzCircleName: 'Halqah Sheikh Bilal (Hafiz Circle)',
        assignedHifzTeacherId: 'tch-01',
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        quranProgress: {
          juzCompleted: 18,
          currentSurahNumber: 20,
          currentSurahName: 'Ta-Ha',
          currentAyah: 45,
          memorizationScoreAvg: 94,
          tajweedScoreAvg: 96,
          isReadyForIjazah: false,
        },
        academicGPA: 3.85,
        attendanceRate: 98,
        feeBalance: 0,
      },
      {
        id: 'std-102',
        admissionNumber: 'AIM-2026-002',
        firstName: 'Khadija',
        lastName: 'Zeynu',
        arabicName: 'خديجة زينو',
        gender: 'female',
        dob: '2014-08-22',
        placeOfBirth: 'Addis Ababa',
        nationality: 'Ethiopian',
        region: 'Addis Ababa',
        subCity: 'Bole',
        woreda: '04',
        address: 'CMC Ayat Real Estate, Block 4',
        guardianName: 'Zeynu Kemal',
        guardianRelationship: 'Father',
        guardianPhone: '+251 922 889900',
        guardianEmail: 'zeynu.kemal@gmail.com',
        emergencyContact: '+251 911 556677',
        bloodGroup: 'A+',
        enrollmentDate: '2024-09-10',
        currentLevel: "Ibtida'i 1",
        currentClass: 'Class 4-B (Girls)',
        hifzCircleName: 'Halqah Ustaza Maryam',
        assignedHifzTeacherId: 'tch-02',
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        quranProgress: {
          juzCompleted: 6,
          currentSurahNumber: 5,
          currentSurahName: 'Al-Ma\'idah',
          currentAyah: 12,
          memorizationScoreAvg: 96,
          tajweedScoreAvg: 98,
          isReadyForIjazah: false,
        },
        academicGPA: 3.92,
        attendanceRate: 99,
        feeBalance: 1200,
      },
    ];

    setStudents(sampleStudents);
    addNotification('Sample Data Loaded', 'Sample Al-Imran records loaded for testing and review.', 'announcement');
  };

  const addAuditLog = (entry: {
    category: AuditLogCategory;
    action: string;
    details: string;
    targetEntityId?: string;
    targetEntityName?: string;
    severity?: 'info' | 'success' | 'warning' | 'critical';
    actorId?: string;
    actorName?: string;
    actorEmail?: string;
    actorRole?: UserRole;
  }) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: entry.actorId || currentUser?.id || 'usr-admin-1',
      actorName: entry.actorName || currentUser?.name || 'System Operator',
      actorEmail: entry.actorEmail || currentUser?.email || 'admin@alimran.edu.et',
      actorRole: entry.actorRole || currentUser?.role || 'super_admin',
      category: entry.category,
      action: entry.action,
      details: entry.details,
      targetEntityId: entry.targetEntityId,
      targetEntityName: entry.targetEntityName,
      severity: entry.severity || 'info',
      ipAddress: '197.156.104.22',
    };

    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_AUDIT_LOGS_KEY);
    }
  };

  const clearAllDemoData = () => {
    setStudents([]);
    setTeachers(prev => {
      if (currentUser) {
        return prev.filter(t => t.id === currentUser.id || (t.email && t.email.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()));
      }
      return [];
    });
    setHifzSessions([]);
    setAttendanceRecords([]);
    setPayments([]);
    setExams([]);
    setExamMarks([]);
    setNotifications([]);
    setAnnouncements([]);
    setCertificates([]);
    setHomeworkList([]);
    setEntranceApplications([]);
    setDonations([]);
    setDonationCauses([]);
    setAdmissionInquiries([]);
    setRecitations([]);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_TEACHERS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_HIFZ_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_EXAMS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_EXAM_MARKS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_CERTIFICATES_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_ENTRANCE_APPLICATIONS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_DONATION_CAUSES_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_INQUIRIES_KEY, JSON.stringify([]));
      localStorage.setItem(STORAGE_RECITATIONS_KEY, JSON.stringify([]));
      localStorage.setItem('alimran_real_data_mode', 'true');
    }
    idbSet(STORAGE_RECITATIONS_KEY, []).catch(() => {});
    idbSet('alimran_quran_recitation_submissions', []).catch(() => {});

    addNotification(
      'Clean Real Data Mode Activated',
      'All demo records removed. You are now working exclusively with your real data.',
      'announcement'
    );
  };

  const resetAllData = () => {
    localStorage.clear();
    setAllUsers([]);
    setCurrentUserState(null);
    setStudents([]);
    setTeachers([]);
    setHifzSessions([]);
    setAttendanceRecords([]);
    setPayments([]);
    setExams([]);
    setExamMarks([]);
    setNotifications([]);
    setAnnouncements([]);
    setCertificates([]);
    setHomeworkList([]);
    setDonations([]);
    setDonationCauses([]);
    setAdmissionInquiries([]);
    setRecitations(INITIAL_RECITATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setEntranceApplications(INITIAL_ENTRANCE_APPLICATIONS);
    idbSet(STORAGE_RECITATIONS_KEY, INITIAL_RECITATIONS).catch(() => {});
    idbSet('alimran_quran_recitation_submissions', INITIAL_RECITATIONS).catch(() => {});
  };

  return (
    <MadrasaContext.Provider
      value={{
        // Supabase Cloud
        isSupabaseActive,
        isSyncing,
        lastCloudSync,
        pushAllToCloud,
        pullAllFromCloud,

        currentUser,
        setCurrentUser: setCurrentUserState,
        allUsers,
        registerFirstAdmin,
        registerUserByAdmin,
        deleteUserAccount,
        updateUserPassword,
        loginUser,
        logoutUser,
        switchRole,
        isFirstTimeSetup,

        language,
        setLanguage,
        t: translations[language],
        dir: language === 'ar' ? 'rtl' : 'ltr',

        theme,
        toggleTheme,
        setTheme,

        customLogoUrl,
        setCustomLogoUrl,
        currentMadrasaBranch,
        setMadrasaBranch,

        students,
        addStudent,
        updateStudent,
        deleteStudent,

        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,

        hifzSessions,
        recordHifzSession,

        attendanceRecords,
        recordBatchAttendance,

        exams,
        addExam,
        examMarks,
        recordExamMarks,
        publishExamResults,

        payments,
        recordPayment,

        inventory,
        addInventoryItem,
        updateInventoryItem,

        libraryBooks,
        addLibraryBook,

        announcements,
        addAnnouncement,

        notifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        addNotification,
        sendNotification,

        homeworkList,
        addHomework,
        updateHomework,
        deleteHomework,
        submitHomeworkResponse,
        gradeHomeworkSubmission,

        // Audio Recitation & Storage Stats
        recitations,
        addRecitation,
        updateRecitation,
        deleteRecitation,
        saveAudioRecitationBlob,
        getAudioRecitationUrl,
        storageStats,
        refreshStorageStats,

        certificates,
        issueCertificate,

        donations,
        donationCauses,
        admissionInquiries,
        addDonation,
        updateDonationCauseRaised,
        submitAdmissionInquiry,

        // System Audit Trail
        auditLogs,
        addAuditLog,
        clearAuditLogs,

        // Online Entrance Applications & Assessments
        entranceApplications,
        submitEntranceApplication,
        updateEntranceApplication,
        deleteEntranceApplication,
        scheduleEntranceAssessment,
        submitAssessmentResult,
        approveRegistrationRequest,
        rejectRegistrationRequest,
        waitlistRegistrationRequest,
        postPlacementResult,
        publishAssessmentResult,
        bulkApproveRegistrationRequests,
        bulkPostPlacementResults,
        bulkEnrollApplicants,
        enrollApplicantDirectly,

        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,

        loadStarterSampleData,
        clearAllDemoData,
        resetAllData,
      }}
    >
      {children}
    </MadrasaContext.Provider>
  );
};

export const useMadrasa = () => {
  const context = useContext(MadrasaContext);
  if (!context) {
    throw new Error('useMadrasa must be used within a MadrasaProvider');
  }
  return context;
};
