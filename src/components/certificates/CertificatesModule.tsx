import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import { canPrintCertificates, CERTIFICATE_PRINT_ROLES } from '../../utils/permissions';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  Award,
  Sparkles,
  Printer,
  FileDown,
  CheckCircle,
  QrCode,
  Scroll,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const CertificatesModule: React.FC = () => {
  const { students, teachers, currentUser } = useMadrasa();

  const userRole = currentUser?.role || 'student';
  const isPrintAuthorized = canPrintCertificates(userRole);
  const [showPermissionWarning, setShowPermissionWarning] = useState<boolean>(false);

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [certType, setCertType] = useState<'hifz' | 'ijazah' | 'tajweed' | 'honor'>('ijazah');
  const [issueDate, setIssueDate] = useState('2026-08-14');
  const [sanadSheikh, setSanadSheikh] = useState('Sheikh Bilal Ibrahim Al-Habashi');
  const [qiraahRiwayah, setQiraahRiwayah] = useState("Riwayah Hafs 'an Asim min Tariq Ash-Shatibiyyah");

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handlePrint = () => {
    if (!isPrintAuthorized) {
      setShowPermissionWarning(true);
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Sanad & Official Certificates Registry Database"
        arabicPageName="الإجازات والشهادات المعتمدة"
        recordCount={students.filter(s => s.quranProgress.juzCompleted >= 30).length}
        recordLabel="Certified Huffaz"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Official Certificates &amp; Ijazah with Sanad</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              Gold Foil Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 font-arabic mt-0.5">
            إصدار الإجازات بالسند المتصل إلى رسول الله ﷺ وشهادات ختم القرآن الكريم
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPrintAuthorized && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Issuing Role: Admin / Registrar Only</span>
            </div>
          )}
          <button
            onClick={handlePrint}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              isPrintAuthorized
                ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95 shadow-amber-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {isPrintAuthorized ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-500" />}
            <span>{isPrintAuthorized ? 'Print Official Gold Certificate' : 'Print Certificate (Restricted)'}</span>
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Select Graduate / Hafiz</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.firstName} {st.lastName} ({st.quranProgress.juzCompleted}/30 Juz)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Certificate Type</label>
          <select
            value={certType}
            onChange={(e) => setCertType(e.target.value as any)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-amber-900"
          >
            <option value="ijazah">Ijazah & Sanad in Qur'an (إجازة بالسند المتصل)</option>
            <option value="hifz">30-Juz Khatmah Completion (شهادة إتمام حفظ القرآن)</option>
            <option value="tajweed">Matn Tajweed Mastery (شهادة إتقان تحفة الأطفال والجزرية)</option>
            <option value="honor">Academic Distinction Award (شهادة تفوق وتميز دراسي)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Issuing Sheikh / Sanad Master</label>
          <input
            type="text"
            value={sanadSheikh}
            onChange={(e) => setSanadSheikh(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">Qira'ah & Riwayah</label>
          <input
            type="text"
            value={qiraahRiwayah}
            onChange={(e) => setQiraahRiwayah(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-semibold"
          />
        </div>
      </div>

      {/* Live Certificate Preview Sheet */}
      <div className="bg-slate-100 p-4 md:p-8 rounded-2xl flex justify-center">
        <div className="bg-[#fffdf7] max-w-4xl w-full p-8 md:p-12 rounded-2xl shadow-xl border-8 border-double border-amber-600 relative overflow-hidden select-none">
          {/* Background Watermark Pattern */}
          <div className="absolute inset-0 bg-islamic-pattern opacity-5 pointer-events-none" />

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-amber-600 text-xs font-serif">✦ ✦ ✦</div>
          <div className="absolute top-2 right-2 text-amber-600 text-xs font-serif">✦ ✦ ✦</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-xs font-serif">✦ ✦ ✦</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-xs font-serif">✦ ✦ ✦</div>

          {/* Bismillah */}
          <div className="text-center mb-6">
            <span className="font-arabic text-2xl font-bold text-emerald-950 block">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
              IN THE NAME OF ALLAH, THE MOST GRACIOUS, THE MOST MERCIFUL
            </span>
          </div>

          {/* Madrasa Heading */}
          <div className="flex items-center justify-between border-b-2 border-amber-600/60 pb-5 mb-6">
            <MadrasaLogo size="md" />
            <div className="text-right">
              <span className="text-sm font-black text-emerald-950 uppercase tracking-widest block">
                AL-IMRAN CMC MADRASA
              </span>
              <span className="font-arabic text-lg font-bold text-emerald-800 block">
                مدرسة آل عمران لتحفيظ القرآن الكريم والعلوم الشرعية
              </span>
              <span className="text-xs font-amharic text-emerald-700 font-bold block">
                አል ዒምራን ሲኤምሲ መድረሳ - አዲስ አበባ
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                CMC Road, Addis Ababa, Ethiopia • Reg No: ETH-MOE-2024-8891
              </span>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6 space-y-2">
            <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-950 border border-amber-400 inline-block shadow-xs">
              {certType === 'ijazah' && "SANAD & IJAZAH IN THE HOLY QUR'AN"}
              {certType === 'hifz' && "CERTIFICATE OF 30-JUZ HIFZ COMPLETION"}
              {certType === 'tajweed' && "CERTIFICATE OF TAJWEED & MATN MASTERY"}
              {certType === 'honor' && "CERTIFICATE OF ACADEMIC DISTINCTION"}
            </span>

            <h2 className="text-3xl font-black font-arabic text-emerald-950 pt-2">
              {certType === 'ijazah' && "إجـازة وسـنـد متـصـل في الـقـرآن الـكـريـم"}
              {certType === 'hifz' && "شـهـادة إتـمـام حـفـظ كـتـاب الله تـعـالـى"}
              {certType === 'tajweed' && "شـهـادة إتـقـان مـتـون الـتـجـويـد والأداء"}
              {certType === 'honor' && "شـهـادة شـرف وتـفـوق أكـاديـمـي"}
            </h2>
          </div>

          {/* Recipient Body Text */}
          <div className="text-center space-y-4 max-w-2xl mx-auto text-slate-800 text-sm leading-relaxed my-6">
            <p>
              This is to officially testify and certify that the student / reciter:
            </p>

            <div className="py-2 border-y-2 border-amber-300 bg-amber-50/50 rounded-xl my-2">
              <h3 className="text-2xl font-black text-emerald-950">
                {currentStudent.firstName} {currentStudent.lastName}
              </h3>
              <p className="text-xl font-arabic font-bold text-emerald-800 mt-1">
                {currentStudent.arabicName}
              </p>
              <span className="text-xs font-mono text-slate-500">
                Admission No: {currentStudent.admissionNumber}
              </span>
            </div>

            <p className="font-arabic text-base leading-loose text-slate-900">
              {certType === 'ijazah' && (
                <>
                  قد قرأ القرآن الكريم كاملاً غيباً عن ظهر قلب من أول فاتحة الكتاب إلى آخر سورة الناس برواية{' '}
                  <strong className="text-emerald-900 font-bold">{qiraahRiwayah}</strong>، قراءة متقنة محققة مع مراعاة أحكام التجويد ومخارج الحروف، وأجزته بسندي المتصل إلى رسول الله ﷺ.
                </>
              )}
              {certType === 'hifz' && (
                <>
                  قد أتم بحمد الله وتوفيقه حفظ كتاب الله تعالى كاملاً (ثلاثين جزءاً) مع الإتقان والضبط ومراعاة قواعد الترتيل والتجويد، ونال تقدير: <strong className="text-emerald-900">ممتاز مرتفع (Mumtaz)</strong>.
                </>
              )}
            </p>

            <p className="text-xs text-slate-600">
              Awarded at Al-Imran CMC Madrasa on this <strong>{issueDate}</strong> (1448 AH). May Allah make this knowledge a light and benefit for the Ummah.
            </p>
          </div>

          {/* Verification Seal & Signatures */}
          <div className="mt-10 pt-6 border-t-2 border-amber-600/60 flex items-center justify-between text-xs">
            {/* Sanad Master Sign */}
            <div className="text-center space-y-1">
              <div className="w-36 border-b-2 border-slate-800 mx-auto" />
              <span className="font-bold text-slate-900 block">{sanadSheikh}</span>
              <span className="text-[10px] text-slate-500">Head of Qur'an & Sanad Dept</span>
            </div>

            {/* Gold Seal Centerpiece */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-600 p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-amber-950/40 bg-amber-400 flex flex-col items-center justify-center text-amber-950 text-center font-bold">
                  <Award className="w-6 h-6 text-amber-950" />
                  <span className="text-[8px] font-black uppercase">GOLD SEAL</span>
                  <span className="text-[7px] font-arabic">معتمد وموثق</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1">ID: ALIMRAN-CERT-{currentStudent.admissionNumber}</span>
            </div>

            {/* Principal Sign */}
            <div className="text-center space-y-1">
              <div className="w-36 border-b-2 border-slate-800 mx-auto" />
              <span className="font-bold text-slate-900 block">Sheikh Fuad Nuru Al-Azhari</span>
              <span className="text-[10px] text-slate-500">Principal & Director General</span>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Printing Permission Denied Modal */}
      {showPermissionWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/60 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Restricted Certificate Issuance
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  إصدار الإجازات والشهادات مقتصر على الإدارة المعتمدة
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Printing and conferring official Sanad Ijazahs, Khatmah Diplomas, and Gold Seal Certificates requires certified administrative credentials to prevent unauthorized certificate generation.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Authorized Roles for Certificate Printing:
                </span>
                <div className="space-y-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  <div>✓ Super Admin (المدير العام)</div>
                  <div>✓ Principal &amp; Vice Principal (المدير والوكيل)</div>
                  <div>✓ Registrar (مسؤول القبول والتسجيل)</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPermissionWarning(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Understood (حسناً)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
