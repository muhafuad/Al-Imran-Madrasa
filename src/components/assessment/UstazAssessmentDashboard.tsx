import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { EntranceApplication, AssessmentResult } from '../../types';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Search,
  FileCheck,
  Eye,
  Sliders,
  Volume2,
  CheckSquare,
} from 'lucide-react';
import { AssessmentCardModal } from './AssessmentCardModal';

export const UstazAssessmentDashboard: React.FC = () => {
  const {
    entranceApplications,
    currentUser,
    submitAssessmentResult,
  } = useMadrasa();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'my_queue' | 'all'>('my_queue');
  const [selectedApplication, setSelectedApplication] = useState<EntranceApplication | null>(null);
  const [viewingRecordModal, setViewingRecordModal] = useState<EntranceApplication | null>(null);

  // Form state for active scoring session
  const [scores, setScores] = useState({
    readingFluencyScore: 85,
    tajweedMakharijScore: 80,
    memorizationScore: 75,
    verifiedMemorizedJuz: 2,
    testedSurahs: 'Surah Al-Mulk (Ayah 1-15), Surah An-Naba, Surah Al-Fatihah',
    strengths: 'Clear articulation of throat letters (Halqiyyah), strong desire to memorize, attentive listening.',
    weaknesses: 'Needs guidance on Rules of Noon Sakinah (Ikhfa/Idgham) and continuous breathing during long ayahs.',
    recommendedLevel: "Ibtida'i 1 (Primary)",
    recommendedClass: 'Class 1-A (Boys)',
    recommendedHifzCircle: 'Halqah Ustaz Bilal Al-Habashi',
    decision: 'Accept & Enroll' as 'Accept & Enroll' | 'Conditional Acceptance with Prep Class' | 'Recommend Preliminary Arabic Alphabet Course' | 'Direct Ijazah Track',
    recommendationNotes: 'Recommended for immediate placement in Morning Tahfeez circle with targeted Tajweed consolidation.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine Ustaz ID
  const currentUstazName = currentUser?.name || 'Ustaz Bilal Al-Habashi';
  const currentUstazId = currentUser?.id || 'tch-1';

  // Filter applications scheduled or pending for evaluation
  const queueApplications = entranceApplications.filter(app => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.guardianPhone.includes(searchQuery);

    const isAssignedToMe = app.assignedUstazId === currentUstazId || app.assignedUstazName?.toLowerCase().includes(currentUstazName.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'my_queue') {
      return isAssignedToMe || app.status === 'scheduled';
    }
    return true;
  });

  const handleStartEvaluation = (app: EntranceApplication) => {
    setSelectedApplication(app);
    // Pre-populate with applicant's self-reported info if available
    setScores({
      readingFluencyScore: 85,
      tajweedMakharijScore: 80,
      memorizationScore: 85,
      verifiedMemorizedJuz: app.memorizedJuzCount || 1,
      testedSurahs: app.memorizedSurahsDetails || 'Surah Al-Fatihah, Surah Al-Mulk, Surah An-Naba',
      strengths: 'Good tone, clear recitation rhythm, receptive to corrective feedback.',
      weaknesses: 'Minor elongation on non-madd letters; requires consolidation of older Juz.',
      recommendedLevel: app.memorizedJuzCount > 5 ? "Sanad Hifz Intensive" : app.memorizedJuzCount > 2 ? "Mutawassit 1" : "Ibtida'i 1 (Primary)",
      recommendedClass: app.gender === 'female' ? 'Class 4-B (Girls)' : 'Class 1-A (Boys)',
      recommendedHifzCircle: 'Halqah Ustaz Bilal Al-Habashi',
      decision: 'Accept & Enroll',
      recommendationNotes: 'Candidate demonstrates high aptitude for memorization and fits well in our core Hifz circle.',
    });
  };

  const calculateOverallScore = () => {
    return Math.round(
      scores.readingFluencyScore * 0.35 +
      scores.tajweedMakharijScore * 0.35 +
      scores.memorizationScore * 0.3
    );
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    setIsSubmitting(true);
    const overall = calculateOverallScore();

    const evaluationResult: AssessmentResult = {
      assessedByUstazId: currentUstazId,
      assessedByUstazName: currentUstazName,
      assessedAt: new Date().toISOString(),
      readingFluencyScore: Number(scores.readingFluencyScore),
      tajweedMakharijScore: Number(scores.tajweedMakharijScore),
      memorizationScore: Number(scores.memorizationScore),
      overallScore: overall,
      verifiedMemorizedJuz: Number(scores.verifiedMemorizedJuz),
      testedSurahs: scores.testedSurahs,
      strengths: scores.strengths,
      weaknesses: scores.weaknesses,
      recommendedLevel: scores.recommendedLevel,
      recommendedClass: scores.recommendedClass,
      recommendedHifzCircle: scores.recommendedHifzCircle,
      decision: scores.decision,
      recommendationNotes: scores.recommendationNotes,
    };

    setTimeout(() => {
      submitAssessmentResult(selectedApplication.id, evaluationResult);
      setIsSubmitting(false);
      setSelectedApplication(null);
    }, 500);
  };

  const addStrengthTag = (tag: string) => {
    if (!scores.strengths.includes(tag)) {
      setScores(prev => ({
        ...prev,
        strengths: prev.strengths ? `${prev.strengths}, ${tag}` : tag,
      }));
    }
  };

  const addWeaknessTag = (tag: string) => {
    if (!scores.weaknesses.includes(tag)) {
      setScores(prev => ({
        ...prev,
        weaknesses: prev.weaknesses ? `${prev.weaknesses}, ${tag}` : tag,
      }));
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white border border-teal-800/40 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Ustaz Oral Diagnostic Evaluation Terminal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Examiner & Placement Assessment Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-teal-200/80 max-w-2xl">
              Conduct oral placement testing for prospective applicants. Record Qur'an reading fluency, Tajweed rules, memorization retention, and issue placement recommendations for the administration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm text-center">
              <span className="text-[10px] text-teal-200 block uppercase tracking-wider">Assigned Examiner</span>
              <span className="text-sm font-bold text-white">{currentUstazName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Application List on Left / Active Assessment Sheet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Applicant Queue (5 Cols on large) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            
            {/* Search & Tabs */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Assessment Queue
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                {queueApplications.length} Candidates
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name or #"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setFilterMode('my_queue')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  filterMode === 'my_queue'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Scheduled for Me
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  filterMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Applications
              </button>
            </div>

            {/* List of Applications */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {queueApplications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-medium">No candidates in this queue.</p>
                </div>
              ) : (
                queueApplications.map(app => {
                  const isSelected = selectedApplication?.id === app.id;
                  const hasResult = !!app.assessmentResult;

                  return (
                    <div
                      key={app.id}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {app.fullName}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {app.applicationNumber}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>Claimed: {app.memorizedJuzCount} Juz</span>
                            <span>•</span>
                            <span>{app.quranReadingAbility}</span>
                          </div>

                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            {app.targetProgram}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {app.status === 'assessed' ? (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold rounded-full">
                              Score: {app.assessmentResult?.overallScore}%
                            </span>
                          ) : app.status === 'scheduled' ? (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold rounded-full">
                              Scheduled
                            </span>
                          ) : app.status === 'enrolled' ? (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold rounded-full">
                              Enrolled
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold rounded-full">
                              Pending
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400">
                            {app.assessmentDate || 'No date set'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setViewingRecordModal(app);
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEvaluation(app)}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{hasResult ? 'Re-Evaluate' : 'Record Assessment'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Oral Evaluation Sheet (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedApplication ? (
            <form
              onSubmit={handleSaveAssessment}
              className="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-md space-y-6 animate-in fade-in"
            >
              {/* Active Evaluation Candidate Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20 -mx-5 -mt-5 p-5 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {selectedApplication.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {selectedApplication.fullName}
                      </h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {selectedApplication.applicationNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Self-Reported: {selectedApplication.memorizedJuzCount} Juz memorized • {selectedApplication.quranReadingAbility}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Computed Diagnostic Score:</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {calculateOverallScore()}%
                  </span>
                </div>
              </div>

              {/* SECTION 1: Quantitative Recitation Scores */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  1. Oral Recitation & Phonetics Grading
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Reading Fluency Slider */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Reading Fluency</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {scores.readingFluencyScore}/100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={scores.readingFluencyScore}
                      onChange={e => setScores(prev => ({ ...prev, readingFluencyScore: Number(e.target.value) }))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Beginner</span>
                      <span>Fluent</span>
                    </div>
                  </div>

                  {/* Tajweed & Makharij Slider */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Tajweed & Makharij</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {scores.tajweedMakharijScore}/100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={scores.tajweedMakharijScore}
                      onChange={e => setScores(prev => ({ ...prev, tajweedMakharijScore: Number(e.target.value) }))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Basic</span>
                      <span>Mastery</span>
                    </div>
                  </div>

                  {/* Memorization Retention Slider */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Retention & Sabqi</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {scores.memorizationScore}/100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={scores.memorizationScore}
                      onChange={e => setScores(prev => ({ ...prev, memorizationScore: Number(e.target.value) }))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Weak</span>
                      <span>Mutqin (Solid)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ustaz-Verified Memorized Juz Count (0-30)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scores.verifiedMemorizedJuz}
                      onChange={e => setScores(prev => ({ ...prev, verifiedMemorizedJuz: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tested Test Passages / Surahs
                    </label>
                    <input
                      type="text"
                      value={scores.testedSurahs}
                      onChange={e => setScores(prev => ({ ...prev, testedSurahs: e.target.value }))}
                      placeholder="e.g. Surah Al-Mulk, Surah Ya-Sin, Juz Amma"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Qualitative Strengths & Weaknesses */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  2. Diagnostic Observations & Feedback
                </h4>

                {/* Strengths with Quick Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Observed Strengths & Aptitude:
                    </label>
                    <span className="text-[10px] text-slate-400">Click chips to add</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Clear Makharij',
                      'Melodious Voice (Husn al-Sawt)',
                      'Quick Retention',
                      'Attentive & Disciplined',
                      'Confident Recitation',
                      'Solid Waqf & Ibtida',
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addStrengthTag(tag)}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={scores.strengths}
                    onChange={e => setScores(prev => ({ ...prev, strengths: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                {/* Weaknesses / Focus Areas with Quick Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Areas for Improvement & Remediation:
                    </label>
                    <span className="text-[10px] text-slate-400">Click chips to add</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Needs Ikhfa & Idgham Consolidation',
                      'Heavy/Light Letters (Tafkheem/Tarqeeq)',
                      'Old Juz Murajaah Required',
                      'Breathing & Madd Rules',
                      'Speed Control (Tarteel)',
                    ].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addWeaknessTag(tag)}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={scores.weaknesses}
                    onChange={e => setScores(prev => ({ ...prev, weaknesses: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Class & Level Recommendations */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  3. Ustaz Placement Decision & Class Assignment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Overall Admission Recommendation
                    </label>
                    <select
                      value={scores.decision}
                      onChange={e => setScores(prev => ({ ...prev, decision: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Accept & Enroll">Accept & Directly Enroll (ተቀባይነት አግኝቷል)</option>
                      <option value="Conditional Acceptance with Prep Class">Conditional Acceptance with Prep Class (በቅድመ ዝግጅት ክፍል)</option>
                      <option value="Recommend Preliminary Arabic Alphabet Course">Recommend Preliminary Arabic Alphabet Course (የፊደል ማሻሻያ)</option>
                      <option value="Direct Ijazah Track">Direct Ijazah & Advanced Sanad Track (የኢጃዛህ ደረጃ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recommended Academic Level
                    </label>
                    <select
                      value={scores.recommendedLevel}
                      onChange={e => setScores(prev => ({ ...prev, recommendedLevel: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recommended Classroom
                    </label>
                    <select
                      value={scores.recommendedClass}
                      onChange={e => setScores(prev => ({ ...prev, recommendedClass: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recommended Hifz Circle (Halqah)
                    </label>
                    <input
                      type="text"
                      value={scores.recommendedHifzCircle}
                      onChange={e => setScores(prev => ({ ...prev, recommendedHifzCircle: e.target.value }))}
                      placeholder="e.g. Halqah Ustaz Bilal Al-Habashi"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Examiner Evaluation Notes & Advice for Administration
                    </label>
                    <textarea
                      rows={2}
                      value={scores.recommendationNotes}
                      onChange={e => setScores(prev => ({ ...prev, recommendationNotes: e.target.value }))}
                      placeholder="Any specific instructions for the assigned teacher or parent counseling..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Evaluation...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Official Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Select a Candidate to Begin Evaluation
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click <strong className="text-emerald-600 font-semibold">"Record Assessment"</strong> on any candidate in the left queue to open their live oral recitation scoring sheet.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Viewing Record Modal */}
      {viewingRecordModal && (
        <AssessmentCardModal
          application={viewingRecordModal}
          onClose={() => setViewingRecordModal(null)}
        />
      )}

    </div>
  );
};
