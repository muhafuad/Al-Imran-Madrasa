export type UserRole =
  | "super_admin"
  | "principal"
  | "vice_principal"
  | "registrar"
  | "finance_officer"
  | "teacher"
  | "hifz_teacher"
  | "parent"
  | "student";

export interface UserProfile {
  id: string;
  name: string;
  arabicName?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone: string;
  madrasaBranchId: string;
  madrasaBranchName: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  assignedHifzHalqah?: string;
  studentId?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  password?: string;
}

export type StudentStatus =
  | "active"
  | "graduated"
  | "suspended"
  | "transferred"
  | "archived";

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  arabicName: string;
  gender: "male" | "female";
  dob: string;
  placeOfBirth: string;
  nationality: string;
  region: string;
  subCity: string;
  woreda?: string;
  address: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  bloodGroup: string;
  medicalNotes?: string;
  enrollmentDate: string;
  currentLevel: string;
  currentClass: string;
  hifzCircleName?: string;
  assignedHifzTeacherId?: string;
  status: StudentStatus;
  photoUrl: string;
  quranProgress: {
    juzCompleted: number;
    currentSurahNumber: number;
    currentSurahName: string;
    currentAyah: number;
    memorizationScoreAvg: number;
    tajweedScoreAvg: number;
    isReadyForIjazah: boolean;
  };
  academicGPA: number;
  attendanceRate: number;
  feeBalance: number;
}

export interface Teacher {
  id: string;
  fullName: string;
  name?: string;
  arabicName: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  role: "teacher" | "hifz_teacher";
  qualifications: string[];
  islamicCertificates: string[];
  experienceYears: number;
  subjects: string[];
  assignedClasses: string[];
  monthlySalary: number;
  joinDate: string;
  photoUrl: string;
  status: "active" | "on_leave" | "inactive";
  specialization?: string;
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  englishTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  startJuz: number;
  startPage: number;
}

export type MemorizationQuality =
  | "Mumtaz (Excellent)"
  | "Jayyid Jiddan (Very Good)"
  | "Jayyid (Good)"
  | "Maqbool (Fair)"
  | "Needs Revision";

export interface HifzSession {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  sessionType: "sabaq" | "sabqi" | "murajaah";
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  juz: number;
  hizb?: number;
  pageNumber?: number;
  memorizationQuality: MemorizationQuality;
  tajweedScore: number;
  fluencyScore: number;
  teacherNotes: string;
  isVerified: boolean;
}

export type AttendanceStatus = "present" | "late" | "excused" | "absent";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  classId: string;
  className: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy: string;
}

export type ExamType =
  | "Quiz"
  | "Monthly Test"
  | "Mid Exam"
  | "Final Exam"
  | "Oral Exam"
  | "Memorization Test"
  | "Tajweed Test";

export interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  subjectArabic: string;
  examType: ExamType;
  classId?: string;
  className: string;
  date: string;
  totalMarks: number;
  passingMarks?: number;
  examinerName?: string;
  academicYear?: string;
  term?: string;
  isPublished?: boolean;
  publishedAt?: string;
  publishedBy?: string;
}

export interface StudentExamMark {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  marksObtained: number;
  totalMarks: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  percentage: number;
  teacherRemarks?: string;
  teacherComments?: string;
  rankInClass?: number;
}

export type FeeType =
  | "Tuition Fee"
  | "Monthly Tuition"
  | "Hifz Program Fee"
  | "Admission Fee"
  | "Books & Materials"
  | "Books & Kit"
  | "Uniform & Badge"
  | "Transport"
  | "Transportation (Bus)"
  | "Madrasa Waqf / Donation";

export type PaymentMethod =
  | "Telebirr"
  | "CBE Birr"
  | "Bank Transfer"
  | "Cash"
  | "Cheque";
