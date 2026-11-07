import React, { useState } from 'react';
import type { EntranceApplication } from '../../types';
import {
  X,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  BookOpen,
  Award,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileCheck,
  Send,
  SlidersHorizontal,
  FileText,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';
import { PlacementPostingModal } from './PlacementPostingModal';
import { OfficialAdmissionLetterModal } from './OfficialAdmissionLetterModal';
import { ApprovalDecisionModal } from './ApprovalDecisonModal';

interface AssessmentCardModalProps {
  application: EntranceApplication;
  onClose: () => void;
  onEnroll?: () => void;
}

export const AssessmentCardModal: React.FC<AssessmentCardModalProps> = ({
  application,
  onClose,
  onEnroll,
}) => {
  const { currentMadrasaBranch, currentUser, publishAssessmentResult, t } = useMadrasa();
  const res = application.assessmentResult;
  const placement = application.placementDetails;
  const isAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'principal' ||
    currentUser?.role === 'vice_principal' ||
    currentUser?.role === 'registrar';

  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject' | 'waitlist' | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleTogglePublish = () => {
    publishAssessmentResult(application.id, !application.isResultPublished);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-300 dark:border-amber-700">
            {t.statusPending || 'Pending Registration Review'}
          </span>
        );
      case 'approved_for_assessment':
        return (
          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 rounded-full text-xs font-semibold border border-teal-300 dark:border-teal-700">
            {t.statusApprovedAssessment || 'Registration Approved'}
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-300 dark:border-blue-700">
            {t.statusScheduled || 'Assessment Scheduled'}
          </span>
        );
      case 'assessed':
        return (
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-300 dark:border-purple-700">
            {t.statusAssessed || 'Assessed (Internal Review)'}
          </span>
        );
      case 'result_published':
        return (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-semibold border border-emerald-300 dark:border-emerald-700">
            {t.statusResultPublished || 'Results Published'}
          </span>
        );
      case 'approved_for_admission':
        return (
          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 rounded-full text-xs font-semibold border border-teal-300 dark:border-teal-700">
            {t.statusApprovedAdmission || 'Approved for Admission'}
          </span>
        );
      case 'enrolled':
        return (
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-semibold border border-emerald-300 dark:border-emerald-700">
            {t.statusEnrolled || 'Officially Enrolled'}
          </span>
        );
      case 'waitlisted':
        return (
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-300 dark:border-amber-700">
            {t.statusWaitlisted || 'Waitlisted'}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 rounded-full text-xs font-semibold border border-rose-300 dark:border-rose-700">
            {t.statusRejected || 'Declined'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-300 dark:border-emerald-700">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {t.diagnosticAssessmentReport || 'Entrance Application & Evaluation Record'}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    #{application.applicationNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentMadrasaBranch} • {t.entranceAssessmentSystem || 'Admissions & Diagnostic Assessment Archive'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                title={t.printDocument || 'Print Evaluation Sheet'}
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-xs">
            
            {/* Top Status & Profile Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                  {application.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {application.fullName} {application.arabicName ? `(${application.arabicName})` : ''}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.submissionDate || 'Applied on'} {application.submissionDate} • {t.appliedProgram || 'Target'}: <strong>{application.targetProgram}</strong>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.shift || 'Schedule'}: <span className="font-semibold text-emerald-600">{application.preferredShift}</span> • {t.gender || 'Gender'}: {application.gender} • {t.age || 'Age'}: {application.age}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1.5">
                {getStatusBadge(application.status)}
                {application.isResultPublished && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                    <Send className="w-3 h-3" />
                    <span>{t.published || 'Publicly Published'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Grid 1: Personal & Guardian Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <User className="w-4 h-4" />
                  {t.candidateInformation || 'Personal Information'}
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.dateOfBirth || 'Date of Birth'}:</span>
                    <span className="font-semibold">{application.dob} ({application.age} {t.age || 'years'})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.address || 'Sub-City & Location'}:</span>
                    <span className="font-semibold">{application.subCity} ({application.address || 'CMC Area'})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.shift || 'Preferred Mode'}:</span>
                    <span className="font-semibold">{application.preferredAssessmentMode}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{t.notes || 'Medical / Notes'}:</span>
                    <span className="font-semibold">{application.hasSpecialNeedsOrMedical || 'None reported'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  {t.guardianName || 'Guardian Information'}
                </h5>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.guardianName || 'Guardian Name'}:</span>
                    <span className="font-semibold">{application.guardianName} ({application.guardianRelationship})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.guardianPhone || 'Phone Number'}:</span>
                    <span className="font-semibold font-mono text-emerald-600">{application.guardianPhone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">{t.email || 'Email Address'}:</span>
                    <span className="font-semibold">{application.guardianEmail || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{t.emergencyPhone || 'Emergency Contact'}:</span>
                    <span className="font-semibold font-mono">{application.emergencyContact|| application.guardianPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Self-Reported Quran Background */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
                {t.selfReported || "Applicant's Self-Reported Background"}
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{t.readingAbility || 'Reading Ability'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{application.quranReadingAbility}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{t.memorizedJuz || 'Memorized Juz'}</span>
                  <span className="font-bold text-emerald-600">{application.memorizedJuzCount} {t.juz || 'Juz'}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{t.tajweedMakharij || 'Tajweed Knowledge'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{application.tajweedKnowledgeLevel}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{t.previousMadrasa}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {application.previousMadrasaName || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Assessment Evaluation Section */}
            {res ? (
              <div className="p-5 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-200 dark:border-purple-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h5 className="font-bold text-purple-950 dark:text-purple-200 text-sm">
                        {t.ustazEvaluationTerminal || 'Ustaz Diagnostic Oral Evaluation Record'}
                      </h5>
                      <span className="text-xs text-purple-700 dark:text-purple-400">
                        {t.assignedExaminer || 'Assessed by'}: <strong>{res.assessedByUstazName}</strong> on {res.assessedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-600 text-white font-extrabold rounded-xl text-sm shadow-xs">
                      {res.overallScore}% Overall
                    </span>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    <span className="text-slate-400 block text-[10px]">{t.tajweedMakharij || 'Tajweed & Makharij'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {res.tajweedMakharijScore}/100
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    <span className="text-slate-400 block text-[10px]">{t.readingFluency || 'Reading Fluency'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {res.readingFluencyScore}/100
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    <span className="text-slate-400 block text-[10px]">{t.retentionSabqi || 'Memorization Accuracy'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {res.memorizationScore}/100
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/40">
                    <span className="text-slate-400 block text-[10px]">{t.verifiedJuzCount || 'Verified Memorized Juz'}</span>
                    <span className="font-extrabold text-emerald-600 text-base">
                      {res.verifiedMemorizedJuz} {t.juz || 'Juz'}
                    </span>
                  </div>
                </div>

                {/* Feedback notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                    <strong className="block mb-1 text-emerald-800 dark:text-emerald-300">{t.observedStrengths || 'Observed Strengths'}:</strong>
                    <p>{res.strengths}</p>
                  </div>
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                    <strong className="block mb-1 text-amber-800 dark:text-amber-300">{t.areasForImprovement || 'Areas for Reinforcement'}:</strong>
                    <p>{res.weaknesses}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Placement Details Card */}
            {placement && (
              <div className="p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                    <h5 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                      {t.admissionPlacement || 'Official Madrasa Placement Record'}
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs">
                    {placement.decisionOutcome}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.className || 'Classroom'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{placement.assignedClass}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.gradeLevel || 'Academic Level'}</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{placement.assignedLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.hifzCircle || 'Tahfeez Halqah'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{placement.assignedHalqah}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.mentorUstaz || 'Assigned Mentor'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{placement.assignedUstazName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.shift || 'Shift & Hours'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{placement.assignedShift}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.tuitionFee || 'Tuition Tier'}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{placement.tuitionTier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.waqfScholarshipDiscount || 'Waqf Subsidy'}</span>
                    <span className="font-bold text-emerald-600">
                      {placement?.scholarshipDiscountPercent ?? 0
                        ? `${placement.scholarshipDiscountPercent}% Waqf Scholarship`
                        : 'Standard (0%)'}
                    </span>
                  </div>
                </div>

                {placement.placementNotes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                    <strong>{t.notes || 'Placement Note'}:</strong> {placement.placementNotes}
                  </p>
                )}
              </div>
            )}

            {/* If Enrolled, Show Enrollment Certificate Stamp */}
            {application.status === 'enrolled' && (
              <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <h6 className="font-bold text-emerald-900 dark:text-emerald-200">
                      {t.officialStudentEnrollmentCompleted}
                    </h6>
                    <p className="text-emerald-800 dark:text-emerald-300">
                      Placed into {application.enrolledClass} ({application.enrolledLevel}) • Student ID: {application.enrolledStudentId}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-700 dark:text-emerald-400">
                  Enrolled by: {application.enrolledBy}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.status || 'Application Status'}: <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{application.status}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Approve Registration */}
              {(application.status === 'pending' || application.status === 'approved_for_assessment') && (
                <button
                  onClick={() => setApprovalMode('approve')}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.batchApprove || 'Approve Request'}</span>
                </button>
              )}

              {/* Post / Edit Placement */}
              <button
                onClick={() => setIsPlacementModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.postPlacement || 'Post Placement Results'}</span>
              </button>

              {/* Toggle Publish */}
              <button
                onClick={handleTogglePublish}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1 border ${
                  application.isResultPublished
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{application.isResultPublished ? (t.published || 'Results Published') : (t.publishResults || 'Publish Results')}</span>
              </button>

              {/* Official Offer Letter */}
              <button
                onClick={() => setIsLetterModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.admissionLetter || 'Official Offer Letter'}</span>
              </button>

              {/* Direct Enroll */}
              {isAdmin && application.status !== 'enrolled' && onEnroll && (
                <button
                  onClick={onEnroll}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.enrollDirectly || 'Directly Enroll'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
              >
                {t.close || 'Close'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Nested Modals */}
      {isPlacementModalOpen && (
        <PlacementPostingModal
          application={application}
          onClose={() => setIsPlacementModalOpen(false)}
        />
      )}

      {isLetterModalOpen && (
        <OfficialAdmissionLetterModal
          application={application}
          onClose={() => setIsLetterModalOpen(false)}
        />
      )}

      {approvalMode && (
        <ApprovalDecisionModal
          application={application}
          mode={approvalMode}
          onClose={() => setApprovalMode(null)}
        />
      )}
    </>
  );
};
