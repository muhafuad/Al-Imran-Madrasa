import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Receipt,
  Award,
  Sparkles,
  PhoneCall,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Heart,
  PlusCircle,
} from 'lucide-react';

export const ParentPortalDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    hifzSessions,
    homeworkList,
    attendanceRecords,
    payments,
    setActiveTab,
    language,
  } = useMadrasa();

  // Family students (all children associated with this parent or mock fallback)
  const familyStudents = students.slice(0, 2);
  const [selectedChildId, setSelectedChildId] = useState<string>(familyStudents[0]?.id || 'std-101');

  const selectedChild = familyStudents.find(s => s.id === selectedChildId) || familyStudents[0];

  const childHifzLogs = hifzSessions.filter(h => h.studentId === selectedChild?.id);
  const latestHifz = childHifzLogs[0] || {
    surahName: 'Ali \'Imran (آل عمران)',
    ayahStart: 1,
    ayahEnd: 20,
    memorizationQuality: 'Mumtaz (Excellent)',
    tajweedScore: 96,
    teacherNotes: 'Very disciplined memorization and respectful behavior.',
    date: '2026-08-18',
  };

  const childAttendance = attendanceRecords.filter(a => a.studentId === selectedChild?.id);
  const totalDue = selectedChild?.feeBalance || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-amber-950" />
                <span>Parent & Guardian Portal • بوابة ولي الأمر</span>
              </span>
              <span className="text-xs text-rose-300 font-semibold">
                {familyStudents.length} Children Enrolled
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ar' ? `مرحباً بكم يا ${currentUser?.name || 'ولي الأمر'}` : `Welcome, ${currentUser?.name || 'Respected Guardian'}`}
            </h1>
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
              Monitoring your children's daily Qur'an memorization, Islamic manners (Adab), attendance, homework, and tuition billing at Al-Imran Madrasa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('finance')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Fees (Telebirr/CBE)</span>
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Enroll New Child</span>
            </button>
          </div>
        </div>
      </div>

      {/* Child Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">Select Child:</span>
        {familyStudents.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChildId(ch.id)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedChildId === ch.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
              {ch.firstName.charAt(0)}
            </div>
            <span>{ch.firstName} {ch.lastName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedChildId === ch.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
              {ch.quranProgress.juzCompleted}/30 Juz
            </span>
          </button>
        ))}
      </div>

      {/* Selected Child Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('quran')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Memorization</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {selectedChild?.quranProgress.juzCompleted}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 30 Juz Completed</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-semibold truncate">
            Circle: {selectedChild?.hifzCircleName}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Today</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-600">Present</span>
            <span className="text-xs font-bold text-slate-400">98% Overall</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Arrived 7:25 AM (Punctual)</p>
        </div>

        <div
          onClick={() => setActiveTab('homework')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Homework & Tasks</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">Up to Date</span>
            <span className="text-xs font-bold text-indigo-600">1 Review Due</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Tajweed oral audio recording</p>
        </div>

        <div
          onClick={() => setActiveTab('finance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tuition Balance</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalDue} ETB</span>
            <span className={`text-xs font-bold ${totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {totalDue > 0 ? 'Pending' : 'Fully Paid'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Telebirr Merchant Code: 48921</p>
        </div>
      </div>

      {/* Detail 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Progress Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedChild?.firstName}'s Latest Hifz Evaluation
                </h3>
                <p className="text-xs text-slate-500 font-arabic">تقييم الشيخ الأخير للحفظ والتجويد</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full">
                {latestHifz.memorizationQuality}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Surah: {latestHifz.surahName} (Ayahs {latestHifz.ayahStart}-{latestHifz.ayahEnd})
                </span>
                <span className="font-mono text-slate-400">{latestHifz.date}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic font-arabic">
                Teacher Note: "{latestHifz.teacherNotes}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveTab('quran')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Qur'an Record</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Quick Actions */}
        <div className="space-y-6">
          {/* Quick Pay Action */}
          <div className="p-6 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Online Payment</span>
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <div className="text-2xl font-black">{totalDue} ETB Due</div>
              <div className="text-xs text-emerald-200 mt-1">Monthly Tuition & Transport Fee</div>
            </div>

            <button
              onClick={() => setActiveTab('finance')}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay via Telebirr or CBE Birr</span>
            </button>
          </div>

          {/* Teacher Contact Note */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assigned Sheikh Contact
            </h4>
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Sheikh Bilal Ibrahim</div>
              <div className="text-slate-500">Head of Tahfeez Department</div>
              <div className="text-emerald-600 font-mono pt-1">+251 922 456 789</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
