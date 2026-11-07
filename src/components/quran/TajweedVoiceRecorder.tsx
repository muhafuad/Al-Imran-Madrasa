import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SURAHS_LIST, INITIAL_TEACHERS, INITIAL_STUDENTS } from '../../data/mockData';
import { INITIAL_RECITATIONS } from '../../data/quranJuzData';
import type {
  RecitationSubmission,
  TajweedErrorAnnotation,
  TajweedErrorCategory,
} from '../../types/quranTypes';
import { recitationAudioEngine, generateMelodiousRecitationWav } from '../../utils/audioPlayer';
import { idbSet, idbGet, idbSaveMediaBlob, idbGetMediaBlob } from '../../lib/indexedDb';
import {
  uploadAudioRecitation,
  dbUpsertRecitation,
  dbFetchRecitations,
  dbDeleteRecitation,
  isSupabaseConfigured,
} from '../../lib/supabase';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Award,
  Send,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Clock,
  User,
  Headphones,
  Tag,
  Check,
  GraduationCap,
  MessageSquare,
  FileAudio,
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
  Inbox,
  SendHorizontal,
  Cloud,
  HardDrive,
} from 'lucide-react';

const STORAGE_RECITATIONS_KEY = 'alimran_quran_recitations_v2';

export const TajweedVoiceRecorder: React.FC = () => {
  const {
    students,
    teachers,
    currentUser,
    recordHifzSession,
    allUsers,
    recitations: contextRecitations,
    addRecitation: contextAddRecitation,
    updateRecitation: contextUpdateRecitation,
    deleteRecitation: contextDeleteRecitation,
  } = useMadrasa();

  // Role detection: default to user's real role, but provide perspective switcher
  const isActualStudent = currentUser?.role === 'student';
  const isActualTeacher =
    currentUser?.role === 'teacher' ||
    currentUser?.role === 'hifz_teacher' ||
    currentUser?.role === 'principal' ||
    currentUser?.role === 'vice_principal' ||
    currentUser?.role === 'super_admin';

  const [activeRoleView, setActiveRoleView] = useState<'student' | 'teacher'>(
    isActualStudent ? 'student' : 'teacher'
  );

  // Lock view to student if user has student role
  useEffect(() => {
    if (isActualStudent && activeRoleView !== 'student') {
      setActiveRoleView('student');
    }
  }, [isActualStudent, activeRoleView]);

  const [submissions, setSubmissions] = useState<RecitationSubmission[]>(() => {
    if (contextRecitations && Array.isArray(contextRecitations) && contextRecitations.length > 0) {
      return contextRecitations;
    }
    return INITIAL_RECITATIONS;
  });

  // Keep submissions in sync with contextRecitations
  useEffect(() => {
    if (contextRecitations && Array.isArray(contextRecitations) && contextRecitations.length > 0) {
      setSubmissions((prev) => {
        const map = new Map<string, RecitationSubmission>();
        prev.forEach((r) => map.set(r.id, r));
        contextRecitations.forEach((r) => map.set(r.id, r));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
    }
  }, [contextRecitations]);

  // Unified lists of available Ustazes (combines teachers table + all registered staff/ustaz user accounts)
  const availableUstazes = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      arabicName: string;
      roleTitle: string;
      specialization: string;
      email?: string;
      phone?: string;
    }>();

    // 1. Teachers array in Madrasa context
    if (teachers && Array.isArray(teachers)) {
      teachers.forEach((t) => {
        const displayName = t.fullName || (t as any).teacherName || t.name || t.arabicName || 'Ustaz';
        const id = t.id || `tch-${(t.email || displayName).toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        map.set(id, {
          id,
          name: displayName,
          arabicName: t.arabicName || displayName,
          roleTitle: t.role === 'hifz_teacher' ? 'Hifz Sheikh (مقرئ)' : 'Ustaz / Faculty (أستاذ)',
          specialization:
            t.specialization ||
            (t.subjects && t.subjects.length > 0 ? t.subjects.join(', ') : "Qur'an Recitation & Tajweed"),
          email: t.email,
          phone: t.phone,
        });
      });
    }

    // 2. All system users registered by super admin with teacher, hifz_teacher, principal, or super_admin role
    if (allUsers && Array.isArray(allUsers)) {
      allUsers.forEach((u) => {
        const isTeacherRole =
          u.role === 'teacher' ||
          u.role === 'hifz_teacher' ||
          u.role === 'principal' ||
          u.role === 'vice_principal' ||
          u.role === 'super_admin' ||
          (u.id && u.id.startsWith('tch-')) ||
          (u.email && (u.email.toLowerCase().includes('sheikh') || u.email.toLowerCase().includes('ustaz') || u.email.toLowerCase().includes('teacher'))) ||
          (u.assignedSubjects && u.assignedSubjects.length > 0);

        if (isTeacherRole) {
          const displayName = u.name || u.arabicName || 'Ustaz';
          let roleTitle = 'Ustaz / Faculty (أستاذ)';
          if (u.role === 'hifz_teacher') roleTitle = 'Hifz Sheikh (شيخ مقرئ)';
          else if (u.role === 'super_admin') roleTitle = 'Super Admin / Sheikh (المشرف العام)';
          else if (u.role === 'principal') roleTitle = 'Principal / Sheikh (مدير المدرسة)';
          else if (u.role === 'vice_principal') roleTitle = 'Vice Principal (وكيل المدرسة)';

          map.set(u.id, {
            id: u.id,
            name: displayName,
            arabicName: u.arabicName || displayName,
            roleTitle,
            specialization:
              u.assignedSubjects && u.assignedSubjects.length > 0
                ? u.assignedSubjects.join(', ')
                : "Qur'an Hifz & Tajweed Qira'at",
            email: u.email,
            phone: u.phone,
          });
        }
      });
    }

    // 3. If currentUser is a teacher/sheikh/admin, ensure they are also included
    if (currentUser) {
      const isUstazRole =
        currentUser.role === 'teacher' ||
        currentUser.role === 'hifz_teacher' ||
        currentUser.role === 'super_admin' ||
        currentUser.role === 'principal' ||
        currentUser.role === 'vice_principal';
      if (isUstazRole && !map.has(currentUser.id)) {
        map.set(currentUser.id, {
          id: currentUser.id,
          name: currentUser.name,
          arabicName: currentUser.arabicName || currentUser.name,
          roleTitle:
            currentUser.role === 'hifz_teacher'
              ? 'Hifz Sheikh (شيخ مقرئ)'
              : currentUser.role === 'super_admin'
              ? 'Super Admin / Sheikh (المشرف العام)'
              : 'Ustaz / Faculty (أستاذ)',
          specialization: "Qur'an Recitation & Tajweed",
          email: currentUser.email,
          phone: currentUser.phone,
        });
      }
    }

    // 4. Guaranteed fallback to INITIAL_TEACHERS so list NEVER shows 0
    if (map.size === 0) {
      INITIAL_TEACHERS.forEach((t) => {
        const displayName = t.fullName || (t as any).teacherName || t.name || 'Sheikh Bilal Ibrahim';
        map.set(t.id, {
          id: t.id,
          name: displayName,
          arabicName: t.arabicName || 'الشيخ بلال إبراهيم',
          roleTitle: 'Hifz Sheikh (مقرئ)',
          specialization: t.subjects?.join(', ') || "Qur'an Recitation & Tajweed",
          email: t.email,
          phone: t.phone,
        });
      });
    }

    return Array.from(map.values());
  }, [teachers, allUsers, currentUser]);

  // Unified lists of available Students
  const availableStudents = useMemo(() => {
    const map = new Map<string, { id: string; firstName: string; lastName: string; arabicName: string }>();

    if (students && Array.isArray(students)) {
      students.forEach((s) => {
        map.set(s.id, {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          arabicName: s.arabicName || `${s.firstName} ${s.lastName}`,
        });
      });
    }

    if (allUsers && Array.isArray(allUsers)) {
      allUsers.forEach((u) => {
        if (u.role === 'student' || (!map.has(u.id) && u.id.startsWith('std-'))) {
          const parts = (u.name || '').split(' ');
          const firstName = parts[0] || u.name;
          const lastName = parts.slice(1).join(' ') || '';
          map.set(u.id, {
            id: u.id,
            firstName,
            lastName,
            arabicName: u.arabicName || u.name,
          });
        }
      });
    }

    if (currentUser && currentUser.role === 'student') {
      const parts = (currentUser.name || '').split(' ');
      map.set(currentUser.id, {
        id: currentUser.id,
        firstName: parts[0] || currentUser.name,
        lastName: parts.slice(1).join(' ') || '',
        arabicName: currentUser.arabicName || currentUser.name,
      });
    }

    if (map.size === 0) {
      INITIAL_STUDENTS.forEach((s) => {
        map.set(s.id, {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          arabicName: s.arabicName || `${s.firstName} ${s.lastName}`,
        });
      });
    }

    return Array.from(map.values());
  }, [students, allUsers, currentUser]);

  // Match student identity
  const matchedStudent = useMemo(() => {
    if (!isActualStudent || !currentUser) return null;
    return (
      availableStudents.find(
        (s) =>
          s.id === currentUser.id ||
          (currentUser.email && s.id.toLowerCase() === currentUser.email.toLowerCase()) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
          s.firstName.toLowerCase() === currentUser.name.toLowerCase().trim()
      ) || availableStudents[0]
    );
  }, [isActualStudent, currentUser, availableStudents]);

  // Student Recording Form States
  const [studentFormStudentId, setStudentFormStudentId] = useState<string>(
    matchedStudent?.id || availableStudents[0]?.id || 'std-101'
  );
  const [targetTeacherId, setTargetTeacherId] = useState<string>(availableUstazes[0]?.id || 'tch-1');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(3);
  const [ayahStart, setAyahStart] = useState<number>(130);
  const [ayahEnd, setAyahEnd] = useState<number>(145);
  const [studentNote, setStudentNote] = useState<string>('');

  // Auto-sync student ID if logged in as student
  useEffect(() => {
    if (isActualStudent && matchedStudent && studentFormStudentId !== matchedStudent.id) {
      setStudentFormStudentId(matchedStudent.id);
    }
  }, [isActualStudent, matchedStudent, studentFormStudentId]);

  // Auto-sync selection if current targetTeacherId or studentFormStudentId is not in the list
  useEffect(() => {
    if (availableUstazes.length > 0 && !availableUstazes.some((t) => t.id === targetTeacherId)) {
      setTargetTeacherId(availableUstazes[0].id);
    }
  }, [availableUstazes, targetTeacherId]);

  useEffect(() => {
    if (availableStudents.length > 0 && !availableStudents.some((s) => s.id === studentFormStudentId)) {
      setStudentFormStudentId(availableStudents[0].id);
    }
  }, [availableStudents, studentFormStudentId]);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState<boolean>(false);
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);

  // Ustaz Evaluation Workbench States
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<RecitationSubmission | null>(null);
  const [evalTajweedScore, setEvalTajweedScore] = useState<number>(95);
  const [evalFluencyScore, setEvalFluencyScore] = useState<number>(95);
  const [evalMakharijScore, setEvalMakharijScore] = useState<number>(92);
  const [evalTeacherNotes, setEvalTeacherNotes] = useState<string>('');
  const [evalErrorsList, setEvalErrorsList] = useState<TajweedErrorAnnotation[]>([]);

  // Tajweed Error Tagging sub-form inside Workbench
  const [tagAyah, setTagAyah] = useState<number>(130);
  const [tagCategory, setTagCategory] = useState<TajweedErrorCategory>('ghunnah');
  const [tagSeverity, setTagSeverity] = useState<'minor' | 'moderate' | 'major' | 'critical'>('minor');
  const [tagDescription, setTagDescription] = useState<string>('');
  const [tagSuggestion, setTagSuggestion] = useState<string>('');

  // Modal inspection
  const [inspectingSubmission, setInspectingSubmission] = useState<RecitationSubmission | null>(null);

  // Sub-tabs for Student & Ustaz
  const [studentSubTab, setStudentSubTab] = useState<'record_new' | 'my_submissions'>('record_new');
  const [teacherSubTab, setTeacherSubTab] = useState<'pending_queue' | 'workbench' | 'reviewed_archive'>('pending_queue');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const currentStudent = availableStudents.find((s) => s.id === studentFormStudentId) || availableStudents[0];
  const targetTeacher = availableUstazes.find((t) => t.id === targetTeacherId) || availableUstazes[0];
  const selectedSurah = SURAHS_LIST.find((s) => s.number === Number(selectedSurahNumber)) || SURAHS_LIST[2];

  // Load persisted submissions and draft audio from IndexedDB and Supabase on component mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const saved = await idbGet<RecitationSubmission[]>(STORAGE_RECITATIONS_KEY, INITIAL_RECITATIONS);
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setSubmissions(saved);
        }
      } catch (e) {
        console.warn('[TajweedStudio] Error loading persisted recitations:', e);
      }

      // Check cloud database for submissions if Supabase is connected
      if (isSupabaseConfigured()) {
        try {
          const cloudRecs = await dbFetchRecitations();
          if (cloudRecs && cloudRecs.length > 0) {
            setSubmissions((prev) => {
              const map = new Map<string, RecitationSubmission>();
              prev.forEach((r) => map.set(r.id, r));
              cloudRecs.forEach((r) => map.set(r.id, r));
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              idbSet(STORAGE_RECITATIONS_KEY, merged).catch(() => {});
              return merged;
            });
          }
        } catch (err) {
          console.warn('[TajweedStudio] Error fetching recitations from Supabase:', err);
        }
      }

      try {
        const draftRecord = await idbGetMediaBlob('tajweed_draft_recitation_blob');
        if (draftRecord && draftRecord.blob && draftRecord.blob.size > 0) {
          setRecordedAudioBlob(draftRecord.blob);
        }
      } catch (e) {
        console.warn('[TajweedStudio] Draft audio check:', e);
      }
    };

    loadPersistedData();
  }, []);

  useEffect(() => {
    const unsubscribe = recitationAudioEngine.subscribe((playing, activeId) => {
      setActivePlaybackId(playing ? activeId : null);
      setIsPlayingRecording(playing && activeId === 'current-recording-preview');
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update tagAyah when evaluating submission changes
  useEffect(() => {
    if (evaluatingSubmission) {
      setTagAyah(evaluatingSubmission.ayahStart);
      setEvalTajweedScore(evaluatingSubmission.tajweedScore || 92);
      setEvalFluencyScore(evaluatingSubmission.fluencyScore || 90);
      setEvalMakharijScore(evaluatingSubmission.makharijScore || 90);
      setEvalTeacherNotes(evaluatingSubmission.teacherFeedbackNotes || '');
      setEvalErrorsList(evaluatingSubmission.tajweedErrors || []);
    }
  }, [evaluatingSubmission]);

  // Audio Recording Handlers
  const startRecording = async () => {
    recitationAudioEngine.stop();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setRecordedAudioBlob(audioBlob);
          idbSaveMediaBlob('tajweed_draft_recitation_blob', audioBlob, 'audio/webm').catch(() => {});
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start(250);
        setIsRecording(true);
        setRecordingTime(0);

        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        simulateRecording();
      }
    } catch (err) {
      console.warn('Microphone access unavailable, activating simulated recitation session:', err);
      simulateRecording();
    }
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      const wav = generateMelodiousRecitationWav(Math.max(recordingTime, 6), selectedSurah.number);
      setRecordedAudioBlob(wav);
      idbSaveMediaBlob('tajweed_draft_recitation_blob', wav, 'audio/wav').catch(() => {});
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const resetRecording = () => {
    recitationAudioEngine.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    setRecordedAudioBlob(null);
    setIsPlayingRecording(false);
    idbSaveMediaBlob('tajweed_draft_recitation_blob', new Blob([]), 'audio/webm').catch(() => {});
  };

  const togglePreviewPlayback = () => {
    if (isPlayingRecording) {
      recitationAudioEngine.stop();
    } else {
      recitationAudioEngine.play({
        id: 'current-recording-preview',
        blob: recordedAudioBlob,
        surahNumber: selectedSurah.number,
        ayahStart: Number(ayahStart),
        durationSeconds: recordingTime > 0 ? recordingTime : 10,
        studentName: currentStudent?.firstName,
      });
    }
  };

  const toggleSubmissionPlayback = async (sub: RecitationSubmission) => {
    if (activePlaybackId === sub.id) {
      recitationAudioEngine.stop();
      return;
    }

    if (sub.audioBlobKey) {
      try {
        const mediaRecord = await idbGetMediaBlob(sub.audioBlobKey);
        if (mediaRecord && mediaRecord.blob) {
          recitationAudioEngine.play({
            id: sub.id,
            blob: mediaRecord.blob,
            surahNumber: sub.surahNumber,
            ayahStart: sub.ayahStart,
            durationSeconds: sub.audioDurationSeconds || 14,
            studentName: sub.studentName,
          });
          return;
        }
      } catch (err) {
        console.warn('[TajweedStudio] Error reading blob from IndexedDB:', err);
      }
    }

    recitationAudioEngine.play({
      id: sub.id,
      audioUrl: sub.audioBlobUrl,
      surahNumber: sub.surahNumber,
      ayahStart: sub.ayahStart,
      durationSeconds: sub.audioDurationSeconds || 14,
      studentName: sub.studentName,
    });
  };

  // Student: Send Voice Recording to Ustaz
  const handleStudentSubmitToUstaz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    if (!recordedAudioBlob && recordingTime === 0) {
      alert('Please record your voice recitation before sending it to your Ustaz.');
      return;
    }

    const subId = `rec-${Date.now().toString().slice(-4)}`;
    const blobKey = `rec_blob_${subId}_${Date.now()}`;

    // Guarantee audio blob is saved to IndexedDB
    const finalBlob =
      recordedAudioBlob ||
      generateMelodiousRecitationWav(Math.max(recordingTime, 8), selectedSurah.number);

    try {
      await idbSaveMediaBlob(blobKey, finalBlob, finalBlob.type || 'audio/webm', {
        submissionId: subId,
        studentId: currentStudent.id,
        surahNumber: selectedSurah.number,
      });
      // Clear draft
      idbSaveMediaBlob('tajweed_draft_recitation_blob', new Blob([]), 'audio/webm').catch(() => {});
    } catch (err) {
      console.warn('[TajweedStudio] IndexedDB audio save warning:', err);
    }

    // If Supabase Storage is configured, upload the audio recording to Cloud Storage
    let cloudAudioUrl = '';
    if (isSupabaseConfigured() && finalBlob) {
      try {
        const uploadRes = await uploadAudioRecitation(currentStudent.id, subId, finalBlob, 'recitations');
        if (uploadRes.success && uploadRes.publicUrl) {
          cloudAudioUrl = uploadRes.publicUrl;
        }
      } catch (err) {
        console.warn('[TajweedStudio] Cloud audio upload warning:', err);
      }
    }

    const newSubmission: RecitationSubmission = {
      id: subId,
      studentId: currentStudent.id,
      studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
      studentArabicName: currentStudent.arabicName,
      teacherId: targetTeacher?.id || 'tch-1',
      teacherName: targetTeacher?.name || 'Sheikh Bilal Ibrahim',
      surahNumber: selectedSurah.number,
      surahName: selectedSurah.nameEnglish,
      surahNameArabic: selectedSurah.nameArabic,
      ayahStart: Number(ayahStart),
      ayahEnd: Number(ayahEnd),
      juz: selectedSurah.startJuz,
      date: new Date().toISOString().split('T')[0],
      audioDurationSeconds: recordingTime > 0 ? recordingTime : 120,
      audioBlobUrl: cloudAudioUrl || '',
      audioBlobKey: blobKey,
      studentNote: studentNote.trim() || undefined,
      tajweedErrors: [],
      status: 'pending_review',
    };

    const updatedSubmissions = [newSubmission, ...submissions];
    setSubmissions(updatedSubmissions);
    await idbSet(STORAGE_RECITATIONS_KEY, updatedSubmissions);
    if (contextAddRecitation) {
      contextAddRecitation(newSubmission).catch(() => {});
    }

    // Also persist to Supabase recitation_submissions table
    if (isSupabaseConfigured()) {
      dbUpsertRecitation(newSubmission).catch((e) =>
        console.warn('[TajweedStudio] dbUpsertRecitation error:', e)
      );
    }

    resetRecording();
    setStudentNote('');
    setStudentSubTab('my_submissions');

    alert(`Alhamdulillah! Your voice recitation for Surah ${selectedSurah.nameEnglish} (Ayahs ${ayahStart}-${ayahEnd}) has been sent to ${targetTeacher?.name}. You will receive Ustaz feedback and Tajweed marks once evaluated.`);
  };

  // Ustaz: Add Tajweed Error Annotation
  const handleAddTajweedError = () => {
    if (!tagDescription.trim() || !evaluatingSubmission) return;

    const categoryLabels: Record<TajweedErrorCategory, { en: string; ar: string }> = {
      makharij: { en: 'Letter Articulation (Makharij)', ar: 'مخارج الحروف' },
      sifat: { en: 'Letter Characteristics (Sifat)', ar: 'صفات الحروف' },
      ghunnah: { en: 'Ghunnah & Noon/Meem Sakinah', ar: 'الغنة وأحكام النون والميم' },
      madd: { en: 'Madd Elongation Rules', ar: 'أحكام المد والقصر' },
      qalqalah: { en: 'Qalqalah Echo/Bounce', ar: 'القلقلة' },
      ikhfa_idgham: { en: 'Ikhfa, Idgham, Iqlab', ar: 'الإخفاء والإدغام والإقلاب' },
      waqf_ibtida: { en: 'Waqf & Ibtida (Stopping/Starting)', ar: 'الوقف والابتداء' },
      lahn_jali: { en: 'Fatal Mistake (Lahn Jali)', ar: 'لحن جلي (خطأ تشكيل أو حرف)' },
      lahn_khafi: { en: 'Subtle Mistake (Lahn Khafi)', ar: 'لحن خفي' },
    };

    const newError: TajweedErrorAnnotation = {
      id: `err-${Date.now()}`,
      timestampSeconds: 15,
      surahNumber: evaluatingSubmission.surahNumber,
      ayahNumber: Number(tagAyah),
      category: tagCategory,
      categoryLabel: categoryLabels[tagCategory].en,
      categoryLabelArabic: categoryLabels[tagCategory].ar,
      description: tagDescription,
      severity: tagSeverity,
      teacherSuggestion: tagSuggestion || 'Practice rule according to Matn Al-Jazariyyah / Tuhfat Al-Atfal.',
    };

    setEvalErrorsList((prev) => [...prev, newError]);
    setTagDescription('');
    setTagSuggestion('');
  };

  const handleRemoveTajweedError = (id: string) => {
    setEvalErrorsList((prev) => prev.filter((e) => e.id !== id));
  };

  // Ustaz: Save Evaluation & Send Feedback to Student
  const handlePublishTeacherEvaluation = async () => {
    if (!evaluatingSubmission) return;

    const overall = Math.round((evalTajweedScore + evalFluencyScore + evalMakharijScore) / 3);
    const quality =
      overall >= 95
        ? 'Mumtaz (Excellent)'
        : overall >= 85
        ? 'Jayyid Jiddan (Very Good)'
        : overall >= 75
        ? 'Jayyid (Good)'
        : 'Maqbool (Fair)';

    const updatedSubmission: RecitationSubmission = {
      ...evaluatingSubmission,
      tajweedScore: evalTajweedScore,
      fluencyScore: evalFluencyScore,
      makharijScore: evalMakharijScore,
      overallScore: overall,
      quality,
      tajweedErrors: evalErrorsList,
      teacherFeedbackNotes: evalTeacherNotes || 'Masha\'Allah, recitation reviewed with Tajweed annotations.',
      status: 'reviewed',
      reviewedAt: new Date().toISOString().split('T')[0],
      teacherId: currentUser?.id || targetTeacher?.id || 'tch-1',
      teacherName: currentUser?.name || targetTeacher?.name || 'Sheikh Bilal Ibrahim',
    };

    const updatedList = submissions.map((sub) =>
      sub.id === evaluatingSubmission.id ? updatedSubmission : sub
    );

    setSubmissions(updatedList);
    await idbSet(STORAGE_RECITATIONS_KEY, updatedList);
    if (contextUpdateRecitation) {
      contextUpdateRecitation(updatedSubmission.id, updatedSubmission).catch(() => {});
    }

    // Save evaluated recitation to Supabase
    if (isSupabaseConfigured()) {
      dbUpsertRecitation(updatedSubmission).catch((e) =>
        console.warn('[TajweedStudio] Cloud eval upsert error:', e)
      );
    }

    // Also record in central Madrasa Hifz session log for global sync
    recordHifzSession({
      studentId: evaluatingSubmission.studentId,
      studentName: evaluatingSubmission.studentName,
      teacherId: updatedSubmission.teacherId,
      teacherName: updatedSubmission.teacherName,
      date: new Date().toISOString().split('T')[0],
      sessionType: 'sabaq',
      surahNumber: evaluatingSubmission.surahNumber,
      surahName: `${evaluatingSubmission.surahName} (${evaluatingSubmission.surahNameArabic})`,
      ayahStart: evaluatingSubmission.ayahStart,
      ayahEnd: evaluatingSubmission.ayahEnd,
      juz: evaluatingSubmission.juz,
      pageNumber: selectedSurah.startPage,
      memorizationQuality: quality,
      tajweedScore: evalTajweedScore,
      fluencyScore: evalFluencyScore,
      teacherNotes: evalTeacherNotes || 'Evaluated in Ustaz Voice Studio.',
      isVerified: true,
    });

    setEvaluatingSubmission(null);
    setTeacherSubTab('pending_queue');

    alert(`Alhamdulillah! Evaluation & Tajweed Feedback successfully sent to student ${evaluatingSubmission.studentName}.`);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recitation recording?')) return;
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    await idbSet(STORAGE_RECITATIONS_KEY, updated);
    if (contextDeleteRecitation) {
      contextDeleteRecitation(id).catch(() => {});
    }
    if (isSupabaseConfigured()) {
      dbDeleteRecitation(id).catch((e) => console.warn('[TajweedStudio] Delete cloud recitation error:', e));
    }
  };

  const startEvaluatingSubmission = (sub: RecitationSubmission) => {
    setEvaluatingSubmission(sub);
    setTeacherSubTab('workbench');
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  // Filtered lists
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending_review');
  const reviewedSubmissions = submissions.filter((s) => s.status === 'reviewed');

  // Student specific submissions
  const myStudentSubmissions = submissions.filter(
    (s) => s.studentId === studentFormStudentId
  );
  const myPendingSubmissions = myStudentSubmissions.filter((s) => s.status === 'pending_review');
  const myReviewedSubmissions = myStudentSubmissions.filter((s) => s.status === 'reviewed');

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              Student-to-Ustaz Voice Exchange &amp; Tajweed Evaluation
            </span>
            <span className="text-xs font-arabic text-emerald-300">
              إرسال التلاوة الصوتية وتقييم المشايخ
            </span>
          </div>
          <h2 className="text-2xl font-black font-arabic mt-1">
            منظومة إرسال التلاوات الصوتية وتقييم المشايخ بالرصد التجويدي
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Students record and send their voice recitations directly to their assigned Ustaz. Ustazes listen, pinpoint Tajweed errors (Makharij, Ghunnah, Madd, Qalqalah), assign scores, and return feedback to students.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-amber-300" />
            {isActualStudent ? 'Active Role Status:' : 'Switch View Perspective:'}
          </span>
          {isActualStudent ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-200">
                Student Reciter (طالب مقرئ)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl">
              <button
                onClick={() => setActiveRoleView('student')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRoleView === 'student'
                    ? 'bg-emerald-500 text-emerald-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student View
              </button>
              <button
                onClick={() => setActiveRoleView('teacher')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  activeRoleView === 'teacher'
                    ? 'bg-amber-400 text-amber-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Ustaz View
                {pendingSubmissions.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT VIEW: RECORD & SEND VOICE TO USTAZ */}
      {/* ========================================================================= */}
      {activeRoleView === 'student' && (
        <div className="space-y-6">
          {/* Student Sub-Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setStudentSubTab('record_new')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                studentSubTab === 'record_new'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Record &amp; Submit Voice to Ustaz</span>
            </button>

            <button
              onClick={() => setStudentSubTab('my_submissions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                studentSubTab === 'my_submissions'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>My Sent Recitations &amp; Ustaz Feedback</span>
              {myPendingSubmissions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-amber-950 font-black rounded-full text-[10px]">
                  {myPendingSubmissions.length} Pending
                </span>
              )}
            </button>
          </div>

          {/* Student Tab 1: Record & Send to Ustaz */}
          {studentSubTab === 'record_new' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recording Deck & Submission Form */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Student Voice Recorder (تسجيل الطالب)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Record clearly through your microphone and select your Ustaz for evaluation.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    High Quality Audio
                  </span>
                </div>

                {/* Identity & Ustaz Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">
                        Student Name (هوية الطالب) *
                      </label>
                      <span className="text-[10px] font-bold text-slate-500">
                        {isActualStudent ? 'Current Profile' : `${availableStudents.length} Students`}
                      </span>
                    </div>
                    {isActualStudent ? (
                      <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <span>
                          {currentStudent?.firstName} {currentStudent?.lastName} {currentStudent?.arabicName ? `(${currentStudent.arabicName})` : ''}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Active Reciter
                        </span>
                      </div>
                    ) : (
                      <select
                        value={studentFormStudentId}
                        onChange={(e) => setStudentFormStudentId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {availableStudents.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.firstName} {st.lastName} {st.arabicName ? `(${st.arabicName})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">
                        Target Ustaz / Sheikh (الشيخ المقرئ) *
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {availableUstazes.length} Registered
                      </span>
                    </div>
                    <select
                      value={targetTeacherId}
                      onChange={(e) => setTargetTeacherId(e.target.value)}
                      className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {availableUstazes.map((tch) => (
                        <option key={tch.id} value={tch.id}>
                          {tch.name} {tch.arabicName ? `(${tch.arabicName})` : ''} • {tch.roleTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Surah & Ayah Range */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-500 font-bold mb-1">Surah (السورة)</label>
                    <select
                      value={selectedSurahNumber}
                      onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
                    >
                      {SURAHS_LIST.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.nameEnglish} ({s.nameArabic})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Start Ayah</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedSurah.numberOfAyahs}
                      value={ayahStart}
                      onChange={(e) => setAyahStart(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">End Ayah</label>
                    <input
                      type="number"
                      min={ayahStart}
                      max={selectedSurah.numberOfAyahs}
                      value={ayahEnd}
                      onChange={(e) => setAyahEnd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Audio Recording Controller Deck */}
                <div className="bg-slate-950 rounded-2xl p-6 text-white text-center space-y-4 shadow-inner">
                  <div className="flex items-center justify-center gap-2">
                    {isRecording ? (
                      <div className="flex items-center gap-2 text-rose-400 animate-pulse font-bold text-xs">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        Recording Recitation... Speak clearly into microphone
                      </div>
                    ) : recordedAudioBlob ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Recitation Voice Ready ({formatSeconds(recordingTime || 120)})
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Click 'Start Recording' when ready to recite Bismillah
                      </span>
                    )}
                  </div>

                  {/* Timer Clock & Visualizer */}
                  <div className="space-y-2">
                    <h4 className="text-4xl font-black font-mono tracking-widest text-emerald-400">
                      {formatSeconds(recordingTime)}
                    </h4>

                    {/* Animated Equalizer Wave */}
                    <div className="flex items-center justify-center gap-1 h-8">
                      {[40, 75, 90, 50, 65, 80, 45, 95, 60, 30, 85, 70, 55, 90, 40].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isRecording || isPlayingRecording
                              ? 'bg-emerald-400 animate-bounce'
                              : recordedAudioBlob
                              ? 'bg-emerald-600'
                              : 'bg-slate-800'
                          }`}
                          style={{
                            height: isRecording || isPlayingRecording ? `${(h * ((recordingTime % 3) + 1)) / 3}%` : '20%',
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {!isRecording ? (
                      <>
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
                        >
                          <Mic className="w-4 h-4" />
                          {recordedAudioBlob ? 'Re-Record Voice' : 'Start Recitation Recording'}
                        </button>

                        {recordedAudioBlob && (
                          <button
                            type="button"
                            onClick={togglePreviewPlayback}
                            className={`px-5 py-3 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95 ${
                              isPlayingRecording
                                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isPlayingRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            <span>{isPlayingRecording ? 'Pause Preview' : 'Listen to My Voice'}</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95 animate-pulse"
                      >
                        <Square className="w-4 h-4" />
                        Stop Recording
                      </button>
                    )}

                    {recordedAudioBlob && !isRecording && (
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl cursor-pointer"
                        title="Reset Audio"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Note to Ustaz */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1">
                    Student Note / Question for Ustaz (ملاحظة للأستاذ - اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="e.g. Assalamu alaykum Ustaz, please check my Qalqalah in verse 134 and whether my Madd Munfasil is uniform..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Submit to Ustaz Button */}
                <button
                  type="button"
                  onClick={handleStudentSubmitToUstaz}
                  disabled={!recordedAudioBlob && recordingTime === 0}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
                    recordedAudioBlob || recordingTime > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <SendHorizontal className="w-4 h-4" />
                  Send Voice Recitation to {targetTeacher?.name || 'Ustaz'} for Evaluation
                </button>
              </div>

              {/* Right Column: Submission Instructions & Recent Recitations */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    How Voice Recitation Submission Works
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span><strong>Record clearly:</strong> Read your Sabaq or Muraja'ah with Tajweed and proper Waqf &amp; Ibtida.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span><strong>Send to Ustaz:</strong> Your voice file is queued in your Ustaz's inbox.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span><strong>Receive Detailed Feedback:</strong> Your Ustaz grades your Tajweed, highlights letter mistakes, and provides written corrective advice.</span>
                    </li>
                  </ul>
                </div>

                {/* My Recent Status Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Inbox className="w-4 h-4 text-teal-600" />
                      My Recitation Status ({currentStudent?.firstName})
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      {myStudentSubmissions.length} Total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200 dark:border-amber-900">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                        Awaiting Review
                      </span>
                      <span className="text-lg font-black font-mono text-amber-900 dark:text-amber-200">
                        {myPendingSubmissions.length}
                      </span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                        Evaluated &amp; Graded
                      </span>
                      <span className="text-lg font-black font-mono text-emerald-900 dark:text-emerald-200">
                        {myReviewedSubmissions.length}
                      </span>
                    </div>
                  </div>

                  {myReviewedSubmissions.length > 0 && (
                    <button
                      onClick={() => setStudentSubTab('my_submissions')}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>View Ustaz Feedback &amp; Tajweed Marks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Student Tab 2: My Sent Recitations & Ustaz Feedback */}
          {studentSubTab === 'my_submissions' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-emerald-600" />
                      My Submitted Recitations &amp; Teacher Feedback
                    </h3>
                    <p className="text-xs text-slate-500">
                      Recitations for {currentStudent?.firstName} {currentStudent?.lastName} ({currentStudent?.arabicName})
                    </p>
                  </div>

                  <button
                    onClick={() => setStudentSubTab('record_new')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Record New Recitation
                  </button>
                </div>

                {myStudentSubmissions.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                      <Mic className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500">No recitations sent yet for this student.</p>
                    <button
                      onClick={() => setStudentSubTab('record_new')}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                    >
                      Record Your First Sabaq Recitation
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myStudentSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className={`p-5 rounded-2xl border transition space-y-3 ${
                          sub.status === 'reviewed'
                            ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {sub.date} • Juz {sub.juz}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white font-arabic mt-0.5">
                              سورة {sub.surahNameArabic} ({sub.surahName})
                            </h4>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                              الآيات: {sub.ayahStart} - {sub.ayahEnd}
                            </p>
                          </div>

                          {sub.status === 'reviewed' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {sub.overallScore}% • {sub.quality}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting Ustaz Review
                            </span>
                          )}
                        </div>

                        {/* Student Note if provided */}
                        {sub.studentNote && (
                          <div className="p-2.5 bg-white/60 dark:bg-slate-900/60 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">My Question/Note:</span>
                            <p className="italic">"{sub.studentNote}"</p>
                          </div>
                        )}

                        {/* Audio Player Strip */}
                        <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleSubmissionPlayback(sub)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold cursor-pointer transition ${
                                activePlaybackId === sub.id
                                  ? 'bg-rose-500 text-white animate-pulse'
                                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              }`}
                              title={activePlaybackId === sub.id ? 'Pause Recitation' : 'Play Recitation'}
                            >
                              {activePlaybackId === sub.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div>
                              <span className="text-[11px] font-bold block text-emerald-400">
                                {activePlaybackId === sub.id ? 'Playing Voice Recording...' : 'Listen to My Voice'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatSeconds(sub.audioDurationSeconds)} • Ustaz: {sub.teacherName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.audioBlobUrl ? (
                              <span className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-mono" title="Stored in Supabase Cloud Storage">
                                <Cloud className="w-3 h-3" /> Cloud
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono" title="Stored locally on device">
                                <HardDrive className="w-3 h-3" /> Local
                              </span>
                            )}
                            {sub.status === 'reviewed' && (
                              <button
                                type="button"
                                onClick={() => setInspectingSubmission(sub)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                              >
                                View Feedback
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition cursor-pointer"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Ustaz Feedback Remarks if reviewed */}
                        {sub.status === 'reviewed' && (
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                              <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tajweed</span>
                                <span className="font-bold text-emerald-600">{sub.tajweedScore}%</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Fluency</span>
                                <span className="font-bold text-teal-600">{sub.fluencyScore}%</span>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Makharij</span>
                                <span className="font-bold text-blue-600">{sub.makharijScore}%</span>
                              </div>
                            </div>

                            <div className="p-2.5 bg-emerald-100/50 dark:bg-emerald-950/40 rounded-xl text-xs space-y-1">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                                Ustaz {sub.teacherName}'s Feedback:
                              </span>
                              <p className="text-slate-800 dark:text-slate-200 italic">
                                "{sub.teacherFeedbackNotes}"
                              </p>
                              {sub.tajweedErrors.length > 0 && (
                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                  ⚠️ {sub.tajweedErrors.length} Tajweed points marked for correction.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USTAZ VIEW: EVALUATION QUEUE & WORKBENCH */}
      {/* ========================================================================= */}
      {activeRoleView === 'teacher' && (
        <div className="space-y-6">
          {/* Ustaz Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setTeacherSubTab('pending_queue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                teacherSubTab === 'pending_queue'
                  ? 'bg-amber-500 text-amber-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Pending Student Voices Queue</span>
              {pendingSubmissions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                  {pendingSubmissions.length} Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setTeacherSubTab('workbench')}
              disabled={!evaluatingSubmission}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                teacherSubTab === 'workbench'
                  ? 'bg-amber-500 text-amber-950 shadow-xs'
                  : evaluatingSubmission
                  ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>
                Active Evaluation Workbench{' '}
                {evaluatingSubmission ? `(${evaluatingSubmission.studentName})` : ''}
              </span>
            </button>

            <button
              onClick={() => setTeacherSubTab('reviewed_archive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                teacherSubTab === 'reviewed_archive'
                  ? 'bg-amber-500 text-amber-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Evaluations Archive ({reviewedSubmissions.length})</span>
            </button>
          </div>

          {/* Ustaz Tab 1: Pending Queue */}
          {teacherSubTab === 'pending_queue' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-amber-500" />
                      Student Voice Recitations Awaiting Evaluation ({pendingSubmissions.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Listen to student oral submissions, annotate Tajweed mistakes on the timeline, grade performance, and return feedback.
                    </p>
                  </div>
                </div>

                {pendingSubmissions.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      All Student Recitations Evaluated!
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      There are currently no pending student voice submissions awaiting review in the queue.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 transition space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 font-black text-sm flex items-center justify-center">
                              {sub.studentName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                {sub.studentName}
                              </h4>
                              <p className="text-xs text-slate-500 font-arabic">
                                {sub.studentArabicName} • Assigned to {sub.teacherName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {sub.audioBlobUrl ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1" title="Voice audio saved on Supabase Cloud Storage">
                                <Cloud className="w-3 h-3" /> Cloud
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1" title="Voice audio saved in local storage">
                                <HardDrive className="w-3 h-3" /> Local
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                              {sub.date}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-arabic text-sm">
                              سورة {sub.surahNameArabic} ({sub.surahName})
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                              Juz {sub.juz}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-mono">
                            Ayahs: {sub.ayahStart} to {sub.ayahEnd} ({formatSeconds(sub.audioDurationSeconds)})
                          </p>
                          {sub.studentNote && (
                            <p className="text-slate-700 dark:text-slate-300 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                              💬 Student Note: "{sub.studentNote}"
                            </p>
                          )}
                        </div>

                        {/* Audio Preview & Grade Button */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSubmissionPlayback(sub)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold cursor-pointer transition ${
                              activePlaybackId === sub.id
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                            title="Listen to Student Voice"
                          >
                            {activePlaybackId === sub.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEvaluatingSubmission(sub)}
                            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                          >
                            <Tag className="w-3.5 h-3.5" />
                            Evaluate Recitation &amp; Annotate Tajweed
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                            title="Delete Recitation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ustaz Tab 2: Active Evaluation Workbench */}
          {teacherSubTab === 'workbench' && evaluatingSubmission && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    Grading Studio
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    Evaluating Student: {evaluatingSubmission.studentName} ({evaluatingSubmission.studentArabicName})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Surah {evaluatingSubmission.surahNameArabic} ({evaluatingSubmission.surahName}) • Ayahs {evaluatingSubmission.ayahStart} - {evaluatingSubmission.ayahEnd} • Juz {evaluatingSubmission.juz}
                  </p>
                </div>

                <button
                  onClick={() => setTeacherSubTab('pending_queue')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Back to Queue
                </button>
              </div>

              {/* Student Audio Player Strip */}
              <div className="p-4 bg-slate-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSubmissionPlayback(evaluatingSubmission)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer transition ${
                      activePlaybackId === evaluatingSubmission.id
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    {activePlaybackId === evaluatingSubmission.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div>
                    <p className="text-xs font-bold text-emerald-300">
                      {activePlaybackId === evaluatingSubmission.id ? 'Playing Student Recitation Voice...' : 'Play Student Audio Clip'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Duration: {formatSeconds(evaluatingSubmission.audioDurationSeconds)} • Sent: {evaluatingSubmission.date}
                    </p>
                  </div>
                </div>

                {evaluatingSubmission.studentNote && (
                  <div className="text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 max-w-md">
                    <span className="text-[10px] text-amber-300 font-bold block">Student Note:</span>
                    <p className="text-slate-300 italic">"{evaluatingSubmission.studentNote}"</p>
                  </div>
                )}
              </div>

              {/* Tajweed Error Annotator Tool */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    Pinpoint Tajweed Mistakes &amp; Suggest Corrections
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold">
                    {evalErrorsList.length} Annotated Mistakes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      At Ayah Number
                    </label>
                    <input
                      type="number"
                      min={evaluatingSubmission.ayahStart}
                      max={evaluatingSubmission.ayahEnd}
                      value={tagAyah}
                      onChange={(e) => setTagAyah(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Tajweed Category
                    </label>
                    <select
                      value={tagCategory}
                      onChange={(e) => setTagCategory(e.target.value as TajweedErrorCategory)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="ghunnah">Ghunnah &amp; Noon/Meem Sakinah (الغنة)</option>
                      <option value="madd">Madd Elongation (المد والقصر)</option>
                      <option value="makharij">Makharij al-Huroof (مخارج الحروف)</option>
                      <option value="sifat">Sifat &amp; Tafkheem (الصفات والتفخيم)</option>
                      <option value="qalqalah">Qalqalah (القلقلة)</option>
                      <option value="ikhfa_idgham">Ikhfa / Idgham / Iqlab (الإخفاء والإدغام)</option>
                      <option value="waqf_ibtida">Waqf &amp; Ibtida (الوقف والابتداء)</option>
                      <option value="lahn_jali">Lahn Jali (لحن جلي - خطأ واضح)</option>
                      <option value="lahn_khafi">Lahn Khafi (لحن خفي)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Severity Level
                    </label>
                    <select
                      value={tagSeverity}
                      onChange={(e) => setTagSeverity(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                    >
                      <option value="minor">Minor (خفيف)</option>
                      <option value="moderate">Moderate (متوسط)</option>
                      <option value="major">Major (كبير)</option>
                      <option value="critical">Critical (لحن جلي)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Mistake description (e.g. Incomplete Ghunnah on Inna, held 1 count)"
                    value={tagDescription}
                    onChange={(e) => setTagDescription(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ustaz suggestion / Matn Al-Jazariyyah reference"
                      value={tagSuggestion}
                      onChange={(e) => setTagSuggestion(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTajweedError}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Error
                    </button>
                  </div>
                </div>

                {/* List of tagged errors */}
                {evalErrorsList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {evalErrorsList.map((err) => (
                      <div
                        key={err.id}
                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                              Ayah {err.ayahNumber} • {err.categoryLabel}
                            </span>
                            <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold">
                              {err.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{err.description}</p>
                          <p className="text-[11px] text-slate-500 font-arabic font-semibold">
                            توجيه الشيخ: {err.teacherSuggestion}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTajweedError(err.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scoring Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                <div>
                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Tajweed Score:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{evalTajweedScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={evalTajweedScore}
                    onChange={(e) => setEvalTajweedScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Fluency / Retention:</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">{evalFluencyScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={evalFluencyScore}
                    onChange={(e) => setEvalFluencyScore(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Makharij Precision:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{evalMakharijScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={evalMakharijScore}
                    onChange={(e) => setEvalMakharijScore(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Ustaz Written Feedback & Publish Button */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ustaz Written Feedback &amp; Corrective Advice for Student (توجيهات الشيخ للطالب) *
                </label>
                <textarea
                  rows={3}
                  value={evalTeacherNotes}
                  onChange={(e) => setEvalTeacherNotes(e.target.value)}
                  placeholder="Masha'Allah, recitation was clear and melodious. Focus on letter Dhad articulation and maintain 2 counts for Ghunnah..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePublishTeacherEvaluation}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    Submit Evaluation &amp; Send Feedback to {evaluatingSubmission.studentName}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeacherSubTab('pending_queue')}
                    className="px-4 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ustaz Tab 3: Reviewed Archive */}
          {teacherSubTab === 'reviewed_archive' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Completed Student Evaluations Archive ({reviewedSubmissions.length})
                </h3>
                <span className="text-xs text-slate-400">All Graded Sessions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewedSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {sub.studentName} <span className="text-[10px] text-slate-400 font-arabic">({sub.studentArabicName})</span>
                        </h4>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-arabic mt-0.5">
                          سورة {sub.surahNameArabic} ({sub.ayahStart}-{sub.ayahEnd}) • Juz {sub.juz}
                        </p>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                        {sub.overallScore}% • {sub.quality}
                      </span>
                    </div>

                    {/* Audio Player Strip */}
                    <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleSubmissionPlayback(sub)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold cursor-pointer transition ${
                            activePlaybackId === sub.id
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          }`}
                          title={activePlaybackId === sub.id ? 'Pause Recitation' : 'Play Recitation'}
                        >
                          {activePlaybackId === sub.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div>
                          <span className="text-[11px] font-bold block text-emerald-400">
                            {activePlaybackId === sub.id ? 'Playing Recitation...' : 'Listen to Recitation'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatSeconds(sub.audioDurationSeconds)} • Ustaz: {sub.teacherName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.audioBlobUrl ? (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono" title="Saved in Supabase Cloud Storage">
                            <Cloud className="w-3 h-3" /> Cloud
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono" title="Saved locally">
                            <HardDrive className="w-3 h-3" /> Local
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setInspectingSubmission(sub)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          View Tajweed ({sub.tajweedErrors.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition cursor-pointer"
                          title="Delete Archive Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                      "{sub.teacherFeedbackNotes}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recitation Detailed Inspection Modal */}
      {inspectingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tajweed Recitation Audit &amp; Ustaz Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectingSubmission.studentName} • Surah {inspectingSubmission.surahNameArabic} ({inspectingSubmission.ayahStart}-{inspectingSubmission.ayahEnd}) • Ustaz {inspectingSubmission.teacherName}
                </p>
              </div>
              <button
                onClick={() => setInspectingSubmission(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Tajweed</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                  {inspectingSubmission.tajweedScore || 90}%
                </span>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-200 dark:border-teal-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Fluency</span>
                <span className="font-mono font-black text-teal-700 dark:text-teal-300 text-sm">
                  {inspectingSubmission.fluencyScore || 90}%
                </span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Makharij</span>
                <span className="font-mono font-black text-blue-700 dark:text-blue-300 text-sm">
                  {inspectingSubmission.makharijScore || 90}%
                </span>
              </div>
            </div>

            {/* Audio Recitation Player in Modal */}
            <div className="p-3 bg-slate-950 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleSubmissionPlayback(inspectingSubmission)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold cursor-pointer transition ${
                    activePlaybackId === inspectingSubmission.id
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {activePlaybackId === inspectingSubmission.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-emerald-300">
                    {activePlaybackId === inspectingSubmission.id ? 'Playing Recitation Recording...' : 'Play Student Recitation Voice'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Duration: {formatSeconds(inspectingSubmission.audioDurationSeconds)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[15, 35, 60, 40, 75, 90, 50, 25].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      activePlaybackId === inspectingSubmission.id ? 'bg-emerald-400 animate-bounce' : 'bg-slate-700'
                    }`}
                    style={{ height: `${activePlaybackId === inspectingSubmission.id ? h : 10}px`, animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* List of annotated Tajweed errors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Ustaz's Annotated Tajweed Corrections ({inspectingSubmission.tajweedErrors.length})
              </span>
              {inspectingSubmission.tajweedErrors.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No major Tajweed mistakes annotated. Clean recitation!</p>
              ) : (
                inspectingSubmission.tajweedErrors.map((err) => (
                  <div key={err.id} className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        Ayah {err.ayahNumber} • {err.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">{err.severity}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{err.description}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-arabic font-bold">
                      توجيه الشيخ: {err.teacherSuggestion}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Ustaz Feedback &amp; Advice (توجيهات الشيخ)
              </span>
              <p className="italic font-medium">"{inspectingSubmission.teacherFeedbackNotes}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
