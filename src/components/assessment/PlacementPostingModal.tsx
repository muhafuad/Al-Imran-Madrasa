import React, { useState } from 'react';
import type { Teacher } from '../../types';
import type { EntranceApplication, PlacementDetails, AssessmentResult } from '../../types';
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  UserCheck,
  Send,
  Save,
  HelpCircle,
} from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';

interface PlacementPostingModalProps {
  application: EntranceApplication;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PlacementPostingModal: React.FC<PlacementPostingModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const { teachers, postPlacementResult, currentUser, t } = useMadrasa();
  const res = application.assessmentResult;
  const existingPlacement = application.placementDetails;

  // Ustaz list
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
        // other teachers...
      ];

  // Form State
  const [placementForm, setPlacementForm] = useState<PlacementDetails>({
    assignedClass: existingPlacement?.assignedClass || res?.recommendedClass || (application.gender === 'female' ? 'Class 4-B (Girls)' : 'Class 1-A (Boys)'),
    assignedLevel: existingPlacement?.assignedLevel || res?.recommendedLevel || "Ibtida'i 1 (Primary)",
    assignedHalqah: existingPlacement?.assignedHalqah || res?.recommendedHifzCircle || 'Halqah Ustaz Bilal Al-Habashi',
    assignedUstazId: existingPlacement?.assignedUstazId || application.assignedUstazId || 'tch-1',
    assignedUstazName: existingPlacement?.assignedUstazName || application.assignedUstazName || 'Ustaz Bilal Al-Habashi',
    assignedShift: existingPlacement?.assignedShift || 'Morning (6:30 AM - 12:00 PM)',
    commencementDate: existingPlacement?.commencementDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    tuitionTier: existingPlacement?.tuitionTier || 'Standard (ETB 1,200/mo)',
    scholarshipDiscountPercent: existingPlacement?.scholarshipDiscountPercent ?? 0,
    placementNotes: existingPlacement?.placementNotes || 'Qualified for regular curriculum with daily 2-hour Tajweed clinic.',
    decisionOutcome: existingPlacement?.decisionOutcome || 'Direct Admission',
  });

  // Diagnostic marks state (in case admin wants to add or adjust scores)
  const [diagnosticMarks, setDiagnosticMarks] = useState({
    overallScore: res?.overallScore ?? 85,
    readingFluencyScore: res?.readingFluencyScore ?? 88,
    tajweedMakharijScore: res?.tajweedMakharijScore ?? 82,
    memorizationScore: res?.memorizationScore ?? 85,
    arabicProficiencyScore: res?.arabicProficiencyScore ?? 80,
    verifiedMemorizedJuz: res?.verifiedMemorizedJuz ?? application.memorizedJuzCount ?? 1,
    strengths: res?.strengths || 'Clear makharij on throat letters (Halqi) and good rhythm.',
    weaknesses: res?.weaknesses || 'Needs reinforcement on Ghunnah durations and Madd Lazim.',
    recommendationNotes: res?.recommendationNotes || 'Recommended for intensive morning halqah.',
  });

  const [publishNow, setPublishNow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedUstaz = ustazList.find(t => t.id === placementForm.assignedUstazId);
    const updatedPlacement: PlacementDetails = {
      ...placementForm,
      assignedUstazName: selectedUstaz?.fullName || placementForm.assignedUstazName,
    };

    const updatedAssessmentResult: Partial<AssessmentResult> = {
      overallScore: Number(diagnosticMarks.overallScore),
      readingFluencyScore: Number(diagnosticMarks.readingFluencyScore),
      tajweedMakharijScore: Number(diagnosticMarks.tajweedMakharijScore),
      memorizationScore: Number(diagnosticMarks.memorizationScore),
      arabicProficiencyScore: Number(diagnosticMarks.arabicProficiencyScore),
      verifiedMemorizedJuz: Number(diagnosticMarks.verifiedMemorizedJuz),
      strengths: diagnosticMarks.strengths,
      weaknesses: diagnosticMarks.weaknesses,
      recommendationNotes: diagnosticMarks.recommendationNotes,
      decision: placementForm.decisionOutcome === 'Direct Admission'
        ? 'Accepted for Direct Admission'
        : placementForm.decisionOutcome === 'Foundation Tajweed Preparatory'
        ? 'Accepted - Foundation Tajweed Track'
        : placementForm.decisionOutcome === 'Accelerated Sanad Track'
        ? 'Accepted - Accelerated Hifz Track'
        : 'Conditional Acceptance',
      recommendedClass: placementForm.assignedClass,
      recommendedLevel: placementForm.assignedLevel,
      recommendedHifzCircle: placementForm.assignedHalqah,
      assessedByUstazName: selectedUstaz?.fullName || application.assignedUstazName || (currentUser?.name ?? 'Head of Academics'),
      assessedAt: res?.assessedAt || new Date().toISOString(),
    };

    setTimeout(() => {
      postPlacementResult(application.id, updatedPlacement, {
        publishNow,
        diagnosticMarks: updatedAssessmentResult,
      });
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {t.postPlacement || 'Post & Finalize Placement Results'}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/20 text-emerald-200">
                  #{application.applicationNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                {t.admissionPlacement || 'Official Classroom Placement, Diagnostic Marks & Parent Portal Publishing'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Candidate Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-base flex-shrink-0">
                {application.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {application.fullName} {application.arabicName ? `(${application.arabicName})` : ''}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t.appliedProgram || 'Program'}: {application.targetProgram} • {t.guardianName || 'Guardian'}: {application.guardianName} ({application.guardianPhone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800">
                {application.preferredShift || 'Morning Shift'}
              </span>
            </div>
          </div>

          {/* Section 1: Placement & Classroom Assignment */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
              1. {t.classroomsAndAcademicAssignment}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.assignedClassroom || 'Assigned Classroom'} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={placementForm.assignedClass}
                  onChange={e => setPlacementForm(prev => ({ ...prev, assignedClass: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Class 1-A (Boys)">Class 1-A (Boys - Beginner)</option>
                  <option value="Class 1-B (Boys)">Class 1-B (Boys - Tajweed Foundation)</option>
                  <option value="Class 2-A (Boys)">Class 2-A (Boys - Intermediate Hifz)</option>
                  <option value="Class 3-A (Boys)">Class 3-A (Boys - Advanced Juz)</option>
                  <option value="Class 4-B (Girls)">Class 4-B (Girls - Primary Hifz)</option>
                  <option value="Class 5-A (Girls)">Class 5-A (Girls - Intermediate Tahfeez)</option>
                  <option value="Sanad Advanced Circle">Sanad Advanced Circle (Khatmah)</option>
                  <option value="Ijazah & Qira'at Special Circle">Ijazah & Qira'at Special Circle</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.gradeLevel || 'Academic Level / Tier'} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={placementForm.assignedLevel}
                  onChange={e => setPlacementForm(prev => ({ ...prev, assignedLevel: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Ibtida'i 1 (Primary)">Ibtida'i 1 (Primary Level 1)</option>
                  <option value="Ibtida'i 2 (Primary Upper)">Ibtida'i 2 (Primary Level 2)</option>
                  <option value="Mutawassit 1 (Intermediate)">Mutawassit 1 (Intermediate Level 1)</option>
                  <option value="Mutawassit 2 (Intermediate Upper)">Mutawassit 2 (Intermediate Level 2)</option>
                  <option value="Sanawi 1 (Secondary Hifz)">Sanawi 1 (Secondary Hifz & Fiqh)</option>
                  <option value="Sanad Hifz Intensive">Sanad Hifz Intensive (Full 30 Juz)</option>
                  <option value="Tajweed Mastery & Ijazah">Tajweed Mastery & Ijazah</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.hifzCircle || "Assigned Halqah (Qur'an Circle)"}
                </label>
                <input
                  type="text"
                  value={placementForm.assignedHalqah}
                  onChange={e => setPlacementForm(prev => ({ ...prev, assignedHalqah: e.target.value }))}
                  placeholder="e.g. Halqah Ustaz Bilal Al-Habashi"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.mentorUstaz || 'Assigned Mentor Ustaz / Teacher'}
                </label>
                <select
                  value={placementForm.assignedUstazId}
                  onChange={e => setPlacementForm(prev => ({ ...prev, assignedUstazId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {ustazList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.specialization || 'Teacher'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.shift || 'Assigned Shift & Hours'}
                </label>
                <select
                  value={placementForm.assignedShift}
                  onChange={e => setPlacementForm(prev => ({ ...prev, assignedShift: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Morning (6:30 AM - 12:00 PM)">{t.morningShift || 'Morning Shift (6:30 AM - 12:00 PM)'}</option>
                  <option value="Afternoon (1:30 PM - 5:30 PM)">{t.afternoonShift || 'Afternoon Shift (1:30 PM - 5:30 PM)'}</option>
                  <option value="Evening (5:30 PM - 8:00 PM)">Evening Shift (5:30 PM - 8:00 PM)</option>
                  <option value="Weekend Intensive (Sat & Sun)">{t.weekendShift || 'Weekend Intensive (Sat & Sun)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.date || 'Commencement / Start Date'}
                </label>
                <input
                  type="date"
                  value={placementForm.commencementDate}
                  onChange={e => setPlacementForm(prev => ({ ...prev, commencementDate: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Diagnostic Evaluation Scores & Remarks */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Award className="w-4 h-4" />
              2. {t.verifiedDiagnosticScores}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  {t.evaluationScore || 'Overall Score'} (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={diagnosticMarks.overallScore}
                  onChange={e => setDiagnosticMarks(prev => ({ ...prev, overallScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2 font-bold text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  {t.tajweedMakharij || 'Tajweed & Makharij'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={diagnosticMarks.tajweedMakharijScore}
                  onChange={e => setDiagnosticMarks(prev => ({ ...prev, tajweedMakharijScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2 font-bold text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  {t.readingFluency || 'Reading Fluency'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={diagnosticMarks.readingFluencyScore}
                  onChange={e => setDiagnosticMarks(prev => ({ ...prev, readingFluencyScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2 font-bold text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  {t.verifiedJuzCount || 'Verified Juz Count'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={diagnosticMarks.verifiedMemorizedJuz}
                  onChange={e => setDiagnosticMarks(prev => ({ ...prev, verifiedMemorizedJuz: Number(e.target.value) }))}
                  className="w-full px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  {t.observedStrengths || 'Observed Strengths (Tajweed & Pronunciation)'}
                </label>
                <input
                  type="text"
                  value={diagnosticMarks.strengths}
                  onChange={e => setDiagnosticMarks(prev => ({ ...prev, strengths: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  {t.areasForImprovement || 'Areas for Consolidation'}
                </label>
                <input
                  type="text"
                  value={diagnosticMarks.weaknesses}
                  onChange={e => setDiagnosticMarks(prev => ({ ...prev, weaknesses: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Waqf Scholarship Terms */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
              3. {t.financeFees || 'Tuition Tier & Waqf Sponsorship'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tuitionFee || 'Tuition Fee Tier'}
                </label>
                <select
                  value={placementForm.tuitionTier}
                  onChange={e => setPlacementForm(prev => ({ ...prev, tuitionTier: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="Standard (ETB 1,200/mo)">Standard (ETB 1,200/mo)</option>
                  <option value="Intensive Hifz (ETB 1,800/mo)">Intensive Hifz (ETB 1,800/mo)</option>
                  <option value="Weekend Tahfeez (ETB 800/mo)">Weekend Tahfeez (ETB 800/mo)</option>
                  <option value="Subsidized Community (ETB 500/mo)">Subsidized Community (ETB 500/mo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.waqfScholarshipDiscount || 'Waqf Scholarship / Discount'}
                </label>
                <select
                  value={placementForm.scholarshipDiscountPercent}
                  onChange={e => setPlacementForm(prev => ({ ...prev, scholarshipDiscountPercent: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-bold text-emerald-600"
                >
                  <option value={0}>0% - Standard Full Fee</option>
                  <option value={25}>25% - Partial Waqf Subsidy</option>
                  <option value={50}>50% - Half Waqf Scholarship</option>
                  <option value={75}>75% - Major Waqf Grant</option>
                  <option value={100}>100% - Full Waqf Orphan / Need-Based</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.decisionOutcome || 'Admission Decision Outcome'}
                </label>
                <select
                  value={placementForm.decisionOutcome}
                  onChange={e => setPlacementForm(prev => ({ ...prev, decisionOutcome: e.target.value as any }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-bold text-blue-600"
                >
                  <option value="Direct Admission">{t.directAdmission || 'Direct Admission (Approved)'}</option>
                  <option value="Foundation Tajweed Preparatory">{t.foundationTrack || 'Foundation Tajweed Preparatory'}</option>
                  <option value="Conditional Placement">{t.conditionalAdmission || 'Conditional Placement'}</option>
                  <option value="Accelerated Sanad Track">{t.acceleratedTrack || 'Accelerated Sanad Track'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.notes || 'Official Placement Remarks & Instructions for Parents'}
              </label>
              <textarea
                rows={2}
                value={placementForm.placementNotes}
                onChange={e => setPlacementForm(prev => ({ ...prev, placementNotes: e.target.value }))}
                placeholder="Notes visible on the official placement letter..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none resize-none"
              />
            </div>
          </div>

          {/* Publishing Switcher Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                  {t.publishResultsToPortal || 'Post & Publish Results to Parent & Public Tracker'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.parentPortalNotice}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={e => setPublishNow(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.saving || 'Saving Placement...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{publishNow ? t.postAndPublishPlacement : t.savePlacementAsDraft}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
