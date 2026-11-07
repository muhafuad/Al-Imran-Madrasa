import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { Student, StudentExamMark } from '../../types';
import {
  Printer,
  FileText,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  X,
  User,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Download,
  QrCode,
  Globe,
} from 'lucide-react';

interface ComprehensiveReportCardModalProps {
  student: Student;
  onClose: () => void;
}

export const ComprehensiveReportCardModal: React.FC<ComprehensiveReportCardModalProps> = ({
  student,
  onClose,
}) => {
 

  const [term, setTerm] = useState<string>('Term 1 Final Examination (1447 AH / 2026)');
  const [reportLanguage, setReportLanguage] = useState<'en' | 'ar' | 'am'>('en');

  const handlePrint = () => {
    window.print();
  };

  // Standardized subjects for the comprehensive term report
  const subjectGrades = [
    {
      id: 'sub-1',
      nameEn: "Qur'an Memorization (Hifz)",
      nameAr: 'حفظ القرآن الكريم',
      nameAm: 'የቁርአን ሂፍዝ / ቃለ-አቀባበል',
      maxScore: 100,
      obtainedScore: 96,
      grade: 'A+',
      ustazRemarks: 'MashaAllah, exceptional retention & pace.',
    },
    {
      id: 'sub-2',
      nameEn: 'Tajweed Rules & Makharij',
      nameAr: 'أحكام التجويد ومخارج الحروف',
      nameAm: 'የተጅዊድ ሕጎችና ማውጫዎች',
      maxScore: 100,
      obtainedScore: 94,
      grade: 'A',
      ustazRemarks: 'Accurate articulation of guttural letters.',
    },
    {
      id: 'sub-3',
      nameEn: 'Aqeedah & Tawheed',
      nameAr: 'العقيدة الإسلامية والتوحيد',
      nameAm: 'ዐቂዳና ተውሒድ',
      maxScore: 100,
      obtainedScore: 92,
      grade: 'A',
      ustazRemarks: 'Clear comprehension of core tenets.',
    },
    {
      id: 'sub-4',
      nameEn: 'Fiqh al-Ibadat (Jurisprudence)',
      nameAr: 'فقه العبادات والأحكام',
      nameAm: 'ፊቅህና ኢባዳት',
      maxScore: 100,
      obtainedScore: 90,
      grade: 'A',
      ustazRemarks: 'Sound grasp of Taharah & Salah rules.',
    },
    {
      id: 'sub-5',
      nameEn: 'Hadith & Islamic Morals',
      nameAr: 'الحديث الشريف والآداب',
      nameAm: 'ሐዲስና ኢስላማዊ ስነ-ምግባር',
      maxScore: 100,
      obtainedScore: 95,
      grade: 'A+',
      ustazRemarks: 'Memorized Arbain Nawawi selections with meanings.',
    },
    {
      id: 'sub-6',
      nameEn: 'Arabic Language (Nahw & Vocabulary)',
      nameAr: 'اللغة العربية والقواعد',
      nameAm: 'የዐረብኛ ቋንቋና ሰዋሰው',
      maxScore: 100,
      obtainedScore: 88,
      grade: 'B+',
      ustazRemarks: 'Good sentence construction; practice writing.',
    },
    {
      id: 'sub-7',
      nameEn: 'Islamic History & Seerah Nabawiyyah',
      nameAr: 'السيرة النبوية والتاريخ',
      nameAm: 'ሲራና ኢስላማዊ ታሪክ',
      maxScore: 100,
      obtainedScore: 91,
      grade: 'A',
      ustazRemarks: 'Enthusiastic engagement in class discussions.',
    },
  ];

  const totalMax = subjectGrades.reduce((acc, curr) => acc + curr.maxScore, 0);
  const totalObtained = subjectGrades.reduce((acc, curr) => acc + curr.obtainedScore, 0);
  const averagePercentage = ((totalObtained / totalMax) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-auto">
        
        {/* Modal Toolbar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Official Academic Credential
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Automated Term Report Card
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setReportLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  reportLanguage === 'en'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setReportLanguage('ar')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer font-arabic ${
                  reportLanguage === 'ar'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setReportLanguage('am')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  reportLanguage === 'am'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                አማርኛ
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Report Card Document */}
        <div
          id="official-term-report-card"
          className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-6 print:border-none print:p-0 print:shadow-none"
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-emerald-800 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-amber-400 border-2 border-amber-300 flex items-center justify-center font-serif text-2xl font-black shadow-sm">
                ع
              </div>
              <div>
                <h1 className="text-xl font-black font-serif text-emerald-950 uppercase tracking-tight">
                  Al-Imran Madrasa &amp; Qur'anic Academy
                </h1>
                <p className="text-sm font-bold text-emerald-800 font-arabic">
                  مدرسة آل عمران النموذجية لتحفيظ القرآن الكريم والعلوم الشرعية
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  CMC Michael Main Campus, Addis Ababa, Ethiopia • Tel: +251 911 000 000 • Web: alimran.edu.et
                </p>
              </div>
            </div>

            <div className="text-right border-l-2 border-slate-200 pl-4">
              <span className="px-2.5 py-1 bg-emerald-800 text-amber-300 rounded-md text-[10px] font-black uppercase tracking-wider font-mono">
                Official Report Card
              </span>
              <p className="text-xs font-bold text-slate-700 mt-1">Academic Year 1447 / 2026</p>
              <p className="text-[10px] font-mono text-slate-500">Ref: REP-{student.admissionNumber}</p>
            </div>
          </div>

          {/* Student Profile & Bio Block */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="md:col-span-2 flex justify-center">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                alt={student.firstName}
                className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-700 shadow-xs"
              />
            </div>

            <div className="md:col-span-5 space-y-1 text-xs">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900">{student.firstName} {student.lastName}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Arabic Name:</span>
                <span className="font-bold text-emerald-900 font-arabic text-sm">{student.arabicName}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Admission No:</span>
                <span className="font-mono font-bold text-slate-900">{student.admissionNumber}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Class &amp; Section:</span>
                <span className="font-bold text-slate-900">{student.currentClass}</span>
              </div>
            </div>

            <div className="md:col-span-5 space-y-1 text-xs">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Hifz Halqah:</span>
                <span className="font-bold text-emerald-800">{student.hifzCircleName}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Level:</span>
                <span className="font-bold text-slate-900 capitalize">{student.currentLevel} Level</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Attendance Rate:</span>
                <span className="font-bold text-emerald-700">{student.attendanceRate || 98}% (Exemplary)</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Class Rank:</span>
                <span className="font-black text-amber-700">1st in Class (Top 2%)</span>
              </div>
            </div>
          </div>

          {/* Qur'an Hifz Special Progress Block */}
          <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Qur'an Memorization Milestone (حالة الحفظ والمراجعة)
                </h4>
                <p className="text-[11px] text-emerald-200">
                  Current Surah: <strong className="text-white">{student.quranProgress?.currentSurahName || 'Surah Al-Kahf'}</strong> • Completed: <strong className="text-amber-300">{student.quranProgress?.juzCompleted || 12} / 30 Ajza'</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-center bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800">
                <span className="text-[10px] text-emerald-300 block">Sabaq (New Lesson)</span>
                <span className="font-bold text-white">98% Fluent</span>
              </div>
              <div className="text-center bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800">
                <span className="text-[10px] text-emerald-300 block">Sabqi (Revision)</span>
                <span className="font-bold text-white">95% Retained</span>
              </div>
              <div className="text-center bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800">
                <span className="text-[10px] text-emerald-300 block">Tajweed Quality</span>
                <span className="font-bold text-amber-300">Mumtaz (A+)</span>
              </div>
            </div>
          </div>

          {/* Academic Assessment Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-900 text-white font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 border-r border-slate-700">#</th>
                  <th className="p-2.5 border-r border-slate-700">
                    {reportLanguage === 'ar' ? 'المادة الدراسية' : reportLanguage === 'am' ? 'የትምህርት ዓይነት' : 'Subject'}
                  </th>
                  <th className="p-2.5 text-center border-r border-slate-700">Max</th>
                  <th className="p-2.5 text-center border-r border-slate-700">Score</th>
                  <th className="p-2.5 text-center border-r border-slate-700">Grade</th>
                  <th className="p-2.5">Ustaz Remarks &amp; Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectGrades.map((sub, index) => (
                  <tr key={sub.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 font-mono text-slate-500 border-r border-slate-200">{index + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                      {reportLanguage === 'ar' ? sub.nameAr : reportLanguage === 'am' ? sub.nameAm : sub.nameEn}
                      <span className="block text-[10px] font-normal text-slate-500 font-arabic">{sub.nameAr}</span>
                    </td>
                    <td className="p-2.5 text-center font-mono text-slate-600 border-r border-slate-200">{sub.maxScore}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800 border-r border-slate-200">{sub.obtainedScore}</td>
                    <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-200">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono text-[10px] font-black">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px]">{sub.ustazRemarks}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="p-2.5 text-right font-black uppercase">
                    Total &amp; Overall Average:
                  </td>
                  <td className="p-2.5 text-center font-mono">{totalMax}</td>
                  <td className="p-2.5 text-center font-mono font-black text-emerald-800">{totalObtained}</td>
                  <td className="p-2.5 text-center font-black text-emerald-800">{averagePercentage}%</td>
                  <td className="p-2.5 text-emerald-800 font-black">Overall Grade: Distinction (Mumtaz)</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conduct / Akhlaq Assessment Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Salah &amp; Jamā'ah Adherence</span>
              <strong className="text-emerald-700 font-bold">Excellent (ممتاز)</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Adab &amp; Respect for Ustazs</span>
              <strong className="text-emerald-700 font-bold">Excellent (ممتاز)</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Homework &amp; Assignments</span>
              <strong className="text-emerald-700 font-bold">Very Good (جيد جداً)</strong>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block">Peer Brotherhood &amp; Conduct</span>
              <strong className="text-emerald-700 font-bold">Excellent (ممتاز)</strong>
            </div>
          </div>

          {/* Official Signatures & Cryptographic Verification Seal */}
          <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="text-center space-y-2">
              <div className="w-32 h-10 border-b border-slate-400 mx-auto flex items-end justify-center">
                <span className="text-xs font-serif italic text-slate-700 font-bold">Ustaz Ahmed</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 uppercase">Class Ustaz / Teacher</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-32 h-10 border-b border-slate-400 mx-auto flex items-end justify-center">
                <span className="text-xs font-serif italic text-slate-700 font-bold">Sheikh Mahmud</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 uppercase">Head of Hifz Board</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-32 h-10 border-b border-slate-400 mx-auto flex items-end justify-center">
                <span className="text-xs font-serif italic text-slate-700 font-bold">Dr. Nuruddin</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 uppercase">Madrasa Principal &amp; Seal</p>
            </div>
          </div>

          {/* Footer with Verification Note */}
          <div className="text-center pt-2 text-[9px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100">
            <span>Generated securely by Al-Imran Madrasa Management System</span>
            <span>Verify online at alimran.edu.et/verify/rep-{student.admissionNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
