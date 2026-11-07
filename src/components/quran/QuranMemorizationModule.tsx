import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { SURAHS_LIST } from '../../data/mockData';
import type { MemorizationQuality } from '../../types';
import { JuzCompletionJourney } from './JuzCompletionJourney';
import { TajweedVoiceRecorder } from './TajweedVoiceRecorder';
import { SabaqSabqiManzilManager } from './SabaqSabqiManzilManager';
import { KhatmahPacingEstimator } from './KhatmahPacingEstimator';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import { canRecordHifz } from '../../utils/permissions';
import { recitationAudioEngine } from '../../utils/audioPlayer';
import {
  BookOpen,
  CheckCircle2,
  Award,
  Sparkles,
  PlusCircle,
  History,
  Search,
  Filter,
  Volume2,
  Layers,
  Star,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Mic,
  Calendar,
  Sliders,
} from 'lucide-react';

export const QuranMemorizationModule: React.FC = () => {
  const { students, hifzSessions, recordHifzSession, teachers, setActiveTab, currentUser } = useMadrasa();

  const isHifzTeacherOrAdmin = canRecordHifz(currentUser?.role);
  const isStudent = currentUser?.role === 'student';

  // Identify matching student for the current logged-in user if student role
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
    isStudent && resolvedStudent ? resolvedStudent.id : students[0]?.id || ''
  );

  // Keep student locked to resolvedStudent when in student role
  useEffect(() => {
    if (isStudent && resolvedStudent && selectedStudentId !== resolvedStudent.id) {
      setSelectedStudentId(resolvedStudent.id);
    }
  }, [isStudent, resolvedStudent, selectedStudentId]);

  const [sessionType, setSessionType] = useState<'sabaq' | 'sabqi' | 'murajaah'>('sabaq');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(3);
  const [ayahStart, setAyahStart] = useState<number>(1);
  const [ayahEnd, setAyahEnd] = useState<number>(15);
  const [memorizationQuality, setMemorizationQuality] = useState<MemorizationQuality>('Mumtaz (Excellent)');
  const [tajweedScore, setTajweedScore] = useState<number>(95);
  const [fluencyScore, setFluencyScore] = useState<number>(95);
  const [teacherNotes, setTeacherNotes] = useState<string>('Excellent recitation with proper Ghunnah and Madd.');
  const [activeTabSub, setActiveTabSub] = useState<'juz_journey' | 'sabaq_3tier' | 'voice_studio' | 'pacing' | 'quick_logger' | 'history' | 'surahs'>('juz_journey');
  const [surahSearch, setSurahSearch] = useState('');
  const [, setAudioTick] = useState(0);

  useEffect(() => {
    const unsubscribe = recitationAudioEngine.subscribe(() => {
      setAudioTick((prev) => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  const currentStudent = isStudent
    ? (resolvedStudent || students[0])
    : (students.find(s => s.id === selectedStudentId) || students[0]);
  const selectedSurah = SURAHS_LIST.find(s => s.number === Number(selectedSurahNumber)) || SURAHS_LIST[2];

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHifzTeacherOrAdmin) {
      alert('Permission Denied: Only Hifz Ustazs and academic faculty can record official evaluated sessions.');
      return;
    }
    if (!currentStudent) return;

    recordHifzSession({
      studentId: currentStudent.id,
      studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
      teacherId: currentUser?.id || 'tch-1',
      teacherName: currentUser?.name || 'Sheikh Bilal Ibrahim',
      date: new Date().toISOString().split('T')[0],
      sessionType,
      surahNumber: selectedSurah.number,
      surahName: `${selectedSurah.nameEnglish} (${selectedSurah.nameArabic})`,
      ayahStart: Number(ayahStart),
      ayahEnd: Number(ayahEnd),
      juz: selectedSurah.startJuz,
      pageNumber: selectedSurah.startPage,
      memorizationQuality,
      tajweedScore: Number(tajweedScore),
      fluencyScore: Number(fluencyScore),
      teacherNotes,
      isVerified: true,
    });

    alert(`Alhamdulillah! ${sessionType.toUpperCase()} session recorded for ${currentStudent.firstName}. Progress updated.`);
  };

  const filteredSurahs = SURAHS_LIST.filter(
    s =>
      s.nameEnglish.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.nameArabic.includes(surahSearch) ||
      s.number.toString() === surahSearch
  );

  // If student, filter sessions to only show their own evaluated audit trail
  const visibleHifzSessions = isStudent && currentStudent
    ? hifzSessions.filter(s => s.studentId === currentStudent.id || s.studentName.toLowerCase().includes(currentStudent.firstName.toLowerCase()))
    : hifzSessions;

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Qur'an Memorization & Hifz Sessions Database"
        arabicPageName="إدارة تحفيظ القرآن الكريم وسجل الحلقات"
        recordCount={hifzSessions.length}
        recordLabel="Evaluated Hifz Sessions"
      />

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950">
              Qur'an Memorization Department • Phase 2
            </span>
            <span className="text-xs font-arabic text-emerald-300 font-semibold">
              قسم تحفيظ القرآن الكريم والإقراء بالسند المتصل
            </span>
          </div>
          <h1 className="text-2xl font-black font-arabic mt-1">
            متابعة الحفظ اليومي، المراجعة الصغرى، والإقراء بالسند
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
            Full Phase 2 Suite: 30-Juz Visual Khatmah Matrix, Live Voice Recitation Recorder & Tajweed Error Annotator, 3-Tier Sabaq/Sabqi/Manzil Manager, and Khatmah Pacing & Ijazah Predictor.
          </p>
        </div>

        {/* Quick Ijazah Banner */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3">
          <div className="p-2.5 bg-amber-400 text-amber-950 rounded-xl font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Ready for Ijazah & Sanad</span>
            <span className="text-[11px] text-amber-200">
              {students.filter(s => s.quranProgress.juzCompleted >= 30).length} Huffaz Completed 30 Juz
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveTabSub('juz_journey')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTabSub === 'juz_journey'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>30-Juz Visual Khatmah Map</span>
        </button>

        <button
          onClick={() => setActiveTabSub('sabaq_3tier')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTabSub === 'sabaq_3tier'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Sabaq / Sabqi / Manzil 3-Tier</span>
        </button>

        <button
          onClick={() => setActiveTabSub('voice_studio')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTabSub === 'voice_studio'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Tajweed Voice Studio &amp; Annotator</span>
        </button>

        <button
          onClick={() => setActiveTabSub('pacing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTabSub === 'pacing'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Khatmah Pacing &amp; Ijazah Predictor</span>
        </button>

        {isHifzTeacherOrAdmin && (
          <button
            onClick={() => setActiveTabSub('quick_logger')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTabSub === 'quick_logger'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Quick Single Session Logger</span>
          </button>
        )}

        <button
          onClick={() => setActiveTabSub('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTabSub === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isStudent ? 'My Session Logs' : 'Session Logs'} ({visibleHifzSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('surahs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTabSub === 'surahs'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>114 Surahs Index</span>
        </button>
      </div>

      {/* Tab 1: 30-Juz Visual Khatmah Matrix */}
      {activeTabSub === 'juz_journey' && <JuzCompletionJourney />}

      {/* Tab 2: Sabaq / Sabqi / Manzil 3-Tier Daily Manager */}
      {activeTabSub === 'sabaq_3tier' && <SabaqSabqiManzilManager />}

      {/* Tab 3: Interactive Tajweed Voice Studio & Annotator */}
      {activeTabSub === 'voice_studio' && <TajweedVoiceRecorder />}

      {/* Tab 4: Khatmah Pacing & Ijazah Graduation Predictor */}
      {activeTabSub === 'pacing' && <KhatmahPacingEstimator />}

      {/* Tab 5: Quick Single Session Logger */}
      {activeTabSub === 'quick_logger' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recorder Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Record Memorization &amp; Tajweed Evaluation</h2>
                <p className="text-xs text-slate-500 font-arabic">تسجيل التسميع اليومي ومستوى التجويد والطلاقة</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                Instructor: Sheikh Bilal Ibrahim
              </span>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              {/* Student & Session Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Student *</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.firstName} {st.lastName} ({st.arabicName}) - {st.quranProgress.juzCompleted}/30 Juz
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Session Type *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSessionType('sabaq')}
                      className={`py-2 px-1 text-center rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        sessionType === 'sabaq'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Sabaq (New)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('sabqi')}
                      className={`py-2 px-1 text-center rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        sessionType === 'sabqi'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Sabqi (Recent)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('murajaah')}
                      className={`py-2 px-1 text-center rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        sessionType === 'murajaah'
                          ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Muraja'ah (Old)
                    </button>
                  </div>
                </div>
              </div>

              {/* Surah & Ayah Bounds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Surah (السورة)</label>
                  <select
                    value={selectedSurahNumber}
                    onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    {SURAHS_LIST.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.nameEnglish} ({s.nameArabic}) - Juz {s.startJuz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ayah Start</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedSurah.numberOfAyahs}
                    value={ayahStart}
                    onChange={(e) => setAyahStart(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ayah End (Max {selectedSurah.numberOfAyahs})</label>
                  <input
                    type="number"
                    min={ayahStart}
                    max={selectedSurah.numberOfAyahs}
                    value={ayahEnd}
                    onChange={(e) => setAyahEnd(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Evaluation Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Memorization Quality (التقدير)</label>
                  <select
                    value={memorizationQuality}
                    onChange={(e) => setMemorizationQuality(e.target.value as MemorizationQuality)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-900 dark:text-emerald-300"
                  >
                    <option value="Mumtaz (Excellent)">Mumtaz (Excellent)</option>
                    <option value="Jayyid Jiddan (Very Good)">Jayyid Jiddan (Very Good)</option>
                    <option value="Jayyid (Good)">Jayyid (Good)</option>
                    <option value="Maqbool (Fair)">Maqbool (Fair)</option>
                    <option value="Needs Revision">Needs Revision (إعادة)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tajweed Score (1 - 100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tajweedScore}
                    onChange={(e) => setTajweedScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-800 dark:text-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Fluency &amp; Retention Score</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={fluencyScore}
                    onChange={(e) => setFluencyScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-800 dark:text-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Teacher Feedback &amp; Makharij Notes</label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed"
                  placeholder="Record specific feedback regarding Waqf, Ikhfa, Idgham, or Ayah connection..."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Hifz Record &amp; Update Khatmah</span>
                </button>
              </div>
            </form>
          </div>

          {/* Student Hifz Card Sidebar Preview */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={currentStudent?.photoUrl}
                  alt={currentStudent?.firstName}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {currentStudent?.firstName} {currentStudent?.lastName}
                  </h3>
                  <p className="text-xs font-arabic text-emerald-800 dark:text-emerald-400 font-bold">{currentStudent?.arabicName}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{currentStudent?.admissionNumber}</span>
                </div>
              </div>

              {/* Stats Box */}
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Qur'an Khatmah Progress</span>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-mono">
                      {currentStudent?.quranProgress.juzCompleted} / 30 Juz
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200/60 dark:bg-emerald-900 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStudent?.quranProgress.juzCompleted / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-1 font-medium">
                    Current Surah: {currentStudent?.quranProgress.currentSurahName} (Ayah {currentStudent?.quranProgress.currentAyah})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Tajweed Avg</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-black font-mono">
                      {currentStudent?.quranProgress.tajweedScoreAvg}%
                    </strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Fluency Avg</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-black font-mono">
                      {currentStudent?.quranProgress.memorizationScoreAvg}%
                    </strong>
                  </div>
                </div>

                {currentStudent?.quranProgress.juzCompleted >= 30 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Hafiz Certificate / Sanad Ready</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Student has completed 30 Juz. Click below to issue the official Madrasa Sanad with Khatmah verification.
                    </p>
                    <button
                      onClick={() => setActiveTab('certificates')}
                      className="mt-2 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer"
                    >
                      Issue Official Sanad Certificate &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span>Circle: {currentStudent?.hifzCircleName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Hifz Session History Logs */}
      {activeTabSub === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isStudent ? 'My Recitation & Evaluation Audit Trail (سجلي الشخصي)' : 'Daily Recitation & Evaluation Audit Trail'}
              </h2>
              <p className="text-[11px] text-slate-500 font-arabic">
                {isStudent ? `سجل التسميع المعتمد للطالب ${currentStudent?.firstName}` : 'سجل التسميع اليومي لجميع طلاب الحلقات'}
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total {visibleHifzSessions.length} sessions logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Surah &amp; Ayahs</th>
                  <th className="px-4 py-3">Quality &amp; Tajweed</th>
                  <th className="px-4 py-3">Teacher Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {visibleHifzSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No memorization sessions logged yet.
                    </td>
                  </tr>
                ) : (
                  visibleHifzSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-slate-500">{session.date}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{session.studentName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 uppercase">
                          {session.sessionType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 font-arabic text-sm block">
                          {session.surahName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Ayahs {session.ayahStart} - {session.ayahEnd} (Juz {session.juz})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">{session.memorizationQuality}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Tajweed: {session.tajweedScore}% • Fluency: {session.fluencyScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 italic text-[11px] max-w-xs">
                        "{session.teacherNotes}"
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: 114 Surahs Directory */}
      {activeTabSub === 'surahs' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Holy Qur'an Surahs Index (114 Surahs)</h2>
              <p className="text-xs text-slate-500 font-arabic">فهرس سور القرآن الكريم</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search surah name, number..."
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map((surah) => {
              const surahAudioId = `surah-card-${surah.number}`;
              const isPlayingThisSurah = recitationAudioEngine.isPlaying(surahAudioId);

              return (
                <div
                  key={surah.number}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingThisSurah) {
                          recitationAudioEngine.stop();
                        } else {
                          recitationAudioEngine.play({
                            id: surahAudioId,
                            surahNumber: surah.number,
                            ayahStart: 1,
                            durationSeconds: 16,
                          });
                        }
                      }}
                      className={`w-8 h-8 rounded-xl font-mono font-bold flex items-center justify-center text-xs shrink-0 cursor-pointer transition ${
                        isPlayingThisSurah
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white'
                      }`}
                      title={isPlayingThisSurah ? 'Pause Recitation' : `Listen to Surah ${surah.nameEnglish}`}
                    >
                      {isPlayingThisSurah ? <Volume2 className="w-4 h-4 animate-bounce" /> : surah.number}
                    </button>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">{surah.nameEnglish}</span>
                      <span className="text-[10px] text-slate-500">
                        {surah.numberOfAyahs} Ayahs • {surah.revelationType}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-arabic font-bold text-emerald-800 dark:text-emerald-300 block">
                      {surah.nameArabic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Juz {surah.startJuz}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

