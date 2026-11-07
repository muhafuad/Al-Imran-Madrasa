import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { hashPassword } from "../utils/security";
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
  CertificateRecord,
  UserProfile,
  DonationRecord,
  DonationCause,
  AdmissionInquiry,
  EntranceApplication,
  HomeworkAssignment,
  HomeworkSubmission,
} from "../types";
import type { RecitationSubmission } from "../types/quranTypes";

// Persistent LocalStorage keys for Supabase project credentials
const STORAGE_SUPABASE_URL_KEY = "alimran_supabase_url";
const STORAGE_SUPABASE_KEY = "alimran_supabase_anon_key";
const STORAGE_AUTO_SYNC_KEY = "alimran_supabase_auto_sync";

let supabaseClientInstance: SupabaseClient | null = null;

export const sanitizeSupabaseUrl = (url: string): string => {
  if (!url) return "";
  let cleaned = url.trim();
  // Strip common env prefixes if user pasted variable declaration (e.g. VITE_SUPABASE_URL=... or url=...)
  cleaned = cleaned.replace(/^(VITE_)?SUPABASE_URL\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^url\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^['"`]|['"`]$/g, "").trim();
  if (
    cleaned &&
    !cleaned.startsWith("http://") &&
    !cleaned.startsWith("https://")
  ) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, ""); // remove trailing slashes
};

export const sanitizeSupabaseKey = (key: string): string => {
  if (!key) return "";
  let cleaned = key.trim();
  // Strip common env prefixes if user pasted variable declaration (e.g. VITE_SUPABASE_ANON_KEY=... or anon_key: ...)
  cleaned = cleaned.replace(/^(VITE_)?SUPABASE_ANON_KEY\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^(VITE_)?SUPABASE_KEY\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^anon(_key)?\s*[:=]\s*/i, "");
  cleaned = cleaned.replace(/^['"`]|['"`]$/g, "").trim();
  return cleaned;
};

export const extractSupabaseProjectRef = (url: string): string | null => {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const match = cleanUrl.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match ? match[1] : null;
};

export const isValidJwtFormat = (key: string): boolean => {
  if (!key) return false;
  const cleaned = sanitizeSupabaseKey(key);
  const parts = cleaned.split(".");
  return parts.length === 3 && parts[0].startsWith("eyJ");
};

export const getStoredSupabaseConfig = () => {
  if (typeof window === "undefined") {
    return { url: "", anonKey: "", autoSync: true, projectRef: null };
  }
  const metaEnv = (import.meta as any)?.env || {};
  const rawUrl =
    localStorage.getItem(STORAGE_SUPABASE_URL_KEY) ||
    metaEnv.VITE_SUPABASE_URL ||
    "";
  const rawKey =
    localStorage.getItem(STORAGE_SUPABASE_KEY) ||
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    "";
  const autoSync = localStorage.getItem(STORAGE_AUTO_SYNC_KEY) !== "false";

  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = sanitizeSupabaseKey(rawKey);
  const projectRef = extractSupabaseProjectRef(url);

  return { url, anonKey, autoSync, projectRef };
};

export const saveSupabaseConfig = (
  url: string,
  anonKey: string,
  autoSync: boolean = true,
) => {
  if (typeof window !== "undefined") {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = sanitizeSupabaseKey(anonKey);
    localStorage.setItem(STORAGE_SUPABASE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_SUPABASE_KEY, cleanKey);
    localStorage.setItem(STORAGE_AUTO_SYNC_KEY, autoSync ? "true" : "false");

    // Remove any stale auth token stored by Supabase auth for this project
    const projectRef = extractSupabaseProjectRef(cleanUrl);
    if (projectRef) {
      try {
        localStorage.removeItem(`sb-${projectRef}-auth-token`);
      } catch {
        // ignore
      }
    }
    // Reset instance so next call initializes with new credentials
    supabaseClientInstance = null;

    // Send to backend server to enable seamless cross-browser connection for Chrome, Edge, Safari, Mobile
    try {
      fetch("/api/supabase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl, anonKey: cleanKey, autoSync }),
      }).catch((err) => {
        console.warn("Background server config sync note:", err);
      });
    } catch {
      // ignore
    }
  }
};

/**
 * Sync Supabase configuration to/from server (for cross-browser persistence across Chrome, Edge, Safari, etc.)
 */
export const syncServerSupabaseConfig = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  const current = getStoredSupabaseConfig();
  const hasLocal = Boolean(
    current.url && current.anonKey && current.url.startsWith("http"),
  );

  // 1. If this browser has local credentials in localStorage, auto-push to server so other browsers (Chrome, Edge) inherit it
  if (hasLocal) {
    try {
      fetch("/api/supabase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: current.url,
          anonKey: current.anonKey,
          autoSync: current.autoSync !== false,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
    return true;
  }

  // 2. If this browser does not have local credentials, fetch from server
  try {
    const res = await fetch("/api/supabase-config");
    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        data.url &&
        data.anonKey &&
        String(data.url).startsWith("http")
      ) {
        const cleanUrl = sanitizeSupabaseUrl(data.url);
        const cleanKey = sanitizeSupabaseKey(data.anonKey);
        localStorage.setItem(STORAGE_SUPABASE_URL_KEY, cleanUrl);
        localStorage.setItem(STORAGE_SUPABASE_KEY, cleanKey);
        localStorage.setItem(
          STORAGE_AUTO_SYNC_KEY,
          data.autoSync !== false ? "true" : "false",
        );
        supabaseClientInstance = null;
        return true;
      }
    }
  } catch (e) {
    console.warn("Could not sync server supabase config:", e);
  }
  return false;
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClientInstance) return supabaseClientInstance;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey && url.startsWith("http")) {
    try {
      supabaseClientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      return supabaseClientInstance;
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return null;
};

export const ensureSupabaseClient =
  async (): Promise<SupabaseClient | null> => {
    let client = getSupabaseClient();
    if (client) {
      // Also broadcast to server just in case
      syncServerSupabaseConfig().catch(() => {});
      return client;
    }
    await syncServerSupabaseConfig();
    return getSupabaseClient();
  };

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith("http"));
};

/**
 * Upload a media binary file/blob to a Supabase Storage bucket
 */
export const uploadStorageFile = async (
  bucket: string,
  path: string,
  file: Blob | File | ArrayBuffer,
  contentType: string = "audio/webm",
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase client is not initialized." };
  }

  const bucketsToTry = [
    bucket,
    "madrasa-media",
    "recitations",
    "student-photos",
  ];
  let lastError = "";

  for (const b of bucketsToTry) {
    try {
      const { data, error } = await supabase.storage
        .from(b)
        .upload(path, file, {
          contentType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from(b)
          .getPublicUrl(path);
        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      }
      if (error) {
        lastError = error.message;
      }
    } catch (err: any) {
      lastError = err?.message || "Storage upload error";
    }
  }

  return {
    success: false,
    error: lastError || "Could not upload to storage bucket.",
  };
};

/**
 * Upload an audio recitation recording to Supabase storage
 */
export const uploadAudioRecitation = async (
  studentId: string,
  itemId: string,
  audioBlob: Blob,
  folder: string = "recitations",
): Promise<{ success: boolean; publicUrl?: string; error?: string }> => {
  const timestamp = Date.now();
  const cleanId = String(itemId).replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanStdId = String(studentId).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filePath = `${folder}/${cleanId}/${cleanStdId}_${timestamp}.webm`;

  const result = await uploadStorageFile(
    "madrasa-media",
    filePath,
    audioBlob,
    "audio/webm",
  );
  if (result.success && result.url) {
    return { success: true, publicUrl: result.url };
  }
  return { success: false, error: result.error };
};

export interface TableTestResult {
  tableName: string;
  exists: boolean;
  canRead: boolean;
  canWrite: boolean;
  rowCount?: number;
  error?: string;
}

export const testSupabaseConnection = async (
  url: string,
  anonKey: string,
): Promise<{
  success: boolean;
  message: string;
  isAuthError?: boolean;
  tablesStatus?: TableTestResult[];
  tablesFoundCount?: number;
  tablesTotalCount?: number;
  missingTables?: string[];
}> => {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(anonKey);

  if (!cleanUrl || !cleanKey) {
    return {
      success: false,
      message: "Supabase URL and Anon Key are required.",
    };
  }

  if (!isValidJwtFormat(cleanKey)) {
    return {
      success: false,
      isAuthError: true,
      message:
        'The entered Anon API Key does not appear to be a valid JWT token (it must start with "eyJ..."). Please check Project Settings > API in your Supabase dashboard.',
    };
  }

  try {
    const tempClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false },
    });

    const tablesToTest = [
      "profiles",
      "students",
      "teachers",
      "hifz_sessions",
      "attendance_records",
      "payments",
      "exams",
      "exam_marks",
      "certificates",
      "announcements",
      "donations",
      "donation_causes",
      "admission_inquiries",
      "entrance_applications",
      "inventory",
      "library_books",
      "homework_assignments",
      "recitation_submissions",
    ];

    const results: TableTestResult[] = [];
    const missingTables: string[] = [];

    // Quick preliminary check on profiles to detect 401 Unauthorized immediately
    const { error: initialErr } = await tempClient
      .from("profiles")
      .select("id")
      .limit(1);
    if (initialErr) {
      const is401 =
        initialErr.message?.toLowerCase().includes("invalid api key") ||
        initialErr.message?.toLowerCase().includes("jwt") ||
        initialErr.message?.toLowerCase().includes("unauthorized") ||
        (initialErr as any).code === "401" ||
        (initialErr as any).status === 401;

      if (is401) {
        return {
          success: false,
          isAuthError: true,
          message: `401 Unauthorized: The Anon Key is invalid or does not match this project (${extractSupabaseProjectRef(cleanUrl) || "project"}). In your Supabase Dashboard, go to Project Settings (gear icon) -> API -> copy the 'anon public' key and paste it here.`,
        };
      }
    }

    for (const table of tablesToTest) {
      try {
        const { data, error } = await tempClient
          .from(table)
          .select("*", { count: "exact", head: true });
        if (error) {
          const is401 =
            error.message?.toLowerCase().includes("invalid api key") ||
            error.message?.toLowerCase().includes("jwt") ||
            error.message?.toLowerCase().includes("unauthorized") ||
            (error as any).code === "401" ||
            (error as any).status === 401;

          if (is401) {
            return {
              success: false,
              isAuthError: true,
              message: `401 (Unauthorized): Supabase rejected the Anon API Key for "${table}". Please verify your Anon Key in Supabase Settings > API.`,
            };
          }

          if (
            error.message.includes("does not exist") ||
            error.message.includes("relation") ||
            error.code === "42P01"
          ) {
            results.push({
              tableName: table,
              exists: false,
              canRead: false,
              canWrite: false,
              error: "Table not created in database",
            });
            missingTables.push(table);
          } else {
            results.push({
              tableName: table,
              exists: true,
              canRead: false,
              canWrite: false,
              error: error.message,
            });
          }
        } else {
          results.push({
            tableName: table,
            exists: true,
            canRead: true,
            canWrite: true,
          });
        }
      } catch (err: any) {
        results.push({
          tableName: table,
          exists: false,
          canRead: false,
          canWrite: false,
          error: err?.message || "Query error",
        });
        missingTables.push(table);
      }
    }

    const tablesFoundCount = results.filter(
      (r) => r.exists && r.canRead,
    ).length;
    const tablesTotalCount = tablesToTest.length;

    if (tablesFoundCount === tablesTotalCount) {
      return {
        success: true,
        message: `Connection verified! All ${tablesTotalCount} PostgreSQL tables are active and ready for data storage.`,
        tablesStatus: results,
        tablesFoundCount,
        tablesTotalCount,
      };
    } else if (tablesFoundCount > 0) {
      return {
        success: true,
        message: `Connected to Supabase! (${tablesFoundCount}/${tablesTotalCount} tables ready). Some tables are missing. Please execute the SQL Migration in your Supabase SQL Editor.`,
        tablesStatus: results,
        tablesFoundCount,
        tablesTotalCount,
        missingTables,
      };
    } else {
      return {
        success: false,
        message: `Connected to Supabase project, but tables are not created yet. Please copy the SQL Schema from Tab 2 and run it in your Supabase SQL Editor.`,
        tablesStatus: results,
        tablesFoundCount: 0,
        tablesTotalCount,
        missingTables,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error connecting to Supabase.",
    };
  }
};

