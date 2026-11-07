import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { StudentPortalDashboard } from './StudentPortalDashboard';
import { ParentPortalDashboard } from './ParentPortalDashboard';
import { FinanceDashboard } from './FinanceDasboard';
import { HifzTeacherDashboard } from './HifzTeacherDashboard';
import { AcademicTeacherDashboard } from './AcadamicTeacherDashboard';
import { RegistrarDashboard } from './RegistrarDashboard';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Receipt,
  AlertCircle,
  Clock,
  Award,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  PhoneCall,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    students,
    teachers,
    hifzSessions,
    payments,
    attendanceRecords,
    exams,
    announcements,
    setActiveTab,
  } = useMadrasa();

  // Role based dispatching
  if (currentUser?.role === 'student') {
    return <StudentPortalDashboard />;
  }

  if (currentUser?.role === 'parent') {
    return <ParentPortalDashboard />;
  }

  if (currentUser?.role === 'finance_officer') {
    return <FinanceDashboard />;
  }

  if (currentUser?.role === 'hifz_teacher') {
    return <HifzTeacherDashboard />;
  }

  if (currentUser?.role === 'teacher') {
    return <AcademicTeacherDashboard />;
  }

  if (currentUser?.role === 'registrar') {
    return <RegistrarDashboard />;
  }

  // Super Admin / Principal / Vice Principal Executive Dashboard

  // Computations
  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === 'male').length;
  const femaleStudents = students.filter(s => s.gender === 'female').length;
  
  const totalTeachers = teachers.length;
  const hifzTeachers = teachers.filter(t => t.role === 'hifz_teacher').length;

  const todayAttendancePresent = attendanceRecords.filter(a => a.status === 'present').length;
  const todayAttendanceRate = attendanceRecords.length > 0
    ? Math.round((todayAttendancePresent / attendanceRecords.length) * 100)
    : 96;

  const totalMonthlyRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstandingFees = students.reduce((acc, s) => acc + s.feeBalance, 0);

  const completedHuffaz = students.filter(s => s.quranProgress.juzCompleted >= 30).length;
  const intermediateHifz = students.filter(s => s.quranProgress.juzCompleted >= 15 && s.quranProgress.juzCompleted < 30).length;
  const foundationHifz = students.filter(s => s.quranProgress.juzCompleted < 15).length;

  // Chart Data
  const studentGrowthData = [
    { month: 'Sep', students: 380, hifz: 140 },
    { month: 'Oct', students: 410, hifz: 165 },
    { month: 'Nov', students: 435, hifz: 190 },
    { month: 'Dec', students: 450, hifz: 210 },
    { month: 'Jan', students: 470, hifz: 235 },
    { month: 'Feb', students: 485, hifz: 250 },
    { month: 'Mar', students: 510, hifz: 280 },
  ];

  const paymentBreakdownData = [
    { name: 'Telebirr', value: 36500, color: '#0284c7' },
    { name: 'CBE Birr', value: 24200, color: '#9333ea' },
    { name: 'Bank Transfer', value: 18000, color: '#059669' },
    { name: 'Cash', value: 9500, color: '#d97706' },
  ];

  const quranProgressDistribution = [
    { name: 'Complete 30 Juz (Hafiz)', count: completedHuffaz || 12, color: '#059669' },
    { name: '15 - 29 Juz', count: intermediateHifz || 45, color: '#10b981' },
    { name: '5 - 14 Juz', count: 68, color: '#34d399' },
    { name: '1 - 4 Juz / Qaida', count: foundationHifz || 95, color: '#6ee7b7' },
  ];

  const sabaqQualityData = [
    { name: 'Mumtaz (Excellent)', value: 58, color: '#059669' },
    { name: 'Jayyid Jiddan (V. Good)', value: 26, color: '#10b981' },
    { name: 'Jayyid (Good)', value: 12, color: '#d97706' },
    { name: 'Muraja\'ah Needed', value: 4, color: '#e11d48' },
  ];

  const weeklyAttendanceTrend = [
    { day: 'Mon', rate: 97 },
    { day: 'Tue', rate: 98 },
    { day: 'Wed', rate: 95 },
    { day: 'Thu', rate: 96 },
    { day: 'Fri', rate: 99 },
    { day: 'Sat', rate: 94 },
  ];

  return (
    <div className="space-y-6">
      {/* Universal Cloud Database Synchronization & Status */}
      <DatabaseStatusBanner
        pageName="Executive Dashboard & Analytics"
        arabicPageName="لوحة التحكم والتحليلات"
        recordCount={totalStudents}
        recordLabel="Active Students Enrolled"
      />

      {/* Welcome Banner with Islamic Date and Amharic Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-lg">
        {/* Subtle Decorative Star Geometry */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-200 border border-emerald-500/30">
                1447/1448 AH • 2026/2027 Academic Year
              </span>
              <span className="text-xs text-emerald-300 font-amharic font-semibold">
                እንኳን ደህና መጡ
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-arabic flex items-center gap-3">
              <span>مرحباً بكم في مدرسة آل عمران</span>
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Welcome back, <span className="font-bold text-white">{currentUser?.name || 'Administrator'}</span>. Currently operating in{' '}
              <span className="underline decoration-amber-400 font-semibold">{currentUser?.madrasaBranchName || 'Al-Imran CMC Main Campus'}</span>.
              All Hifz circles, attendance records, and CBE/Telebirr transactions are active and synchronized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('quran')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Hifz Session Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Issue Sanad / Cert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Enrolled</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalStudents}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14% this term
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>👦 {maleStudents} Boys</span>
            <span>🧕 {femaleStudents} Girls</span>
          </div>
        </div>

        {/* Card 2: Qur'an Hifz Daily Sessions */}
        <div
          onClick={() => setActiveTab('quran')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Hifz Sessions</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition-colors rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{hifzSessions.length}</span>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950 px-1.5 py-0.5 rounded">
              Sabaq & Muraja'ah
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>✨ {completedHuffaz} Complete Huffaz</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">96% Tajweed Avg</span>
          </div>
        </div>

        {/* Card 3: Today's Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-500 dark:hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Attendance</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{todayAttendanceRate}%</span>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-0.5" /> High discipline
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Staff Attendance: 100%</span>
            <span>6 Halawat Circles</span>
          </div>
        </div>

        {/* Card 4: Monthly Revenue (Executive Admin) */}
        <div
          onClick={() => setActiveTab('finance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Revenue</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ETB {totalMonthlyRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">ETB {totalOutstandingFees.toLocaleString()} Unpaid</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Telebirr / CBE</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Student Growth & Hifz Enrollees */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Student & Hifz Enrollment Growth</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly progression across Academic and Hifz circles</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
              2025 - 2026 Academic Term
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHifz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px', borderColor: '#334155' }}
                />
                <Legend />
                <Area type="monotone" dataKey="students" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudents)" name="Total Students" />
                <Area type="monotone" dataKey="hifz" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHifz)" name="Hifz Specialists" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Methods (Ethiopia) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payment Methods (Ethiopia)</h2>
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">ETB Currency</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Live breakdown of fee collections</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`ETB ${Number(value).toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', borderColor: '#334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {paymentBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">ETB {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Qur'an Khatmah Progress & Active Circles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hifz Completion Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Qur'an Memorization Tiers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic">مستويات حفظ القرآن الكريم</p>
            </div>
            <button
              onClick={() => setActiveTab('quran')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center"
            >
              Details <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {quranProgressDistribution.map((tier) => (
              <div key={tier.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{tier.name}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{tier.count} Students</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(tier.count / totalStudents) * 100 * 1.8}%`,
                      backgroundColor: tier.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Sanad / Ijazah Ready: </span>
              <span>2 students have completed 30 Juz review and are undergoing rigorous oral Sanad examination with Sheikh Bilal.</span>
            </div>
          </div>
        </div>

        {/* Today's Active Hifz Sessions Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Hifz Recitations & Evaluations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live feed from Sheikh Bilal & Ustaza Maryam circles</p>
            </div>
            <button
              onClick={() => setActiveTab('quran')}
              className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800 cursor-pointer"
            >
              + Record Session
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {hifzSessions.slice(0, 4).map((session) => (
              <div
                key={session.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {session.juz} <span className="text-[9px] block">Juz</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{session.studentName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 uppercase border border-amber-200 dark:border-amber-800">
                        {session.sessionType}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold font-arabic mt-0.5">
                      {session.surahName} • Ayahs {session.ayahStart} - {session.ayahEnd}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 line-clamp-1">
                      "{session.teacherNotes}"
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 text-right">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {session.memorizationQuality}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">Tajweed: {session.tajweedScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ethiopian Madrasa Announcements & Upcoming Events */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Official Madrasa Announcements</h2>
            <span className="text-xs text-slate-400 font-arabic">الإعلانات الرسمية</span>
          </div>
          <button
            onClick={() => setActiveTab('communication')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
          >
            View All Announcements &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((anc) => (
            <div
              key={anc.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-850 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {anc.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{anc.publishedAt}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{anc.title}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {anc.content}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>By: {anc.author}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Al-Imran Notice</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
