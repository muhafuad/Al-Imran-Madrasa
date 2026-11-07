import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  UserCheck,
  FileCheck,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { AdminApplicationsPortal } from './AdminApplicationPortal';
import { UstazAssessmentDashboard } from './UstazAssessmentDashboard';
import { EntranceApplicationForm } from './EntranceApplicationForm';
import { AssessmentCardModal } from './AssessmentCardModal';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import type { EntranceApplication } from '../../types';

export const EntranceAssessmentModule: React.FC = () => {
  const { entranceApplications, currentUser, t, language } = useMadrasa();

  const userRole = currentUser?.role || 'super_admin';
  const isAdmin = userRole === 'super_admin' || userRole === 'principal' || userRole === 'vice_principal' || userRole === 'registrar';
  const isUstaz = userRole === 'hifz_teacher' || userRole === 'teacher';

  // Default active tab based on role
  const [activeSubTab, setActiveSubTab] = useState<'admin_portal' | 'ustaz_portal' | 'apply_form' | 'lookup'>(
    isUstaz ? 'ustaz_portal' : isAdmin ? 'admin_portal' : 'apply_form'
  );

  // Status Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [searchedApp, setSearchedApp] = useState<EntranceApplication | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Modal State
  const [viewingApp, setViewingApp] = useState<EntranceApplication | null>(null);

  // Calculate live statistics
  const totalApps = entranceApplications.length;
  const pendingCount = entranceApplications.filter(a => a.status === 'pending').length;
  const scheduledCount = entranceApplications.filter(a => a.status === 'scheduled').length;
  const assessedCount = entranceApplications.filter(a => a.status === 'assessed').length;
  const enrolledCount = entranceApplications.filter(a => a.status === 'enrolled').length;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setSearchedApp(null);

    const query = lookupQuery.trim().toLowerCase();
    if (!query) return;

    const match = entranceApplications.find(
      app =>
        app.applicationNumber.toLowerCase() === query ||
        app.guardianPhone.includes(query) ||
        app.fullName.toLowerCase().includes(query)
    );

    if (match) {
      setSearchedApp(match);
    } else {
      setLookupError(`${t.noApplicationFound} "${lookupQuery}".`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Entrance Admissions & Placement Assessments Database"
        arabicPageName="اختبار القبول والمستوى والتقديم الإلكتروني"
        recordCount={entranceApplications.length}
        recordLabel="Registered Applicants"
      />

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.entranceAssessmentSystem}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.entranceBoardTitle}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              {t.entranceBoardDesc}
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 block uppercase tracking-wider font-semibold">{t.totalApplicants}</span>
              <span className="text-2xl font-black text-white">{totalApps}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm text-center min-w-[100px]">
              <span className="text-[10px] text-amber-300 block uppercase tracking-wider font-semibold">{t.pendingReview}</span>
              <span className="text-2xl font-black text-amber-200">{pendingCount}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 block uppercase tracking-wider font-semibold">{t.statusEnrolled}</span>
              <span className="text-2xl font-black text-emerald-300">{enrolledCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          
          {isAdmin && (
            <button
              onClick={() => setActiveSubTab('admin_portal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'admin_portal'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.adminReviewScheduling}</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {(isAdmin || isUstaz) && (
            <button
              onClick={() => setActiveSubTab('ustaz_portal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'ustaz_portal'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t.ustazAssessmentDashboard}</span>
              {scheduledCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                  {scheduledCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('apply_form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'apply_form'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.digitalApplicationForm}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('lookup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'lookup'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.applicationStatusTracker}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {t.activeRole} <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{t[userRole as keyof typeof t] || userRole.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Sub-Tab 1: Admin Review & Scheduling */}
      {activeSubTab === 'admin_portal' && isAdmin && (
        <AdminApplicationsPortal />
      )}

      {/* Sub-Tab 2: Ustaz Assessment Dashboard */}
      {activeSubTab === 'ustaz_portal' && (isAdmin || isUstaz) && (
        <UstazAssessmentDashboard />
      )}

      {/* Sub-Tab 3: Digital Application Form */}
      {activeSubTab === 'apply_form' && (
        <div className="max-w-4xl mx-auto">
          <EntranceApplicationForm
            onSuccess={() => {
              if (isAdmin) setActiveSubTab('admin_portal');
            }}
          />
        </div>
      )}

      {/* Sub-Tab 4: Application Lookup & Status Tracker */}
      {activeSubTab === 'lookup' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t.trackApplicationStatus}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t.trackStatusDesc}
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="text"
                required
                placeholder="APP-2026-101 or +251 911..."
                value={lookupQuery}
                onChange={e => setLookupQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.lookupApplication}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {lookupError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto text-left">
                {lookupError}
              </div>
            )}
          </div>

          {/* Searched Application Status Result Card */}
          {searchedApp && (
            <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    #{searchedApp.applicationNumber}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {searchedApp.fullName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t.appliedProgram}: {searchedApp.targetProgram} • {searchedApp.preferredShift}
                  </p>
                </div>

                <div>
                  {searchedApp.status === 'pending' && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700">
                      {t.statusPending}
                    </span>
                  )}
                  {searchedApp.status === 'scheduled' && (
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-300 dark:border-blue-700">
                      {t.statusScheduled}
                    </span>
                  )}
                  {searchedApp.status === 'assessed' && (
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-300 dark:border-purple-700">
                      {t.statusAssessed} ({t.overallScore}: {searchedApp.assessmentResult?.overallScore}%)
                    </span>
                  )}
                  {searchedApp.status === 'enrolled' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                      {t.statusEnrolled} ({searchedApp.enrolledClass})
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold py-2">
                <div className={`p-2 rounded-xl border ${searchedApp ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                  1. {t.digitalApplicationForm}
                </div>
                <div className={`p-2 rounded-xl border ${searchedApp.status === 'scheduled' || searchedApp.status === 'assessed' || searchedApp.status === 'enrolled' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                  2. {t.assignedUstaz}
                </div>
                <div className={`p-2 rounded-xl border ${searchedApp.status === 'assessed' || searchedApp.status === 'enrolled' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                  3. {t.recordAssessment}
                </div>
                <div className={`p-2 rounded-xl border ${searchedApp.status === 'enrolled' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                  4. {t.statusEnrolled}
                </div>
              </div>

              {/* Schedule / Ustaz Info Card if scheduled */}
              {searchedApp.assignedUstazName && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {t.oralPlacementSessionInfo}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">{t.assignedExaminer}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{searchedApp.assignedUstazName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{t.assessmentDate}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{searchedApp.assessmentDate} ({searchedApp.assessmentTime})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{t.sessionMode}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{searchedApp.assessmentMode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setViewingApp(searchedApp)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
                >
                  {t.viewFullAssessmentCard}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Printable Assessment Modal */}
      {viewingApp && (
        <AssessmentCardModal
          application={viewingApp}
          onClose={() => setViewingApp(null)}
        />
      )}

    </div>
  );
};