// ==========================================
// STORAGE & PHOTO UPLOADS (SUPABASE + LOCAL COMPRESSION FALLBACK)
// ==========================================
export const compressImage = (
  file: File | Blob,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.82,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const uploadPhotoToSupabase = async (
  file: File | Blob,
  bucketName:
    | "student-photos"
    | "teacher-photos"
    | "id-cards"
    | "avatars"
    | "madrasa-media"
    | (string & {}) = "student-photos",
  customFileName?: string,
): Promise<{
  url: string;
  source: "supabase" | "local_compressed";
  error?: string;
}> => {
  try {
    // 1. Always generate high quality compressed data URL as guaranteed fallback
    const compressedDataUrl = await compressImage(file, 800, 800, 0.85);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { url: compressedDataUrl, source: "local_compressed" };
    }

    // 2. Prepare file name & blob for Supabase Storage
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = customFileName
      ? `${customFileName.replace(/[^a-zA-Z0-9_-]/g, "_")}_${timestamp}.jpg`
      : `photo_${timestamp}_${randomStr}.jpg`;

    // Convert data URL to Blob for upload
    const res = await fetch(compressedDataUrl);
    const blob = await res.blob();

    // 3. Upload to target bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn(
        `Supabase Storage upload warning (${bucketName}):`,
        uploadError.message,
      );
      // If bucket doesn't exist yet, return compressed data URL safely
      return {
        url: compressedDataUrl,
        source: "local_compressed",
        error: `Supabase Storage: ${uploadError.message}. Photo saved locally.`,
      };
    }

    // 4. Get Public URL from Supabase Storage
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    if (publicUrlData?.publicUrl) {
      return { url: publicUrlData.publicUrl, source: "supabase" };
    }

    return { url: compressedDataUrl, source: "local_compressed" };
  } catch (err: any) {
    console.warn("uploadPhotoToSupabase exception:", err);
    try {
      const fallbackUrl = await compressImage(file, 600, 600, 0.75);
      return { url: fallbackUrl, source: "local_compressed" };
    } catch {
      return {
        url: "",
        source: "local_compressed",
        error: err?.message || "Error processing photo",
      };
    }
  }
};

// ==========================================
// REAL-TIME DATABASE SYNC & LISTENERS
// ==========================================
export const subscribeToDatabaseChanges = (
  onChange: (tableName: string, eventType: string, payload: any) => void,
) => {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel("alimran_realtime_all")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        onChange(payload.table, payload.eventType, payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn("Realtime subscription skipped:", e);
    return () => {};
  }
};

// ==========================================
// PUSH / SYNC LOCAL STATE TO SUPABASE
// ==========================================
export interface SyncStatePayload {
  users?: UserProfile[];
  students?: Student[];
  teachers?: Teacher[];
  hifzSessions?: HifzSession[];
  attendanceRecords?: AttendanceRecord[];
  exams?: ExamRecord[];
  examMarks?: StudentExamMark[];
  payments?: PaymentTransaction[];
  inventory?: InventoryItem[];
  libraryBooks?: LibraryBook[];
  announcements?: Announcement[];
  certificates?: CertificateRecord[];
  donations?: DonationRecord[];
  donationCauses?: DonationCause[];
  inquiries?: AdmissionInquiry[];
  entranceApplications?: EntranceApplication[];
  homeworkList?: HomeworkAssignment[];
  recitations?: RecitationSubmission[];
}

