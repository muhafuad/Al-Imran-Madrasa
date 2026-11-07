import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { PacingTargetCalculation } from '../../types/quranTypes';
import {
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldCheck,
  Target,
  Sliders,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

export const KhatmahPacingEstimator: React.FC = () => {
  const { students, currentUser } = useMadrasa();

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
  const [dailyPacePages, setDailyPacePages] = useState<number>(1.0); // 1 page/day
  const [weeklyStudyDays, setWeeklyStudyDays] = useState<number>(6); // 6 days per week

  // Keep synced to resolved student if student role
  React.useEffect(() => {
    if (isStudent && resolvedStudent && selectedStudentId !== resolvedStudent.id) {
      setSelectedStudentId(resolvedStudent.id);
    }
  }, [isStudent, resolvedStudent, selectedStudentId]);

  const currentStudent = isStudent && resolvedStudent
    ? resolvedStudent
    : (students.find((s) => s.id === selectedStudentId) || students[0]);
  const juzCompleted = currentStudent?.quranProgress.juzCompleted || 0;

  // Madani Mushaf standard: 604 total pages, ~20 pages per Juz
  const TOTAL_PAGES = 604;
  const pagesCompleted = Math.min(TOTAL_PAGES, juzCompleted * 20 + 4);
  const pagesRemaining = Math.max(0, TOTAL_PAGES - pagesCompleted);

  // Calculate estimated days to completion
  const effectiveDailyRate = (dailyPacePages * weeklyStudyDays) / 7;
  const daysRemaining = effectiveDailyRate > 0 ? Math.ceil(pagesRemaining / effectiveDailyRate) : 999;

  const today = new Date();
  const projectedGraduationDate = new Date();
  projectedGraduationDate.setDate(today.getDate() + daysRemaining);

  const formattedGraduationDate = projectedGraduationDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate Milestone forecasts
  const getMilestoneDate = (targetJuz: number) => {
    if (targetJuz <= juzCompleted) return 'Completed';
    const pagesNeeded = (targetJuz - juzCompleted) * 20;
    const daysNeeded = effectiveDailyRate > 0 ? Math.ceil(pagesNeeded / effectiveDailyRate) : 0;
    const d = new Date();
    d.setDate(today.getDate() + daysNeeded);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Ijazah Readiness Criteria
  const is30JuzDone = juzCompleted >= 30;
  const isTajweedTop = (currentStudent?.quranProgress.tajweedScoreAvg || 0) >= 95;
  const isAttendanceTop = (currentStudent?.attendanceRate || 0) >= 95;
  const isDhorPassed = (currentStudent?.quranProgress.memorizationScoreAvg || 0) >= 95;

  const ijazahScore = Math.round(
    (juzCompleted / 30) * 50 +
      (currentStudent?.quranProgress.tajweedScoreAvg || 0) * 0.25 +
      (currentStudent?.quranProgress.memorizationScoreAvg || 0) * 0.25
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligent Khatmah &amp; Ijazah Predictor
            </span>
            <span className="text-xs font-arabic text-amber-200 font-bold">
              حساب سرعة الإنجاز والجاهزية للإجازة بالسند المتصل
            </span>
          </div>
          <h2 className="text-2xl font-black mt-1">
            Khatmah Pacing &amp; Ijazah Graduation Estimator
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Dynamic computational model forecasting complete Qur'an memorization graduation dates, milestone checkpoints, and Ijazah Sanad eligibility based on current daily pace and revision quality.
          </p>
        </div>

        {/* Graduation Forecast Callout */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center min-w-[240px]">
          <span className="text-xs text-amber-300 font-bold block uppercase tracking-wider">
            Projected Khatmah Graduation
          </span>
          <h3 className="text-xl font-black text-white mt-1">
            {juzCompleted >= 30 ? 'Khatmah Complete! 🎓' : formattedGraduationDate}
          </h3>
          <span className="text-[11px] text-slate-300 font-mono">
            {juzCompleted >= 30 ? '30 Juz Memorized' : `${daysRemaining} days remaining at ${dailyPacePages}p/day`}
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Calculator + Milestone Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulator Parameters */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Pacing Parameters
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
              Interactive
            </span>
          </div>

          {/* Student Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isStudent ? 'Active Student Record (الملف الحالي)' : 'Select Student *'}
            </label>
            {isStudent ? (
              <div className="w-full px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
                <span>
                  {currentStudent?.firstName} {currentStudent?.lastName} {currentStudent?.arabicName ? `(${currentStudent.arabicName})` : ''}
                </span>
                <span className="text-[10px] font-mono bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                  {currentStudent?.quranProgress.juzCompleted}/30 Juz
                </span>
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} ({st.arabicName}) — {st.quranProgress.juzCompleted}/30 Juz
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Daily Pace Slider */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Daily Sabaq Memorization Pace:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                {dailyPacePages} Page(s) / Day ({dailyPacePages * 15} lines)
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="3.0"
              step="0.25"
              value={dailyPacePages}
              onChange={(e) => setDailyPacePages(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0.25 p (Quarter)</span>
              <span>1.0 p (Standard)</span>
              <span>2.0 p (Fast-track)</span>
              <span>3.0 p (Intensive)</span>
            </div>
          </div>

          {/* Weekly Study Days */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Weekly Madrasa Study Days:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                {weeklyStudyDays} Days / Week
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setWeeklyStudyDays(days)}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    weeklyStudyDays === days
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Progress Math Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Pages Completed</span>
              <span className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-base">
                {pagesCompleted} / 604
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {Math.round((pagesCompleted / 604) * 100)}% of Madani Mushaf
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Pages Remaining</span>
              <span className="font-mono font-black text-amber-800 dark:text-amber-300 text-base">
                {pagesRemaining} Pages
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {30 - juzCompleted} Juz left to memorize
              </span>
            </div>
          </div>

          {/* Active Streak Tracker */}
          <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Active Hifz Daily Streak
                </span>
                <span className="text-[11px] text-slate-500">
                  Unbroken consecutive days recited
                </span>
              </div>
            </div>
            <span className="font-mono font-black text-xl text-orange-600 dark:text-orange-400">
              🔥 48 Days
            </span>
          </div>
        </div>

        {/* Right Column: Milestones Roadmap & Ijazah Checklist */}
        <div className="lg:col-span-7 space-y-6">
          {/* Milestone Checkpoint Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Khatmah Checkpoint Forecast Roadmap
              </h3>
              <span className="text-xs text-slate-400 font-mono">30 Juz Milestone Path</span>
            </div>

            <div className="space-y-3">
              {[
                { juz: 5, label: 'Juz 5 (First Quarter Milestone)', desc: 'Al-Baqarah & Ali Imran completed' },
                { juz: 10, label: 'Juz 10 (One Third Milestone)', desc: 'Surah An-Nisa through At-Tawbah' },
                { juz: 15, label: 'Juz 15 (Mid-Way Half-Khatmah)', desc: 'Surah Al-Kahf midway celebratory assessment' },
                { juz: 20, label: 'Juz 20 (Two Thirds Milestone)', desc: 'Surah Maryam through Al-Ankabut' },
                { juz: 25, label: 'Juz 25 (Advanced Homestretch)', desc: 'Surah Ya-Sin and Ha Meem Surahs' },
                { juz: 30, label: 'Juz 30 (Full Khatmah Graduation)', desc: 'Grand Khatm celebration & Sanad entrance' },
              ].map((m) => {
                const isPassed = juzCompleted >= m.juz;
                return (
                  <div
                    key={m.juz}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      isPassed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : `J${m.juz}`}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{m.label}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.desc}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs font-bold">
                      {isPassed ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Achieved ✓
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Est. {getMilestoneDate(m.juz)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ijazah Sanad Readiness Audit */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/40 dark:from-purple-950/30 dark:to-indigo-950/20 rounded-3xl p-6 border border-purple-200 dark:border-purple-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-200 dark:border-purple-800">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-black text-purple-950 dark:text-purple-100">
                    Ijazah بالسند المتصل Eligibility Audit
                  </h3>
                </div>
                <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
                  Requirements for authorization to teach with continuous chain of transmission to the Prophet ﷺ
                </p>
              </div>

              <span className="px-3 py-1 bg-purple-600 text-white rounded-full font-mono font-bold text-xs">
                Readiness: {ijazahScore}%
              </span>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900 flex items-center gap-2.5">
                {is30JuzDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold block">30 Juz Full Memorization</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Current: {juzCompleted}/30 Juz
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900 flex items-center gap-2.5">
                {isTajweedTop ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold block">Tajweed Precision &gt;= 95%</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Current Avg: {currentStudent?.quranProgress.tajweedScoreAvg || 94}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900 flex items-center gap-2.5">
                {isDhorPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold block">Dhor Retention Test Passed</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Score: {currentStudent?.quranProgress.memorizationScoreAvg || 96}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900 flex items-center gap-2.5">
                {isAttendanceTop ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div>
                  <span className="font-bold block">Halqah Attendance Rate &gt;= 95%</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Rate: {currentStudent?.attendanceRate || 98}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
