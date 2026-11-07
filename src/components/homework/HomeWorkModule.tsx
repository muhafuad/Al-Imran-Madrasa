import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mic,
  FileText,
  Award,
  User,
  Trash2,
  Edit,
  X,
  ChevronRight,
  Check,
  MessageSquare,
  Send,
  Eye,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { HomeworkAssignment, HomeworkSubmission } from '../../types';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import { canManageHomework } from '../../utils/permissions';
import { AudioRecitationRecorder } from '../common/AudioRecitationRecorder';
import { AudioRecitationPlayer } from '../common/AudioRecitationPlayer';

export const HomeworkModule: React.FC = () => {
  const {
    homeworkList,
    addHomework,
    updateHomework,
    deleteHomework,
    submitHomeworkResponse,
    gradeHomeworkSubmission,
    currentUser,
    students,
    teachers,
    language,
    t,
  } = useMadrasa();

  const isRtl = language === 'ar';
  const isTeacherOrAdmin = canManageHomework(currentUser?.role);
  const isStudent = currentUser?.role === 'student';
  const isParent = currentUser?.role === 'parent';

  // Filters & State
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkAssignment | null>(null);
  const [activeReviewHw, setActiveReviewHw] = useState<HomeworkAssignment | null>(null);
  const [submittingHw, setSubmittingHw] = useState<HomeworkAssignment | null>(null);

  // Form State for Create / Edit Assignment
  const [formData, setFormData] = useState({
    title: '',
    arabicTitle: '',
    subject: 'Qur\'an Hifz',
    className: 'Class 8-A',
    teacherName: currentUser?.name || 'Sheikh Bilal Ibrahim',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    instructions: '',
    surahTarget: '',
    ayahRange: '',
    totalPoints: 20,
  });

  // Student Submission Form State
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Grading Form State
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(20);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'reviewed' | 'needs_revision'>('reviewed');

  // Subjects List
  const subjects = [
    'Qur\'an Hifz',
    'Tajweed',
    'Arabic (Nahw)',
    'Arabic (Sarf)',
    'Fiqh',
    'Aqeedah',
    'Hadith',
    'Seerah',
    'Akhlaq & Adab',
  ];

  const classes = [
    'Class 8-A',
    'Class 8-B',
    'Class 7-A',
    'Class 7-B',
    'Hifz Halqah 1',
    'Hifz Halqah 2',
    'Class 6-A',
  ];

  // Filtered Homework List
  const filteredHomework = homeworkList.filter((hw) => {
    const matchesSubject = selectedSubject === 'all' || hw.subject === selectedSubject;
    const matchesClass = selectedClass === 'all' || hw.className === selectedClass;
    const matchesSearch =
      hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hw.arabicTitle && hw.arabicTitle.includes(searchTerm)) ||
      (hw.description && hw.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hw.surahTarget && hw.surahTarget.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSubject && matchesClass && matchesSearch;
  });

  // Summary Metrics
  const totalTasks = homeworkList.length;
  const totalSubmissions = homeworkList.reduce((acc, h) => acc + (h.submissions?.length || 0), 0);
  const totalPendingReview = homeworkList.reduce(
    (acc, h) => acc + (h.submissions?.filter((s) => s.status === 'submitted').length || 0),
    0
  );
  const hifzTasksCount = homeworkList.filter(
    (h) => h.subject.includes('Qur\'an') || h.subject.includes('Tajweed')
  ).length;

  const handleOpenCreate = () => {
    if (!isTeacherOrAdmin) return;
    setFormData({
      title: '',
      arabicTitle: '',
      subject: 'Qur\'an Hifz',
      className: 'Class 8-A',
      teacherName: currentUser?.name || 'Sheikh Bilal Ibrahim',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      instructions: '',
      surahTarget: '',
      ayahRange: '',
      totalPoints: 20,
    });
    setEditingHomework(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (hw: HomeworkAssignment) => {
    if (!isTeacherOrAdmin) return;
    setFormData({
      title: hw.title,
      arabicTitle: hw.arabicTitle || '',
      subject: hw.subject,
      className: hw.className,
      teacherName: hw.teacherName || '',
      dueDate: hw.dueDate,
      description: hw.description || '',
      instructions: hw.instructions || '',
      surahTarget: hw.surahTarget || '',
      ayahRange: hw.ayahRange || '',
      totalPoints: hw.totalPoints || 20,
    });
    setEditingHomework(hw);
    setShowCreateModal(true);
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacherOrAdmin) return;
    if (!formData.title.trim()) return;

    if (editingHomework) {
      updateHomework(editingHomework.id, {
        title: formData.title,
        arabicTitle: formData.arabicTitle,
        subject: formData.subject,
        className: formData.className,
        dueDate: formData.dueDate,
        description: formData.description,
        instructions: formData.instructions,
        surahTarget: formData.surahTarget,
        ayahRange: formData.ayahRange,
        totalPoints: Number(formData.totalPoints),
      });
    } else {
      addHomework({
        title: formData.title,
        arabicTitle: formData.arabicTitle,
        subject: formData.subject,
        className: formData.className,
        teacherId: currentUser?.id,
        teacherName: formData.teacherName,
        dueDate: formData.dueDate,
        description: formData.description,
        instructions: formData.instructions,
        surahTarget: formData.surahTarget,
        ayahRange: formData.ayahRange,
        totalPoints: Number(formData.totalPoints),
        totalStudents: 28,
      });
    }
    setShowCreateModal(false);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw || isSubmitting) return;

    setIsSubmitting(true);
    const studentId = currentUser?.id || 'std-101';
    const studentName = currentUser?.name || 'Abdurahman Mohammed';

    try {
      await submitHomeworkResponse(submittingHw.id, {
        studentId,
        studentName,
        notes: submissionNotes,
        audioRecitationRecorded: Boolean(recordedAudioBlob),
        audioBlob: recordedAudioBlob || undefined,
      });

      setSubmittingHw(null);
      setSubmissionNotes('');
      setRecordedAudioBlob(null);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGrade = (hwId: string, subId: string) => {
    gradeHomeworkSubmission(hwId, subId, Number(gradeScore), gradeFeedback, gradeStatus);
    setGradingSubId(null);
    setGradeFeedback('');
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Homework Assignments & Recitation Submissions Database"
        arabicPageName="الواجبات والتكليفات المنزلية"
        recordCount={homeworkList.length}
        recordLabel="Active Assignments"
      />

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'am' ? 'የቤት ስራና የትምህርት ምዘና' : language === 'ar' ? 'الواجبات والتكاليف المدرسية' : 'Homework & Assignments'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic">
                {language === 'ar'
                  ? 'متابعة التكاليف القرآنية، الواجبات الشرعية، وتصحيح التلاوات للطلاب'
                  : 'Track Qur\'an memorization tasks, Islamic studies assignments, and evaluate student submissions.'}
              </p>
            </div>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            id="btn-create-homework"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {language === 'am' ? 'አዲስ የቤት ስራ መዝግብ' : language === 'ar' ? 'إضافة واجب جديد' : 'Assign New Homework'}
            </span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language === 'am' ? 'ጠቅላላ የቤት ስራዎች' : language === 'ar' ? 'إجمالي الواجبات' : 'Total Active Tasks'}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalTasks}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language === 'am' ? 'የቁርኣንና ተጅዊድ ስራዎች' : language === 'ar' ? 'واجبات القرآن والتجويد' : 'Qur\'an & Tajweed Tasks'}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{hifzTasksCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language === 'am' ? 'ምላሽ የተሰጣቸው' : language === 'ar' ? 'إجمالي التسليمات' : 'Turned-In Submissions'}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {language === 'am' ? 'እርማት የሚጠብቁ' : language === 'ar' ? 'في انتظار التصحيح' : 'Pending Grading'}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalPendingReview}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="search-homework"
            type="text"
            placeholder={
              language === 'am'
                ? 'የቤት ስራ ወይም ምዕራፍ ፈልግ...'
                : language === 'ar'
                ? 'بحث في الواجبات أو السور...'
                : 'Search assignments, surah target, or instructions...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-subject-filter"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع المواد' : 'All Subjects'}</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <select
              id="select-class-filter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع الفصول' : 'All Classes'}</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Homework Cards Grid */}
      {filteredHomework.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'am' ? 'ምንም የቤት ስራ አልተገኘም' : language === 'ar' ? 'لا توجد واجبات مطابقة' : 'No Homework Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {language === 'ar'
              ? 'جرّب تغيير خيارات التصفية أو قم بإضافة واجب جديد للطلاب.'
              : 'Try changing your search filters or click "Assign New Homework" to post a task.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHomework.map((hw) => {
            const hasSubmissions = hw.submissions && hw.submissions.length > 0;
            const mySubmission = hw.submissions?.find(
              (s) => s.studentId === (currentUser?.id || 'std-101')
            );
            const isDueSoon = new Date(hw.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={hw.id}
                id={`homework-card-${hw.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {hw.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {hw.className}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          isDueSoon
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Due: {hw.dueDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {hw.title}
                    </h3>
                    {hw.arabicTitle && (
                      <p className="text-xs font-arabic text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {hw.arabicTitle}
                      </p>
                    )}
                    {hw.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                        {hw.description}
                      </p>
                    )}
                  </div>

                  {/* Quran Target or Ayah Range if present */}
                  {(hw.surahTarget || hw.ayahRange) && (
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{hw.surahTarget || 'Assigned Recitation'}</span>
                      </div>
                      {hw.ayahRange && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Ayahs: {hw.ayahRange}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{hw.teacherName || 'Madrasa Faculty'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{hw.totalPoints || 20} pts</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    {/* Status badge for students */}
                    {(isStudent || isParent) && (
                      <div>
                        {mySubmission ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              mySubmission.status === 'reviewed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {mySubmission.status === 'reviewed'
                                ? `Score: ${mySubmission.score}/${mySubmission.maxScore}`
                                : 'Submitted'}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Student Submit Button */}
                    {(isStudent || isParent) && (
                      <button
                        id={`btn-submit-${hw.id}`}
                        onClick={() => {
                          setSubmittingHw(hw);
                          setSubmissionNotes(mySubmission?.notes || '');
                          setRecordedAudioBlob(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{mySubmission ? 'Update Response' : 'Turn In Task'}</span>
                      </button>
                    )}

                    {/* Teacher / Admin Review Submissions Button */}
                    {isTeacherOrAdmin && (
                      <>
                        <button
                          id={`btn-review-${hw.id}`}
                          onClick={() => setActiveReviewHw(hw)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            Submissions ({hw.submissions?.length || 0})
                          </span>
                        </button>

                        <button
                          id={`btn-edit-${hw.id}`}
                          onClick={() => handleOpenEdit(hw)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Edit Assignment"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-delete-${hw.id}`}
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this homework assignment?')) {
                              deleteHomework(hw.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">
                  {editingHomework ? 'Edit Homework Assignment' : 'Assign New Homework Task'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHomework} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  id="input-hw-title"
                  type="text"
                  required
                  placeholder="e.g. Memorize Surah Al-Kahf Ayahs 1-10"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 font-arabic">
                  Arabic Title (العنوان بالعربية)
                </label>
                <input
                  id="input-hw-arabic-title"
                  type="text"
                  placeholder="مثال: حفظ سورة الكهف الآيات ١-١٠ مع الترتيل"
                  value={formData.arabicTitle}
                  onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-arabic focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    id="input-hw-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Class *
                  </label>
                  <select
                    id="input-hw-class"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {classes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Surah / Topic Target
                  </label>
                  <input
                    id="input-hw-surah"
                    type="text"
                    placeholder="e.g. Surah Al-Baqarah"
                    value={formData.surahTarget}
                    onChange={(e) => setFormData({ ...formData, surahTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ayah Range / Chapter
                  </label>
                  <input
                    id="input-hw-ayah"
                    type="text"
                    placeholder="e.g. 1 - 25"
                    value={formData.ayahRange}
                    onChange={(e) => setFormData({ ...formData, ayahRange: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    id="input-hw-due"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Points *
                  </label>
                  <input
                    id="input-hw-points"
                    type="number"
                    min="5"
                    max="100"
                    value={formData.totalPoints}
                    onChange={(e) => setFormData({ ...formData, totalPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Instructions & Guidelines
                </label>
                <textarea
                  id="input-hw-instructions"
                  rows={3}
                  placeholder="Provide detailed instructions for the student..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-homework"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {editingHomework ? 'Save Changes' : 'Post Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT SUBMISSION MODAL */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Turn In Homework</h3>
                  <p className="text-xs text-slate-500">{submittingHw.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSubmittingHw(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subject: {submittingHw.subject}</span>
                  <span>Max Points: {submittingHw.totalPoints || 20}</span>
                </div>
                {submittingHw.surahTarget && (
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Target: {submittingHw.surahTarget} ({submittingHw.ayahRange || 'Assigned Verses'})
                  </p>
                )}
              </div>

              {/* Real Audio Recitation Recorder with IndexedDB storage */}
              <AudioRecitationRecorder
                onAudioReady={(blob) => setRecordedAudioBlob(blob)}
                isRtl={isRtl}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Completion Notes / Written Submission
                </label>
                <textarea
                  id="input-student-notes"
                  rows={4}
                  required
                  placeholder="Explain completed portions, Ayahs memorized, or written workbook answers..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingHw(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-turn-in"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm & Submit Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER SUBMISSIONS & GRADING DRAWER */}
      {activeReviewHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {activeReviewHw.className}
                  </span>
                  <h3 className="text-base font-bold">{activeReviewHw.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submissions Review & Grading Console (Max Points: {activeReviewHw.totalPoints || 20})
                </p>
              </div>
              <button
                onClick={() => setActiveReviewHw(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submissions List */}
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {!activeReviewHw.submissions || activeReviewHw.submissions.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <p className="text-xs text-slate-500">No students have submitted this assignment yet.</p>
                </div>
              ) : (
                activeReviewHw.submissions.map((sub) => {
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{sub.studentName}</span>
                            {sub.audioRecitationRecorded && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Audio Recitation Attached
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Turned in: {sub.submittedAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                              sub.status === 'reviewed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : sub.status === 'needs_revision'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {sub.status === 'reviewed'
                              ? `Score: ${sub.score}/${sub.maxScore}`
                              : sub.status === 'needs_revision'
                              ? 'Needs Revision'
                              : 'Pending Review'}
                          </span>
                        </div>
                      </div>

                      {/* Audio Recitation Player */}
                      {(sub.audioBlobKey || sub.audioUrl || sub.audioRecitationRecorded) && (
                        <AudioRecitationPlayer
                          blobKey={sub.audioBlobKey}
                          audioUrl={sub.audioUrl}
                          studentName={sub.studentName}
                        />
                      )}

                      {/* Notes / Recitation details */}
                      {sub.notes && (
                        <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <p className="font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                            Student Response Notes:
                          </p>
                          {sub.notes}
                        </div>
                      )}

                      {/* Existing Feedback */}
                      {sub.feedback && !isGradingThis && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300">
                          <span className="font-bold">Ustaz Feedback: </span>
                          <span>{sub.feedback}</span>
                        </div>
                      )}

                      {/* Grading Form Toggle */}
                      {isGradingThis ? (
                        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-3 mt-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            Grade Submission for {sub.studentName}
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Award Score (out of {sub.maxScore})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={sub.maxScore}
                                value={gradeScore}
                                onChange={(e) => setGradeScore(Number(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Status
                              </label>
                              <select
                                value={gradeStatus}
                                onChange={(e) => setGradeStatus(e.target.value as any)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                              >
                                <option value="reviewed">Approved / Reviewed</option>
                                <option value="needs_revision">Needs Revision</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Teacher Feedback & Remarks
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Excellent Tajweed and articulation. Mumtaz!"
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setGradingSubId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveGrade(activeReviewHw.id, sub.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                            >
                              Save Grade
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setGradingSubId(sub.id);
                            setGradeScore(sub.score !== undefined ? sub.score : sub.maxScore);
                            setGradeFeedback(sub.feedback || '');
                            setGradeStatus(sub.status === 'needs_revision' ? 'needs_revision' : 'reviewed');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{sub.status === 'reviewed' ? 'Edit Grade' : 'Grade / Evaluate'}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