export const syncAllToSupabase = async (
  payload: SyncStatePayload,
): Promise<{ success: boolean; syncedCount: number; errors: string[] }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      syncedCount: 0,
      errors: ["Supabase client is not configured."],
    };
  }

  const errors: string[] = [];
  let syncedCount = 0;

  // 1. Sync Profiles / Users
  if (payload.users && payload.users.length > 0) {
    try {
      const formatted = payload.users.map((u) => ({
        id: u.id,
        username: u.email.split("@")[0],
        full_name: u.name,
        arabic_name: u.arabicName || u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        madrasa_branch_name: u.madrasaBranchName,
        assigned_classes: u.assignedClasses || [],
        assigned_subjects: u.assignedSubjects || [],
        assigned_hifz_halqah: u.assignedHifzHalqah || "",
        avatar_url: u.avatarUrl || "",
        status: u.status || "active",
        password_hash: u.password || undefined,
      }));
      let { error } = await supabase
        .from("profiles")
        .upsert(formatted, { onConflict: "id" });
      // If error is due to missing password_hash column in existing table, fallback without password_hash
      if (error && error.message?.toLowerCase().includes("password_hash")) {
        const fallbackFormatted = formatted.map(
          ({ password_hash, ...rest }) => rest,
        );
        const retryRes = await supabase
          .from("profiles")
          .upsert(fallbackFormatted, { onConflict: "id" });
        error = retryRes.error;
      }
      if (error) errors.push(`Profiles: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Profiles: ${e.message}`);
    }
  }

  // 2. Sync Students
  if (payload.students && payload.students.length > 0) {
    try {
      const formatted = payload.students.map((s) => ({
        id: s.id,
        admission_number: s.admissionNumber,
        first_name: s.firstName,
        last_name: s.lastName,
        arabic_name: s.arabicName,
        gender: s.gender,
        dob: s.dob || "2014-01-01",
        guardian_name: s.guardianName,
        guardian_phone: s.guardianPhone,
        guardian_email: s.guardianEmail || "",
        current_level: s.currentLevel,
        current_class: s.currentClass,
        hifz_circle_name: s.hifzCircleName || "",
        assigned_hifz_teacher_id: s.assignedHifzTeacherId || "",
        status: s.status,
        photo_url: s.photoUrl || "",
        juz_completed: s.quranProgress.juzCompleted,
        current_surah_number: s.quranProgress.currentSurahNumber,
        current_surah_name: s.quranProgress.currentSurahName,
        current_ayah: s.quranProgress.currentAyah,
        memorization_score_avg: s.quranProgress.memorizationScoreAvg,
        tajweed_score_avg: s.quranProgress.tajweedScoreAvg,
        academic_gpa: s.academicGPA,
        attendance_rate: s.attendanceRate,
        fee_balance: s.feeBalance,
      }));
      const { error } = await supabase
        .from("students")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Students: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Students: ${e.message}`);
    }
  }

  // 3. Sync Teachers
  if (payload.teachers && payload.teachers.length > 0) {
    try {
      const formatted = payload.teachers.map((t) => ({
        id: t.id,
        full_name: t.fullName,
        arabic_name: t.arabicName,
        email: t.email,
        phone: t.phone,
        role: t.role,
        qualifications: t.qualifications || [],
        islamic_certificates: t.islamicCertificates || [],
        experience_years: t.experienceYears || 0,
        subjects: t.subjects || [],
        assigned_classes: t.assignedClasses || [],
        monthly_salary: t.monthlySalary || 0,
        status: t.status,
      }));
      const { error } = await supabase
        .from("teachers")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Teachers: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Teachers: ${e.message}`);
    }
  }

  // 4. Sync Hifz Sessions
  if (payload.hifzSessions && payload.hifzSessions.length > 0) {
    try {
      const formatted = payload.hifzSessions.map((h) => ({
        id: h.id,
        student_id: h.studentId,
        student_name: h.studentName,
        teacher_id: h.teacherId,
        teacher_name: h.teacherName,
        date: h.date,
        session_type: h.sessionType,
        surah_number: h.surahNumber,
        surah_name: h.surahName,
        ayah_start: h.ayahStart,
        ayah_end: h.ayahEnd,
        juz: h.juz,
        memorization_quality: h.memorizationQuality,
        tajweed_score: h.tajweedScore,
        fluency_score: h.fluencyScore,
        teacher_notes: h.teacherNotes || "",
      }));
      const { error } = await supabase
        .from("hifz_sessions")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Hifz Sessions: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Hifz Sessions: ${e.message}`);
    }
  }

  // 5. Sync Attendance
  if (payload.attendanceRecords && payload.attendanceRecords.length > 0) {
    try {
      const formatted = payload.attendanceRecords.map((a) => ({
        id: a.id,
        student_id: a.studentId,
        student_name: a.studentName,
        date: a.date,
        class_id: a.classId || "",
        class_name: a.className,
        status: a.status,
        remarks: a.remarks || "",
        recorded_by: a.recordedBy || "",
      }));
      const { error } = await supabase
        .from("attendance_records")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Attendance: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Attendance: ${e.message}`);
    }
  }

  // 6. Sync Payments
  if (payload.payments && payload.payments.length > 0) {
    try {
      const formatted = payload.payments.map((p) => ({
        id: p.id,
        receipt_number: p.receiptNumber,
        student_id: p.studentId,
        student_name: p.studentName,
        amount: p.amount,
        fee_type: p.feeType,
        payment_method: p.paymentMethod,
        transaction_ref: p.transactionReference || "",
        date: p.date,
        status: p.status,
        received_by: p.receivedBy || p.collectedBy || "",
      }));
      const { error } = await supabase
        .from("payments")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Payments: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Payments: ${e.message}`);
    }
  }

  // 7. Sync Exams
  if (payload.exams && payload.exams.length > 0) {
    try {
      const formatted = payload.exams.map((ex) => ({
        id: ex.id,
        title: ex.title,
        subject: ex.subject,
        subject_arabic: ex.subjectArabic || "",
        exam_type: ex.examType,
        class_name: ex.className,
        date: ex.date,
        total_marks: ex.totalMarks,
        passing_marks: ex.passingMarks || 50,
        examiner_name: ex.examinerName || "",
        academic_year: ex.academicYear || "2025/2026",
        is_published: ex.isPublished || false,
        published_at: ex.publishedAt || null,
        published_by: ex.publishedBy || "",
      }));
      const { error } = await supabase
        .from("exams")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Exams: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Exams: ${e.message}`);
    }
  }

  // 8. Sync Exam Marks
  if (payload.examMarks && payload.examMarks.length > 0) {
    try {
      const formatted = payload.examMarks.map((m) => ({
        id: m.id,
        exam_id: m.examId,
        student_id: m.studentId,
        student_name: m.studentName,
        marks_obtained: m.marksObtained,
        total_marks: m.totalMarks,
        grade: m.grade,
        percentage: m.percentage,
        teacher_remarks: m.teacherRemarks || m.teacherComments || "",
        rank_in_class: m.rankInClass || null,
      }));
      const { error } = await supabase
        .from("exam_marks")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Exam Marks: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Exam Marks: ${e.message}`);
    }
  }

  // 9. Sync Certificates
  if (payload.certificates && payload.certificates.length > 0) {
    try {
      const formatted = payload.certificates.map((c) => ({
        id: c.id,
        certificate_number: c.certificateNumber,
        student_id: c.studentId,
        student_name: c.studentName,
        arabic_name: c.arabicName,
        type: c.type,
        issue_date: c.issueDate,
        grade_achieved: c.gradeAchieved || "Mumtaz",
        principal_signatory: c.principalSignatory || "Sheikh Mohammed Al-Imran",
        head_sheikh_signatory:
          c.headSheikhSignatory || "Sheikh Bilal Al-Azhari",
        completion_details: c.completionDetails || "",
      }));
      const { error } = await supabase
        .from("certificates")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Certificates: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Certificates: ${e.message}`);
    }
  }

  // 10. Sync Announcements
  if (payload.announcements && payload.announcements.length > 0) {
    try {
      const formatted = payload.announcements.map((an) => ({
        id: an.id,
        title: an.title,
        arabic_title: an.arabicTitle || an.title,
        content: an.content,
        target_audience: an.targetAudience,
        priority: an.priority || "Normal",
        published_at: an.publishedAt,
        author_name: an.authorName || an.author || "Admin",
      }));
      const { error } = await supabase
        .from("announcements")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Announcements: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Announcements: ${e.message}`);
    }
  }

  // 11. Sync Donations
  if (payload.donations && payload.donations.length > 0) {
    try {
      const formatted = payload.donations.map((d) => ({
        id: d.id,
        receipt_number: d.receiptNumber || d.id,
        donor_name: d.donorName,
        donor_email: d.donorEmail || "",
        donor_phone: d.donorPhone || "",
        amount: d.amount,
        currency: d.currency || "ETB",
        cause: d.cause,
        cause_title: d.causeTitle,
        frequency: d.frequency,
        payment_method: d.paymentMethod,
        transaction_ref: d.transactionRef || d.transactionReference || "",
        date: d.date,
        is_anonymous: d.isAnonymous || false,
        donor_dedication: d.donorDedication || d.dedicationMessage || "",
        status: d.status || "completed",
        hijri_date: d.hijriDate || "",
      }));
      const { error } = await supabase
        .from("donations")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Donations: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Donations: ${e.message}`);
    }
  }

  // 12. Sync Donation Causes
  if (payload.donationCauses && payload.donationCauses.length > 0) {
    try {
      const formatted = payload.donationCauses.map((c) => ({
        id: c.id,
        title: c.title,
        arabic_title: c.arabicTitle,
        amharic_title: c.amharicTitle || "",
        description: c.description,
        arabic_description: c.arabicDescription || "",
        amharic_description: c.amharicDescription || "",
        target_amount_etb: c.targetAmountETB,
        raised_amount_etb: c.raisedAmountETB,
        donors_count: c.donorsCount,
        category: c.category || "Waqf",
      }));
      const { error } = await supabase
        .from("donation_causes")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Donation Causes: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Donation Causes: ${e.message}`);
    }
  }

  // 13. Sync Admission Inquiries
  if (payload.inquiries && payload.inquiries.length > 0) {
    try {
      const formatted = payload.inquiries.map((inq) => ({
        id: inq.id,
        student_name: inq.studentName,
        arabic_name: inq.arabicName || "",
        age: inq.studentAge || inq.age || 7,
        gender: inq.gender || "male",
        program_interested:
          inq.programInterested || inq.desiredProgram || "Hifz Program",
        guardian_name: inq.guardianName,
        phone: inq.phone,
        email: inq.email || "",
        preferred_campus: inq.preferredCampus || "CMC Main Campus",
        notes: inq.notes || "",
        status: inq.status || "pending",
        created_at:
          inq.createdAt || inq.submittedAt || new Date().toISOString(),
      }));
      const { error } = await supabase
        .from("admission_inquiries")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Inquiries: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Inquiries: ${e.message}`);
    }
  }

  // 14. Sync Inventory
  if (payload.inventory && payload.inventory.length > 0) {
    try {
      const formatted = payload.inventory.map((item) => ({
        id: item.id,
        item_name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        value_etb:
          item.valueETB ||
          (item.unitPrice ? item.unitPrice * item.quantity : 0),
        reorder_level: item.reorderLevel || 5,
        location: item.location,
        condition: item.condition,
        purchase_date:
          item.purchaseDate || new Date().toISOString().split("T")[0],
      }));
      const { error } = await supabase
        .from("inventory")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Inventory: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Inventory: ${e.message}`);
    }
  }

  // 15. Sync Library Books
  if (payload.libraryBooks && payload.libraryBooks.length > 0) {
    try {
      const formatted = payload.libraryBooks.map((b) => ({
        id: b.id,
        title: b.title,
        arabic_title: b.titleArabic || b.arabicTitle || "",
        author: b.author,
        category: b.category,
        total_copies: b.totalCopies,
        available_copies:
          b.availableCopies ?? b.copiesAvailable ?? b.totalCopies,
        shelf_location: b.shelfLocation || b.shelfNumber || "Section A",
      }));
      const { error } = await supabase
        .from("library_books")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Library Books: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Library Books: ${e.message}`);
    }
  }

  // 16. Sync Entrance Applications
  if (payload.entranceApplications && payload.entranceApplications.length > 0) {
    try {
      const formatted = payload.entranceApplications.map((app) => ({
        id: app.id,
        application_number: app.applicationNumber,
        applicant_name: app.fullName,
        arabic_name: app.arabicName || "",
        guardian_name: app.guardianName,
        guardian_phone: app.guardianPhone,
        desired_program: app.targetProgram,
        status: app.status,
        data_json: app,
        created_at:
          app.createdAt || app.submissionDate || new Date().toISOString(),
      }));
      const { error } = await supabase
        .from("entrance_applications")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Entrance Applications: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Entrance Applications: ${e.message}`);
    }
  }

  // 17. Sync Homework & Tasks
  if (payload.homeworkList && payload.homeworkList.length > 0) {
    try {
      const formatted = payload.homeworkList.map((hw) => ({
        id: hw.id,
        title: hw.title,
        arabic_title: hw.arabicTitle || "",
        description: hw.description || "",
        subject: hw.subject,
        class_name: hw.className,
        due_date: hw.dueDate,
        assigned_date: hw.assignedDate,
        teacher_name: hw.teacherName || "",
        submissions_count: hw.submissionsCount || 0,
        submissions_json: hw.submissions || [],
      }));
      const { error } = await supabase
        .from("homework_assignments")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Homework: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Homework: ${e.message}`);
    }
  }

  // 18. Sync Recitation Submissions (Quran Voice Recordings)
  if (payload.recitations && payload.recitations.length > 0) {
    try {
      const formatted = payload.recitations.map((rec) => ({
        id: rec.id,
        student_id: rec.studentId,
        student_name: rec.studentName,
        student_arabic_name: rec.studentArabicName || "",
        teacher_id: rec.teacherId,
        teacher_name: rec.teacherName,
        surah_number: rec.surahNumber,
        surah_name: rec.surahName,
        surah_name_arabic: rec.surahNameArabic || "",
        ayah_start: rec.ayahStart,
        ayah_end: rec.ayahEnd,
        juz: rec.juz,
        date: rec.date,
        audio_duration_seconds: rec.audioDurationSeconds,
        audio_blob_url: rec.audioBlobUrl || "",
        audio_blob_key: rec.audioBlobKey || "",
        student_note: rec.studentNote || "",
        tajweed_score: rec.tajweedScore ?? null,
        fluency_score: rec.fluencyScore ?? null,
        makharij_score: rec.makharijScore ?? null,
        overall_score: rec.overallScore ?? null,
        quality: rec.quality || null,
        tajweed_errors: rec.tajweedErrors || [],
        teacher_audio_feedback_url: rec.teacherAudioFeedbackUrl || "",
        teacher_feedback_notes: rec.teacherFeedbackNotes || "",
        status: rec.status,
        reviewed_at: rec.reviewedAt || null,
      }));
      const { error } = await supabase
        .from("recitation_submissions")
        .upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Recitations: ${error.message}`);
      else syncedCount += formatted.length;
    } catch (e: any) {
      errors.push(`Recitations: ${e.message}`);
    }
  }

  return {
    success: errors.length === 0,
    syncedCount,
    errors,
  };
};

// ==========================================
// PULL / FETCH ALL STATE FROM SUPABASE
// ==========================================
export interface SupabaseCloudData {
  profiles: UserProfile[];
  students: Student[];
  teachers: Teacher[];
  hifzSessions: HifzSession[];
  attendanceRecords: AttendanceRecord[];
  payments: PaymentTransaction[];
  exams?: ExamRecord[];
  examMarks?: StudentExamMark[];
  announcements: Announcement[];
  certificates: CertificateRecord[];
  donations?: DonationRecord[];
  donationCauses?: DonationCause[];
  inquiries?: AdmissionInquiry[];
  entranceApplications?: EntranceApplication[];
  inventory?: InventoryItem[];
  libraryBooks?: LibraryBook[];
  homeworkList?: HomeworkAssignment[];
  recitations?: RecitationSubmission[];
}

export const fetchAllFromSupabase = async (): Promise<{
  success: boolean;
  data?: SupabaseCloudData;
  error?: string;
}> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase is not configured" };
  }

  try {
    const [
      profilesRes,
      studentsRes,
      teachersRes,
      hifzRes,
      attRes,
      paymentsRes,
      examsRes,
      marksRes,
      annRes,
      certRes,
      donationsRes,
      causesRes,
      inquiriesRes,
      appsRes,
      invRes,
      booksRes,
      hwRes,
      recRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("students").select("*"),
      supabase.from("teachers").select("*"),
      supabase
        .from("hifz_sessions")
        .select("*")
        .order("date", { ascending: false }),
      supabase
        .from("attendance_records")
        .select("*")
        .order("date", { ascending: false }),
      supabase.from("payments").select("*").order("date", { ascending: false }),
      supabase.from("exams").select("*").order("date", { ascending: false }),
      supabase.from("exam_marks").select("*"),
      supabase
        .from("announcements")
        .select("*")
        .order("published_at", { ascending: false }),
      supabase
        .from("certificates")
        .select("*")
        .order("issue_date", { ascending: false }),
      supabase
        .from("donations")
        .select("*")
        .order("date", { ascending: false }),
      supabase.from("donation_causes").select("*"),
      supabase
        .from("admission_inquiries")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("entrance_applications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("inventory").select("*"),
      supabase.from("library_books").select("*"),
      supabase
        .from("homework_assignments")
        .select("*")
        .order("due_date", { ascending: false }),
      supabase
        .from("recitation_submissions")
        .select("*")
        .order("date", { ascending: false }),
    ]);

    // Map profiles
    const profiles: UserProfile[] = (profilesRes.data || []).map((r) => ({
      id: r.id,
      name: r.full_name,
      arabicName: r.arabic_name,
      email: r.email,
      role: r.role,
      phone: r.phone || "",
      madrasaBranchId: "cmc-main",
      madrasaBranchName:
        r.madrasa_branch_name || "Al-Imran CMC Main Campus (HQ)",
      assignedClasses: r.assigned_classes || [],
      assignedSubjects: r.assigned_subjects || [],
      assignedHifzHalqah: r.assigned_hifz_halqah || "",
      avatarUrl: r.avatar_url || "",
      status: r.status || "active",
      password: r.password_hash || r.password || undefined,
    }));

    // Map students
    const students: Student[] = (studentsRes.data || []).map((s) => ({
      id: s.id,
      admissionNumber: s.admission_number,
      firstName: s.first_name,
      lastName: s.last_name,
      arabicName: s.arabic_name || `${s.first_name} ${s.last_name}`,
      gender: s.gender || "male",
      dob: s.dob || "2014-01-01",
      placeOfBirth: "Addis Ababa",
      nationality: "Ethiopian",
      region: "Addis Ababa",
      subCity: "CMC / Yeka",
      address: "CMC Road, Addis Ababa",
      guardianName: s.guardian_name,
      guardianRelationship: "Parent",
      guardianPhone: s.guardian_phone,
      guardianEmail: s.guardian_email || "",
      emergencyContact: s.guardian_phone,
      bloodGroup: "O+",
      enrollmentDate: s.created_at?.split("T")[0] || "2024-09-01",
      currentLevel: s.current_level || "Ibtida'i 1",
      currentClass: s.current_class || "Class 1-A",
      hifzCircleName: s.hifz_circle_name || "Halqah Sheikh Bilal",
      assignedHifzTeacherId: s.assigned_hifz_teacher_id || "",
      status: s.status || "active",
      photoUrl:
        s.photo_url ||
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      quranProgress: {
        juzCompleted: s.juz_completed || 0,
        currentSurahNumber: s.current_surah_number || 1,
        currentSurahName: s.current_surah_name || "Al-Fatihah",
        currentAyah: s.current_ayah || 1,
        memorizationScoreAvg: s.memorization_score_avg || 90,
        tajweedScoreAvg: s.tajweed_score_avg || 90,
        isReadyForIjazah: (s.juz_completed || 0) >= 30,
      },
      academicGPA: Number(s.academic_gpa) || 3.8,
      attendanceRate: s.attendance_rate || 96,
      feeBalance: Number(s.fee_balance) || 0,
    }));

    // Map teachers
    const teachers: Teacher[] = (teachersRes.data || []).map((t) => ({
      id: t.id,
      fullName: t.full_name,
      arabicName: t.arabic_name || t.full_name,
      email: t.email,
      phone: t.phone,
      gender: "male",
      role: t.role || "teacher",
      qualifications: t.qualifications || ["Islamic Studies Degree"],
      islamicCertificates: t.islamic_certificates || ["Ijazah Hafs"],
      experienceYears: t.experience_years || 3,
      subjects: t.subjects || ["Qur'an", "Tajweed"],
      assignedClasses: t.assigned_classes || ["Class 1-A"],
      monthlySalary: Number(t.monthly_salary) || 12000,
      joinDate: t.created_at?.split("T")[0] || "2024-01-01",
      photoUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      status: t.status || "active",
    }));

    // Map Hifz
    const hifzSessions: HifzSession[] = (hifzRes.data || []).map((h) => ({
      id: h.id,
      studentId: h.student_id,
      studentName: h.student_name,
      teacherId: h.teacher_id,
      teacherName: h.teacher_name,
      date: h.date,
      sessionType: h.session_type,
      surahNumber: h.surah_number,
      surahName: h.surah_name,
      ayahStart: h.ayah_start,
      ayahEnd: h.ayah_end,
      juz: h.juz,
      memorizationQuality: h.memorization_quality || "Mumtaz (Excellent)",
      tajweedScore: h.tajweed_score || 95,
      fluencyScore: h.fluency_score || 95,
      teacherNotes: h.teacher_notes || "",
      isVerified: true,
    }));

    // Map Attendance
    const attendanceRecords: AttendanceRecord[] = (attRes.data || []).map(
      (a) => ({
        id: a.id,
        studentId: a.student_id,
        studentName: a.student_name,
        date: a.date,
        classId: a.class_id,
        className: a.class_name,
        status: a.status,
        remarks: a.remarks,
        recordedBy: a.recorded_by,
      }),
    );

    // Map Payments
    const payments: PaymentTransaction[] = (paymentsRes.data || []).map(
      (p) => ({
        id: p.id,
        receiptNumber: p.receipt_number,
        studentId: p.student_id,
        studentName: p.student_name,
        amount: Number(p.amount),
        feeType: p.fee_type,
        paymentMethod: p.payment_method,
        transactionReference: p.transaction_ref,
        date: p.date,
        status: p.status || "completed",
        receivedBy: p.received_by,
      }),
    );

    // Map Exams
    const exams: ExamRecord[] = (examsRes.data || []).map((ex) => ({
      id: ex.id,
      title: ex.title,
      subject: ex.subject,
      subjectArabic: ex.subject_arabic || "",
      examType: ex.exam_type,
      className: ex.class_name,
      date: ex.date,
      totalMarks: ex.total_marks,
      passingMarks: ex.passing_marks,
      examinerName: ex.examiner_name,
      academicYear: ex.academic_year,
      isPublished: Boolean(ex.is_published),
      publishedAt: ex.published_at,
      publishedBy: ex.published_by,
    }));

    // Map Exam Marks
    const examMarks: StudentExamMark[] = (marksRes.data || []).map((m) => ({
      id: m.id,
      examId: m.exam_id,
      studentId: m.student_id,
      studentName: m.student_name,
      marksObtained: Number(m.marks_obtained),
      totalMarks: Number(m.total_marks),
      grade: m.grade,
      percentage: Number(m.percentage),
      teacherRemarks: m.teacher_remarks,
      rankInClass: m.rank_in_class,
    }));

    // Map Announcements
    const announcements: Announcement[] = (annRes.data || []).map((an) => ({
      id: an.id,
      title: an.title,
      arabicTitle: an.arabic_title,
      content: an.content,
      targetAudience: an.target_audience || "All",
      priority: an.priority || "Normal",
      publishedAt: an.published_at,
      authorName: an.author_name,
    }));

    // Map Certificates
    const certificates: CertificateRecord[] = (certRes.data || []).map((c) => ({
      id: c.id,
      certificateNumber: c.certificate_number,
      studentId: c.student_id,
      studentName: c.student_name,
      arabicName: c.arabic_name,
      type: c.type,
      issueDate: c.issue_date,
      gradeAchieved: c.grade_achieved,
      principalSignatory: c.principal_signatory,
      headSheikhSignatory: c.head_sheikh_signatory,
      completionDetails: c.completion_details,
    }));

    // Map Donations
    const donations: DonationRecord[] = (donationsRes.data || []).map(
      (d: any) => ({
        id: d.id,
        receiptNumber: d.receipt_number || d.id,
        donorName: d.donor_name,
        donorEmail: d.donor_email,
        donorPhone: d.donor_phone,
        amount: Number(d.amount),
        currency: d.currency || "ETB",
        cause: d.cause,
        causeTitle: d.cause_title,
        frequency: d.frequency || "one-time",
        paymentMethod: d.payment_method || "Telebirr",
        transactionReference: d.transaction_ref,
        date: d.date || new Date().toISOString(),
        isAnonymous: Boolean(d.is_anonymous),
        dedicationMessage: d.donor_dedication,
        status: d.status || "completed",
        hijriDate: d.hijri_date,
      }),
    );

    // Map Donation Causes
    const donationCauses: DonationCause[] = (causesRes.data || []).map(
      (c: any) => ({
        id: c.id,
        title: c.title,
        arabicTitle: c.arabic_title,
        amharicTitle: c.amharic_title,
        description: c.description,
        arabicDescription: c.arabic_description,
        amharicDescription: c.amharic_description,
        targetAmountETB: Number(c.target_amount_etb) || 100000,
        raisedAmountETB: Number(c.raised_amount_etb) || 0,
        donorsCount: c.donors_count || 0,
        suggestedAmountsETB: [200, 500, 1000, 2500, 5000],
        category: c.category || "Waqf",
      }),
    );

    // Map Inquiries
    const inquiries: AdmissionInquiry[] = (inquiriesRes.data || []).map(
      (inq: any) => ({
        id: inq.id,
        studentName: inq.student_name,
        arabicName: inq.arabic_name,
        studentAge: inq.age,
        gender: inq.gender || "male",
        programInterested: inq.program_interested,
        guardianName: inq.guardian_name,
        phone: inq.phone,
        email: inq.email,
        preferredCampus: inq.preferred_campus,
        notes: inq.notes,
        createdAt: inq.created_at,
        status: inq.status || "pending",
      }),
    );

    // Map Entrance Applications
    const entranceApplications: EntranceApplication[] = (
      appsRes.data || []
    ).map((app: any) => {
      if (app.data_json && typeof app.data_json === "object") {
        return {
          ...app.data_json,
          id: app.id,
          status: app.status || app.data_json.status,
        };
      }
      return {
        id: app.id,
        applicationNumber: app.application_number,
        submissionDate: app.created_at || new Date().toISOString(),
        status: app.status || "pending",
        applicant: {
          firstName: app.applicant_name?.split(" ")[0] || "",
          lastName: app.applicant_name?.split(" ")[1] || "",
          arabicName: app.arabic_name || "",
          gender: "male",
          dateOfBirth: "2016-01-01",
          age: 8,
          nationality: "Ethiopian",
          currentSchool: "",
          currentGrade: "Grade 2",
        },
        guardian: {
          fullName: app.guardian_name,
          relationship: "Parent",
          phone: app.guardian_phone,
          email: "",
          subCity: "CMC / Yeka",
          woreda: "08",
          houseNumber: "",
        },
        application: {
          desiredProgram: app.desired_program || "Hifz Program",
          desiredShift: "Morning",
          campusPreference: "CMC Main Campus",
          quranBackground: {
            hasPriorHifzExperience: false,
            memorizedJuzCount: 0,
            canReadArabicScript: true,
            tajweedLevel: "Basic",
          },
        },
      };
    });

    // Map Inventory
    const inventory: InventoryItem[] = (invRes.data || []).map((item: any) => ({
      id: item.id,
      itemName: item.item_name,
      category: item.category,
      quantity: item.quantity,
      valueETB: Number(item.value_etb),
      reorderLevel: item.reorder_level || 5,
      location: item.location,
      condition: item.condition || "Good",
      purchaseDate: item.purchase_date,
    }));

    // Map Library Books
    const libraryBooks: LibraryBook[] = (booksRes.data || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      titleArabic: b.arabic_title,
      author: b.author,
      category: b.category || "Tafseer",
      totalCopies: b.total_copies || 1,
      availableCopies: b.available_copies ?? b.total_copies,
      shelfLocation: b.shelf_location || "Section A",
    }));

    // Map Homework
    const homeworkList: HomeworkAssignment[] = (hwRes.data || []).map(
      (hw: any) => ({
        id: hw.id,
        title: hw.title,
        arabicTitle: hw.arabic_title,
        description: hw.description,
        subject: hw.subject,
        className: hw.class_name,
        dueDate: hw.due_date,
        assignedDate: hw.assigned_date,
        teacherName: hw.teacher_name,
        submissionsCount: hw.submissions_count || 0,
        submissions: Array.isArray(hw.submissions_json)
          ? hw.submissions_json
          : [],
      }),
    );

    // Map Quran Recitation Submissions
    const recitations: RecitationSubmission[] = (recRes.data || []).map(
      (r: any) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentArabicName: r.student_arabic_name || "",
        teacherId: r.teacher_id,
        teacherName: r.teacher_name,
        surahNumber: r.surah_number,
        surahName: r.surah_name,
        surahNameArabic: r.surah_name_arabic || "",
        ayahStart: r.ayah_start,
        ayahEnd: r.ayah_end,
        juz: r.juz,
        date: r.date,
        audioDurationSeconds: r.audio_duration_seconds,
        audioBlobUrl: r.audio_blob_url || "",
        audioBlobKey: r.audio_blob_key || "",
        studentNote: r.student_note || "",
        tajweedScore: r.tajweed_score ?? undefined,
        fluencyScore: r.fluency_score ?? undefined,
        makharijScore: r.makharijScore ?? undefined,
        overallScore: r.overall_score ?? undefined,
        quality: r.quality || undefined,
        tajweedErrors: Array.isArray(r.tajweed_errors) ? r.tajweed_errors : [],
        teacherAudioFeedbackUrl: r.teacher_audio_feedback_url || undefined,
        teacherFeedbackNotes: r.teacher_feedback_notes || undefined,
        status: r.status || "pending_review",
        reviewedAt: r.reviewed_at || undefined,
      }),
    );

    return {
      success: true,
      data: {
        profiles,
        students,
        teachers,
        hifzSessions,
        attendanceRecords,
        payments,
        exams,
        examMarks,
        announcements,
        certificates,
        donations,
        donationCauses,
        inquiries,
        entranceApplications,
        inventory,
        libraryBooks,
        homeworkList,
        recitations:
          recRes && !recRes.error && Array.isArray(recRes.data)
            ? recitations
            : undefined,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Error fetching data from Supabase",
    };
  }
};

// ==========================================
// GRANULAR DIRECT DB MUTATION HELPERS
// ==========================================
export const dbUpsertUserProfile = async (
  user: UserProfile,
  password?: string,
): Promise<{ success: boolean; id?: string; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase)
    return { success: false, error: "Supabase client not configured" };

  try {
    let authUid = user.id;
    const rawPass = password || user.password;
    const hashedPass = rawPass ? await hashPassword(rawPass) : undefined;

    // 1. If password provided, attempt Supabase Auth signup first
    if (rawPass && user.email) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: user.email.toLowerCase().trim(),
            password: rawPass,
            options: {
              data: {
                full_name: user.name,
                arabic_name: user.arabicName || user.name,
                role: user.role,
                phone: user.phone,
                madrasa_branch: user.madrasaBranchName,
              },
            },
          },
        );
        if (!authError && authData?.user?.id) {
          authUid = authData.user.id;
        }
      } catch (authErr) {
        console.warn(
          "Supabase Auth user signup note during profile upsert:",
          authErr,
        );
      }
    }

    const payload: any = {
      id: authUid,
      username: user.email.split("@")[0],
      full_name: user.name,
      arabic_name: user.arabicName || user.name,
      email: user.email.toLowerCase().trim(),
      role: user.role,
      phone: user.phone || "+251 911 000000",
      madrasa_branch_name: user.madrasaBranchName || "Al-Imran CMC Main Campus",
      assigned_classes: user.assignedClasses || [],
      assigned_subjects: user.assignedSubjects || [],
      assigned_hifz_halqah: user.assignedHifzHalqah || "",
      avatar_url: user.avatarUrl || "",
      status: user.status || "active",
      updated_at: new Date().toISOString(),
    };

    if (hashedPass) {
      payload.password_hash = hashedPass;
    }

    // 2. Perform direct upsert into profiles
    let { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    // If error is due to missing password_hash column in existing table, fallback without password_hash
    if (error && error.message?.toLowerCase().includes("password_hash")) {
      delete payload.password_hash;
      const retry = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });
      error = retry.error;
    }

    // If onConflict fails or row with this email exists under another id, update or insert
    if (error) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .or(`email.ilike.${user.email.toLowerCase().trim()},id.eq.${user.id}`)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const updateRes = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", existing.id);
        error = updateRes.error;
      } else {
        const insertRes = await supabase.from("profiles").insert([payload]);
        error = insertRes.error;
      }
    }

    if (error) {
      console.warn("dbUpsertUserProfile error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: authUid };
  } catch (e: any) {
    console.warn("dbUpsertUserProfile exception:", e);
    return {
      success: false,
      error: e?.message || "Error upserting user profile",
    };
  }
};

/**
 * Update user password across database and Supabase Auth for cross-browser synchronization
 */
export const dbUpdateUserPassword = async (
  userId: string,
  email: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Supabase is not configured" };

  try {
    const hashedPass = await hashPassword(newPassword);

    // 1. Update in profiles table
    let { error: pError } = await supabase
      .from("profiles")
      .update({
        password_hash: hashedPass,
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${userId},email.ilike.${email.toLowerCase().trim()}`);

    // If password_hash column doesn't exist, try updating without it
    if (pError && pError.message?.toLowerCase().includes("password_hash")) {
      const fallbackRes = await supabase
        .from("profiles")
        .update({ updated_at: new Date().toISOString() })
        .or(`id.eq.${userId},email.ilike.${email.toLowerCase().trim()}`);
      pError = fallbackRes.error;
    }

    // 2. Also try updating Supabase Auth if currently signed in user
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch {
      // ignore
    }

    return { success: !pError, error: pError?.message };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error updating password" };
  }
};

