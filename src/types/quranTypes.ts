import type { MemorizationQuality } from "./index";

export type JuzMasteryStatus =
  | "mastered"
  | "revision"
  | "in_progress"
  | "not_started";

export interface RubElHizb {
  number: number; // 1 to 240
  hizbNumber: number; // 1 to 60
  juzNumber: number; // 1 to 30
  quarterIndexInHizb: 1 | 2 | 3 | 4;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahStart: number;
  startWordsArabic: string;
  pageNumber: number;
  status: JuzMasteryStatus;
}

export interface JuzData {
  juzNumber: number; // 1 to 30
  nameArabic: string; // e.g. "الم", "سيقول"
  nameEnglish: string;
  surahStartNumber: number;
  surahEndNumber: number;
  surahSummary: string;
  surahSummaryArabic: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  startAyahText: string;
  hizbStart: number;
  hizbEnd: number;
}

export interface StudentJuzProgress {
  juzNumber: number;
  status: JuzMasteryStatus;
  lastTestedDate?: string;
  retentionScore?: number; // 0 to 100
  tajweedScore?: number; // 0 to 100
  memorizationQuality?: MemorizationQuality;
  revisionsCount: number;
  teacherNotes?: string;
  isVerifiedByTeacher: boolean;
  verifiedByTeacherName?: string;
}

export type TajweedErrorCategory =
  | "makharij" // Makharij al-Huroof (Articulations)
  | "sifat" // Sifat (Characteristics, Tafkheem/Tarqeeq)
  | "ghunnah" // Ghunnah & Noon/Meem Sakinah
  | "madd" // Madd Duration (Elongations: Asli, Far'i, Muttasil, Munfasil, Lazim)
  | "qalqalah" // Qalqalah
  | "ikhfa_idgham" // Ikhfa, Idgham, Iqlab, Izhar
  | "waqf_ibtida" // Waqf & Ibtida (Stopping & Starting rules)
  | "lahn_jali" // Obvious fatal mistake (harakah/letter change)
  | "lahn_khafi"; // Subtle hidden mistake

export interface TajweedErrorAnnotation {
  id: string;
  timestampSeconds: number;
  surahNumber: number;
  ayahNumber: number;
  category: TajweedErrorCategory;
  categoryLabel: string;
  categoryLabelArabic: string;
  description: string;
  severity: "minor" | "moderate" | "major" | "critical";
  teacherSuggestion: string;
}

export interface RecitationSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentArabicName: string;
  teacherId: string;
  teacherName: string;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahStart: number;
  ayahEnd: number;
  juz: number;
  date: string;
  audioDurationSeconds: number;
  audioBlobUrl?: string;
  audioBlobKey?: string;
  studentNote?: string;
  tajweedScore?: number;
  fluencyScore?: number;
  makharijScore?: number;
  overallScore?: number;
  quality?: MemorizationQuality;
  tajweedErrors: TajweedErrorAnnotation[];
  teacherAudioFeedbackUrl?: string;
  teacherFeedbackNotes?: string;
  status: "reviewed" | "pending_review";
  reviewedAt?: string;
}

export interface DailySabaqEntry {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  // Sabaq (New lesson)
  sabaqSurah: string;
  sabaqSurahNumber: number;
  sabaqAyahStart: number;
  sabaqAyahEnd: number;
  sabaqPage: number;
  sabaqLines: number;
  sabaqGrade: MemorizationQuality;
  sabaqScore: number;

  // Sabqi / Amokhta (Recent 5-10 lessons revision)
  sabqiSurah: string;
  sabqiAyahRange: string;
  sabqiPages: string;
  sabqiGrade: MemorizationQuality;
  sabqiScore: number;

  // Manzil / Dhor (Old Juz revision)
  manzilJuzNumber: number;
  manzilHizbNumber?: number;
  manzilGrade: MemorizationQuality;
  manzilScore: number;

  overallAttendance: "present" | "late" | "absent";
  teacherNotes: string;
  teacherName: string;
}

export interface PacingTargetCalculation {
  studentId: string;
  studentName: string;
  currentJuzCompleted: number;
  currentQuarterIndex: number; // 0 to 240
  dailyPacePages: number; // e.g. 0.5, 1, 1.5, 2
  weeklyStudyDays: number; // e.g. 5, 6, 7
  totalQuranPages: number; // 604
  pagesCompleted: number;
  pagesRemaining: number;
  estimatedDaysToKhatmah: number;
  projectedKhatmahDate: string;
  streakDays: number;
  ijazahEligibilityScore: number; // 0 to 100
  ijazahRequirementsMet: {
    thirtyJuzCompleted: boolean;
    tajweedTheoryExamPassed: boolean;
    retentionDhorExamPassed: boolean;
    matnAlJazariyyahMastered: boolean;
    minimumAttendanceRateMet: boolean;
  };
}
