import React from 'react';
import type { EntranceApplication } from '../../types';
import {
  X,
  Printer,
  BookOpen,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useMadrasa } from '../../context/MadrasaContext';

interface OfficialAdmissionLetterModalProps {
  application: EntranceApplication;
  onClose: () => void;
}

export const OfficialAdmissionLetterModal: React.FC<OfficialAdmissionLetterModalProps> = ({
  application,
  onClose,
}) => {
  const { currentMadrasaBranch } = useMadrasa();
  const res = application.assessmentResult;
  const placement = application.placementDetails;

  const handlePrint = () => {
    window.print();
  };

  const assignedClass = placement?.assignedClass || res?.recommendedClass || application.enrolledClass || 'Class 1-A (Boys)';
  const assignedLevel = placement?.assignedLevel || res?.recommendedLevel || application.enrolledLevel || "Ibtida'i 1 (Primary)";
  const assignedHalqah = placement?.assignedHalqah || res?.recommendedHifzCircle || 'General Tahfeez Circle';
  const assignedUstaz = placement?.assignedUstazName || application.assignedUstazName || 'Ustaz Bilal Al-Habashi';
  const commencementDate = placement?.commencementDate || 'Monday, 1st September 2026';
  const shift = placement?.assignedShift || application.preferredShift|| 'Morning Shift (6:30 AM - 12:00 PM)';
  const tuition = placement?.tuitionTier || 'Standard (ETB 1,200/mo)';
  const scholarship = placement?.scholarshipDiscountPercent ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Official Madrasa Admission & Placement Letter
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              #{application.applicationNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Letter</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="printable-admission-letter" className="p-8 overflow-y-auto space-y-6 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
          
          {/* Institutional Letterhead Header */}
          <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-md">
                <BookOpen className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-400 tracking-tight font-serif">
                  AL-IMRAN CMC ISLAMIC MADRASA
                </h2>
                <p className="font-arabic text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                  مدرسة العمران الإسلامية لتحفيظ القرآن الكريم والعلوم الشرعية
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentMadrasaBranch} • Addis Ababa, Ethiopia • Tel: +251 911 234 567 • Email: admissions@alimran-madrasa.et
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1 font-mono text-slate-500">
              <div>Ref: <strong className="text-slate-900 dark:text-slate-100">ADM-2026/{application.applicationNumber}</strong></div>
              <div>Date: <strong className="text-slate-900 dark:text-slate-100">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              <div>Academic Term: <strong>2026/2027</strong></div>
            </div>
          </div>

          {/* Arabic Bismillah Banner */}
          <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="font-arabic text-xl text-emerald-800 dark:text-emerald-400 font-bold">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Official Letter of Admission & Classroom Placement
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Issued following Diagnostic Oral Recitation, Tajweed Evaluation & Academic Clearance
            </p>
          </div>

          {/* Salutation & Recipient Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Candidate / Student:</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {application.fullName} {application.arabicName ? `(${application.arabicName})` : ''}
              </div>
              <div className="text-xs text-slate-500">
                Guardian: <strong>{application.guardianName}</strong> ({application.guardianRelationship}) • Tel: {application.guardianPhone}
              </div>
              <div className="text-xs text-slate-500">
                Address: {application.address || 'CMC, Addis Ababa'} ({application.subCity})
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end justify-center space-y-1 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300">
                Decision: {placement?.decisionOutcome || 'Approved for Direct Admission'}
              </span>
              <span className="text-[11px] text-slate-400">
                Application Status: <strong className="capitalize text-slate-700 dark:text-slate-300">{application.status}</strong>
              </span>
            </div>
          </div>

          {/* Letter Body Paragraph */}
          <div className="space-y-3 leading-relaxed text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <p>
              Dear Respected Guardian <strong>{application.guardianName}</strong>,
            </p>
            <p>
              <em>As-salamu alaykum wa Rahmatullahi wa Barakatuh.</em>
            </p>
            <p>
              Following the comprehensive oral entrance assessment and diagnostic evaluation conducted at Al-Imran CMC Islamic Madrasa, we are pleased to inform you that <strong>{application.fullName}</strong> has been officially accepted and placed into our Qur'an Hifz and Islamic Studies curriculum.
            </p>
          </div>

          {/* Official Placement Table */}
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
            <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold">
              <span>Official Academic Placement & Schedule Details</span>
              <span>Intake Cohort 2026</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-200 dark:divide-emerald-800 text-xs">
              <div className="p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500">Assigned Classroom:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{assignedClass}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500">Academic Hifz Level:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{assignedLevel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500">Tahfeez Halqah (Circle):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{assignedHalqah}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Mentor Ustaz:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{assignedUstaz}</span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500">Session Shift & Hours:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{shift}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500">Commencement Date:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{commencementDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-slate-500">Tuition Tier:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{tuition}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Waqf Subsidy / Scholarship:</span>
                  <span className="font-bold text-emerald-600">
                    {scholarship > 0 ? `${scholarship}% Waqf Scholarship Applied` : 'Standard Tier (0%)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Assessment Scores Breakdown */}
          {res && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Oral Diagnostic Evaluation Record
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                  Overall: {res.overallScore}/100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tajweed & Makharij</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{res.tajweedMakharijScore}/100</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Reading Fluency</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{res.readingFluencyScore}/100</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Memorization Quality</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{res.memorizationScore}/100</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Verified Memorization</span>
                  <span className="font-bold text-emerald-600">{res.verifiedMemorizedJuz} Juz Amma</span>
                </div>
              </div>
              {placement?.placementNotes && (
                <div className="pt-2 text-slate-600 dark:text-slate-400 italic">
                  <strong>Special Administrative Notes:</strong> "{placement.placementNotes}"
                </div>
              )}
            </div>
          )}

          {/* Signatures & Seal Section */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center">
            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-slate-600 dark:text-slate-400 font-bold">Ustaz B. Al-Habashi</span>
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 dark:text-slate-200">
                Head of Qur'anic Board
              </div>
              <div className="text-[10px] text-slate-400">Oral Assessment Committee</div>
            </div>

            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-emerald-700/60 flex items-center justify-center text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest leading-none rotate-[-12deg]">
                  OFFICIAL<br/>SEAL
                </div>
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 dark:text-slate-200">
                Office of Admissions
              </div>
              <div className="text-[10px] text-slate-400">Al-Imran Madrasa Registrar</div>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-slate-600 dark:text-slate-400 font-bold">Sheikh Fuad Nuru</span>
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 dark:text-slate-200">
                Madrasa Principal / Ameer
              </div>
              <div className="text-[10px] text-slate-400">Board of Trustees</div>
            </div>
          </div>

          {/* Tear-off Guardian Acknowledgment Section */}
          <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 dark:border-slate-700 space-y-2 text-[11px] text-slate-500">
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 uppercase">
              <span>Guardian Undertaking & Acceptance Slip</span>
              <span>Detach and Submit on First Day</span>
            </div>
            <p>
              I, ___________________________________ (Parent/Guardian of {application.fullName}), confirm receipt of this admission and placement offer into {assignedClass}. I agree to uphold Madrasa attendance standards, dress code, and daily revision requirements.
            </p>
            <div className="flex justify-between pt-2">
              <span>Signature: __________________________</span>
              <span>Date: __________________________</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
