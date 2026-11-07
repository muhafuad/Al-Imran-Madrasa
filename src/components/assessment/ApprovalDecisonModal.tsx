import React, { useState } from 'react';
import type { EntranceApplication } from '../../types';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  FileCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';

interface ApprovalDecisionModalProps {
  application: EntranceApplication;
  mode: 'approve' | 'reject' | 'waitlist';
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApprovalDecisionModal: React.FC<ApprovalDecisionModalProps> = ({
  application,
  mode,
  onClose,
  onSuccess,
}) => {
  const {
    approveRegistrationRequest,
    rejectRegistrationRequest,
    waitlistRegistrationRequest,
    currentUser,
    t,
  } = useMadrasa();

  const [notes, setNotes] = useState(
    mode === 'approve'
      ? 'Application background and guardian contact information verified. Approved for oral assessment and placement.'
      : mode === 'waitlist'
      ? 'Candidate meets general prerequisites. Placed on active waitlist for next term cohort opening.'
      : 'Application prerequisites not fulfilled.'
  );

  const [conditionalTerms, setConditionalTerms] = useState(
    application.hasSpecialNeedsOrMedical ? 'Requires 1-on-1 recitation guidance during initial 2 weeks.' : ''
  );

  const [rejectionReason, setRejectionReason] = useState(
    'Age or prerequisite memorization foundation below minimum intake requirement for the requested advanced track.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (mode === 'approve') {
        approveRegistrationRequest(application.id, notes, conditionalTerms);
      } else if (mode === 'reject') {
        rejectRegistrationRequest(application.id, rejectionReason);
      } else if (mode === 'waitlist') {
        waitlistRegistrationRequest(application.id, notes);
      }

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between text-white ${
            mode === 'approve'
              ? 'bg-gradient-to-r from-emerald-800 to-teal-900 border-emerald-700'
              : mode === 'waitlist'
              ? 'bg-gradient-to-r from-amber-700 to-orange-900 border-amber-600'
              : 'bg-gradient-to-r from-rose-800 to-red-950 border-rose-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              {mode === 'approve' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              ) : mode === 'waitlist' ? (
                <Clock className="w-5 h-5 text-amber-300" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-300" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {mode === 'approve'
                  ? (t.batchApprove || 'Approve Student Registration Request')
                  : mode === 'waitlist'
                  ? (t.statusWaitlisted || 'Place Applicant on Waitlist')
                  : (t.statusRejected || 'Decline / Reject Application')}
              </h3>
              <p className="text-xs text-white/80">
                Application #{application.applicationNumber} • {application.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {/* Candidate Quick Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {application.fullName}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px]">
                {application.memorizedJuzCount} {t.memorizedJuz || 'Juz Memorized'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {t.guardianName || 'Guardian'}: {application.guardianName} ({application.guardianRelationship}) • Tel: {application.guardianPhone}
            </p>
            <p className="text-[11px] text-slate-500">
              {t.appliedProgram || 'Target Program'}: <strong className="text-slate-700 dark:text-slate-300">{application.targetProgram}</strong> ({application.preferredShift})
            </p>
          </div>

          {mode === 'approve' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.approvalRemarks}
                </label>
                <textarea
                  rows={2}
                  required
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.conditionalAdmission}
                </label>
                <input
                  type="text"
                  value={conditionalTerms}
                  onChange={e => setConditionalTerms(e.target.value)}
                  placeholder="e.g. Must complete 2-week Tajweed primer / Medical clearance"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {t.conditionalTermsHelp}
                </p>
              </div>
            </>
          )}

          {mode === 'waitlist' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.waitlistReason}
              </label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              />
            </div>
          )}

          {mode === 'reject' && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.rejectionReason} <span className="text-rose-500">*</span>
              </label>
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none mb-2"
              >
                <option value="Age or prerequisite memorization foundation below minimum intake requirement.">
                  Age / Foundation below minimum intake requirement
                </option>
                <option value="Madrasa intake capacity fully exhausted for the requested schedule.">
                  Intake capacity exhausted for requested shift
                </option>
                <option value="Applicant resides outside reasonable daily transit perimeter.">
                  Transit / Location constraint
                </option>
                <option value="Guardian withdrew or requested postponement.">
                  Guardian request / withdrawal
                </option>
                <option value="Custom Reason">Other reason (specified below)</option>
              </select>

              <textarea
                rows={2}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Details of decision..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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
              className={`px-5 py-2 font-bold rounded-xl text-white shadow-md flex items-center gap-1.5 ${
                mode === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : mode === 'waitlist'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? (
                t.loading || 'Processing...'
              ) : mode === 'approve' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.confirm || 'Confirm Approval'}</span>
                </>
              ) : mode === 'waitlist' ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>{t.statusWaitlisted || 'Place on Waitlist'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.confirm || 'Confirm Decline'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
