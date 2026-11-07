import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { Student, Teacher } from '../../types';
import { MadrasaLogo } from '../common/MadrasaLogo';
import { ImageUploadField } from '../common/ImageUploadField';
import { canPrintIDCards, canBatchPrint, getAuthorizedRolesLabel, ID_CARD_PRINT_ROLES } from '../../utils/permissions';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  Printer,
  QrCode,
  ShieldCheck,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  Droplet,
  Layers,
  Eye,
  Download,
  GraduationCap,
  Award,
  RefreshCw,
  Building,
  Camera,
  Lock,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export const IDCardStudio: React.FC = () => {
  const { students, teachers, updateStudent, updateTeacher, currentMadrasaBranch, currentUser, language, t } = useMadrasa();

  const userRole = currentUser?.role || 'student';
  const isPrintAuthorized = canPrintIDCards(userRole);
  const isBatchAuthorized = canBatchPrint(userRole);

  const [cardType, setCardType] = useState<'student' | 'staff'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cardSideView, setCardSideView] = useState<'both' | 'front' | 'back'>('both');
  const [isBatchPrintModal, setIsBatchPrintModal] = useState<boolean>(false);
  const [batchCategory, setBatchCategory] = useState<'all' | 'class'>('all');
  const [showPermissionWarning, setShowPermissionWarning] = useState<boolean>(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId) || teachers[0];

  // Distinct classes
  const classOptions = Array.from(new Set(students.map((s) => s.currentClass))).filter(Boolean);

  // Filtered lists
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.arabicName.includes(searchTerm);
    const matchesClass = selectedClassFilter === 'all' || s.currentClass === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const filteredTeachers = teachers.filter((tch) => {
    return (
      tch.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tch.arabicName && tch.arabicName.includes(searchTerm)) ||
      tch.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handlePrint = () => {
    if (!isPrintAuthorized) {
      setShowPermissionWarning(true);
      return;
    }
    window.print();
  };

  const handleOpenBatchModal = () => {
    if (!isBatchAuthorized) {
      setShowPermissionWarning(true);
      return;
    }
    setIsBatchPrintModal(true);
  };

  // Generate QR Code simulation SVG string
  const renderQRCode = (codeValue: string) => {
    return (
      <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded p-1">
          {/* Simulated High-Res QR matrix */}
          <div className="w-full h-full grid grid-cols-5 gap-0.5 bg-white p-0.5 rounded-xs">
            <div className="bg-slate-950 col-span-2 row-span-2"></div>
            <div className="bg-slate-950 col-span-1"></div>
            <div className="bg-slate-950 col-span-2 row-span-2"></div>
            <div className="bg-slate-950 col-span-1"></div>
            <div className="bg-slate-950 col-span-1"></div>
            <div className="bg-slate-950 col-span-1"></div>
            <div className="bg-slate-950 col-span-3"></div>
            <div className="bg-slate-950 col-span-2 row-span-2"></div>
            <div className="bg-slate-950 col-span-1"></div>
            <div className="bg-slate-950 col-span-2 row-span-2"></div>
          </div>
        </div>
        <span className="text-[8px] font-mono font-bold text-slate-700 mt-1 tracking-tighter">
          {codeValue}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Student & Faculty Identification Registry Database"
        arabicPageName="استوديو البطاقات الجامعية والتعريفية"
        recordCount={students.length + teachers.length}
        recordLabel="ID Card Profiles"
      />

      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              Identity Management &amp; Security
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              High-Resolution PVC &amp; Paper Print Format
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Official ID Card &amp; Badge Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Generate verifiable photographic identity badges with cryptographic QR verification for students, teachers, and administrative personnel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {!isPrintAuthorized && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Print Role: Admin / Registrar Only</span>
            </div>
          )}
          <button
            onClick={handleOpenBatchModal}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
              isBatchAuthorized
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
            }`}
          >
            {isBatchAuthorized ? (
              <Layers className="w-4 h-4 text-emerald-500" />
            ) : (
              <Lock className="w-4 h-4 text-amber-500" />
            )}
            Batch Print Cards (A4)
          </button>
          <button
            onClick={handlePrint}
            className={`flex-1 md:flex-initial px-5 py-2.5 font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              isPrintAuthorized
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {isPrintAuthorized ? (
              <Printer className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-amber-500" />
            )}
            {isPrintAuthorized ? 'Print Selected ID' : 'Print ID (Restricted)'}
          </button>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls & Selection Panel */}
        <div className="lg:col-span-5 space-y-4 no-print">
          {/* Card Type Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Select Badge Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCardType('student')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                  cardType === 'student'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student ID Badges ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setCardType('staff')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                  cardType === 'staff'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Faculty &amp; Staff ({teachers.length})
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={cardType === 'student' ? 'Search student name, ID...' : 'Search teacher name, role...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {cardType === 'student' && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Classes &amp; Halqahs</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Card View Toggles */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Preview Layout</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCardSideView('both')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  cardSideView === 'both'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Front &amp; Back
              </button>
              <button
                type="button"
                onClick={() => setCardSideView('front')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  cardSideView === 'front'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Front Only
              </button>
              <button
                type="button"
                onClick={() => setCardSideView('back')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  cardSideView === 'back'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Back Only
              </button>
            </div>
          </div>

          {/* Directory List for Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {cardType === 'student' ? `Select Student (${filteredStudents.length})` : `Select Faculty Member (${filteredTeachers.length})`}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Click to preview</span>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cardType === 'student' ? (
                filteredStudents.length > 0 ? (
                  filteredStudents.map((std) => {
                    const isSelected = std.id === selectedStudent?.id;
                    return (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => setSelectedStudentId(std.id)}
                        className={`w-full p-3 text-left flex items-center gap-3 transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <img
                          src={std.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={std.firstName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {std.firstName} {std.lastName}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {std.admissionNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {std.currentClass} • {std.hifzCircleName}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">No students match your filter.</div>
                )
              ) : (
                filteredTeachers.length > 0 ? (
                  filteredTeachers.map((tch) => {
                    const isSelected = tch.id === selectedTeacher?.id;
                    return (
                      <button
                        key={tch.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(tch.id)}
                        className={`w-full p-3 text-left flex items-center gap-3 transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <img
                          src={tch.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={tch.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {tch.fullName}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {tch.id.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate capitalize">
                            {tch.role.replace('_', ' ')} • {tch.subjects?.join(', ') || 'Faculty'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">No staff members found.</div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live Card Preview & Print Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-6">
          <div className="w-full bg-slate-950/5 dark:bg-slate-900/40 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-8 min-h-[560px]">
            
            {/* Student ID Card Layout */}
            {cardType === 'student' && selectedStudent && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-2xl">
                
                {/* Front Side */}
                {(cardSideView === 'both' || cardSideView === 'front') && (
                  <div className="w-72 h-[430px] bg-white rounded-2xl shadow-2xl border-2 border-emerald-700/80 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-900">
                    {/* Top Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-3.5 text-center relative">
                      <div className="absolute top-1.5 left-2.5">
                        <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
                          <span className="text-[10px] text-amber-300 font-bold">ع</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <h3 className="font-black text-[13px] tracking-wide uppercase font-serif text-amber-300">
                          Al-Imran Madrasa
                        </h3>
                        <p className="text-[9px] text-emerald-100 font-arabic">مدرسة آل عمران لتحفيظ القرآن الكريم</p>
                        <span className="text-[8px] tracking-widest text-emerald-200 uppercase font-semibold mt-0.5">
                          Addis Ababa, Ethiopia
                        </span>
                      </div>
                    </div>

                    {/* Student Photo & Identity Core */}
                    <div className="px-4 pt-3 flex flex-col items-center text-center">
                      <div className="relative">
                        <img
                          src={selectedStudent.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={selectedStudent.firstName}
                          className="w-24 h-24 rounded-xl object-cover border-2 border-emerald-600 shadow-md"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <h2 className="text-sm font-black text-slate-900 mt-2.5">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h2>
                      <p className="text-xs font-bold text-emerald-800 font-arabic">{selectedStudent.arabicName}</p>

                      <div className="mt-1 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-extrabold tracking-wider">
                        STUDENT IDENTIFICATION
                      </div>
                    </div>

                    {/* Student Key Metadata */}
                    <div className="px-4 py-2 space-y-1 text-slate-800 text-[10px]">
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Admission ID:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedStudent.admissionNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Class / Grade:</span>
                        <span className="font-bold text-slate-900">{selectedStudent.currentClass}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Hifz Halqah:</span>
                        <span className="font-bold text-emerald-800 truncate max-w-[140px]">{selectedStudent.hifzCircleName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Blood Group:</span>
                        <span className="font-bold text-rose-700">{selectedStudent.bloodGroup || 'O+'}</span>
                      </div>
                    </div>

                    {/* Bottom Golden Bar */}
                    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 px-3 py-1.5 flex items-center justify-between text-[9px] font-bold">
                      <span>Valid: 2026/2027 Academic Year</span>
                      <span className="font-mono font-black">CMC Main Campus</span>
                    </div>
                  </div>
                )}

                {/* Back Side */}
                {(cardSideView === 'both' || cardSideView === 'back') && (
                  <div className="w-72 h-[430px] bg-slate-50 rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-900">
                    {/* Top Back Header */}
                    <div className="p-3 bg-slate-900 text-white text-center">
                      <p className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                        Emergency &amp; Institutional Information
                      </p>
                      <p className="text-[8px] text-slate-300 font-arabic">معلومات الطوارئ والتحقق الرسمي</p>
                    </div>

                    {/* Center QR & Guardian Details */}
                    <div className="px-4 py-2 space-y-3 flex flex-col items-center text-center">
                      {renderQRCode(selectedStudent.admissionNumber)}

                      <div className="w-full bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 text-left">
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Guardian:</span>
                          <span className="font-bold">{selectedStudent.guardianName}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Emergency Phone:</span>
                          <span className="font-mono font-bold text-emerald-800">{selectedStudent.guardianPhone}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Address:</span>
                          <span className="truncate max-w-[140px] text-slate-700">{selectedStudent.address || 'Yeka / CMC, Addis Ababa'}</span>
                        </div>
                      </div>

                      <p className="text-[8px] text-slate-500 leading-tight">
                        This badge is the property of Al-Imran Madrasa. If found, please return to CMC Michael Campus, Addis Ababa or call +251 911 000 000.
                      </p>
                    </div>

                    {/* Official Stamp & Signature Area */}
                    <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-12 h-6 border-b border-dashed border-slate-400 flex items-end justify-center">
                          <span className="text-[8px] font-serif italic text-slate-600 font-bold">Principal</span>
                        </div>
                        <span className="text-[7px] text-slate-400 uppercase font-semibold">Authorized Signature</span>
                      </div>

                      <div className="w-10 h-10 rounded-full border border-emerald-600/40 bg-emerald-50 flex items-center justify-center text-center p-0.5">
                        <span className="text-[6px] font-bold text-emerald-800 leading-tight uppercase font-serif">
                          Al-Imran<br />SEAL
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Staff / Teacher ID Card Layout */}
            {cardType === 'staff' && selectedTeacher && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-2xl">
                
                {/* Staff Front Side */}
                {(cardSideView === 'both' || cardSideView === 'front') && (
                  <div className="w-72 h-[430px] bg-white rounded-2xl shadow-2xl border-2 border-indigo-800 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-900">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 text-center relative">
                      <div className="flex flex-col items-center">
                        <h3 className="font-black text-[13px] tracking-wide uppercase font-serif text-amber-300">
                          Al-Imran Madrasa
                        </h3>
                        <p className="text-[9px] text-indigo-200 font-arabic">هيئة التدريس والمشايخ</p>
                        <span className="text-[8px] tracking-widest text-indigo-300 uppercase font-semibold mt-0.5">
                          Faculty &amp; Staff Credential
                        </span>
                      </div>
                    </div>

                    {/* Staff Photo */}
                    <div className="px-4 pt-3 flex flex-col items-center text-center">
                      <div className="relative">
                        <img
                          src={selectedTeacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={selectedTeacher.fullName}
                          className="w-24 h-24 rounded-xl object-cover border-2 border-indigo-600 shadow-md"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-xs">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <h2 className="text-sm font-black text-slate-900 mt-2.5">
                        {selectedTeacher.fullName}
                      </h2>
                      <p className="text-xs font-bold text-indigo-900 font-arabic">{selectedTeacher.arabicName || selectedTeacher.fullName}</p>

                      <div className="mt-1 inline-block px-3 py-0.5 bg-indigo-100 text-indigo-950 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {selectedTeacher.role.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Staff Details */}
                    <div className="px-4 py-2 space-y-1 text-slate-800 text-[10px]">
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Faculty ID:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedTeacher.id.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Department:</span>
                        <span className="font-bold text-slate-900">Qur'anic &amp; Islamic Sciences</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Direct Phone:</span>
                        <span className="font-mono font-bold text-indigo-900">{selectedTeacher.phone}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-0.5">
                        <span className="text-slate-500 font-medium">Branch:</span>
                        <span className="font-bold text-slate-900">{currentMadrasaBranch}</span>
                      </div>
                    </div>

                    {/* Bottom Platinum Strip */}
                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-amber-300 px-3 py-1.5 flex items-center justify-between text-[9px] font-bold border-t border-indigo-700">
                      <span>Official Staff Pass</span>
                      <span className="font-mono font-black">Authorized Personnel</span>
                    </div>
                  </div>
                )}

                {/* Staff Back Side */}
                {(cardSideView === 'both' || cardSideView === 'back') && (
                  <div className="w-72 h-[430px] bg-slate-50 rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-slate-900">
                    <div className="p-3 bg-indigo-950 text-white text-center">
                      <p className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                        Staff Verification &amp; Access Rights
                      </p>
                      <p className="text-[8px] text-indigo-200 font-arabic">بطاقة تعريف المشايخ والكوادر الإدارية</p>
                    </div>

                    <div className="px-4 py-2 space-y-3 flex flex-col items-center text-center">
                      {renderQRCode(selectedTeacher.id.toUpperCase())}

                      <div className="w-full bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1 text-left">
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Qualifications:</span>
                          <span className="font-bold text-indigo-900 truncate max-w-[130px]">{selectedTeacher.qualifications?.[0] || 'Islamic Scholar'}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Ijazah / Sanad:</span>
                          <span className="font-bold text-emerald-800 truncate max-w-[130px]">{selectedTeacher.islamicCertificates?.[0] || "Hafs 'an Asim"}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Email:</span>
                          <span className="truncate max-w-[140px] text-slate-700 font-mono">{selectedTeacher.email || 'faculty@alimran.edu.et'}</span>
                        </div>
                      </div>

                      <p className="text-[8px] text-slate-500 leading-tight">
                        Holder of this badge is an official educator/staff member of Al-Imran Madrasa. Granted full campus &amp; administrative access.
                      </p>
                    </div>

                    <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-14 h-6 border-b border-dashed border-slate-400 flex items-end justify-center">
                          <span className="text-[8px] font-serif italic text-slate-600 font-bold">Executive Board</span>
                        </div>
                        <span className="text-[7px] text-slate-400 uppercase font-semibold">Director General</span>
                      </div>

                      <div className="w-10 h-10 rounded-full border border-indigo-700/40 bg-indigo-50 flex items-center justify-center text-center p-0.5">
                        <span className="text-[6px] font-bold text-indigo-900 leading-tight uppercase font-serif">
                          Faculty<br />SEAL
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Badge Photo Uploader & Live Camera Capture */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {cardType === 'student' ? 'Student ID Photo' : 'Faculty ID Photo'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Snap via webcam or upload to instantly update badge and cloud database
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                {cardType === 'student' ? selectedStudent?.admissionNumber : selectedTeacher?.id.toUpperCase()}
              </span>
            </div>

            {cardType === 'student' && selectedStudent && (
              <ImageUploadField
                label={`Upload / Snap Photo for ${selectedStudent.firstName} ${selectedStudent.lastName}`}
                value={selectedStudent.photoUrl || ''}
                bucket="student-photos"
                customFileName={`student_${selectedStudent.admissionNumber}`}
                onChange={(newUrl) => {
                  if (newUrl) {
                    updateStudent(selectedStudent.id, { photoUrl: newUrl });
                  }
                }}
                helperText="Captures high-contrast passport photo, syncs to Supabase Cloud, and updates badge preview instantly"
              />
            )}

            {cardType === 'staff' && selectedTeacher && (
              <ImageUploadField
                label={`Upload / Snap Photo for ${selectedTeacher.fullName}`}
                value={selectedTeacher.photoUrl || ''}
                bucket="teacher-photos"
                customFileName={`teacher_${selectedTeacher.id}`}
                onChange={(newUrl) => {
                  if (newUrl) {
                    updateTeacher(selectedTeacher.id, { photoUrl: newUrl });
                  }
                }}
                helperText="Captures faculty portrait, syncs to Supabase Cloud, and updates staff badge preview instantly"
              />
            )}
          </div>
        </div>
      </div>

      {/* Batch Print A4 Sheet Modal */}
      {isBatchPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Batch ID Card Sheet Printing (A4 Multi-Grid)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formatted for printing multiple PVC identity badges on high-yield A4 sheets with alignment guides.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Print A4 Batch
                </button>
                <button
                  onClick={() => setIsBatchPrintModal(false)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Batch Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              {(cardType === 'student' ? filteredStudents : filteredTeachers).map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-300 p-3 shadow-xs flex flex-col justify-between h-48 relative overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={item.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                      alt={item.firstName || item.fullName}
                      className="w-12 h-12 rounded-lg object-cover border border-emerald-600 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-black text-slate-900 truncate">
                        {item.firstName ? `${item.firstName} ${item.lastName}` : item.fullName}
                      </h5>
                      <p className="text-[9px] font-bold text-emerald-800 font-arabic truncate">
                        {item.arabicName}
                      </p>
                      <span className="text-[9px] font-mono text-slate-600 font-bold">
                        {item.admissionNumber || item.id.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-600 border-t border-slate-100 pt-1.5 space-y-0.5">
                    <p className="truncate"><strong>Class:</strong> {item.currentClass || item.subjects?.join(', ') || 'General'}</p>
                    <p className="truncate"><strong>Contact:</strong> {item.guardianPhone || item.phone}</p>
                  </div>

                  <div className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded-sm flex items-center justify-between text-[8px] font-bold font-mono">
                    <span>AL-IMRAN BADGE</span>
                    <span>2026/27</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Printing Permission Denied Modal */}
      {showPermissionWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/60 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Restricted Printing Permission
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  صلاحية الطباعة مقتصرة على الإدارة والتسجيل
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Printing and batch-issuing physical PVC identity badges is restricted to institutional administrators and registrars to preserve identity security and prevent unauthorized credential production.
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Authorized Roles for ID Badge Printing:
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
