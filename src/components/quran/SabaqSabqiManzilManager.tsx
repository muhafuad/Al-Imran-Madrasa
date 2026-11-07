import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SURAHS_LIST } from '../../data/mockData';
import { INITIAL_DAILY_SABAQ } from '../../data/quranJuzData';
import type { DailySabaqEntry } from '../../types/quranTypes';
import type { MemorizationQuality } from '../../types';
import { canRecordHifz } from '../../utils/permissions';
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Layers,
  Search,
  Filter,
  Check,
  Calendar,
  User,
  Star,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export const SabaqSabqiManzilManager: React.FC = () => {
  const { students, recordHifzSession, currentUser } = useMadrasa();

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

  const [dailyEntries, setDailyEntries] = useState<DailySabaqEntry[]>(INITIAL_DAILY_SABAQ);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    isStudent && resolvedStudent ? resolvedStudent.id : students[0]?.id || 'std-101'
  );

  useEffect(() => {
    if (isStudent && resolvedStudent && selectedStudentId !== resolvedStudent.id) {
      setSelectedStudentId(resolvedStudent.id);
    }
  }, [isStudent, resolvedStudent, selectedStudentId]);

  const [filterHalqah, setFilterHalqah] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sabaq (New Lesson) Form States
  const [sabaqSurahNumber, setSabaqSurahNumber] = useState<number>(3);
  const [sabaqAyahStart, setSabaqAyahStart] = useState<number>(146);
  const [sabaqAyahEnd, setSabaqAyahEnd] = useState<number>(160);
  const [sabaqPage, setSabaqPage] = useState<number>(68);
  const [sabaqLines, setSabaqLines] = useState<number>(15);
  const [sabaqGrade, setSabaqGrade] = useState<MemorizationQuality>('Mumtaz (Excellent)');
  const [sabaqScore, setSabaqScore] = useState<number>(97);

  // Sabqi (Recent 5-10 lessons revision)
  const [sabqiSurah, setSabqiSurah] = useState<string>('Ali \'Imran (آل عمران)');
  const [sabqiAyahRange, setSabqiAyahRange] = useState<string>('Ayah 120 - 145');
  const [sabqiPages, setSabqiPages] = useState<string>('65-67 (3 Pages)');
  const [sabqiGrade, setSabqiGrade] = useState<MemorizationQuality>('Mumtaz (Excellent)');
  const [sabqiScore, setSabqiScore] = useState<number>(95);

  // Manzil / Dhor (Old Juz retention)
  const [manzilJuzNumber, setManzilJuzNumber] = useState<number>(3);
  const [manzilHizbNumber, setManzilHizbNumber] = useState<number>(5);
  const [manzilGrade, setManzilGrade] = useState<MemorizationQuality>('Mumtaz (Excellent)');
  const [manzilScore, setManzilScore] = useState<number>(96);

  const [teacherNotes, setTeacherNotes] = useState<string>('Excellent fluency on all three tiers today.');

  const currentStudent = isStudent
    ? (resolvedStudent || students[0])
    : (students.find((s) => s.id === selectedStudentId) || students[0]);
  const selectedSabaqSurah = SURAHS_LIST.find((s) => s.number === Number(sabaqSurahNumber)) || SURAHS_LIST[2];

  const handleSaveDailySession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHifzTeacherOrAdmin) {
      alert('Permission Denied: Only Hifz Ustazs and academic faculty can evaluate and record daily 3-tier sessions.');
      return;
    }
    if (!currentStudent) return;

    const newEntry: DailySabaqEntry = {
      id: `sabaq-${Date.now().toString().slice(-4)}`,
      studentId: currentStudent.id,
      studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
      date: new Date().toISOString().split('T')[0],
      sabaqSurah: `${selectedSabaqSurah.nameEnglish} (${selectedSabaqSurah.nameArabic})`,
      sabaqSurahNumber: selectedSabaqSurah.number,
      sabaqAyahStart: Number(sabaqAyahStart),
      sabaqAyahEnd: Number(sabaqAyahEnd),
      sabaqPage: Number(sabaqPage),
      sabaqLines: Number(sabaqLines),
      sabaqGrade,
      sabaqScore: Number(sabaqScore),

      sabqiSurah,
      sabqiAyahRange,
      sabqiPages,
      sabqiGrade,
      sabqiScore: Number(sabqiScore),

      manzilJuzNumber: Number(manzilJuzNumber),
      manzilHizbNumber: Number(manzilHizbNumber),
      manzilGrade,
      manzilScore: Number(manzilScore),

      overallAttendance: 'present',
      teacherNotes,
      teacherName: currentUser?.name || 'Sheikh Bilal Ibrahim',
    };

    setDailyEntries((prev) => [newEntry, ...prev]);

    // Also record in central Hifz context for student progress
    recordHifzSession({
      studentId: currentStudent.id,
      studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
      teacherId: currentUser?.id || 'tch-1',
      teacherName: currentUser?.name || 'Sheikh Bilal Ibrahim',
      date: new Date().toISOString().split('T')[0],
      sessionType: 'sabaq',
      surahNumber: selectedSabaqSurah.number,
      surahName: `${selectedSabaqSurah.nameEnglish} (${selectedSabaqSurah.nameArabic})`,
      ayahStart: Number(sabaqAyahStart),
      ayahEnd: Number(sabaqAyahEnd),
      juz: selectedSabaqSurah.startJuz,
      pageNumber: Number(sabaqPage),
      memorizationQuality: sabaqGrade,
      tajweedScore: Number(sabaqScore),
      fluencyScore: Number(sabaqScore),
      teacherNotes,
      isVerified: true,
    });

    alert(`Masha'Allah! Daily Sabaq, Sabqi, and Manzil (Dhor) recorded successfully for ${currentStudent.firstName}.`);
  };

  const visibleEntries = isStudent && currentStudent
    ? dailyEntries.filter(e => e.studentId === currentStudent.id || e.studentName.toLowerCase().includes(currentStudent.firstName.toLowerCase()))
    : dailyEntries;

  const filteredEntries = visibleEntries.filter((entry) => {
    return entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sabaqSurah.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Overview Info Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Classical Madrasa 3-Tier Hifz System
            </span>
            <span className="text-xs font-arabic text-slate-500 font-bold">
              السبق والسبقي والمنزل (الدور اليومي)
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Daily Sabaq, Sabqi &amp; Manzil (Dhor) Manager
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Strict classical methodology: <strong>1. Sabaq</strong> (today's new lesson), <strong>2. Sabqi / Amokhta</strong> (recent 5-10 Sabaqs revision), and <strong>3. Manzil / Dhor</strong> (major retention of 1 full older Juz on a rotating 30-day cycle).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-[10px] font-bold uppercase block">Today's Sessions</span>
            <span className="text-lg font-black font-mono">{dailyEntries.length} Recited</span>
          </div>
        </div>
      </div>

      {/* 3-Tier Structure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Sabaq */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 dark:from-emerald-950/40 dark:to-teal-950/10 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-black text-[10px] uppercase rounded-full">
              Tier 1
            </span>
            <span className="font-arabic font-bold text-emerald-950 dark:text-emerald-200 text-base">
              السبق (الدرس الجديد)
            </span>
          </div>
          <h3 className="text-base font-black text-emerald-950 dark:text-emerald-100">
            Sabaq (New Lesson)
          </h3>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
            Memorization of new lines/pages today (usually 10-15 lines or 1 page). Must be recited without looking or hesitation.
          </p>
        </div>

        {/* Tier 2: Sabqi */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50/30 dark:from-teal-950/40 dark:to-cyan-950/10 p-5 rounded-3xl border border-teal-200 dark:border-teal-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-teal-600 text-white font-black text-[10px] uppercase rounded-full">
              Tier 2
            </span>
            <span className="font-arabic font-bold text-teal-950 dark:text-teal-200 text-base">
              السبقي (الأموخته)
            </span>
          </div>
          <h3 className="text-base font-black text-teal-950 dark:text-teal-100">
            Sabqi (Recent Revision)
          </h3>
          <p className="text-xs text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
            Revision of the preceding 5 to 10 Sabaqs / half-juz to bridge new lessons into long-term memory.
          </p>
        </div>

        {/* Tier 3: Manzil */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/30 dark:from-purple-950/40 dark:to-indigo-950/10 p-5 rounded-3xl border border-purple-200 dark:border-purple-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-purple-600 text-white font-black text-[10px] uppercase rounded-full">
              Tier 3
            </span>
            <span className="font-arabic font-bold text-purple-950 dark:text-purple-200 text-base">
              المنزل (الدور / المراجعة الكبرى)
            </span>
          </div>
          <h3 className="text-base font-black text-purple-950 dark:text-purple-100">
            Manzil / Dhor (Old Juz)
          </h3>
          <p className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
            Daily recitation of 1 full older memorized Juz on a monthly repeating Khatmah rotation.
          </p>
        </div>
      </div>

      {/* Daily Multi-Tier Session Entry Form (Faculty/Ustaz only) or Student Assigned Targets Card */}
      {!isStudent ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Log Today's Tri-Part Hifz Session
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Date: {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <form onSubmit={handleSaveDailySession} className="space-y-6 text-xs">
          {/* Student Picker */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Select Reciting Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.arabicName}) — {st.quranProgress.juzCompleted}/30 Juz • {st.hifzCircleName}
                </option>
              ))}
            </select>
          </div>

          {/* Tri-Part Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Sabaq */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase block pb-1 border-b border-emerald-200 dark:border-emerald-800">
                1. Sabaq (السبق الجديد)
              </span>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Surah</label>
                <select
                  value={sabaqSurahNumber}
                  onChange={(e) => setSabaqSurahNumber(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {SURAHS_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameEnglish} ({s.nameArabic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Ayah Start</label>
                  <input
                    type="number"
                    value={sabaqAyahStart}
                    onChange={(e) => setSabaqAyahStart(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Ayah End</label>
                  <input
                    type="number"
                    value={sabaqAyahEnd}
                    onChange={(e) => setSabaqAyahEnd(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Page #</label>
                  <input
                    type="number"
                    value={sabaqPage}
                    onChange={(e) => setSabaqPage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Lines</label>
                  <input
                    type="number"
                    value={sabaqLines}
                    onChange={(e) => setSabaqLines(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Grade</label>
                  <select
                    value={sabaqGrade}
                    onChange={(e) => setSabaqGrade(e.target.value as MemorizationQuality)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold"
                  >
                    <option value="Mumtaz (Excellent)">Mumtaz (A+)</option>
                    <option value="Jayyid Jiddan (Very Good)">Jayyid Jiddan (A)</option>
                    <option value="Jayyid (Good)">Jayyid (B)</option>
                    <option value="Needs Revision">Needs Revision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Score (0-100)</label>
                  <input
                    type="number"
                    value={sabaqScore}
                    onChange={(e) => setSabaqScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Sabqi */}
            <div className="bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-2xl border border-teal-200 dark:border-teal-800/60 space-y-3">
              <span className="text-xs font-black text-teal-950 dark:text-teal-300 uppercase block pb-1 border-b border-teal-200 dark:border-teal-800">
                2. Sabqi (السبقي - مراجعة القريب)
              </span>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Surah / Section</label>
                <input
                  type="text"
                  value={sabqiSurah}
                  onChange={(e) => setSabqiSurah(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Ayah Range</label>
                <input
                  type="text"
                  value={sabqiAyahRange}
                  onChange={(e) => setSabqiAyahRange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Pages Recited</label>
                <input
                  type="text"
                  value={sabqiPages}
                  onChange={(e) => setSabqiPages(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Grade</label>
                  <select
                    value={sabqiGrade}
                    onChange={(e) => setSabqiGrade(e.target.value as MemorizationQuality)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold"
                  >
                    <option value="Mumtaz (Excellent)">Mumtaz (A+)</option>
                    <option value="Jayyid Jiddan (Very Good)">Jayyid Jiddan (A)</option>
                    <option value="Jayyid (Good)">Jayyid (B)</option>
                    <option value="Needs Revision">Needs Revision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Score</label>
                  <input
                    type="number"
                    value={sabqiScore}
                    onChange={(e) => setSabqiScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 3. Manzil */}
            <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 space-y-3">
              <span className="text-xs font-black text-purple-950 dark:text-purple-300 uppercase block pb-1 border-b border-purple-200 dark:border-purple-800">
                3. Manzil (المنزل - الدور القديم)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Juz # (1-30)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={manzilJuzNumber}
                    onChange={(e) => setManzilJuzNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Hizb # (1-60)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={manzilHizbNumber}
                    onChange={(e) => setManzilHizbNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Rotation Cycle</label>
                <span className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl block font-mono text-slate-700 dark:text-slate-300">
                  Monthly Rotation • Juz {manzilJuzNumber} of 30
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-5">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Grade</label>
                  <select
                    value={manzilGrade}
                    onChange={(e) => setManzilGrade(e.target.value as MemorizationQuality)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold"
                  >
                    <option value="Mumtaz (Excellent)">Mumtaz (A+)</option>
                    <option value="Jayyid Jiddan (Very Good)">Jayyid Jiddan (A)</option>
                    <option value="Jayyid (Good)">Jayyid (B)</option>
                    <option value="Needs Revision">Needs Revision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Score</label>
                  <input
                    type="number"
                    value={manzilScore}
                    onChange={(e) => setManzilScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Submit */}
          <div className="space-y-3">
            <textarea
              rows={2}
              placeholder="Ustaz overall comments on fluency, Tajweed rules, and student effort..."
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs"
            />

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              Save Complete Tri-Part Session (Sabaq + Sabqi + Manzil)
            </button>
          </div>
        </form>
      </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  My Daily 3-Tier Recitation Targets (جدولي اليومي)
                </h3>
                <p className="text-xs text-slate-500 font-arabic">
                  الطالب: {currentStudent?.firstName} {currentStudent?.lastName} • حلقة: {currentStudent?.hifzCircleName}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs self-start">
              Verified Student Dashboard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-emerald-200/80 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block mb-1">
                1. Sabaq (السبق الجديد)
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Surah Ali 'Imran (Ayah 146 - 160)
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Target: 1 Page (Page 68, 15 Lines)</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-teal-200/80 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider block mb-1">
                2. Sabqi (السبقي الأموخته)
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Surah Ali 'Imran (Ayah 120 - 145)
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Target: Pages 65-67 (3 Pages)</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-purple-200/80 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block mb-1">
                3. Manzil / Dhor (المنزل الدور)
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Juz 3 (Tilka Ar-Rusul)
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Target: Hizb 5 &amp; 6 (Full Juz Retention)</p>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Recite these three portions daily to your Halqah Ustaz. Once tested, your evaluations will appear in your ledger below.</span>
          </div>
        </div>
      )}

      {/* Daily Records Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isStudent ? 'My 3-Tier Recitation Ledger (سجل تسميعي اليومي)' : 'Daily Tri-Part Session Ledger'}
            </h3>
            <p className="text-xs text-slate-500">
              {isStudent ? `السجل المعتمد لتقييمات الطالب ${currentStudent?.firstName}` : 'Live audit of student recitation submissions today'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or surah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Date &amp; Student</th>
                <th className="p-3.5">Tier 1: Sabaq (New)</th>
                <th className="p-3.5">Tier 2: Sabqi (Recent)</th>
                <th className="p-3.5">Tier 3: Manzil (Dhor)</th>
                <th className="p-3.5">Ustaz Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 whitespace-nowrap">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {entry.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.date} • {entry.teacherName}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        {entry.sabaqSurah}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Ayat {entry.sabaqAyahStart}-{entry.sabaqAyahEnd} (p. {entry.sabaqPage})
                      </p>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                        {entry.sabaqScore}% {entry.sabaqGrade}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-teal-800 dark:text-teal-300">
                        {entry.sabqiSurah}
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono">{entry.sabqiPages}</p>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono">
                        {entry.sabqiScore}%
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-purple-800 dark:text-purple-300">
                        Juz {entry.manzilJuzNumber} {entry.manzilHizbNumber ? `(Hizb ${entry.manzilHizbNumber})` : ''}
                      </span>
                      <p className="text-[11px] text-slate-500">Monthly Dhor Cycle</p>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono">
                        {entry.manzilScore}%
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <p className="text-slate-600 dark:text-slate-400 text-xs italic line-clamp-2">
                      "{entry.teacherNotes}"
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
