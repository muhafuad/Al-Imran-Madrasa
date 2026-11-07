import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Award,
  Sparkles,
  Search,
  PlusCircle,
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const RegistrarDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    entranceApplications,
    attendanceRecords,
    setActiveTab,
  } = useMadrasa();

  const pendingApps = (entranceApplications || []).filter(
    a => a.status === 'pending' || a.status === 'scheduled'
  );
  const assessedApps = (entranceApplications || []).filter(a => a.status === 'assessed');
  const enrolledApps = (entranceApplications || []).filter(a => a.status === 'enrolled');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Registrar & Admissions Desk • أمانة التسجيل والقبول</span>
              </span>
              <span className="text-xs text-emerald-200 font-semibold">
                Al-Imran Academic Year 2026/2027
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admissions & Student Registry Dashboard
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Managing incoming student intake, oral Tajweed placement auditions, branch transfers across CMC, Ayat, and Summit, and official transcripts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('assessment')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Process Applicants ({pendingApps.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Student Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Students</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{students.length}</span>
            <span className="text-xs font-bold text-slate-400">Total Enrolled</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-semibold">Across 3 Campus Branches</p>
        </div>

        {/* Pending Admissions */}
        <div
          onClick={() => setActiveTab('assessment')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Placement</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingApps.length}</span>
            <span className="text-xs font-bold text-amber-600">Awaiting Audition</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Tajweed placement tests</p>
        </div>

        {/* Assessed Ready to Enroll */}
        <div
          onClick={() => setActiveTab('assessment')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ready to Enroll</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{assessedApps.length}</span>
            <span className="text-xs font-bold text-teal-600">Assessment Done</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Ready for Halqah assignment</p>
        </div>

        {/* Certificates Pending */}
        <div
          onClick={() => setActiveTab('certificates')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sanad & Ijazahs</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {students.filter(s => s.quranProgress.juzCompleted >= 30).length}
            </span>
            <span className="text-xs font-bold text-indigo-600">Huffaz Verified</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Official Gold foil certification</p>
        </div>
      </div>

      {/* Admissions Pipeline List */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Entrance Applications</h3>
          <button
            onClick={() => setActiveTab('assessment')}
            className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
          >
            Open Placement Portal
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-3">Application #</th>
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Target Program</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(entranceApplications || []).slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">
                    {app.applicationNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{app.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-arabic">{app.arabicName}</div>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {app.targetProgram}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'enrolled'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : app.status === 'assessed'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setActiveTab('assessment')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Process
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