export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  amount: number;
  feeType: FeeType;
  monthFor?: string;
  monthCovered?: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  date: string;
  status: PaymentStatus;
  receivedBy?: string;
  collectedBy?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category:
    | "Books & Mushafs"
    | "Mus'haf & Books"
    | "Uniforms"
    | "Furniture"
    | "Audio/Tech"
    | "Audio/Visual Equipment"
    | "IT & Office"
    | "Stationery";
  quantity: number;
  unitPrice?: number;
  valueETB?: number;
  reorderLevel?: number;
  location: string;
  condition: "New" | "Good" | "Excellent" | "Fair" | "Needs Repair";
  purchaseDate?: string;
  supplier?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  titleArabic?: string;
  arabicTitle?: string;
  author: string;
  category:
    | "Tafseer"
    | "Tafsir"
    | "Hadith"
    | "Fiqh"
    | "Seerah"
    | "Tajweed"
    | "Arabic Grammar"
    | "Children";
  isbn?: string;
  shelfNumber?: string;
  shelfLocation?: string;
  availableCopies?: number;
  copiesAvailable?: number;
  totalCopies: number;
  isDigitalAvailable?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  arabicTitle?: string;
  content: string;
  category?: string;
  targetAudience: "All" | "Teachers" | "Parents" | "Students";
  priority?: "Normal" | "High" | "Urgent";
  publishedAt: string;
  authorName?: string;
  author?: string;
  isImportant?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type:
    | "memorization"
    | "attendance"
    | "payment"
    | "admission"
    | "exam"
    | "announcement";
  read: boolean;
  targetAudience?: "all" | "parents" | "teachers" | "students";
  channel?: "all" | "sms" | "app" | "telegram";
  priority?: "low" | "normal" | "high" | "urgent";
  sentDate?: string;
  isRead?: boolean;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  notes?: string;
  status: "submitted" | "reviewed" | "needs_revision";
  score?: number;
  maxScore: number;
  feedback?: string;
  audioRecitationRecorded?: boolean;
  audioBlobKey?: string;
  audioUrl?: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  arabicTitle?: string;
  description?: string;
  subject: string;
  className: string;
  teacherId?: string;
  teacherName?: string;
  dueDate: string;
  assignedDate: string;
  instructions?: string;
  submissionsCount: number;
  totalStudents?: number;
  surahTarget?: string;
  ayahRange?: string;
  totalPoints?: number;
  submissions?: HomeworkSubmission[];
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  arabicName: string;
  type:
    | "Hifz Completion (30 Juz)"
    | "Hifz Completion (Khatmah & Sanad)"
    | "Juz Amma Completion"
    | "Tajweed & Tarteel Ijazah"
    | "Tajweed Proficiency"
    | "Academic Excellence"
    | "Character & Akhlaq Award";
  riwayah?: string;
  issueDate: string;
  principalSignatory?: string;
  headSheikhSignatory?: string;
  gradeAchieved?: string;
  completionDetails?: string;
  verifiedBy?: string;
  qrCodeData?: string;
}

export type DonationCauseType =
  | "hifz_sponsorship"
  | "building_waqf"
  | "mushaf_fund"
  | "teacher_honorarium"
  | "general_sadaqah"
  | "zakat";

export interface DonationRecord {
  id: string;
  receiptNumber?: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  cause: string;
  causeTitle: string;
  frequency: "one-time" | "monthly" | "annual";
  paymentMethod: string;
  transactionRef?: string;
  transactionReference?: string;
  date: string;
  isAnonymous: boolean;
  dedicationMessage?: string;
  donorDedication?: string;
  status: string;
  hijriDate?: string;
}

export interface DonationCause {
  id: string;
  type?: string;
  title: string;
  arabicTitle: string;
  amharicTitle?: string;
  description: string;
  arabicDescription?: string;
  amharicDescription?: string;
  targetAmountETB: number;
  raisedAmountETB: number;
  donorsCount: number;
  suggestedAmountsETB: number[];
  imageUrl?: string;
  badge?: string;
  arabicBadge?: string;
  amharicBadge?: string;
  iconName?: string;
  category?: "Waqf" | "Sponsorship" | "Education" | "Relief" | string;
}

export interface AdmissionInquiry {
  id: string;
  studentName: string;
  arabicName?: string;
  studentAge?: number;
  age?: number;
  gender?: "male" | "female";
  programInterested?: string;
  desiredProgram?: string;
  guardianName: string;
  phone: string;
  email?: string;
  preferredCampus?: string;
  previousQuranExperience?: string;
  notes?: string;
  createdAt?: string;
  submittedAt?: string;
  status: "pending" | "reviewed" | "contacted" | "admitted";
}

export type EntranceApplicationStatus =
  | "pending"
  | "approved_for_assessment"
  | "scheduled"
  | "in_assessment"
  | "assessed"
  | "result_published"
  | "approved_for_admission"
  | "enrolled"
  | "waitlisted"
  | "rejected";

export interface PlacementDetails {
  assignedClass: string;
  assignedLevel: string;
  assignedHalqah: string;
  assignedUstazId?: string;
  assignedUstazName?: string;
  assignedShift?: string;
  commencementDate?: string;
  startDate?: string;
  tuitionTier?: string;
  tuitionFeeBirr?: number;
  admissionFeeBirr?: number;
  scholarshipDiscountPercent?: number;
  decisionOutcome?:
    | "Direct Admission"
    | "Foundation Tajweed Preparatory"
    | "Conditional Placement"
    | "Accelerated Sanad Track"
    | string;
  placementNotes?: string;
  specialInstructions?: string;
  placementRemarks?: string;
  placedAt?: string;
  placedBy?: string;
}