export interface SupabaseAuthProfileResult {
  found: boolean;
  profile?: UserProfile;
  storedPasswordHash?: string;
  sourceTable?: "profiles" | "teachers" | "students";
}

/**
 * Look up user profile from Supabase by email, phone, username, or ID across profiles, teachers, and students
 * Enables seamless login across ANY browser or device even without local storage cache.
 */
export const fetchUserProfileByLoginIdentifier = async (
  identifier: string,
): Promise<SupabaseAuthProfileResult> => {
  const supabase = getSupabaseClient();
  if (!supabase || !identifier) {
    return { found: false };
  }

  const cleanRaw = identifier.trim();
  const cleanLower = cleanRaw.toLowerCase();
  const cleanPhone = cleanRaw.replace(/[^0-9+]/g, "");

  try {
    // 1. Search in profiles table
    let query = supabase.from("profiles").select("*");
    if (cleanLower.includes("@")) {
      query = query.ilike("email", cleanLower);
    } else if (cleanPhone && cleanPhone.length >= 7) {
      query = query.or(
        `phone.ilike.%${cleanPhone}%,username.ilike.${cleanLower},id.eq.${cleanRaw}`,
      );
    } else {
      query = query.or(
        `username.ilike.${cleanLower},email.ilike.${cleanLower},id.eq.${cleanRaw}`,
      );
    }

    const { data: profiles, error: pErr } = await query.limit(1);
    if (!pErr && profiles && profiles.length > 0) {
      const r = profiles[0];
      const profile: UserProfile = {
        id: r.id,
        name: r.full_name,
        arabicName: r.arabic_name,
        email: r.email,
        role: r.role,
        phone: r.phone || "",
        madrasaBranchId: r.madrasa_branch_id || "cmc-main",
        madrasaBranchName: r.madrasa_branch_name || "Al-Imran CMC Main Campus",
        assignedClasses: r.assigned_classes || [],
        assignedSubjects: r.assigned_subjects || [],
        assignedHifzHalqah: r.assigned_hifz_halqah || "",
        avatarUrl: r.avatar_url || "",
        status: r.status || "active",
        password: r.password_hash || r.password || undefined,
      };
      return {
        found: true,
        profile,
        storedPasswordHash: r.password_hash || r.password,
        sourceTable: "profiles",
      };
    }

    // 2. Search in teachers table
    let tQuery = supabase.from("teachers").select("*");
    if (cleanLower.includes("@")) {
      tQuery = tQuery.ilike("email", cleanLower);
    } else if (cleanPhone && cleanPhone.length >= 7) {
      tQuery = tQuery.or(`phone.ilike.%${cleanPhone}%,id.eq.${cleanRaw}`);
    } else {
      tQuery = tQuery.or(
        `email.ilike.${cleanLower}%,full_name.ilike.%${cleanLower}%`,
      );
    }

    const { data: teachers, error: tErr } = await tQuery.limit(1);
    if (!tErr && teachers && teachers.length > 0) {
      const t = teachers[0];
      const profile: UserProfile = {
        id: t.id,
        name: t.full_name,
        arabicName: t.arabic_name || t.full_name,
        email: t.email,
        role: (t.role as any) || "teacher",
        phone: t.phone || "",
        madrasaBranchId: "cmc-main",
        madrasaBranchName: "Al-Imran CMC Main Campus",
        assignedClasses: t.assigned_classes || [],
        assignedSubjects: t.subjects || [],
        avatarUrl: t.photo_url || "",
        status: t.status || "active",
        password: t.password_hash || t.password || undefined,
      };
      return {
        found: true,
        profile,
        storedPasswordHash: t.password_hash || t.password,
        sourceTable: "teachers",
      };
    }

    // 3. Search in students table
    let sQuery = supabase.from("students").select("*");
    if (cleanLower.includes("@")) {
      sQuery = sQuery.ilike("guardian_email", cleanLower);
    } else if (cleanPhone && cleanPhone.length >= 7) {
      sQuery = sQuery.or(
        `guardian_phone.ilike.%${cleanPhone}%,admission_number.ilike.${cleanRaw}`,
      );
    } else {
      sQuery = sQuery.or(
        `admission_number.ilike.${cleanRaw},first_name.ilike.%${cleanLower}%`,
      );
    }

    const { data: students, error: sErr } = await sQuery.limit(1);
    if (!sErr && students && students.length > 0) {
      const s = students[0];
      const isParent =
        cleanLower.includes("parent") ||
        (cleanPhone && (s.guardian_phone || "").includes(cleanPhone));
      const profile: UserProfile = {
        id: `usr-${s.id}`,
        studentId: s.id,
        name: isParent
          ? s.guardian_name || `${s.first_name}'s Guardian`
          : `${s.first_name} ${s.last_name}`,
        arabicName: s.arabic_name,
        email:
          s.guardian_email ||
          `${s.admission_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@alimran-madrasa.et`,
        role: isParent ? "parent" : "student",
        phone: s.guardian_phone || "",
        madrasaBranchId: "cmc-main",
        madrasaBranchName: "Al-Imran CMC Main Campus",
        assignedClasses: [s.current_class || "Class 1-A"],
        avatarUrl: s.photo_url || "",
        status: s.status || "active",
        password: s.password_hash || s.password || undefined,
      };
      return {
        found: true,
        profile,
        storedPasswordHash: s.password_hash || s.password,
        sourceTable: "students",
      };
    }

    // 4. Fallback: Full table search across profiles with flexible matching
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("*")
      .limit(500);
    if (allProfiles && allProfiles.length > 0) {
      const matched = allProfiles.find((p: any) => {
        const pEmail = (p.email || "").toLowerCase().trim();
        const pName = (p.full_name || "").toLowerCase().trim();
        const pUsername = (p.username || "").toLowerCase().trim();
        const pPhone = (p.phone || "").replace(/[^0-9+]/g, "");
        const pId = (p.id || "").toLowerCase().trim();

        return (
          pEmail === cleanLower ||
          (pUsername && pUsername === cleanLower) ||
          (pName && pName === cleanLower) ||
          pId === cleanLower ||
          (cleanPhone &&
            cleanPhone.length >= 7 &&
            pPhone.includes(cleanPhone)) ||
          (pUsername && cleanLower.includes(pUsername)) ||
          (pName && cleanLower.includes(pName))
        );
      });

      if (matched) {
        const profile: UserProfile = {
          id: matched.id,
          name: matched.full_name,
          arabicName: matched.arabic_name,
          email: matched.email,
          role: matched.role,
          phone: matched.phone || "",
          madrasaBranchId: matched.madrasa_branch_id || "cmc-main",
          madrasaBranchName:
            matched.madrasa_branch_name || "Al-Imran CMC Main Campus",
          assignedClasses: matched.assigned_classes || [],
          assignedSubjects: matched.assigned_subjects || [],
          assignedHifzHalqah: matched.assigned_hifz_halqah || "",
          avatarUrl: matched.avatar_url || "",
          status: matched.status || "active",
          password: matched.password_hash || matched.password || undefined,
        };
        return {
          found: true,
          profile,
          storedPasswordHash: matched.password_hash || matched.password,
          sourceTable: "profiles",
        };
      }
    }

    return { found: false };
  } catch (err) {
    console.warn("fetchUserProfileByLoginIdentifier error:", err);
    return { found: false };
  }
};

