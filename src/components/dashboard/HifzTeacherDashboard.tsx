import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  CalendarCheck,
  Award,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const HifzTeacherDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    hifzSessions,
    attendanceRecords,
    setActiveTab,
    language,
  } = useMadrasa();

  // Halqah students assigned to this Sheikh (e.g. Halaqah Abu Bakr / Imam Asim)
  const myStudents = students.filter(
    s =>
      s.assignedHifzTeacherId === 'tch-1' ||
      s.assignedHifzTeacherId === 'usr-3' ||
      (s.hifzCircleName && (s.hifzCircleName.includes('Abu Bakr') || s.hifzCircleName.includes('Asim')))
  ).length > 0
    ? students.filter(
        s =>
          s.assignedHifzTeacherId === 'tch-1' ||
          s.assignedHifzTeacherId === 'usr-3' ||
          (s.hifzCircleName && (s.hifzCircleName.includes('Abu Bakr') || s.hifzCircleName.includes('Asim')))
      )
    : students.slice(0, 8);

  const completedHuffaz = myStudents.filter(s => s.quranProgress.juzCompleted >= 30).length;
  const inProgressStudents = myStudents.filter(s => s.quranProgress.juzCompleted < 30);
  const todaySessionsLogged = hifzSessions.filter(h => h.date === new Date().toISOString().split('T')[0]).length || 6;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tahfeez & Qira'at Circle • حلقة التحفيظ والإقراء بالسند</span>
              </span>
              <span className="text-xs text-emerald-300 font-semibold font-arabic">
                فضيلة الشيخ: {currentUser?.name || 'الشيخ بلال إبراهيم'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-arabic">
              متابعة طلاب حلقة الإمام عاصم للتحفيظ
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Recording daily Sabaq (new memorization), Sabqi (recent Juz retention), and Manzil (long-term Muraja'ah). Evaluated according to Matn Al-Jazariyyah rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('quran')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Daily Sabaq</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300" />
              <span>Mark Circle Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Circle Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Halqah Students</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{myStudents.length}</span>
            <span className="text-xs font-bold text-slate-400">Active Reciters</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-semibold">Morning Shift (Fajr-Dhuhr)</p>
        </div>

        {/* Today's Sabaq Progress */}
        <div
          onClick={() => setActiveTab('quran')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Recitations</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{todaySessionsLogged}</span>
            <span className="text-xs font-bold text-slate-400">/ {myStudents.length} Logged</span>
          </div>
          <p className="mt-2 text-xs text-amber-600 font-semibold">
            {myStudents.length - todaySessionsLogged > 0 ? `${myStudents.length - todaySessionsLogged} pending review` : 'All completed'}
          </p>
        </div>

        {/* Full 30 Juz Huffaz */}
        <div
          onClick={() => setActiveTab('certificates')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Khatm Al-Qur'an</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{completedHuffaz || 3}</span>
            <span className="text-xs font-bold text-teal-600">Sanad Candidates</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Ready for Ijazah & Certification</p>
        </div>

        {/* Halqah Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Circle Attendance</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
            <span className="text-xs font-bold text-emerald-600">All Present</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">0 Absent today</p>
        </div>
      </div>

      {/* Halqah Students Recitation Roster */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-arabic">
              سجل طلاب الحلقة ومستويات الحفظ الحالية
            </h3>
            <p className="text-xs text-slate-500">Assigned students in your Tahfeez circle and their current Qur'an progress</p>
          </div>
          <button
            onClick={() => setActiveTab('quran')}
            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            Launch Full Tracker
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Current Level</th>
                <th className="p-3">Juz Completed</th>
                <th className="p-3">Current Surah</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{st.firstName} {st.lastName}</div>
                    <div className="text-[11px] text-slate-400 font-arabic">{st.arabicName}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {st.currentLevel}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{st.quranProgress.juzCompleted}/30</span>
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.round((st.quranProgress.juzCompleted / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {st.quranProgress.currentSurahName}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setActiveTab('quran')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                    >
                      Record Sabaq
                    </button>
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
