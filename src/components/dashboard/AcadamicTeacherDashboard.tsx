import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookMarked,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet,
  Users,
  Clock,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const AcademicTeacherDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    homeworkList,
    exams,
    attendanceRecords,
    setActiveTab,
    language,
  } = useMadrasa();

  const myHomeworkList = homeworkList.slice(0, 4);
  const pendingGradingCount = 5;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm">
                <BookMarked className="w-3.5 h-3.5" />
                <span>Academic Faculty Portal • هيئة التدريس والعلوم الشرعية</span>
              </span>
              <span className="text-xs text-indigo-200 font-semibold">
                Instructor: {currentUser?.name || 'Ustaz Zakaria'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Islamic Studies & Arabic Faculty Dashboard
            </h1>
            <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
              Curriculum progression in Classical Arabic (Nahw & Sarf), Fiqh, Aqeedah, and Hadith. Grading homework assignments and scheduling examinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('homework')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Exams & Gradebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('subjects')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Subjects Taught</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BookMarked className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">4 Courses</span>
            <span className="text-xs font-bold text-slate-400">Nahw, Fiqh, Hadith</span>
          </div>
          <p className="mt-2 text-xs text-indigo-600 font-semibold">12 Classes / Week</p>
        </div>

        <div
          onClick={() => setActiveTab('homework')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Submissions Due</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingGradingCount}</span>
            <span className="text-xs font-bold text-amber-600">Pending Evaluation</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Click to grade submissions</p>
        </div>

        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Class Attendance</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">96%</span>
            <span className="text-xs font-bold text-teal-600">High Punctuality</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Class 3-A & Class 8-A</p>
        </div>

        <div
          onClick={() => setActiveTab('exams')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Exams</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{exams.length}</span>
            <span className="text-xs font-bold text-blue-600">Scheduled Tests</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Term II Final Assessment</p>
        </div>
      </div>

      {/* Main Grid: Homework Assignments & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Classroom Assignments</h3>
            <button
              onClick={() => setActiveTab('homework')}
              className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Manage All
            </button>
          </div>

          <div className="space-y-3">
            {myHomeworkList.map((hw) => (
              <div
                key={hw.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{hw.title}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded font-semibold">
                      {hw.className}
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
                  Grade Submissions
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Today's Teaching Schedule */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Class Schedule</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-800 space-y-1">
              <div className="flex justify-between font-bold text-indigo-900 dark:text-indigo-200">
                <span>Arabic Grammar (Nahw)</span>
                <span>8:00 - 9:15 AM</span>
              </div>
              <p className="text-slate-500">Class 3-A • Al-Ajrumiyyah Chapter 3</p>
            </div>

            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800 space-y-1">
              <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-200">
                <span>Islamic Jurisprudence (Fiqh)</span>
                <span>9:45 - 11:00 AM</span>
              </div>
              <p className="text-slate-500">Class 8-A • Safinat An-Naja Fiqh</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>40 Hadith Nawawi</span>
                <span>11:30 AM - 12:30 PM</span>
              </div>
              <p className="text-slate-500">Auditorium Hall • Hadith 12-14</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
