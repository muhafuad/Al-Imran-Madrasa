import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import type { ExamType, Student } from '../../types';
import { ComprehensiveReportCardModal } from './ComprehensiveReportCardModal';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import { canManageExams, canPrintReportCards } from '../../utils/permissions';
import {
  FileSpreadsheet,
  PlusCircle,
  Printer,
  FileDown,
  Award,
  Search,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Calendar,
  X,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const ExamReportCardModule: React.FC = () => {
  const { exams, addExam, examMarks, students, currentUser, publishExamResults, t, language, dir } = useMadrasa();

  const isExamManager = canManageExams(currentUser?.role);
  const isStudent = currentUser?.role === 'student';
  const isParent = currentUser?.role === 'parent';

  // Find linked student record if logged in as student or parent
  const myStudentRecord = isStudent
    ? students.find(
        (s) =>
          s.id === currentUser?.id ||
          s.guardianEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
          `${s.firstName} ${s.lastName}`.toLowerCase() === currentUser?.name?.toLowerCase()
      ) || students[0]
    : students[0] || ({} as Student);

  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student>(myStudentRecord);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // Published exams tracking (local state toggle with context fallback)
  const [publishedExamIds, setPublishedExamIds] = useState<string[]>(['exam-1', 'exam-2']);

  // New Exam form
  const [examForm, setExamForm] = useState({
    title: '',
    subject: "Qur'an & Tajweed",
    subjectArabic: 'القرآن الكريم والتجويد',
    examType: 'Mid Exam' as ExamType,
    academicYear: '2026/2027',
    term: 'Term II (Spring 2026)',
    className: 'Class 8-A',
    date: '2026-08-25',
    totalMarks: 100,
  });

  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExamManager) {
      alert('Permission Denied: Only teachers and academic administrators can schedule exams.');
      return;
    }
    if (!examForm.title) {
      alert(language === 'ar' ? 'يرجى إدخال عنوان الاختبار.' : language === 'am' ? 'እባክዎን የፈተናውን ርዕስ ያስገቡ።' : 'Please enter an exam title.');
      return;
    }

    addExam({
      title: examForm.title,
      subject: examForm.subject,
      subjectArabic: examForm.subjectArabic,
      examType: examForm.examType,
      academicYear: examForm.academicYear,
      term: examForm.term,
      className: examForm.className,
      date: examForm.date,
      totalMarks: Number(examForm.totalMarks),
    });

    setIsAddExamOpen(false);
    alert(language === 'ar' ? 'تمت جدولة الاختبار بنجاح!' : language === 'am' ? 'ፈተናው በተሳካ ሁኔታ ተመዝግቧል!' : 'Exam scheduled successfully!');
  };

  const handleTogglePublishExam = (examId: string) => {
    if (!isExamManager) return;
    const isCurrentlyPublished = publishedExamIds.includes(examId);
    if (isCurrentlyPublished) {
      setPublishedExamIds(prev => prev.filter(id => id !== examId));
      if (publishExamResults) publishExamResults(examId, false);
    } else {
      setPublishedExamIds(prev => [...prev, examId]);
      if (publishExamResults) publishExamResults(examId, true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Sample report card items for selected student
  const studentMarks = [
    {
      subject: language === 'ar' ? 'القرآن الكريم والتجويد' : language === 'am' ? 'ቅዱስ ቁርኣን (ሂፍዝና ተጅዊድ)' : "Holy Qur'an (Hifz & Tajweed)",
      arabic: 'القرآن الكريم والتجويد',
      max: 100,
      score: 98,
      grade: 'A+',
      remarks: language === 'ar' ? 'تلاوة ممتازة مع إتقان تام للتجويد والمخارج.' : language === 'am' ? 'በጣም ጥሩ የሂፍዝ ደረጃና የተሟላ የተጅዊድ ንባብ።' : 'Mumtaz recitation with flawless Tajweed.'
    },
    {
      subject: language === 'ar' ? 'اللغة العربية (النحو والصرف)' : language === 'am' ? 'የአረብኛ ቋንቋ (ነሕውና ሶርፍ)' : 'Arabic Language (Nahw & Sarf)',
      arabic: 'اللغة العربية (النحو والصرف)',
      max: 100,
      score: 94,
      grade: 'A',
      remarks: language === 'ar' ? 'إتقان جيد للإعراب وتصريف الأفعال.' : language === 'am' ? 'የአረብኛ ሰዋሰውና ቃላትን በሚገባ ተረድቷል።' : 'Mastered sentence parsing & verb patterns.'
    },
    {
      subject: language === 'ar' ? 'الفقه الإسلامي (العبادات)' : language === 'am' ? 'ኢስላማዊ ፊቅህ (የዒባዳ ህግጋት)' : 'Islamic Jurisprudence (Fiqh)',
      arabic: 'الفقه الإسلامي (العبادات)',
      max: 100,
      score: 96,
      grade: 'A+',
      remarks: language === 'ar' ? 'فهم متميز لأحكام الطهارة والصلاة.' : language === 'am' ? 'የሶላትና የጦሃራ ህግጋትን ጠንቅቆ አውቋል።' : 'Excellent understanding of Fiqh rules.'
    },
    {
      subject: language === 'ar' ? 'العقيدة الإسلامية والتوحيد' : language === 'am' ? 'ኢስላማዊ ዐቂዳና ተውሂድ' : 'Islamic Creed (Aqeedah & Tawheed)',
      arabic: 'العقيدة والتوحيد',
      max: 100,
      score: 95,
      grade: 'A',
      remarks: language === 'ar' ? 'أساس متين في أركان الإيمان والتوحيد.' : language === 'am' ? 'የተውሂድና የእምነት መሰረቶችን ጠንቅቋል።' : 'Strong foundation in Tawheed.'
    },
    {
      subject: language === 'ar' ? 'الحديث الشريف (الأربعون النووية)' : language === 'am' ? 'ሐዲስና ሱና (አርበዒን ነወዊያ)' : "Hadith & Sunnah (Arba'in)",
      arabic: 'الحديث الشريف (الأربعون النووية)',
      max: 100,
      score: 97,
      grade: 'A+',
      remarks: language === 'ar' ? 'حفظ متقن مع معرفة الرواة والمعاني.' : language === 'am' ? 'ሐዲሶችን በቃል በመያዝ ማብራሪያቸውን ተረድቷል።' : 'Memorized 25 Hadiths with chain.'
    },
    {
      subject: language === 'ar' ? 'السيرة النبوية والتاريخ الإسلامي' : language === 'am' ? 'የነቢዩ ﷺ ታሪክ (ሲራህ)' : 'Prophetic Biography (Seerah)',
      arabic: 'السيرة النبوية والتاريخ',
      max: 100,
      score: 92,
      grade: 'A',
      remarks: language === 'ar' ? 'إحاطة طيبة بأحداث السيرة الشريفة.' : language === 'am' ? 'የነቢዩን ﷺ የህይወት ታሪክ በሚገባ ተረድቷል።' : 'Good grasp of Islamic chronology.'
    },
    {
      subject: language === 'ar' ? 'الآداب والأخلاق الإسلامية' : language === 'am' ? 'ኢስላማዊ ሥነ-ምግባርና አደብ' : 'Islamic Manners & Akhlaq',
      arabic: 'الآداب والأخلاق الإسلامية',
      max: 100,
      score: 99,
      grade: 'A+',
      remarks: language === 'ar' ? 'خلق رفيع وتواضع ومواظبة مشرفة.' : language === 'am' ? 'ምርጥ ሥነ-ምግባር ያለውና ታዛዥ ተማሪ ነው።' : 'Exemplary conduct and humility.'
    },
  ];

  const totalScore = studentMarks.reduce((acc, m) => acc + m.score, 0);
  const averagePercentage = Math.round(totalScore / studentMarks.length);

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Examinations & Student Transcripts Database"
        arabicPageName="الاختبارات والشهادات والنتائج"
        recordCount={exams.length}
        recordLabel="Exam Schedules"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{t.examinationsTitle}</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {exams.length} {t.active}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.examinationsSubtitle}
          </p>
        </div>

        {isExamManager && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddExamOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.scheduleNewExam}</span>
            </button>
          </div>
        )}
      </div>

      {/* Scheduled Exams Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.upcomingExamsSchedule}</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{t.academicTerm}: Term II (2026)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">{t.examTitle}</th>
                <th className="px-4 py-3">{t.subject}</th>
                <th className="px-4 py-3">{t.className}</th>
                <th className="px-4 py-3">{t.examType}</th>
                <th className="px-4 py-3">{t.date}</th>
                <th className="px-4 py-3">{t.totalMarks}</th>
                <th className="px-4 py-3 text-right">{t.resultPublishing}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {exams.map((exam) => {
                const isPub = publishedExamIds.includes(exam.id);
                return (
                  <tr key={exam.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{exam.title}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{exam.subject}</span>
                      <span className="text-[11px] font-arabic text-emerald-800 dark:text-emerald-400">{exam.subjectArabic}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{exam.className}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {exam.examType}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{exam.date}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">{exam.totalMarks} pts</td>
                    <td className="px-4 py-3 text-right">
                      {isExamManager ? (
                        <button
                          onClick={() => handleTogglePublishExam(exam.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer ${
                            isPub
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-teal-50'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{isPub ? t.published : t.postPublish}</span>
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs ${
                            isPub
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isPub ? t.published : 'Scheduled'}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Exam Modal */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{t.scheduleNewExam}</h3>
              <button
                onClick={() => setIsAddExamOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExamSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.examTitle} *</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: اختبار منتصف الفصل للقرآن' : language === 'am' ? 'ምሳሌ፡ የቁርኣን አጋማሽ ፈተና' : 'e.g. Midterm Quran & Tajweed Exam'}
                  value={examForm.title}
                  onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.subject} (EN/AM)</label>
                  <input
                    type="text"
                    value={examForm.subject}
                    onChange={e => setExamForm({ ...examForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.arabicName}</label>
                  <input
                    type="text"
                    value={examForm.subjectArabic}
                    onChange={e => setExamForm({ ...examForm, subjectArabic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.examType}</label>
                  <select
                    value={examForm.examType}
                    onChange={e => setExamForm({ ...examForm, examType: e.target.value as ExamType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Mid Exam">{t.midExam}</option>
                    <option value="Final Exam">{t.finalExam}</option>
                    <option value="Monthly Assessment">{t.monthlyQuiz}</option>
                    <option value="Oral Hifz Test">{t.oralHifzTest}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.className}</label>
                  <input
                    type="text"
                    value={examForm.className}
                    onChange={e => setExamForm({ ...examForm, className: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.date}</label>
                  <input
                    type="date"
                    value={examForm.date}
                    onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t.totalMarks}</label>
                  <input
                    type="number"
                    value={examForm.totalMarks}
                    onChange={e => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Generator CTA Section */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">{t.officialCertificationEngine}</span>
          </div>
          <h3 className="text-lg font-bold">
            {t.officialReportCard}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            {t.reportCardEngineDesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStudentForReport?.id}
            onChange={(e) => {
              const st = students.find(s => s.id === e.target.value);
              if (st) setSelectedStudentForReport(st);
            }}
            className="px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-400"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.firstName} {st.lastName} ({st.admissionNumber})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.viewPrintReportCard}</span>
          </button>
        </div>
      </div>

      {/* Official Automated Comprehensive Report Card Modal */}
      {isReportModalOpen && selectedStudentForReport && (
        <ComprehensiveReportCardModal
          student={selectedStudentForReport}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
};