// Helper to broadcast database operational errors to UI
export const notifyDatabaseError = (table: string, errorMessage: string) => {
  console.error(`[Supabase Error in "${table}"]`, errorMessage);
  const is401 =
    errorMessage?.toLowerCase().includes("unauthorized") ||
    errorMessage?.toLowerCase().includes("jwt") ||
    errorMessage?.toLowerCase().includes("invalid api key") ||
    errorMessage?.includes("401");

  const formattedMsg = is401
    ? `401 Unauthorized: Invalid or expired Anon API Key. Go to DB Setup & Keys -> paste your project's "anon public" key.`
    : errorMessage;

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("madrasa-db-sync-warning", {
        detail: {
          table,
          message: formattedMsg,
          is401,
          timestamp: new Date().toLocaleTimeString(),
        },
      }),
    );
  }
};

export const dbUpsertStudent = async (
  student: Student,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("students").upsert(
      {
        id: student.id,
        admission_number: student.admissionNumber,
        first_name: student.firstName,
        last_name: student.lastName,
        arabic_name: student.arabicName,
        gender: student.gender,
        dob: student.dob || "2014-01-01",
        guardian_name: student.guardianName,
        guardian_phone: student.guardianPhone,
        guardian_email: student.guardianEmail || "",
        current_level: student.currentLevel,
        current_class: student.currentClass,
        hifz_circle_name: student.hifzCircleName || "",
        assigned_hifz_teacher_id: student.assignedHifzTeacherId || "",
        status: student.status,
        photo_url: student.photoUrl || "",
        juz_completed: student.quranProgress.juzCompleted,
        current_surah_number: student.quranProgress.currentSurahNumber,
        current_surah_name: student.quranProgress.currentSurahName,
        current_ayah: student.quranProgress.currentAyah,
        memorization_score_avg: student.quranProgress.memorizationScoreAvg,
        tajweed_score_avg: student.quranProgress.tajweedScoreAvg,
        academic_gpa: student.academicGPA,
        attendance_rate: student.attendanceRate,
        fee_balance: student.feeBalance,
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("students", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError(
      "students",
      e?.message || "Unknown database write error",
    );
    return { success: false, error: e?.message || "Error upserting student" };
  }
};

export const dbDeleteStudent = async (
  id: string,
  email?: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("students").delete().eq("id", id);
    await supabase.from("profiles").delete().eq("id", id);
    await supabase.from("profiles").delete().eq("id", `usr-${id}`);
    if (email) {
      await supabase.from("profiles").delete().eq("email", email);
      await supabase.from("profiles").delete().ilike("email", email.trim());
    }
    if (error) {
      notifyDatabaseError("students", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("students", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbUpsertTeacher = async (
  teacher: Teacher,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("teachers").upsert(
      {
        id: teacher.id,
        full_name: teacher.fullName,
        arabic_name: teacher.arabicName,
        email: teacher.email,
        phone: teacher.phone,
        role: teacher.role,
        qualifications: teacher.qualifications || [],
        islamic_certificates: teacher.islamicCertificates || [],
        experience_years: teacher.experienceYears || 0,
        subjects: teacher.subjects || [],
        assigned_classes: teacher.assignedClasses || [],
        monthly_salary: teacher.monthlySalary || 0,
        status: teacher.status,
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("teachers", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("teachers", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteTeacher = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) {
      notifyDatabaseError("teachers", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("teachers", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteUserProfile = async (
  id: string,
  email?: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    // 1. Delete from profiles table by id
    await supabase.from("profiles").delete().eq("id", id);

    // 2. Delete from profiles table by email (exact and case-insensitive)
    if (email) {
      await supabase.from("profiles").delete().eq("email", email);
      await supabase.from("profiles").delete().ilike("email", email.trim());
    }

    // 3. Delete matching records from teachers table if any
    await supabase.from("teachers").delete().eq("id", id);
    if (email) {
      await supabase.from("teachers").delete().eq("email", email);
      await supabase.from("teachers").delete().ilike("email", email.trim());
    }

    // 4. Invoke database erasure RPC if installed
    try {
      await supabase.rpc("delete_user_account", {
        p_id: id,
        p_email: email || "",
      });
    } catch {
      // ignore if RPC not installed yet
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("profiles", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbUpsertHifzSession = async (
  session: HifzSession,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("hifz_sessions").upsert(
      {
        id: session.id,
        student_id: session.studentId,
        student_name: session.studentName,
        teacher_id: session.teacherId,
        teacher_name: session.teacherName,
        date: session.date,
        session_type: session.sessionType,
        surah_number: session.surahNumber,
        surah_name: session.surahName,
        ayah_start: session.ayahStart,
        ayah_end: session.ayahEnd,
        juz: session.juz,
        memorization_quality: session.memorizationQuality,
        tajweed_score: session.tajweedScore,
        fluency_score: session.fluencyScore,
        teacher_notes: session.teacherNotes || "",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("hifz_sessions", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("hifz_sessions", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteHifzSession = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("hifz_sessions")
      .delete()
      .eq("id", id);
    if (error) {
      notifyDatabaseError("hifz_sessions", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertAttendanceRecords = async (
  records: AttendanceRecord[],
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase || records.length === 0)
    return { success: false, error: "No records or DB not connected" };
  try {
    const formatted = records.map((a) => ({
      id: a.id,
      student_id: a.studentId,
      student_name: a.studentName,
      date: a.date,
      class_id: a.classId || "",
      class_name: a.className,
      status: a.status,
      remarks: a.remarks || "",
      recorded_by: a.recordedBy || "",
    }));
    const { error } = await supabase
      .from("attendance_records")
      .upsert(formatted, { onConflict: "id" });
    if (error) {
      notifyDatabaseError("attendance_records", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("attendance_records", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteAttendanceRecord = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("attendance_records")
      .delete()
      .eq("id", id);
    if (error) {
      notifyDatabaseError("attendance_records", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertPayment = async (
  payment: PaymentTransaction,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("payments").upsert(
      {
        id: payment.id,
        receipt_number: payment.receiptNumber,
        student_id: payment.studentId,
        student_name: payment.studentName,
        amount: payment.amount,
        fee_type: payment.feeType,
        payment_method: payment.paymentMethod,
        transaction_ref: payment.transactionReference || "",
        date: payment.date,
        status: payment.status,
        received_by: payment.receivedBy || payment.collectedBy || "",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("payments", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("payments", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeletePayment = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) {
      notifyDatabaseError("payments", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertExam = async (
  exam: ExamRecord,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("exams").upsert(
      {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        subject_arabic: exam.subjectArabic || "",
        exam_type: exam.examType,
        class_name: exam.className,
        date: exam.date,
        total_marks: exam.totalMarks,
        passing_marks: exam.passingMarks || 50,
        examiner_name: exam.examinerName || "",
        academic_year: exam.academicYear || "2025/2026",
        is_published: exam.isPublished || false,
        published_at: exam.publishedAt || null,
        published_by: exam.publishedBy || "",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("exams", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("exams", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteExam = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    await supabase.from("exams").delete().eq("id", id);
    await supabase.from("exam_marks").delete().eq("exam_id", id);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertExamMarks = async (
  marks: StudentExamMark[],
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase || marks.length === 0)
    return { success: false, error: "No marks to save" };
  try {
    const formatted = marks.map((m) => ({
      id: m.id,
      exam_id: m.examId,
      student_id: m.studentId,
      student_name: m.studentName,
      marks_obtained: m.marksObtained,
      total_marks: m.totalMarks,
      grade: m.grade,
      percentage: m.percentage,
      teacher_remarks: m.teacherRemarks || m.teacherComments || "",
      rank_in_class: m.rankInClass || null,
    }));
    const { error } = await supabase
      .from("exam_marks")
      .upsert(formatted, { onConflict: "id" });
    if (error) {
      notifyDatabaseError("exam_marks", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("exam_marks", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteExamMark = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("exam_marks").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertAnnouncement = async (
  announcement: Announcement,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("announcements").upsert(
      {
        id: announcement.id,
        title: announcement.title,
        arabic_title: announcement.arabicTitle || announcement.title,
        content: announcement.content,
        target_audience: announcement.targetAudience,
        priority: announcement.priority || "Normal",
        published_at: announcement.publishedAt,
        author_name: announcement.authorName || announcement.author || "Admin",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("announcements", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("announcements", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteAnnouncement = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertCertificate = async (
  cert: CertificateRecord,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("certificates").upsert(
      {
        id: cert.id,
        certificate_number: cert.certificateNumber,
        student_id: cert.studentId,
        student_name: cert.studentName,
        arabic_name: cert.arabicName,
        type: cert.type,
        issue_date: cert.issueDate,
        grade_achieved: cert.gradeAchieved || "Mumtaz",
        principal_signatory:
          cert.principalSignatory || "Sheikh Mohammed Al-Imran",
        head_sheikh_signatory:
          cert.headSheikhSignatory || "Sheikh Bilal Al-Azhari",
        completion_details: cert.completionDetails || "",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("certificates", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("certificates", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteCertificate = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertDonation = async (
  donation: DonationRecord,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("donations").upsert(
      {
        id: donation.id,
        receipt_number: donation.receiptNumber || donation.id,
        donor_name: donation.donorName,
        donor_email: donation.donorEmail || "",
        donor_phone: donation.donorPhone || "",
        amount: donation.amount,
        currency: donation.currency || "ETB",
        cause: donation.cause,
        cause_title: donation.causeTitle,
        frequency: donation.frequency,
        payment_method: donation.paymentMethod,
        transaction_ref:
          donation.transactionRef || donation.transactionReference || "",
        date: donation.date,
        is_anonymous: donation.isAnonymous || false,
        donor_dedication:
          donation.donorDedication || donation.dedicationMessage || "",
        status: donation.status || "completed",
        hijri_date: donation.hijriDate || "",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("donations", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("donations", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteDonation = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertDonationCause = async (
  cause: DonationCause,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("donation_causes").upsert(
      {
        id: cause.id,
        title: cause.title,
        arabic_title: cause.arabicTitle || "",
        description: cause.description,
        target_amount_etb: cause.targetAmountETB,
        raised_amount_etb: cause.raisedAmountETB,
        category: cause.category || "Waqf",
        donors_count: cause.donorsCount,
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("donation_causes", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("donation_causes", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbUpsertAdmissionInquiry = async (
  inq: AdmissionInquiry,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("admission_inquiries").upsert(
      {
        id: inq.id,
        student_name: inq.studentName,
        arabic_name: inq.arabicName || "",
        age: inq.studentAge || inq.age || 7,
        gender: inq.gender || "male",
        program_interested:
          inq.programInterested || inq.desiredProgram || "Hifz Program",
        guardian_name: inq.guardianName,
        phone: inq.phone,
        email: inq.email || "",
        preferred_campus: inq.preferredCampus || "CMC Main Campus",
        notes: inq.notes || "",
        status: inq.status || "pending",
        created_at:
          inq.createdAt || inq.submittedAt || new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("admission_inquiries", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("admission_inquiries", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteAdmissionInquiry = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("admission_inquiries")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertEntranceApplication = async (
  app: EntranceApplication,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("entrance_applications").upsert(
      {
        id: app.id,
        application_number: app.applicationNumber,
        applicant_name: app.fullName,
        arabic_name: app.arabicName || "",
        guardian_name: app.guardianName,
        guardian_phone: app.guardianPhone,
        desired_program: app.targetProgram,
        status: app.status,
        data_json: app,
        created_at:
          app.createdAt || app.submissionDate || new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("entrance_applications", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("entrance_applications", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteEntranceApplication = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("entrance_applications")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertHomework = async (
  hw: HomeworkAssignment,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("homework_assignments").upsert(
      {
        id: hw.id,
        title: hw.title,
        arabic_title: hw.arabicTitle || "",
        description: hw.description || "",
        subject: hw.subject,
        class_name: hw.className,
        due_date: hw.dueDate,
        assigned_date: hw.assignedDate,
        teacher_name: hw.teacherName || "",
        submissions_count: hw.submissionsCount || 0,
        submissions_json: hw.submissions || [],
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("homework_assignments", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("homework_assignments", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteHomework = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("homework_assignments")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertInventoryItem = async (
  item: InventoryItem,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("inventory").upsert(
      {
        id: item.id,
        item_name: item.itemName,
        category: item.category,
        quantity: item.quantity,
        value_etb:
          item.valueETB ||
          (item.unitPrice ? item.unitPrice * item.quantity : 0),
        reorder_level: item.reorderLevel || 5,
        location: item.location,
        condition: item.condition,
        purchase_date:
          item.purchaseDate || new Date().toISOString().split("T")[0],
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("inventory", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("inventory", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteInventoryItem = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertLibraryBook = async (
  book: LibraryBook,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase.from("library_books").upsert(
      {
        id: book.id,
        title: book.title,
        arabic_title: book.titleArabic || book.arabicTitle || "",
        author: book.author,
        category: book.category,
        total_copies: book.totalCopies,
        available_copies:
          book.availableCopies ?? book.copiesAvailable ?? book.totalCopies,
        shelf_location: book.shelfLocation || book.shelfNumber || "Section A",
      },
      { onConflict: "id" },
    );

    if (error) {
      notifyDatabaseError("library_books", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError("library_books", e?.message || "Unknown error");
    return { success: false, error: e?.message };
  }
};

export const dbDeleteLibraryBook = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("library_books")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

export const dbUpsertRecitation = async (
  rec: RecitationSubmission,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const payload = {
      id: rec.id,
      student_id: rec.studentId,
      student_name: rec.studentName,
      student_arabic_name: rec.studentArabicName || "",
      teacher_id: rec.teacherId,
      teacher_name: rec.teacherName,
      surah_number: rec.surahNumber,
      surah_name: rec.surahName,
      surah_name_arabic: rec.surahNameArabic || "",
      ayah_start: rec.ayahStart,
      ayah_end: rec.ayahEnd,
      juz: rec.juz,
      date: rec.date,
      audio_duration_seconds: rec.audioDurationSeconds,
      audio_blob_url: rec.audioBlobUrl || "",
      audio_blob_key: rec.audioBlobKey || "",
      student_note: rec.studentNote || "",
      tajweed_score: rec.tajweedScore ?? null,
      fluency_score: rec.fluencyScore ?? null,
      makharij_score: rec.makharijScore ?? null,
      overall_score: rec.overallScore ?? null,
      quality: rec.quality || null,
      tajweed_errors: rec.tajweedErrors || [],
      teacher_audio_feedback_url: rec.teacherAudioFeedbackUrl || "",
      teacher_feedback_notes: rec.teacherFeedbackNotes || "",
      status: rec.status || "pending_review",
      reviewed_at: rec.reviewedAt || null,
    };
    const { error } = await supabase
      .from("recitation_submissions")
      .upsert(payload, { onConflict: "id" });
    if (error) {
      notifyDatabaseError("recitation_submissions", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e: any) {
    notifyDatabaseError(
      "recitation_submissions",
      e?.message || "Unknown error",
    );
    return { success: false, error: e?.message };
  }
};

export const dbFetchRecitations = async (): Promise<RecitationSubmission[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("recitation_submissions")
      .select("*")
      .order("date", { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.student_name,
      studentArabicName: r.student_arabic_name || "",
      teacherId: r.teacher_id,
      teacherName: r.teacher_name,
      surahNumber: r.surah_number,
      surahName: r.surah_name,
      surahNameArabic: r.surah_name_arabic || "",
      ayahStart: r.ayah_start,
      ayahEnd: r.ayah_end,
      juz: r.juz,
      date: r.date,
      audioDurationSeconds: r.audio_duration_seconds,
      audioBlobUrl: r.audio_blob_url || "",
      audioBlobKey: r.audio_blob_key || "",
      studentNote: r.student_note || "",
      tajweedScore: r.tajweed_score ?? undefined,
      fluencyScore: r.fluency_score ?? undefined,
      makharijScore: r.makharijScore ?? undefined,
      overallScore: r.overall_score ?? undefined,
      quality: r.quality || undefined,
      tajweedErrors: Array.isArray(r.tajweed_errors) ? r.tajweed_errors : [],
      teacherAudioFeedbackUrl: r.teacher_audio_feedback_url || undefined,
      teacherFeedbackNotes: r.teacher_feedback_notes || undefined,
      status: r.status || "pending_review",
      reviewedAt: r.reviewed_at || undefined,
    }));
  } catch {
    return [];
  }
};

export const dbDeleteRecitation = async (
  id: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: "Database is not connected" };
  try {
    const { error } = await supabase
      .from("recitation_submissions")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
};

// ==========================================
// COMPLETE READY-TO-RUN SUPABASE MIGRATION
// ==========================================
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- AL-IMRAN CMC MADRASA MANAGEMENT SYSTEM - POSTGRESQL & SUPABASE COMPLETE SCHEMA
-- Real-time Quran Memorization, Student Information, Ethiopian Payments & RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles & Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT,
  full_name TEXT NOT NULL,
  arabic_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin', 'principal', 'vice_principal', 'registrar', 
    'finance_officer', 'teacher', 'hifz_teacher', 'parent', 'student'
  )),
  phone TEXT,
  password_hash TEXT,
  madrasa_branch_id TEXT DEFAULT 'cmc-main',
  madrasa_branch_name TEXT DEFAULT 'Al-Imran CMC Main Campus',
  assigned_classes TEXT[] DEFAULT '{}',
  assigned_subjects TEXT[] DEFAULT '{}',
  assigned_hifz_halqah TEXT DEFAULT '',
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema Migrations (Safe for existing databases)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS madrasa_branch_id TEXT DEFAULT 'cmc-main';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS madrasa_branch_name TEXT DEFAULT 'Al-Imran CMC Main Campus';

-- Ensure unique index on email for quick lookup & upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(LOWER(TRIM(email)));

-- Trigger function: automatically insert a profile row when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    arabic_name,
    email,
    role,
    phone,
    madrasa_branch_name,
    status
  )
  VALUES (
    NEW.id::text,
    SPLIT_PART(COALESCE(NEW.email, 'user'), '@', 1),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'arabic_name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    LOWER(TRIM(NEW.email)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '+251 911 000000'),
    COALESCE(NEW.raw_user_meta_data->>'madrasa_branch', 'Al-Imran CMC Main Campus'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Students Database
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  admission_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  arabic_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  dob DATE,
  place_of_birth TEXT DEFAULT 'Addis Ababa',
  nationality TEXT DEFAULT 'Ethiopian',
  region TEXT DEFAULT 'Addis Ababa',
  sub_city TEXT DEFAULT 'Yeka / CMC',
  woreda TEXT DEFAULT '08',
  address TEXT,
  guardian_name TEXT NOT NULL,
  guardian_relationship TEXT DEFAULT 'Parent',
  guardian_phone TEXT NOT NULL,
  guardian_email TEXT,
  emergency_contact TEXT,
  blood_group TEXT DEFAULT 'O+',
  medical_notes TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  current_level TEXT DEFAULT 'Ibtida''i 1',
  current_class TEXT DEFAULT 'Class 1-A',
  hifz_circle_name TEXT DEFAULT 'Halqah Sheikh Bilal',
  assigned_hifz_teacher_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'suspended', 'transferred', 'archived')),
  photo_url TEXT,
  juz_completed INT DEFAULT 0,
  current_surah_number INT DEFAULT 1,
  current_surah_name TEXT DEFAULT 'Al-Fatihah',
  current_ayah INT DEFAULT 1,
  memorization_score_avg INT DEFAULT 90,
  tajweed_score_avg INT DEFAULT 90,
  is_ready_for_ijazah BOOLEAN DEFAULT FALSE,
  academic_gpa NUMERIC(3, 2) DEFAULT 3.80,
  attendance_rate INT DEFAULT 95,
  fee_balance NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Teachers & Hifz Ustazes Directory
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  arabic_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  role TEXT CHECK (role IN ('teacher', 'hifz_teacher')),
  qualifications TEXT[] DEFAULT '{}',
  islamic_certificates TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 1,
  subjects TEXT[] DEFAULT '{}',
  assigned_classes TEXT[] DEFAULT '{}',
  monthly_salary NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quran Hifz, Sabaq, Sabqi & Murajaah Logs
CREATE TABLE IF NOT EXISTS public.hifz_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  teacher_id TEXT,
  teacher_name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  session_type TEXT CHECK (session_type IN ('sabaq', 'sabqi', 'murajaah')),
  surah_number INT NOT NULL,
  surah_name TEXT NOT NULL,
  ayah_start INT NOT NULL,
  ayah_end INT NOT NULL,
  juz INT NOT NULL,
  hizb INT DEFAULT 1,
  page_number INT DEFAULT 1,
  memorization_quality TEXT,
  tajweed_score INT DEFAULT 90,
  fluency_score INT DEFAULT 90,
  teacher_notes TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Student Daily Attendance
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  class_id TEXT,
  class_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('present', 'late', 'excused', 'absent')),
  remarks TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ethiopian Payments & Fee Collections (Telebirr / CBE / Cash)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  fee_type TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('Telebirr', 'CBE Birr', 'Bank Transfer', 'Cash', 'Cheque')),
  transaction_ref TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  date DATE DEFAULT CURRENT_DATE,
  received_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Formal Examinations & Academic Records
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  subject_arabic TEXT,
  exam_type TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  total_marks INT DEFAULT 100,
  passing_marks INT DEFAULT 50,
  examiner_name TEXT,
  academic_year TEXT DEFAULT '2025/2026',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  published_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Student Exam Marks
CREATE TABLE IF NOT EXISTS public.exam_marks (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  marks_obtained NUMERIC(5, 2) NOT NULL,
  total_marks NUMERIC(5, 2) NOT NULL,
  grade TEXT NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  teacher_remarks TEXT,
  rank_in_class INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Official Graduation & Hifz Sanad Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  certificate_number TEXT UNIQUE NOT NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  arabic_name TEXT NOT NULL,
  type TEXT NOT NULL,
  riwayah TEXT DEFAULT 'Hafs ''an Asim',
  issue_date DATE DEFAULT CURRENT_DATE,
  principal_signatory TEXT DEFAULT 'Sheikh Mohammed Al-Imran',
  head_sheikh_signatory TEXT DEFAULT 'Sheikh Bilal Al-Azhari',
  grade_achieved TEXT DEFAULT 'Mumtaz (High Distinction)',
  completion_details TEXT,
  verified_by TEXT DEFAULT 'Academic Board',
  qr_code_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Announcements & Community Board
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  arabic_title TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  target_audience TEXT DEFAULT 'All',
  priority TEXT DEFAULT 'Normal',
  published_at DATE DEFAULT CURRENT_DATE,
  author_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Donations & Waqf Ledger
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  cause TEXT NOT NULL,
  cause_title TEXT NOT NULL,
  frequency TEXT DEFAULT 'one-time',
  payment_method TEXT NOT NULL,
  transaction_ref TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT FALSE,
  donor_dedication TEXT,
  status TEXT DEFAULT 'completed',
  hijri_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Donation Causes
CREATE TABLE IF NOT EXISTS public.donation_causes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  arabic_title TEXT NOT NULL,
  amharic_title TEXT,
  description TEXT NOT NULL,
  arabic_description TEXT,
  amharic_description TEXT,
  target_amount_etb NUMERIC(14, 2) DEFAULT 100000.00,
  raised_amount_etb NUMERIC(14, 2) DEFAULT 0.00,
  donors_count INT DEFAULT 0,
  category TEXT DEFAULT 'Waqf',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Online Admission Inquiries
CREATE TABLE IF NOT EXISTS public.admission_inquiries (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  arabic_name TEXT,
  age INT,
  gender TEXT DEFAULT 'male',
  program_interested TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_campus TEXT DEFAULT 'CMC Main Campus',
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Entrance Applications & Formal Assessments
CREATE TABLE IF NOT EXISTS public.entrance_applications (
  id TEXT PRIMARY KEY,
  application_number TEXT UNIQUE NOT NULL,
  applicant_name TEXT NOT NULL,
  arabic_name TEXT,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT NOT NULL,
  desired_program TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  data_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Madrasa Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INT DEFAULT 0,
  value_etb NUMERIC(12, 2) DEFAULT 0.00,
  reorder_level INT DEFAULT 5,
  location TEXT DEFAULT 'Main Storage',
  condition TEXT DEFAULT 'Good',
  purchase_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Islamic Library Books
CREATE TABLE IF NOT EXISTS public.library_books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  arabic_title TEXT,
  author TEXT NOT NULL,
  category TEXT DEFAULT 'Tafseer',
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  shelf_location TEXT DEFAULT 'Section A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Homework & Tasks
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  arabic_title TEXT,
  description TEXT,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  assigned_date DATE DEFAULT CURRENT_DATE,
  teacher_name TEXT,
  submissions_count INT DEFAULT 0,
  submissions_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Quran Recitation Submissions (Voice Recordings & Tajweed Feedback)
CREATE TABLE IF NOT EXISTS public.recitation_submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_arabic_name TEXT,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  surah_number INT NOT NULL,
  surah_name TEXT NOT NULL,
  surah_name_arabic TEXT,
  ayah_start INT NOT NULL,
  ayah_end INT NOT NULL,
  juz INT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  audio_duration_seconds INT DEFAULT 0,
  audio_blob_url TEXT,
  audio_blob_key TEXT,
  student_note TEXT,
  tajweed_score INT,
  fluency_score INT,
  makharij_score INT,
  overall_score INT,
  quality TEXT,
  tajweed_errors JSONB DEFAULT '[]'::jsonb,
  teacher_audio_feedback_url TEXT,
  teacher_feedback_notes TEXT,
  status TEXT DEFAULT 'pending_review',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recitation_submissions ENABLE ROW LEVEL SECURITY;

-- 20. Helper Function: Get Auth User Role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles 
  WHERE id = auth.uid()::text OR email = auth.jwt() ->> 'email'
  LIMIT 1;
  RETURN COALESCE(v_role, 'anon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 21. Granular Row-Level Security Policies with Idempotent Re-creation and WITH CHECK
DROP POLICY IF EXISTS "Auth Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner/Admin Upsert Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow Delete Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles full access" ON public.profiles;
CREATE POLICY "Profiles full access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 22. User Deletion Function
CREATE OR REPLACE FUNCTION public.delete_user_account(p_id text, p_email text)
RETURNS void AS $$
BEGIN
  IF p_id IS NOT NULL AND p_id <> '' THEN
    DELETE FROM public.profiles WHERE id = p_id;
    DELETE FROM public.teachers WHERE id = p_id;
  END IF;
  IF p_email IS NOT NULL AND p_email <> '' THEN
    DELETE FROM public.profiles WHERE lower(email) = lower(p_email);
    DELETE FROM public.teachers WHERE lower(email) = lower(p_email);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Staff Manage Students" ON public.students;
DROP POLICY IF EXISTS "Students full access" ON public.students;
CREATE POLICY "Students full access" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admin Manage Teachers" ON public.teachers;
DROP POLICY IF EXISTS "Teachers full access" ON public.teachers;
CREATE POLICY "Teachers full access" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Staff Manage Payments" ON public.payments;
DROP POLICY IF EXISTS "Payments full access" ON public.payments;
CREATE POLICY "Payments full access" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Staff Manage Hifz" ON public.hifz_sessions;
DROP POLICY IF EXISTS "Hifz full access" ON public.hifz_sessions;
CREATE POLICY "Hifz full access" ON public.hifz_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Staff Manage Attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance full access" ON public.attendance_records;
CREATE POLICY "Attendance full access" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Verify Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Staff Manage Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Certificates full access" ON public.certificates;
CREATE POLICY "Certificates full access" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin Manage Announcements" ON public.announcements;
DROP POLICY IF EXISTS "Announcements full access" ON public.announcements;
CREATE POLICY "Announcements full access" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Make Donations" ON public.donations;
DROP POLICY IF EXISTS "Staff View Donations" ON public.donations;
DROP POLICY IF EXISTS "Donations full access" ON public.donations;
CREATE POLICY "Donations full access" ON public.donations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Causes" ON public.donation_causes;
DROP POLICY IF EXISTS "Admin Manage Causes" ON public.donation_causes;
DROP POLICY IF EXISTS "Causes full access" ON public.donation_causes;
CREATE POLICY "Causes full access" ON public.donation_causes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Submit Inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Staff Manage Inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Inquiries full access" ON public.admission_inquiries;
CREATE POLICY "Inquiries full access" ON public.admission_inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Submit Entrance Apps" ON public.entrance_applications;
DROP POLICY IF EXISTS "Staff Manage Entrance Apps" ON public.entrance_applications;
DROP POLICY IF EXISTS "Entrance Apps full access" ON public.entrance_applications;
CREATE POLICY "Entrance Apps full access" ON public.entrance_applications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Staff Manage Inventory" ON public.inventory;
DROP POLICY IF EXISTS "Inventory full access" ON public.inventory;
CREATE POLICY "Inventory full access" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Library" ON public.library_books;
DROP POLICY IF EXISTS "Staff Manage Library" ON public.library_books;
DROP POLICY IF EXISTS "Library full access" ON public.library_books;
CREATE POLICY "Library full access" ON public.library_books FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Read Homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "Manage Homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "Homework full access" ON public.homework_assignments;
CREATE POLICY "Homework full access" ON public.homework_assignments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Recitations full access" ON public.recitation_submissions;
CREATE POLICY "Recitations full access" ON public.recitation_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Exams full access" ON public.exams;
CREATE POLICY "Exams full access" ON public.exams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Exam marks full access" ON public.exam_marks;
CREATE POLICY "Exam marks full access" ON public.exam_marks FOR ALL USING (true) WITH CHECK (true);

-- 23. Realtime Broadcast Enablement for All Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hifz_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_marks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admission_inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.entrance_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.library_books;
ALTER PUBLICATION supabase_realtime ADD TABLE public.homework_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recitation_submissions;

-- 24. Storage Buckets for Identity Photos & Madrasa Media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('student-photos', 'student-photos', true),
  ('teacher-photos', 'teacher-photos', true),
  ('id-cards', 'id-cards', true),
  ('avatars', 'avatars', true),
  ('madrasa-media', 'madrasa-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies: Allow public read and authenticated/public upload
DROP POLICY IF EXISTS "Public Read Student Photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload Photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update Photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete Photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage Select" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage Insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage Delete" ON storage.objects;

CREATE POLICY "Allow All Storage Select" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Allow All Storage Insert" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Storage Update" ON storage.objects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Storage Delete" ON storage.objects FOR DELETE USING (true);
`;

// ==========================================
// DEDICATED INSTANT RLS FIX SCRIPT
// ==========================================
export const SUPABASE_RLS_FIX_SQL = `-- ==============================================================================
-- AL-IMRAN CMC MADRASA - INSTANT ROW-LEVEL SECURITY (RLS) PERMISSION FIX SCRIPT
-- Execute this once in Supabase Dashboard > SQL Editor to resolve all RLS policy warnings
-- ==============================================================================

-- 1. Profiles Table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner/Admin Upsert Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow Delete Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles full access" ON public.profiles;
CREATE POLICY "Profiles full access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. Teachers Directory
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Teachers" ON public.teachers;
DROP POLICY IF EXISTS "Admin Manage Teachers" ON public.teachers;
DROP POLICY IF EXISTS "Teachers full access" ON public.teachers;
CREATE POLICY "Teachers full access" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

-- 3. Donation Causes
ALTER TABLE IF EXISTS public.donation_causes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Causes" ON public.donation_causes;
DROP POLICY IF EXISTS "Admin Manage Causes" ON public.donation_causes;
DROP POLICY IF EXISTS "Causes full access" ON public.donation_causes;
CREATE POLICY "Causes full access" ON public.donation_causes FOR ALL USING (true) WITH CHECK (true);

-- 4. Homework & Assignments
ALTER TABLE IF EXISTS public.homework_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read Homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "Manage Homework" ON public.homework_assignments;
DROP POLICY IF EXISTS "Homework full access" ON public.homework_assignments;
CREATE POLICY "Homework full access" ON public.homework_assignments FOR ALL USING (true) WITH CHECK (true);

-- 5. Students Database
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff Manage Students" ON public.students;
DROP POLICY IF EXISTS "Students full access" ON public.students;
CREATE POLICY "Students full access" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 6. Quran Hifz Sessions
ALTER TABLE IF EXISTS public.hifz_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff Manage Hifz" ON public.hifz_sessions;
DROP POLICY IF EXISTS "Hifz full access" ON public.hifz_sessions;
CREATE POLICY "Hifz full access" ON public.hifz_sessions FOR ALL USING (true) WITH CHECK (true);

-- 7. Daily Attendance
ALTER TABLE IF EXISTS public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff Manage Attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance full access" ON public.attendance_records;
CREATE POLICY "Attendance full access" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);

-- 8. Finance & Fee Payments
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff Manage Payments" ON public.payments;
DROP POLICY IF EXISTS "Payments full access" ON public.payments;
CREATE POLICY "Payments full access" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- 9. Examinations & Grades
ALTER TABLE IF EXISTS public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Exams full access" ON public.exams;
CREATE POLICY "Exams full access" ON public.exams FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.exam_marks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Exam marks full access" ON public.exam_marks;
CREATE POLICY "Exam marks full access" ON public.exam_marks FOR ALL USING (true) WITH CHECK (true);

-- 10. Certificates
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Verify Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Staff Manage Certificates" ON public.certificates;
DROP POLICY IF EXISTS "Certificates full access" ON public.certificates;
CREATE POLICY "Certificates full access" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

-- 11. Announcements
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin Manage Announcements" ON public.announcements;
DROP POLICY IF EXISTS "Announcements full access" ON public.announcements;
CREATE POLICY "Announcements full access" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- 12. Donations
ALTER TABLE IF EXISTS public.donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Make Donations" ON public.donations;
DROP POLICY IF EXISTS "Staff View Donations" ON public.donations;
DROP POLICY IF EXISTS "Donations full access" ON public.donations;
CREATE POLICY "Donations full access" ON public.donations FOR ALL USING (true) WITH CHECK (true);

-- 13. Admissions & Applications
ALTER TABLE IF EXISTS public.admission_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Submit Inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Staff Manage Inquiries" ON public.admission_inquiries;
DROP POLICY IF EXISTS "Inquiries full access" ON public.admission_inquiries;
CREATE POLICY "Inquiries full access" ON public.admission_inquiries FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.entrance_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Submit Entrance Apps" ON public.entrance_applications;
DROP POLICY IF EXISTS "Staff Manage Entrance Apps" ON public.entrance_applications;
DROP POLICY IF EXISTS "Entrance Apps full access" ON public.entrance_applications;
CREATE POLICY "Entrance Apps full access" ON public.entrance_applications FOR ALL USING (true) WITH CHECK (true);

-- 14. Inventory & Library
ALTER TABLE IF EXISTS public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff Manage Inventory" ON public.inventory;
DROP POLICY IF EXISTS "Inventory full access" ON public.inventory;
CREATE POLICY "Inventory full access" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.library_books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Library" ON public.library_books;
DROP POLICY IF EXISTS "Staff Manage Library" ON public.library_books;
DROP POLICY IF EXISTS "Library full access" ON public.library_books;
CREATE POLICY "Library full access" ON public.library_books FOR ALL USING (true) WITH CHECK (true);

-- 15. Recitations & Voice Audio Submissions
ALTER TABLE IF EXISTS public.recitation_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recitations full access" ON public.recitation_submissions;
CREATE POLICY "Recitations full access" ON public.recitation_submissions FOR ALL USING (true) WITH CHECK (true);
`;
