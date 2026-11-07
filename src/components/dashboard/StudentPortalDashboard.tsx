import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Volume2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentPortalDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    hifzSessions,
    homeworkList,
    attendanceRecords,
    announcements,
    setActiveTab,
    language,
  } = useMadrasa();

  // Identify student from mock data or match by user id / email
  const student =
    students.find(s => s.guardianEmail === currentUser?.email || s.id === 'std-101') ||
    students[0];

  // Student specific data
  const myHifzSessions = hifzSessions.filter(h => h.studentId === student?.id);
  const lastSession = myHifzSessions[0] || {
    surahName: 'Ali \'Imran (آل عمران)',
    ayahStart: 1,
    ayahEnd: 20,
    memorizationQuality: 'Mumtaz (Excellent)',
    tajweedScore: 96,
    fluencyScore: 98,
    teacherNotes: 'Ma Sha Allah! Flawless Makharij and strong voice retention.',
    date: '2026-08-18',
  };

  const myHomework = homeworkList.slice(0, 3);
  const myAttendance = attendanceRecords.filter(a => a.studentId === student?.id);
  const attendanceRate = 98;

  const juzCompleted = student?.quranProgress?.juzCompleted || 5;
  const juzTarget = 30;
  const progressPercent = Math.round((juzCompleted / juzTarget) * 100);

  return (
    <div className="space-y-6">
      {/* Student Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Portal • بوابة طالب العلم</span>
              </span>
              <span className="text-xs text-emerald-300 font-mono font-bold">
                ID: {student?.admissionNumber || 'AIM-2026-101'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ar' ? `أهلاً بك يا ${currentUser?.name || student?.firstName}` : language === 'am' ? `እንኳን ደህና መጣህ ${currentUser?.name || student?.firstName}` : `Welcome Back, ${currentUser?.name || student?.firstName}`}
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Enrolled in <span className="font-bold text-white">{student?.currentClass || 'Class 201 - Advanced Tahfeez'}</span> • Circle:{' '}
              <span className="font-bold text-amber-300">{student?.hifzCircleName || 'Halaqah Abu Bakr As-Siddiq'}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('quran')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>My 30-Juz Progress</span>
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-300" />
              <span>Submit Homework</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Juz Completed */}
        <div
          onClick={() => setActiveTab('quran')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Memorized Juz</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{juzCompleted}</span>
            <span className="text-xs font-bold text-slate-400">/ 30 Juz ({progressPercent}%)</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Sabaq Quality */}
        <div
          onClick={() => setActiveTab('quran')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tajweed Score</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{lastSession.tajweedScore}%</span>
            <span className="text-xs font-bold text-emerald-600">Mumtaz (ممتاز)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate">Last: {lastSession.surahName}</p>
        </div>

        {/* Attendance Rate */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Attendance</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{attendanceRate}%</span>
            <span className="text-xs font-bold text-teal-600">Punctual & Active</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">0 unexcused absences this term</p>
        </div>

        {/* Pending Homework */}
        <div
          onClick={() => setActiveTab('homework')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assignments</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{myHomework.length} Active</span>
            <span className="text-xs font-bold text-indigo-600">1 Audio Due</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Click to record oral recitation</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Sabaq & Qur'an Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Target & Teacher Note */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Sabaq & Recitation Status</h3>
                  <p className="text-xs text-slate-500 font-arabic">متابعة السبق والمراجعة اليومية من الشيخ</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Verified Today
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Current Portion:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{lastSession.surahName}</span>
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono">
                    Ayahs {lastSession.ayahStart}-{lastSession.ayahEnd}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{lastSession.date}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                  <span className="text-xs font-bold text-emerald-600">{lastSession.memorizationQuality}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tajweed Score</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{lastSession.tajweedScore} / 100</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fluency</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{lastSession.fluencyScore} / 100</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Sheikh Remark: </span>
                <span className="text-slate-600 dark:text-slate-400 italic font-arabic">"{lastSession.teacherNotes}"</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveTab('quran')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full 30-Juz Progress History</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pending Homework Tasks */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>My Active Assignments</span>
              </h3>
              <button
                onClick={() => setActiveTab('homework')}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {myHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{hw.title}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded font-semibold">
                        {hw.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{hw.instructions}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> Due: {hw.dueDate}
                      </span>
                      <span>Max Points: {hw.totalPoints}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('homework')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
                  >
                    Submit Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links, Report Card Preview, Tuition */}
        <div className="space-y-6">
          {/* Official Report Card Box */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Academic Standing</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <div className="text-3xl font-black">96.5% GPA</div>
              <div className="text-xs text-emerald-300 font-bold mt-0.5">Rank: 2nd in Class 201 (Mumtaz)</div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Official Term II Report Card is ready with grades in Qur'an Hifz, Tajweed, Nahw, and Fiqh.
            </p>

            <button
              onClick={() => setActiveTab('exams')}
              className="w-full py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>View & Download Report Card</span>
            </button>
          </div>

          {/* Tuition & Fee Receipt Status */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tuition Status</span>
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 dark:text-slate-300">Term II Tuition:</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                Paid (Verified)
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Receipt No: <span className="font-mono text-slate-600 dark:text-slate-300">AIM-REC-2026-088</span> (Telebirr)
            </p>

            <button
              onClick={() => setActiveTab('finance')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              View Payment Receipts
            </button>
          </div>

          {/* Madrasa Announcements */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Madrasa Announcements
            </h4>
            <div className="space-y-2 text-xs">
              {announcements.slice(0, 2).map((a) => (
                <div key={a.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{a.title}</span>
                  <span className="text-[10px] text-slate-400">{a.publishedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
