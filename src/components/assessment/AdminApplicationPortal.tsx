import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { EntranceApplication, EntranceApplicationStatus } from '../../types';
import type { Teacher } from "../../types";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  UserPlus,
  Trash2,
  Edit,
  Eye,
  Sliders,
  Printer,
  ChevronRight,
  X,
  AlertCircle,
  FileCheck,
  Check,
  ArrowRight,
  BookOpen,
  Send,
  SlidersHorizontal,
  FileText,
  Layers,
  CheckSquare,
  Square,
  Ban,
  UserCheck,
} from 'lucide-react';
import { AssessmentCardModal } from './AssessmentCardModal';
import { PlacementPostingModal } from './PlacementPostingModal';
import { ApprovalDecisionModal } from './ApprovalDecisonModal';
import { OfficialAdmissionLetterModal } from './OfficialAdmissionLetterModal';

export const AdminApplicationsPortal: React.FC = () => {
  const {
    entranceApplications,
    teachers,
    students,
    currentUser,
    scheduleEntranceAssessment,
    updateEntranceApplication,
    deleteEntranceApplication,
    enrollApplicantDirectly,
    publishAssessmentResult,
    bulkApproveRegistrationRequests,
    bulkPostPlacementResults,
    bulkEnrollApplicants,
    setActiveTab,
    t,
  } = useMadrasa();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  // Multi-select for Bulk Actions
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Modal States
  const [schedulingApp, setSchedulingApp] = useState<EntranceApplication | null>(null);
  const [enrollingApp, setEnrollingApp] = useState<EntranceApplication | null>(null);
  const [viewingApp, setViewingApp] = useState<EntranceApplication | null>(null);
  const [placementPostingApp, setPlacementPostingApp] = useState<EntranceApplication | null>(null);
  const [approvalModalData, setApprovalModalData] = useState<{
    app: EntranceApplication;
    mode: 'approve' | 'reject' | 'waitlist';
  } | null>(null);
  const [admissionLetterApp, setAdmissionLetterApp] = useState<EntranceApplication | null>(null);

  const [enrollmentResult, setEnrollmentResult] = useState<{ studentId: string; message: string } | null>(null);

  // Scheduling Form Fields
  const [scheduleForm, setScheduleForm] = useState({
    ustazId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    mode: 'In-Person (Campus)' as 'In-Person (Campus)' | 'Online (Video / Zoom / Telegram)' | 'Oral Board',
    roomOrLink: 'Oral Assessment Room 2 (CMC Campus)',
    adminNotes: 'Please evaluate Tajweed rules, Makharij, and memorized Juz Amma recitation fluency.',
  });

  // Direct Enrollment Form Fields
  const [enrollForm, setEnrollForm] = useState({
    classAssigned: 'Class 1-A (Boys)',
    levelAssigned: "Ibtida'i 1 (Primary)",
    hifzCircleAssigned: 'Halqah Ustaz Bilal Al-Habashi',
    assignedUstazId: 'tch-1',
  });

  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState(false);



const ustazList: Teacher[] =
  teachers.length > 0
    ? teachers
    : [
        {
          id: "tch-1",
          fullName: "Ustaz Bilal Al-Habashi",
          arabicName: "",
          email: "",
          phone: "",
          gender: "male",
          role: "teacher",
          specialization: "Hifz & Tajweed",
          qualifications: [],
          islamicCertificates: [],
          experienceYears: 0,
          subjects: [],
          assignedClasses: [],
          monthlySalary: 0,
          joinDate: "",
          photoUrl: "",
          status: "active",
          salaryStatus: "pending",
        },
        {
          id: "tch-2",
          fullName: "Ustaza Maryam Nur",
          arabicName: "",
          email: "",
          phone: "",
          gender: "female",
          role: "teacher",
          specialization: "Girls Tahfeez Circle",
          qualifications: [],
          islamicCertificates: [],
          experienceYears: 0,
          subjects: [],
          assignedClasses: [],
          monthlySalary: 0,
          joinDate: "",
          photoUrl: "",
          status: "active",
          salaryStatus: "pending",
        },
        {
          id: "tch-3",
          fullName: "Sheikh Dawud Mohammed",
          arabicName: "",
          email: "",
          phone: "",
          gender: "male",
          role: "hifz_teacher",
          specialization: "Qira'at & Sanad",
          qualifications: [],
          islamicCertificates: [],
          experienceYears: 0,
          subjects: [],
          assignedClasses: [],
          monthlySalary: 0,
          joinDate: "",
          photoUrl: "",
          status: "active",
          salaryStatus: "pending",
        },
      ];

  // Applications Filter logic
  const filteredApps = entranceApplications.filter(app => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.guardianPhone.includes(searchQuery) ||
      (app.guardianName && app.guardianName.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'pending') {
      matchesStatus = app.status === 'pending' || app.status === 'approved_for_assessment';
    } else if (statusFilter === 'scheduled') {
      matchesStatus = app.status === 'scheduled';
    } else if (statusFilter === 'assessed') {
      matchesStatus = app.status === 'assessed';
    } else if (statusFilter === 'result_published') {
      matchesStatus = app.status === 'result_published' || !!app.isResultPublished;
    } else if (statusFilter === 'approved_for_admission') {
      matchesStatus = app.status === 'approved_for_admission';
    } else if (statusFilter === 'enrolled') {
      matchesStatus = app.status === 'enrolled';
    } else if (statusFilter === 'waitlisted_rejected') {
      matchesStatus = app.status === 'rejected' || app.status === 'waitlisted';
    } else {
      matchesStatus = app.status === statusFilter;
    }

    const matchesProgram = programFilter === 'all' || app.targetProgram === programFilter;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  // KPI Counters
  const totalCount = entranceApplications.length;
  const pendingCount = entranceApplications.filter(a => a.status === 'pending' || a.status === 'approved_for_assessment').length;
  const scheduledCount = entranceApplications.filter(a => a.status === 'scheduled').length;
  const assessedCount = entranceApplications.filter(a => a.status === 'assessed').length;
  const publishedCount = entranceApplications.filter(a => a.status === 'result_published' || a.isResultPublished).length;
  const enrolledCount = entranceApplications.filter(a => a.status === 'enrolled').length;
  const waitlistRejectCount = entranceApplications.filter(a => a.status === 'rejected' || a.status === 'waitlisted').length;

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedAppIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map(a => a.id));
    }
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    if (selectedAppIds.length === 0) return;
    if (confirm(`Approve ${selectedAppIds.length} selected registration request(s)?`)) {
      setIsProcessingBulk(true);
      bulkApproveRegistrationRequests(selectedAppIds, 'Bulk approved by Administration.');
      setSelectedAppIds([]);
      setIsProcessingBulk(false);
    }
  };

  const handleBulkPublishResults = (publish: boolean) => {
    if (selectedAppIds.length === 0) return;
    if (confirm(`${publish ? 'Publish' : 'Unpublish'} results for ${selectedAppIds.length} candidate(s)?`)) {
      setIsProcessingBulk(true);
      bulkPostPlacementResults(selectedAppIds, publish);
      setSelectedAppIds([]);
      setIsProcessingBulk(false);
    }
  };

  const handleBulkDirectEnroll = async () => {
    if (selectedAppIds.length === 0) return;
    if (confirm(`Directly enroll ${selectedAppIds.length} candidate(s) into madrasa rosters?`)) {
      setIsProcessingBulk(true);
      await bulkEnrollApplicants(selectedAppIds);
      setSelectedAppIds([]);
      setIsProcessingBulk(false);
    }
  };

  // Single Action Handlers
  const handleOpenScheduleModal = (app: EntranceApplication) => {
    setSchedulingApp(app);
    setScheduleForm({
      ustazId: app.assignedUstazId || ustazList[0]?.id || 'tch-1',
      date: app.assessmentDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: app.assessmentTime || '10:00 AM',
      mode:
        (app.preferredAssessmentMode as
          | "In-Person (Campus)"
          | "Online (Video / Zoom / Telegram)"
          | "Oral Board") ?? "In-Person (Campus)",
      roomOrLink: app.assessmentRoomOrLink || 'Evaluation Board Room B',
      adminNotes: app.adminNotes || '',
    });
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp) return;

    setIsSubmittingSchedule(true);
    const selectedUstaz = ustazList.find(t => t.id === scheduleForm.ustazId);
    const ustazName = selectedUstaz?.fullName || 'Ustaz Bilal Al-Habashi';

    setTimeout(() => {
      scheduleEntranceAssessment(
        schedulingApp.id,
        scheduleForm.ustazId,
        ustazName,
        scheduleForm.date,
        scheduleForm.time,
        scheduleForm.mode,
        scheduleForm.roomOrLink,
        scheduleForm.adminNotes
      );
      setIsSubmittingSchedule(false);
      setSchedulingApp(null);
    }, 350);
  };

  const handleOpenEnrollModal = (app: EntranceApplication) => {
    setEnrollingApp(app);
    const res = app.assessmentResult;
    const placement = app.placementDetails;
    setEnrollForm({
      classAssigned: placement?.assignedClass || res?.recommendedClass || (app.gender === 'female' ? 'Class 4-B (Girls)' : 'Class 1-A (Boys)'),
      levelAssigned: placement?.assignedLevel || res?.recommendedLevel || "Ibtida'i 1 (Primary)",
      hifzCircleAssigned: placement?.assignedHalqah || res?.recommendedHifzCircle || 'Halqah Ustaz Bilal Al-Habashi',
      assignedUstazId: placement?.assignedUstazId || app.assignedUstazId || 'tch-1',
    });
    setEnrollmentResult(null);
  };

  const handleConfirmDirectEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingApp) return;

    setIsSubmittingEnrollment(true);
    const outcome = await enrollApplicantDirectly(
      enrollingApp.id,
      enrollForm.classAssigned,
      enrollForm.levelAssigned,
      enrollForm.hifzCircleAssigned,
      enrollForm.assignedUstazId
    );

    setIsSubmittingEnrollment(false);
    if (outcome.success) {
      setEnrollmentResult({
        studentId: outcome.studentId,
        message: outcome.message,
      });
    } else {
      alert(outcome.message);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove entrance application for ${name}?`)) {
      deleteEntranceApplication(id);
    }
  };

  const handleTogglePublish = (app: EntranceApplication) => {
    const nextState = !app.isResultPublished;
    publishAssessmentResult(app.id, nextState);
  };

  return (
    <div className="space-y-6">

      {/* KPI Stats Cards Filter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'border-slate-800 bg-slate-900 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-400'
          }`}
        >
          <span className="text-[11px] text-slate-400 block font-medium">{t.allTotal || 'All Total'}</span>
          <span className="text-xl font-black">{totalCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-amber-600 bg-amber-600 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-amber-400'
          }`}
        >
          <span className="text-[11px] text-amber-500 block font-medium">{t.needsReview || 'Needs Review'}</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('scheduled')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'scheduled'
              ? 'border-blue-600 bg-blue-600 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-400'
          }`}
        >
          <span className="text-[11px] text-blue-500 block font-medium">{t.inAssessment || 'In Assessment'}</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400">{scheduledCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('assessed')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'assessed'
              ? 'border-purple-600 bg-purple-600 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-purple-400'
          }`}
        >
          <span className="text-[11px] text-purple-500 block font-medium">{t.assessedDraft || 'Assessed / Draft'}</span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400">{assessedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('result_published')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'result_published'
              ? 'border-teal-600 bg-teal-600 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-teal-400'
          }`}
        >
          <span className="text-[11px] text-teal-500 block font-medium">{t.resultsPublishedKpi || 'Results Published'}</span>
          <span className="text-xl font-black text-teal-600 dark:text-teal-400">{publishedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('enrolled')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'enrolled'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
          }`}
        >
          <span className="text-[11px] text-emerald-500 block font-medium">{t.enrolledRoster || 'Enrolled Roster'}</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{enrolledCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('waitlisted_rejected')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'waitlisted_rejected'
              ? 'border-rose-700 bg-rose-700 text-white shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-rose-400'
          }`}
        >
          <span className="text-[11px] text-rose-500 block font-medium">{t.waitlistDeclined || 'Waitlist / Declined'}</span>
          <span className="text-xl font-black text-rose-600 dark:text-rose-400">{waitlistRejectCount}</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder || 'Search candidate name, app #, or phone...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="all">{t.all || 'All Stages & Decisions'}</option>
            <option value="pending">{t.statusPending || 'Pending Registration Requests'}</option>
            <option value="scheduled">{t.statusScheduled || 'Scheduled for Assessment'}</option>
            <option value="assessed">{t.statusAssessed || 'Assessed (Internal Review)'}</option>
            <option value="result_published">{t.statusResultPublished || 'Results Officially Published'}</option>
            <option value="approved_for_admission">{t.statusApprovedAdmission || 'Approved for Admission'}</option>
            <option value="enrolled">{t.statusEnrolled || 'Officially Enrolled'}</option>
            <option value="waitlisted_rejected">{t.waitlistDeclined || 'Waitlisted or Declined'}</option>
          </select>

          <select
            value={programFilter}
            onChange={e => setProgramFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="all">{t.all || 'All Programs'}</option>
            <option value="Full-Time Qur'an Hifz & Sanad Program">Full-Time Qur'an Hifz</option>
            <option value="After-School Qur'an & Islamic Studies">After-School Qur'an</option>
            <option value="Weekend Intensive Hifz & Tajweed">Weekend Intensive</option>
            <option value="Ijazah & Qira'at Certification Track">Ijazah Track</option>
          </select>
        </div>
      </div>

      {/* Floating Multi-Select Bulk Actions Toolbar */}
      {selectedAppIds.length > 0 && (
        <div className="sticky top-4 z-30 p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              {selectedAppIds.length}
            </span>
            <div>
              <span className="font-bold text-xs block text-white">
                {selectedAppIds.length} {t.applicationsSelected || 'Application(s) Selected'}
              </span>
              <span className="text-[11px] text-slate-400">
                {t.executeBatchActions || 'Execute batch administration actions across selected applications'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={isProcessingBulk}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.bulkApprove || 'Bulk Approve'}</span>
            </button>

            <button
              onClick={() => handleBulkPublishResults(true)}
              disabled={isProcessingBulk}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.bulkPostResults || 'Bulk Post / Publish Results'}</span>
            </button>

            <button
              onClick={handleBulkDirectEnroll}
              disabled={isProcessingBulk}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.bulkEnroll || 'Bulk Enroll into Roster'}</span>
            </button>

            <button
              onClick={() => setSelectedAppIds([])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              {t.deselectAll || 'Deselect All'}
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllFiltered}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Select All Filtered"
            >
              {selectedAppIds.length > 0 && selectedAppIds.length === filteredApps.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {t.admissionsPlacementPortal || 'Admissions, Assessment Results & Placement Portal'}
              </h3>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            {t.showingEntries || 'Showing'} {filteredApps.length} / {entranceApplications.length}
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">{t.noApplicationsMatched || 'No entrance applications matched your filter criteria.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3 w-8"></th>
                  <th className="py-3 px-4">{t.applicantAndRef || 'Applicant & Reference'}</th>
                  <th className="py-3 px-4">{t.stepGuardianDetails || 'Guardian Contact'}</th>
                  <th className="py-3 px-4">{t.assessmentAndUstaz || 'Assessment & Ustaz'}</th>
                  <th className="py-3 px-4">{t.placementAndClass || 'Placement & Class'}</th>
                  <th className="py-3 px-4">{t.resultPublication || 'Result Publication'}</th>
                  <th className="py-3 px-4 text-right">{t.adminActions || 'Admin Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredApps.map(app => {
                  const res = app.assessmentResult;
                  const placement = app.placementDetails;
                  const isSelected = selectedAppIds.includes(app.id);

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleSelect(app.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Applicant Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                            {app.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {app.fullName}
                              {app.gender === 'female' ? (
                                <span className="text-[10px] text-pink-600 bg-pink-50 dark:bg-pink-950/60 px-1.5 py-0.2 rounded font-medium">F</span>
                              ) : (
                                <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded font-medium">M</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              #{app.applicationNumber} • {app.targetProgram ? app.targetProgram.split(' ')[0] : 'Hifz'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Guardian */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {app.guardianName} ({app.guardianRelationship})
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {app.guardianPhone}
                          </div>
                        </div>
                      </td>

                      {/* Assessment & Ustaz */}
                      <td className="py-3 px-4">
                        {res ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full text-[11px]">
                                Score: {res.overallScore}/100
                              </span>
                              <span className="text-[11px] text-emerald-600 font-semibold">
                                {res.verifiedMemorizedJuz} Juz
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              By {res.assessedByUstazName}
                            </div>
                          </div>
                        ) : app.assignedUstazName ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-semibold">
                              Assigned: {app.assignedUstazName}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {app.assessmentDate} {app.assessmentTime ? `(${app.assessmentTime})` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                            {t.statusPending || 'Pending Review'}
                          </span>
                        )}
                      </td>

                      {/* Placement & Class */}
                      <td className="py-3 px-4">
                        {app.status === 'enrolled' ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                              {t.statusEnrolled || 'Enrolled'}: {app.enrolledClass}
                            </span>
                            <div className="text-[10px] font-mono text-slate-400">
                              ID: {app.enrolledStudentId}
                            </div>
                          </div>
                        ) : placement ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {placement.assignedClass}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold">
                              {placement.assignedLevel} ({placement.decisionOutcome})
                            </div>
                          </div>
                        ) : res?.recommendedClass ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-600 dark:text-slate-400 italic">
                              Rec: {res.recommendedClass}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {res.recommendedLevel}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">{t.notPlacedYet || 'Not placed yet'}</span>
                        )}
                      </td>

                      {/* Result Publication Status */}
                      <td className="py-3 px-4">
                        {app.isResultPublished ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] border border-teal-300 dark:border-teal-700">
                              <Send className="w-2.5 h-2.5" />
                              <span>{t.published || 'Published'}</span>
                            </span>
                            <button
                              onClick={() => handleTogglePublish(app)}
                              className="text-[10px] text-slate-400 hover:text-rose-600 underline"
                              title="Revert to internal draft"
                            >
                              {t.unpublish || 'Unpublish'}
                            </button>
                          </div>
                        ) : res || placement ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                              {t.internalDraft || 'Internal Draft'}
                            </span>
                            <button
                              onClick={() => handleTogglePublish(app)}
                              className="text-[10px] text-teal-600 hover:text-teal-700 font-bold underline"
                              title="Post and publish results to parents now"
                            >
                              {t.postNow || 'Post Now'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">{t.noScoreYet || 'No score yet'}</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 flex-wrap justify-end">
                          
                          {/* 1. View / Print Slip */}
                          <button
                            onClick={() => setViewingApp(app)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="View Full Evaluation & Diagnostic Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Approve Request */}
                          {(app.status === 'pending' || app.status === 'approved_for_assessment') && (
                            <button
                              onClick={() => setApprovalModalData({ app, mode: 'approve' })}
                              className="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700 transition flex items-center gap-1"
                              title="Approve Registration Request"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t.approve || 'Approve'}</span>
                            </button>
                          )}

                          {/* 3. Assign / Reschedule Ustaz */}
                          <button
                            onClick={() => handleOpenScheduleModal(app)}
                            className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition flex items-center gap-1"
                            title="Assign Ustaz & Assessment Date"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{app.status === 'pending' ? (t.schedule || 'Schedule') : (t.reschedule || 'Reschedule')}</span>
                          </button>

                          {/* 4. Post Placement & Assessment Results */}
                          <button
                            onClick={() => setPlacementPostingApp(app)}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 transition flex items-center gap-1"
                            title="Post/Edit Classroom Placement & Diagnostic Scores"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>{t.placement || 'Placement'}</span>
                          </button>

                          {/* 5. Official Admission Letter */}
                          {(placement || res || app.status === 'enrolled') && (
                            <button
                              onClick={() => setAdmissionLetterApp(app)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                              title="Generate Official Admission & Placement Letter"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 6. Direct Enroll */}
                          {app.status !== 'enrolled' ? (
                            <button
                              onClick={() => handleOpenEnrollModal(app)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1"
                              title="Directly Enroll Student into Active Classes"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{t.enroll || 'Enroll'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTab('students')}
                              className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition"
                            >
                              {t.inRoster || 'In Roster'}
                            </button>
                          )}

                          {/* 7. Waitlist / Decline */}
                          {app.status !== 'enrolled' && (
                            <button
                              onClick={() => setApprovalModalData({ app, mode: 'reject' })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Decline / Reject Application"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 8. Delete */}
                          <button
                            onClick={() => handleDelete(app.id, app.fullName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Application Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Schedule Assessment Modal */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {t.assignUstazScheduleAssessment || 'Assign Ustaz & Schedule Assessment'}
                </h3>
              </div>
              <button
                onClick={() => setSchedulingApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 block">{t.applicant || 'Applicant'}:</span>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {schedulingApp.fullName} (#{schedulingApp.applicationNumber})
                </div>
                <div className="text-[11px] text-slate-500">
                  {t.claimedMemorization || 'Self-Reported'}: {schedulingApp.memorizedJuzCount} Juz • {schedulingApp.quranReadingAbility}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.assignedExaminer || 'Assigned Examiner / Hifz Ustaz'} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={scheduleForm.ustazId}
                  onChange={e => setScheduleForm(prev => ({ ...prev, ustazId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {ustazList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.specialization || 'Ustaz'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assessmentDate || 'Assessment Date'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assessmentDate|| 'Assessment Time'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.assessmentMode || 'Assessment Mode'}
                </label>
                <select
                  value={scheduleForm.mode}
                  onChange={e => setScheduleForm(prev => ({ ...prev, mode: e.target.value as any }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="In-Person (Campus)">{t.inPersonCampus || 'In-Person (Campus)'}</option>
                  <option value="Online (Video / Zoom / Telegram)">{t.onlineVideoSession || 'Online (Video / Zoom / Telegram)'}</option>
                  <option value="Oral Board">{t.oralPanelBoard || 'Oral Examination Board'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.roomOrVideoLink || 'Room Location or Video Link'}
                </label>
                <input
                  type="text"
                  value={scheduleForm.roomOrLink}
                  onChange={e => setScheduleForm(prev => ({ ...prev, roomOrLink: e.target.value }))}
                  placeholder="e.g. Oral Room 2 / Zoom Link"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.examinerNotes || 'Instructions for Assigned Ustaz'}
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.adminNotes}
                  onChange={e => setScheduleForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Notes for examiner..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-4 py-2 font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="px-5 py-2 font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingSchedule ? (t.saving || 'Saving...') : (t.confirmSchedule || 'Confirm Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Direct Student Enrollment Modal */}
      {enrollingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {t.directStudentEnrollment || 'Direct Student Enrollment from Assessment'}
                </h3>
              </div>
              <button
                onClick={() => setEnrollingApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enrollmentResult ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t.studentOfficiallyEnrolled || 'Student Officially Enrolled!'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {enrollmentResult.message}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setEnrollingApp(null);
                      setActiveTab('students');
                    }}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
                  >
                    <span>{t.openStudentDirectory || 'Open Student Directory'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDirectEnrollment} className="p-6 space-y-4 text-xs">
                {/* Candidate Overview */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {enrollingApp.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.guardianName || 'Guardian'}: {enrollingApp.guardianName} ({enrollingApp.guardianPhone})
                      </div>
                    </div>
                    {enrollingApp.assessmentResult && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                        {t.overallScore || 'Oral Score'}: {enrollingApp.assessmentResult.overallScore}%
                      </span>
                    )}
                  </div>

                  {enrollingApp.placementDetails && (
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <strong>{t.admissionPlacement || 'Assigned Placement'}:</strong> {enrollingApp.placementDetails.assignedClass} • {enrollingApp.placementDetails.assignedLevel} ({enrollingApp.placementDetails.assignedHalqah})
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assignedClassroom || 'Assign Classroom'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={enrollForm.classAssigned}
                    onChange={e => setEnrollForm(prev => ({ ...prev, classAssigned: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Class 1-A (Boys)">Class 1-A (Boys)</option>
                    <option value="Class 1-B (Boys)">Class 1-B (Boys)</option>
                    <option value="Class 2-A (Boys)">Class 2-A (Boys)</option>
                    <option value="Class 3-A (Boys)">Class 3-A (Boys)</option>
                    <option value="Class 4-B (Girls)">Class 4-B (Girls)</option>
                    <option value="Class 5-A (Girls)">Class 5-A (Girls)</option>
                    <option value="Sanad Advanced Circle">Sanad Advanced Circle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.academicHifzLevel || 'Academic Hifz Level'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={enrollForm.levelAssigned}
                    onChange={e => setEnrollForm(prev => ({ ...prev, levelAssigned: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Ibtida'i 1 (Primary)">Ibtida'i 1 (Primary Hifz Level)</option>
                    <option value="Ibtida'i 2 (Primary Upper)">Ibtida'i 2 (Primary Upper)</option>
                    <option value="Mutawassit 1 (Intermediate)">Mutawassit 1 (Intermediate Hifz)</option>
                    <option value="Mutawassit 2 (Intermediate Upper)">Mutawassit 2 (Intermediate Upper)</option>
                    <option value="Sanad Hifz Intensive">Sanad Hifz Intensive (Khatmah)</option>
                    <option value="Tajweed Mastery & Ijazah">Tajweed Mastery & Ijazah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assignedHifzHalqah || 'Assigned Hifz Halqah (Circle)'}
                  </label>
                  <input
                    type="text"
                    value={enrollForm.hifzCircleAssigned}
                    onChange={e => setEnrollForm(prev => ({ ...prev, hifzCircleAssigned: e.target.value }))}
                    placeholder="e.g. Halqah Ustaz Bilal Al-Habashi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.assignedHifzMentor || 'Assigned Hifz Mentor / Teacher'}
                  </label>
                  <select
                    value={enrollForm.assignedUstazId}
                    onChange={e => setEnrollForm(prev => ({ ...prev, assignedUstazId: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {ustazList.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEnrollingApp(null)}
                    className="px-4 py-2 font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {t.cancel || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEnrollment}
                    className="px-6 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
                  >
                    {isSubmittingEnrollment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t.enrollingStudent || 'Enrolling Student...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t.completeOfficialEnrollment || 'Complete Official Enrollment'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Detailed Assessment Record Slip Modal */}
      {viewingApp && (
        <AssessmentCardModal
          application={viewingApp}
          onClose={() => setViewingApp(null)}
          onEnroll={() => {
            const target = viewingApp;
            setViewingApp(null);
            handleOpenEnrollModal(target);
          }}
        />
      )}

      {/* MODAL 4: Post Placement & Assessment Results Modal */}
      {placementPostingApp && (
        <PlacementPostingModal
          application={placementPostingApp}
          onClose={() => setPlacementPostingApp(null)}
        />
      )}

      {/* MODAL 5: Approval Decision Modal */}
      {approvalModalData && (
        <ApprovalDecisionModal
          application={approvalModalData.app}
          mode={approvalModalData.mode}
          onClose={() => setApprovalModalData(null)}
        />
      )}

      {/* MODAL 6: Official Admission & Placement Letter Modal */}
      {admissionLetterApp && (
        <OfficialAdmissionLetterModal
          application={admissionLetterApp}
          onClose={() => setAdmissionLetterApp(null)}
        />
      )}

    </div>
  );
};
