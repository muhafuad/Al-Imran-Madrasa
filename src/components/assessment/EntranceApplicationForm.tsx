import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  User,
  ShieldCheck,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  HelpCircle,
  FileText,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import type { EntranceApplication } from '../../types';

interface EntranceApplicationFormProps {
  onSuccess?: (applicationNumber: string) => void;
  isPublicView?: boolean;
}

export const EntranceApplicationForm: React.FC<EntranceApplicationFormProps> = ({
  onSuccess,
  isPublicView = false,
}) => {
  const { submitEntranceApplication } = useMadrasa();

  // Multi-step form step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppNum, setSubmittedAppNum] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    arabicName: '',
    gender: 'male' as 'male' | 'female',
    dob: '2015-06-15',
    nationality: 'Ethiopian',
    subCity: 'Yeka',
    woreda: '08',
    address: 'CMC Road, Addis Ababa',
    photoUrl: '',
    targetProgram: 'Full-Time Qur\'an Hifz & Sanad Program',
    preferredShift: 'Morning Shift (8:00 AM - 12:30 PM)',

    // Step 2: Guardian Details
    guardianName: '',
    guardianRelationship: 'Father',
    guardianPhone: '+251 ',
    guardianEmail: '',
    emergencyContact: '+251 ',
    guardianOccupation: '',

    // Step 3: Quran Background
    quranReadingAbility: 'Fluent with Tajweed Rules' as 'Fluent with Tajweed Rules' | 'Can read with spelling (Hija)' | 'Beginner Arabic Letters' | 'Cannot read Arabic yet',
    memorizedJuzCount: 3,
    memorizedSurahsDetails: 'Juz 30 (Amma), Juz 29 (Tabarak), Surah Yasin',
    tajweedKnowledgeLevel: 'Basic Tajweed Rules' as 'Advanced with Ijazah/Rules' | 'Basic Tajweed Rules' | 'Practical recitation only' | 'None/New to Tajweed',
    previousMadrasaName: '',
    previousUstazName: '',
    yearsOfIslamicStudy: '2',

    // Step 4: Preferences & Special Notes
    preferredAssessmentMode: 'In-Person (Campus)' as 'In-Person (Campus)' | 'Online (Video / Zoom / Telegram)' | 'Oral Board',
    hasSpecialNeedsOrMedical: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      alert('Please enter prospective student\'s full name.');
      return false;
    }
    if (!formData.dob) {
      alert('Please select date of birth.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.guardianName.trim()) {
      alert('Please enter guardian\'s full name.');
      return false;
    }
    if (!formData.guardianPhone || formData.guardianPhone.trim().length < 8) {
      alert('Please enter a valid guardian phone number (e.g. +251 911 ...).');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const appNumber = submitEntranceApplication({
        fullName: formData.fullName.trim(),
        arabicName: formData.arabicName.trim() || undefined,
        gender: formData.gender,
        dob: formData.dob,
        nationality: formData.nationality,
        subCity: formData.subCity,
        woreda: formData.woreda,
        address: formData.address,
        photoUrl: formData.photoUrl || undefined,
        guardianName: formData.guardianName.trim(),
        guardianRelationship: formData.guardianRelationship,
        guardianPhone: formData.guardianPhone.trim(),
        guardianEmail: formData.guardianEmail.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || formData.guardianPhone.trim(),
        quranReadingAbility: formData.quranReadingAbility,
        memorizedJuzCount: Number(formData.memorizedJuzCount) || 0,
        memorizedSurahsDetails: formData.memorizedSurahsDetails || undefined,
        tajweedKnowledgeLevel: formData.tajweedKnowledgeLevel,
        previousMadrasaName: formData.previousMadrasaName || undefined,
        previousUstazName: formData.previousUstazName || undefined,
        targetProgram: formData.targetProgram,
        preferredShift: formData.preferredShift,
        preferredAssessmentMode: formData.preferredAssessmentMode,
        hasSpecialNeedsOrMedical: formData.hasSpecialNeedsOrMedical || undefined,
      });

      setIsSubmitting(false);
      setSubmittedAppNum(appNumber);
      if (onSuccess) onSuccess(appNumber);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedAppNum(null);
    setCurrentStep(1);
    setFormData({
      fullName: '',
      arabicName: '',
      gender: 'male',
      dob: '2015-06-15',
      nationality: 'Ethiopian',
      subCity: 'Yeka',
      woreda: '08',
      address: 'CMC Road, Addis Ababa',
      photoUrl: '',
      targetProgram: 'Full-Time Qur\'an Hifz & Sanad Program',
      preferredShift: 'Morning Shift (8:00 AM - 12:30 PM)',
      guardianName: '',
      guardianRelationship: 'Father',
      guardianPhone: '+251 ',
      guardianEmail: '',
      emergencyContact: '+251 ',
      guardianOccupation: '',
      quranReadingAbility: 'Fluent with Tajweed Rules',
      memorizedJuzCount: 0,
      memorizedSurahsDetails: '',
      tajweedKnowledgeLevel: 'Basic Tajweed Rules',
      previousMadrasaName: '',
      previousUstazName: '',
      yearsOfIslamicStudy: '0',
      preferredAssessmentMode: 'In-Person (Campus)',
      hasSpecialNeedsOrMedical: '',
    });
  };

  if (submittedAppNum) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg text-center max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full">
            Application Submitted Successfully
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Alhamdulillah! Application Received
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
            Your online entrance assessment application has been logged into the Madrasa registry with a status of <strong className="text-amber-600 dark:text-amber-400 font-semibold">Pending Admin Review</strong>.
          </p>
        </div>

        {/* Application Number Token Card */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-md mx-auto space-y-2">
          <span className="text-xs text-slate-500 block">Your Tracking Application Number:</span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-700 dark:text-emerald-400 tracking-wider">
            {submittedAppNum}
          </div>
          <p className="text-[11px] text-slate-400">
            Please keep this number for your records. The Madrasa administration will review the profile and assign an Ustaz and date for the oral entrance evaluation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Application Receipt</span>
          </button>

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Another Application</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Online Entrance & Placement Application</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Prospective Student Entrance Form
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Complete this digital form before visiting the campus. Our admissions committee will review your Qur'an background and schedule an oral placement assessment.
          </p>
        </div>

        {/* Step Indicator Progress */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(step => (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (step < currentStep) setCurrentStep(step);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                currentStep === step
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : currentStep > step
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {currentStep > step ? '✓' : step}
            </button>
          ))}
        </div>
      </div>

      {/* Step Navigation Titles Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
        <div className={`p-2.5 rounded-xl border transition ${currentStep === 1 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
          <span className="block text-[10px] text-slate-400">Step 1</span>
          1. Student Personal Info
        </div>
        <div className={`p-2.5 rounded-xl border transition ${currentStep === 2 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
          <span className="block text-[10px] text-slate-400">Step 2</span>
          2. Guardian Details
        </div>
        <div className={`p-2.5 rounded-xl border transition ${currentStep === 3 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
          <span className="block text-[10px] text-slate-400">Step 3</span>
          3. Qur'an Background
        </div>
        <div className={`p-2.5 rounded-xl border transition ${currentStep === 4 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
          <span className="block text-[10px] text-slate-400">Step 4</span>
          4. Schedule & Review
        </div>
      </div>

      {/* Form Steps Body */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-emerald-600" />
              Applicant Personal Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Ibrahim Bilal Ahmed"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arabic Name (Optional / الاسم الكامل)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.arabicName}
                  onChange={e => handleChange('arabicName', e.target.value)}
                  placeholder="إبراهيم بلال أحمد"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-arabic"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="male">Male (Boys Section)</option>
                  <option value="female">Female (Girls Section)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={e => handleChange('dob', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-City (Addis Ababa)
                </label>
                <select
                  value={formData.subCity}
                  onChange={e => handleChange('subCity', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Yeka">Yeka (የካ)</option>
                  <option value="Bole">Bole (ቦሌ)</option>
                  <option value="Kirkos">Kirkos (ቂርቆስ)</option>
                  <option value="Arada">Arada (አራዳ)</option>
                  <option value="Gullele">Gullele (ጉለሌ)</option>
                  <option value="Kolfe Keranio">Kolfe Keranio (ኮልፌ ቀራንዮ)</option>
                  <option value="Nifas Silk-Lafto">Nifas Silk-Lafto (ንፋስ ስልክ)</option>
                  <option value="Akaky Kaliti">Akaky Kaliti (አቃቂ ቃሊቲ)</option>
                  <option value="Lemi Kura">Lemi Kura (ለሚ ኩራ / CMC)</option>
                  <option value="Outside Addis Ababa">Outside Addis Ababa / Regional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Woreda & Specific Area Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="e.g. Woreda 08, CMC Michael, Sunshine Villa"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={e => handleChange('photoUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Guardian Details */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Parent & Guardian Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.guardianName}
                  onChange={e => handleChange('guardianName', e.target.value)}
                  placeholder="e.g. Bilal Ahmed Nur"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Relationship to Applicant
                </label>
                <select
                  value={formData.guardianRelationship}
                  onChange={e => handleChange('guardianRelationship', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Father">Father (አባት)</option>
                  <option value="Mother">Mother (እናት)</option>
                  <option value="Brother">Brother (ወንድም)</option>
                  <option value="Uncle">Uncle (አጎት)</option>
                  <option value="Legal Guardian">Legal Guardian (አሳዳጊ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guardianPhone}
                  onChange={e => handleChange('guardianPhone', e.target.value)}
                  placeholder="+251 911 234567"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.guardianEmail}
                  onChange={e => handleChange('guardianEmail', e.target.value)}
                  placeholder="bilal.ahmed@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alternative / Emergency Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={e => handleChange('emergencyContact', e.target.value)}
                  placeholder="+251 922 889900"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Qur'an Background & Learning History */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Qur'an Learning Background & Prior Knowledge
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Qur'an Reading Ability <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.quranReadingAbility}
                  onChange={e => handleChange('quranReadingAbility', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Fluent with Tajweed Rules">Fluent Reading with Tajweed (ቁርኣንን አቀላጥፎ በተጅዊድ ያነባል)</option>
                  <option value="Can read with spelling (Hija)">Can read with spelling / Hija (በሂጃእ ይገጣጥማል)</option>
                  <option value="Beginner Arabic Letters">Beginner (ፊደላትን ገና በመለየት ላይ)</option>
                  <option value="Cannot read Arabic yet">Complete Beginner (አረብኛ ፊደላትን አያውቅም)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Memorized Juz Count (0 - 30) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.memorizedJuzCount}
                  onChange={e => handleChange('memorizedJuzCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Surahs or Juz Details
                </label>
                <input
                  type="text"
                  value={formData.memorizedSurahsDetails}
                  onChange={e => handleChange('memorizedSurahsDetails', e.target.value)}
                  placeholder="e.g. Juz 30 (Amma), Juz 29 (Tabarak), Surah Al-Baqarah Ayahs 1-100"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Theoretical Tajweed Knowledge
                </label>
                <select
                  value={formData.tajweedKnowledgeLevel}
                  onChange={e => handleChange('tajweedKnowledgeLevel', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Advanced with Ijazah/Rules">Advanced (Studied Matn Tuhfatul Atfal / Jazariyyah)</option>
                  <option value="Basic Tajweed Rules">Basic Rules (Noon Sakinah, Meem Sakinah, Mudood)</option>
                  <option value="Practical recitation only">Practical recitation only (no theoretical rules)</option>
                  <option value="None/New to Tajweed">None / New to Tajweed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Previous Madrasa / Institution (If any)
                </label>
                <input
                  type="text"
                  value={formData.previousMadrasaName}
                  onChange={e => handleChange('previousMadrasaName', e.target.value)}
                  placeholder="e.g. Bilal Madrasa, Merkato Tahfeez"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Previous Ustaz / Recitation Teacher (Optional)
                </label>
                <input
                  type="text"
                  value={formData.previousUstazName}
                  onChange={e => handleChange('previousUstazName', e.target.value)}
                  placeholder="e.g. Sheikh Abdulqadir Al-Habashi"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Program, Preferred Schedule & Review */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Target Program, Preferred Schedule & Special Notes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Program of Interest <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.targetProgram}
                  onChange={e => handleChange('targetProgram', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Full-Time Qur'an Hifz & Sanad Program">Full-Time Qur'an Hifz & Sanad Program</option>
                  <option value="After-School Qur'an & Islamic Studies">After-School Qur'an & Islamic Studies</option>
                  <option value="Weekend Intensive Hifz & Tajweed">Weekend Intensive Hifz & Tajweed</option>
                  <option value="Ijazah & Qira'at Certification Track">Ijazah & Qira'at Certification Track</option>
                  <option value="Elementary Qa'idah & Arabic Alphabet">Elementary Qa'idah & Arabic Alphabet (Beginners)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Daily Shift <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.preferredShift}
                  onChange={e => handleChange('preferredShift', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Morning Shift (8:00 AM - 12:30 PM)">Morning Shift (8:00 AM - 12:30 PM)</option>
                  <option value="Afternoon Shift (2:00 PM - 5:30 PM)">Afternoon Shift (2:00 PM - 5:30 PM)</option>
                  <option value="Evening / After-Maghrib (6:00 PM - 8:30 PM)">Evening / After-Maghrib (6:00 PM - 8:30 PM)</option>
                  <option value="Weekend Full-Day (Saturday & Sunday)">Weekend Full-Day (Saturday & Sunday)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Assessment Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'In-Person (Campus)', title: 'In-Person (Campus)', desc: 'On-site oral test at CMC Campus' },
                    { id: 'Online (Video / Zoom / Telegram)', title: 'Online Video Session', desc: 'Remote evaluation via Zoom/Telegram' },
                    { id: 'Oral Board', title: 'Oral Panel Board', desc: 'Multi-scholar committee session' },
                  ].map(mode => (
                    <div
                      key={mode.id}
                      onClick={() => handleChange('preferredAssessmentMode', mode.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        formData.preferredAssessmentMode === mode.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs">{mode.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{mode.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Needs, Medical Conditions or Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.hasSpecialNeedsOrMedical}
                  onChange={e => handleChange('hasSpecialNeedsOrMedical', e.target.value)}
                  placeholder="Any allergies, reading difficulties, or guidance for the examining Ustaz..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Summary Review Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">Application Summary Snapshot:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400">
                <div><span className="text-slate-400 block">Applicant:</span> {formData.fullName || 'Not provided'}</div>
                <div><span className="text-slate-400 block">Guardian:</span> {formData.guardianName} ({formData.guardianPhone})</div>
                <div><span className="text-slate-400 block">Memorized:</span> {formData.memorizedJuzCount} Juz ({formData.quranReadingAbility})</div>
              </div>
            </div>
          </div>
        )}

        {/* Step Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Entrance Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
