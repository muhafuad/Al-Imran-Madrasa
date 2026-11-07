import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { JUZ_DATA_LIST } from '../../data/quranJuzData';
import type { JuzData, JuzMasteryStatus, StudentJuzProgress } from '../../types/quranTypes';
import { canRecordHifz } from '../../utils/permissions';
import {
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Filter,
  Check,
  Eye,
  X,
  ChevronRight,
  ShieldCheck,
  Flame,
  Printer,
  Download,
  AlertCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

export const JuzCompletionJourney: React.FC = () => {
  const { students, language, currentUser } = useMadrasa();

  const isHifzTeacherOrAdmin = canRecordHifz(currentUser?.role);
  const isStudent = currentUser?.role === 'student';

  const resolvedStudent = isStudent
    ? students.find(
        (s) =>
          s.id === currentUser?.id ||
          s.guardianEmail === currentUser?.email ||
          s.admissionNumber === currentUser?.id ||
          (currentUser?.name && `${s.firstName} ${s.lastName}`.toLowerCase().includes(currentUser.name.toLowerCase()))
      ) || students[0]
    : null;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    isStudent && resolvedStudent ? resolvedStudent.id : students[0]?.id || 'std-101'
  );

  useEffect(() => {
    if (isStudent && resolvedStudent && selectedStudentId !== resolvedStudent.id) {
      setSelectedStudentId(resolvedStudent.id);
    }
  }, [isStudent, resolvedStudent, selectedStudentId]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
 type JuzWithProgress = JuzData & {
  status: JuzMasteryStatus;
  record?: StudentJuzProgress;
};

const [inspectingJuz, setInspectingJuz] = useState<JuzWithProgress | null>(null);

  // Local state for customized student Juz progress mapping
  const currentStudent = isStudent
    ? (resolvedStudent || students[0])
    : (students.find((s) => s.id === selectedStudentId) || students[0]);

  // Derive initial status based on student's juzCompleted
  const studentJuzCount = currentStudent?.quranProgress.juzCompleted || 0;

  const [studentProgressMap, setStudentProgressMap] = useState<Record<string, Record<number, StudentJuzProgress>>>({
    'std-101': {
      1: { juzNumber: 1, status: 'mastered', retentionScore: 99, revisionsCount: 14, isVerifiedByTeacher: true, verifiedByTeacherName: 'Sheikh Bilal Ibrahim', teacherNotes: 'Mutqin (Perfect). Ready for Sanad testing.' },
      2: { juzNumber: 2, status: 'mastered', retentionScore: 97, revisionsCount: 12, isVerifiedByTeacher: true, verifiedByTeacherName: 'Sheikh Bilal Ibrahim', teacherNotes: 'Strong retention of Ayat Al-Kursi and Riba verses.' },
      3: { juzNumber: 3, status: 'mastered', retentionScore: 96, revisionsCount: 10, isVerifiedByTeacher: true, verifiedByTeacherName: 'Sheikh Bilal Ibrahim' },
      4: { juzNumber: 4, status: 'in_progress', retentionScore: 94, revisionsCount: 4, isVerifiedByTeacher: false, teacherNotes: 'Currently memorizing second half of Ali Imran.' },
      28: { juzNumber: 28, status: 'mastered', retentionScore: 98, revisionsCount: 8, isVerifiedByTeacher: true },
      29: { juzNumber: 29, status: 'mastered', retentionScore: 99, revisionsCount: 16, isVerifiedByTeacher: true },
      30: { juzNumber: 30, status: 'mastered', retentionScore: 100, revisionsCount: 22, isVerifiedByTeacher: true, verifiedByTeacherName: 'Ustaz Usman Ahmedin', teacherNotes: 'Flawless Tajweed on Juz Amma.' },
    },
    'std-102': {
      1: { juzNumber: 1, status: 'mastered', retentionScore: 95, revisionsCount: 6, isVerifiedByTeacher: true },
      28: { juzNumber: 28, status: 'mastered', retentionScore: 92, revisionsCount: 5, isVerifiedByTeacher: true },
      29: { juzNumber: 29, status: 'mastered', retentionScore: 94, revisionsCount: 8, isVerifiedByTeacher: true },
      30: { juzNumber: 30, status: 'mastered', retentionScore: 98, revisionsCount: 12, isVerifiedByTeacher: true },
      15: { juzNumber: 15, status: 'in_progress', retentionScore: 90, revisionsCount: 2, isVerifiedByTeacher: false },
    },
  });

  const getJuzStatus = (juzNum: number): JuzMasteryStatus => {
    const studentRecords = studentProgressMap[selectedStudentId];
    if (studentRecords && studentRecords[juzNum]) {
      return studentRecords[juzNum].status;
    }
    // Dynamic fallback based on student.quranProgress.juzCompleted
    if (juzNum <= studentJuzCount) {
      return 'mastered';
    }
    if (juzNum === studentJuzCount + 1) {
      return 'in_progress';
    }
    return 'not_started';
  };

  const getJuzRecord = (juzNum: number): StudentJuzProgress | undefined => {
    return studentProgressMap[selectedStudentId]?.[juzNum];
  };

  const handleUpdateJuzStatus = (juzNum: number, newStatus: JuzMasteryStatus, retentionScore: number, notes: string) => {
    if (!isHifzTeacherOrAdmin) {
      alert('Permission Denied: Only Hifz Ustazs and academic faculty can update official Juz mastery status.');
      return;
    }

    setStudentProgressMap((prev) => {
      const studentMap = { ...(prev[selectedStudentId] || {}) };
      studentMap[juzNum] = {
        juzNumber: juzNum,
        status: newStatus,
        retentionScore,
        revisionsCount: (studentMap[juzNum]?.revisionsCount || 0) + 1,
        isVerifiedByTeacher: newStatus === 'mastered',
        verifiedByTeacherName: newStatus === 'mastered' ? (currentUser?.name || 'Sheikh Bilal Ibrahim') : undefined,
        lastTestedDate: new Date().toISOString().split('T')[0],
        teacherNotes: notes,
      };
      return {
        ...prev,
        [selectedStudentId]: studentMap,
      };
    });
    setInspectingJuz(null);
  };

  // Metrics
  const all30JuzStatus = JUZ_DATA_LIST.map((j) => ({
    ...j,
    status: getJuzStatus(j.juzNumber),
    record: getJuzRecord(j.juzNumber),
  }));

  const masteredCount = all30JuzStatus.filter((j) => j.status === 'mastered').length;
  const inProgressCount = all30JuzStatus.filter((j) => j.status === 'in_progress').length;
  const inRevisionCount = all30JuzStatus.filter((j) => j.status === 'revision').length;
  const notStartedCount = all30JuzStatus.filter((j) => j.status === 'not_started').length;
  const completionPercentage = Math.round((masteredCount / 30) * 100);

  const filteredJuzList = all30JuzStatus.filter((j) => {
    if (filterStatus === 'all') return true;
    return j.status === filterStatus;
  });

  const getStatusBadge = (status: JuzMasteryStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Mastered (متقن)
          </span>
        );
      case 'revision':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In Revision (مراجعة)
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            In Progress (قيد الحفظ)
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Not Started (لم يبدأ)
          </span>
        );
    }
  };

  const getStatusCardClasses = (status: JuzMasteryStatus) => {
    switch (status) {
      case 'mastered':
        return 'bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/10 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-xs hover:shadow-md';
      case 'revision':
        return 'bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/10 border-amber-200 dark:border-amber-800/80 hover:border-amber-400 text-amber-950 dark:text-amber-100 shadow-xs hover:shadow-md';
      case 'in_progress':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/10 border-blue-200 dark:border-blue-800/80 hover:border-blue-400 text-blue-950 dark:text-blue-100 shadow-xs hover:shadow-md ring-2 ring-blue-400/30';
      case 'not_started':
      default:
        return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 opacity-80 hover:opacity-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Selector & Milestone Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Student Picker */}
          <div className="space-y-2 flex-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {isStudent ? 'My Khatmah Portfolio & Verified Progress' : 'Active Student Khatmah Portfolio'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {isStudent ? (
                <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentStudent.firstName} {currentStudent.lastName}
                  </span>
                  <span className="text-xs font-arabic text-emerald-700 dark:text-emerald-400 font-bold">
                    ({currentStudent.arabicName})
                  </span>
                </div>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.arabicName}) — {st.quranProgress.juzCompleted}/30 Juz
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold font-mono">
                  {currentStudent.currentClass}
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl text-xs font-bold">
                  {currentStudent.hifzCircleName}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="lg:w-96 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Overall Memorization Journey
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                {masteredCount} / 30 Juz ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>Hizb: {masteredCount * 2} / 60</span>
              <span>Rub': {masteredCount * 8} / 240 Quarters</span>
              {completionPercentage >= 90 && (
                <span className="font-bold text-amber-500 flex items-center gap-0.5">
                  <Award className="w-3.5 h-3.5" /> Ready for Ijazah
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All 30 Juz (30)
          </button>
          <button
            onClick={() => setFilterStatus('mastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'mastered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Mastered ({masteredCount})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'in_progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterStatus('revision')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'revision'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            In Revision ({inRevisionCount})
          </button>
          <button
            onClick={() => setFilterStatus('not_started')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'not_started'
                ? 'bg-slate-600 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Not Started ({notStartedCount})
          </button>
        </div>

        <span className="text-xs text-slate-400 italic">
          Click any Juz to inspect Ayah breakdown or log teacher retention grade.
        </span>
      </div>

      {/* 30-Juz Interactive Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {filteredJuzList.map((juz) => {
          const status = juz.status;
          return (
            <div
              key={juz.juzNumber}
              onClick={() => setInspectingJuz(juz)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${getStatusCardClasses(
                status
              )}`}
            >
              {/* Card Header: Number & Status Badge */}
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-black text-xs text-slate-800 dark:text-slate-200">
                  {juz.juzNumber}
                </div>
                {status === 'mastered' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : status === 'in_progress' ? (
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                ) : status === 'revision' ? (
                  <Clock className="w-4 h-4 text-amber-500" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">20p</span>
                )}
              </div>

              {/* Arabic Name & Phrase */}
              <div className="text-right">
                <h3 className="text-lg font-black font-arabic text-emerald-950 dark:text-emerald-200 leading-tight">
                  {juz.nameArabic}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {juz.nameEnglish}
                </p>
              </div>

              {/* Surah Range & Pages */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-arabic truncate text-right">
                  {juz.surahSummaryArabic}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Hizb {juz.hizbStart}-{juz.hizbEnd}</span>
                  <span>p. {juz.startPage}-{juz.endPage}</span>
                </div>
              </div>

              {/* Retention Score if mastered */}
              {juz.record?.retentionScore && (
                <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span>Retention Score:</span>
                  <span className="font-mono">{juz.record.retentionScore}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Juz Inspection & Evaluation Modal */}
      {inspectingJuz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-lg shadow-md">
                  {inspectingJuz.juzNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black font-arabic text-emerald-950 dark:text-emerald-200">
                      الجزء {inspectingJuz.juzNumber}: {inspectingJuz.nameArabic}
                    </h2>
                    {getStatusBadge(getJuzStatus(inspectingJuz.juzNumber))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectingJuz.nameEnglish} • Pages {inspectingJuz.startPage} to {inspectingJuz.endPage} ({inspectingJuz.totalPages} pages)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingJuz(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Arabic Opening Ayah Preview Banner */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                مطلع الجزء وبداية الآيات
              </span>
              <p className="text-base font-arabic font-bold text-emerald-950 dark:text-emerald-100 leading-loose">
                {inspectingJuz.startAyahText}
              </p>
            </div>

            {/* Content & Hizb Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Surahs Included</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{inspectingJuz.surahSummary}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Hizb Breakdown</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">Hizb {inspectingJuz.hizbStart} &amp; {inspectingJuz.hizbEnd}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Rub' el Hizb</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">8 Quarters</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Madani Pages</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">{inspectingJuz.totalPages} Pages</p>
              </div>
            </div>

            {/* Teacher Evaluation & Status Form or Student Read-Only View */}
            {isStudent ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Ustaz Evaluation &amp; Certification
                  </h4>
                  {getStatusBadge(inspectingJuz.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Retention Score</span>
                    <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {getJuzRecord(inspectingJuz.juzNumber)?.retentionScore ?? (inspectingJuz.status === 'mastered' ? 98 : inspectingJuz.status === 'in_progress' ? 85 : 0)}%
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Revision Cycles</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
                      {getJuzRecord(inspectingJuz.juzNumber)?.revisionsCount ?? (inspectingJuz.status === 'mastered' ? 12 : 2)} Rounds
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Certified By</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {getJuzRecord(inspectingJuz.juzNumber)?.verifiedByTeacherName || 'Halqah Head Sheikh'}
                    </span>
                  </div>
                </div>

                {getJuzRecord(inspectingJuz.juzNumber)?.teacherNotes && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Ustaz Sanad Notes</span>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      "{getJuzRecord(inspectingJuz.juzNumber)?.teacherNotes}"
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official status is maintained and tested by your Halqah Ustaz. Read-only student view.</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Teacher Mastery &amp; Retention Log ({currentStudent.firstName})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      Mastery Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateJuzStatus(inspectingJuz.juzNumber, 'mastered', 98, 'Mastered with excellent retention.')}
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mastered (متقن)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateJuzStatus(inspectingJuz.juzNumber, 'revision', 90, 'Assigned for daily Sabqi revision.')}
                        className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        In Revision (مراجعة)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateJuzStatus(inspectingJuz.juzNumber, 'in_progress', 85, 'Currently memorizing new quarters.')}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        In Progress (حفظ)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateJuzStatus(inspectingJuz.juzNumber, 'not_started', 0, '')}
                        className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Reset (لم يبدأ)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Retention Test Score (0 - 100%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={getJuzRecord(inspectingJuz.juzNumber)?.retentionScore || 95}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        Teacher Sanad / Hifz Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Flawless Waqf and Makharij, tested 3 times"
                        defaultValue={getJuzRecord(inspectingJuz.juzNumber)?.teacherNotes || ''}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Verified by Halqah Head Ustaz
              </span>
              <button
                onClick={() => setInspectingJuz(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