export interface AssessmentResult {
  assessedAt: string;
  assessedByUstazId?: string;
  assessedByUstazName: string;
  quranReadingScore?: number; // 0-100
  readingFluencyScore?: number; // 0-100
  tajweedMakharijScore: number; // 0-100
  memorizationScore: number; // 0-100
  retentionScore?: number; // 0-100
  arabicComprehensionScore?: number; // 0-100
  arabicProficiencyScore?: number; // 0-100
  overallScore: number; // 0-100
  verifiedMemorizedJuz?: number;
  testedSurahs?: string;
  surahsTested?: string[];
  testedJuzRange?: string;
  strengths: string;
  weaknesses: string;
  recommendedLevel: string;
  recommendedClass: string;
  recommendedHifzCircle?: string;
  recommendedWeeklyPace?: string;
  ustazRemarks?: string;
  recommendationNotes?: string;
  decision:
    | "Recommended"
    | "Conditional Acceptance"
    | "Needs Foundation Level"
    | "Not Ready"
    | "Accept & Enroll"
    | "Conditional Acceptance with Prep Class"
    | "Recommend Preliminary Arabic Alphabet Course"
    | "Direct Ijazah Track"
    | "Accepted for Direct Admission"
    | "Accepted - Foundation Tajweed Track"
    | "Accepted - Accelerated Hifz Track"
    | string;
}

export interface EntranceApplication {
  id: string;
  applicationNumber: string; // e.g. APP-2026-001
  createdAt: string;
  submissionDate?: string;
  submittedAt?: string;
  status: EntranceApplicationStatus;

  // Prospective Student Information
  fullName: string;
  arabicName?: string;
  amharicName?: string;
  gender: "male" | "female";
  dob: string;
  dateOfBirth?: string;
  age?: number;
  nationality?: string;
  address: string;
  subCity?: string;
  woreda?: string;
  photoUrl?: string;

  // Guardian Details
  guardianName: string;
  guardianRelationship?:
    | "Father"
    | "Mother"
    | "Brother"
    | "Sister"
    | "Grandparent"
    | "Guardian"
    | "Uncle"
    | "Legal Guardian"
    | string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;

  // Quran Learning Background
  readingAbility?: string;
  quranReadingAbility?: string;
  memorizedJuzCount: number;
  memorizedDetails?: string;
  memorizedSurahsDetails?: string;
  tajweedLevel?: string;
  tajweedKnowledge?: string;
  tajweedKnowledgeLevel?: string;
  previousMadrasa?: string;
  previousMadrasaName?: string;
  previousUstazName?: string;
  yearsOfIslamicStudy?: string;
  arabicProficiency?:
    | "Beginner"
    | "Elementary"
    | "Intermediate"
    | "Fluent"
    | string;
  islamicStudiesBackground?: string;

  // Program & Schedule Preferences
  targetProgram: string;
  preferredShift: string;
  preferredSchedule?: string;
  preferredBranchId?: string;
  preferredBranchName?: string;
  preferredAssessmentMode?:
    | "In-Person (Campus)"
    | "Online (Video / Zoom / Telegram)"
    | "Oral Board"
    | string;
  hasSpecialNeedsOrMedical?: string;
  specialNeedsDetails?: string;
  applicantNotes?: string;

  // Admin Scheduling details
  assignedUstazId?: string;
  assignedUstazName?: string;
  assessmentDate?: string;
  assessmentTime?: string;
  assessmentMode?:
    | "In-Person (Campus)"
    | "Online (Video / Zoom / Telegram)"
    | "Oral Board"
    | string;
  assessmentRoomOrLink?: string;
  adminNotes?: string;
  scheduledAt?: string;

  // Ustaz Assessment Results
  assessmentResult?: AssessmentResult;

  // Admin Results Posting & Placement Decision
  isResultPublished?: boolean;
  resultPublishedAt?: string;
  resultPublishedBy?: string;
  placementDetails?: PlacementDetails;
  adminDecision?:
    | "Approved"
    | "Conditional"
    | "Waitlisted"
    | "Rejected"
    | "Pending";
  adminDecisionNotes?: string;
  adminDecisionDate?: string;
  adminDecisionBy?: string;
  rejectionReason?: string;
  conditionalTerms?: string;

  // Direct Enrollment Tracking
  enrolledStudentId?: string;
  enrolledAt?: string;
  enrolledBy?: string;
  enrolledClass?: string;
  enrolledLevel?: string;
}

export type AuditLogCategory =
  | "AUTH"
  | "STUDENT"
  | "TEACHER"
  | "QURAN"
  | "EXAM"
  | "FINANCE"
  | "CERTIFICATE"
  | "SYSTEM"
  | "SECURITY";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  category: AuditLogCategory;
  action: string;
  details: string;
  targetEntityId?: string;
  targetEntityName?: string;
  ipAddress?: string;
  severity: "info" | "success" | "warning" | "critical";
}

export * from "./quranTypes";
