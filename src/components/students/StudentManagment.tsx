import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { Student, StudentStatus } from '../../types';
import { MadrasaLogo } from '../common/MadrasaLogo';
import { ImageUploadField } from '../common/ImageUploadField';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import { canPrintIDCards, canPrintStudentDossiers } from '../../utils/permissions';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  FileDown,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  BookOpen,
  Calendar,
  CreditCard,
  QrCode,
  Shield,
  ShieldCheck,
  Lock,
  X,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Save,
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, teachers, currentUser } = useMadrasa();

  const userRole = currentUser?.role;
  const isAdmin = userRole === 'super_admin' || userRole === 'principal' || userRole === 'vice_principal' || userRole === 'registrar';
  const isSuperAdminOrPrincipal = userRole === 'super_admin' || userRole === 'principal';
  const isFinanceStaff = isAdmin || userRole === 'finance_officer';
  const isPrintIdAuthorized = canPrintIDCards(userRole);
  const isPrintDossierAuthorized = canPrintStudentDossiers(userRole);

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'quran' | 'fees' | 'attendance'>('profile');

  // Find linked student record for student role
  const myStudentRecord = userRole === 'student'
    ? students.find(s => s.guardianEmail?.toLowerCase() === currentUser?.email?.toLowerCase() || `${s.firstName} ${s.lastName}`.toLowerCase() === currentUser?.name?.toLowerCase()) || students[0]
    : null;

  // Find linked student records for parent role
  const myChildrenRecords = userRole === 'parent'
    ? students.filter(s => s.guardianEmail?.toLowerCase() === currentUser?.email?.toLowerCase() || s.guardianName?.toLowerCase().includes(currentUser?.name?.toLowerCase() || ''))
    : [];
  const parentChildren = userRole === 'parent' && myChildrenRecords.length === 0 && students.length > 0 ? students.slice(0, 2) : myChildrenRecords;

  const handleOpenEdit = (student: Student) => {
    setEditingStudent({ ...student });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!isAdmin) {
      alert('Permission Denied: Only administrators can edit student records.');
      return;
    }
    updateStudent(editingStudent.id, editingStudent);
    setIsEditOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string, name: string) => {
    if (!isSuperAdminOrPrincipal) {
      alert('Permission Denied: Only Super Admin and Principal can delete student records.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete student "${name}"?`)) {
      deleteStudent(studentId);
    }
  };

  // Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    arabicName: '',
    gender: 'male' as 'male' | 'female',
    dob: '2014-01-15',
    placeOfBirth: 'Addis Ababa',
    nationality: 'Ethiopian',
    region: 'Addis Ababa',
    subCity: 'Yeka Sub-City',
    woreda: 'Woreda 08 (CMC)',
    address: 'CMC Michael, Addis Ababa',
    guardianName: '',
    guardianRelationship: 'Father',
    guardianPhone: '+251 9',
    guardianEmail: '',
    emergencyContact: '+251 9',
    bloodGroup: 'O+',
    medicalNotes: 'None',
    enrollmentDate: '2026-08-14',
    currentLevel: "Ibtida'i 3",
    currentClass: 'Class 3-A',
    hifzCircleName: 'Halqah Imam Asim (Advanced)',
    assignedHifzTeacherId: 'tch-1',
    status: 'active' as StudentStatus,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    juzCompleted: 3,
    currentSurahNumber: 1,
    currentSurahName: 'Al-Fatihah',
    feeBalance: 1200,
  });

  // Filter logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      student.arabicName.includes(searchFilter) ||
      student.guardianPhone.includes(searchFilter) ||
      student.subCity.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
    const matchesLevel = levelFilter === 'all' || student.currentLevel.includes(levelFilter);

    return matchesSearch && matchesStatus && matchesGender && matchesLevel;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Permission Denied: Only Madrasa Administrators (Super Admin, Principal, Registrar) are authorized to register students.');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.guardianName) {
      alert('Please fill in required fields: First Name, Last Name, and Guardian Name.');
      return;
    }

    addStudent({
      firstName: formData.firstName,
      lastName: formData.lastName,
      arabicName: formData.arabicName || `${formData.firstName} ${formData.lastName}`,
      gender: formData.gender,
      dob: formData.dob,
      placeOfBirth: formData.placeOfBirth,
      nationality: formData.nationality,
      region: formData.region,
      subCity: formData.subCity,
      woreda: formData.woreda,
      address: formData.address,
      guardianName: formData.guardianName,
      guardianRelationship: formData.guardianRelationship,
      guardianPhone: formData.guardianPhone,
      guardianEmail: formData.guardianEmail || `${formData.firstName.toLowerCase()}@alimran.et`,
      emergencyContact: formData.emergencyContact,
      bloodGroup: formData.bloodGroup,
      medicalNotes: formData.medicalNotes,
      enrollmentDate: formData.enrollmentDate,
      currentLevel: formData.currentLevel,
      currentClass: formData.currentClass,
      hifzCircleName: formData.hifzCircleName,
      assignedHifzTeacherId: formData.assignedHifzTeacherId,
      status: formData.status,
      photoUrl: formData.photoUrl,
      quranProgress: {
        juzCompleted: Number(formData.juzCompleted),
        currentSurahNumber: Number(formData.currentSurahNumber),
        currentSurahName: formData.currentSurahName,
        currentAyah: 1,
        memorizationScoreAvg: 90,
        tajweedScoreAvg: 90,
        isReadyForIjazah: Number(formData.juzCompleted) >= 30,
      },
      academicGPA: 3.8,
      attendanceRate: 98,
      feeBalance: Number(formData.feeBalance),
    });

    setIsRegisterOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Student Directory & Admissions Database"
        arabicPageName="سجل الطلاب والقبول"
        recordCount={students.length}
        recordLabel="Registered Students"
      />

      {/* Module Header with Search & Register CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {userRole === 'student' ? 'My Student Dossier & Record' : userRole === 'parent' ? "Children's Academic & Qur'an Records" : 'Student Directory & Admissions'}
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {userRole === 'student' ? '1 Profile' : `${students.length} Registered`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic mt-0.5">
            سجل الطلاب والقبول والتسجيل - مدرسة آل عمران
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ New Student Admission</span>
            </button>
          ) : userRole === 'parent' ? (
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Parent Portal View</span>
            </div>
          ) : userRole === 'student' ? (
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student Profile Verified</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Faculty Directory View</span>
            </div>
          )}
        </div>
      </div>

      {/* Student Personal Portal Banner (Active when logged in as Student) */}
      {userRole === 'student' && myStudentRecord && (
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-700/40 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={myStudentRecord.photoUrl}
                alt={myStudentRecord.firstName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-400/30 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase">
                    Official Student Dossier
                  </span>
                  <span className="text-xs text-emerald-200 font-mono">#{myStudentRecord.admissionNumber}</span>
                </div>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {myStudentRecord.firstName} {myStudentRecord.lastName}
                </h2>
                <p className="text-sm font-arabic text-emerald-300">{myStudentRecord.arabicName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStudent(myStudentRecord);
                  setIsIdCardOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Print Student ID Card</span>
              </button>
              <button
                onClick={() => {
                  setSelectedStudent(myStudentRecord);
                  setIsDetailOpen(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Full Dossier</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-800/60 text-xs">
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Class & Halqah</span>
              <span className="font-bold text-white text-sm">{myStudentRecord.currentClass}</span>
              <span className="text-[11px] text-emerald-300 block truncate">{myStudentRecord.hifzCircleName}</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Qur'an Memorization</span>
              <span className="font-bold text-amber-300 text-sm">{myStudentRecord.quranProgress.juzCompleted} / 30 Juz</span>
              <span className="text-[11px] text-slate-300 block truncate">{myStudentRecord.quranProgress.currentSurahName}</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Academic GPA & Att.</span>
              <span className="font-bold text-white text-sm">GPA {myStudentRecord.academicGPA}</span>
              <span className="text-[11px] text-emerald-300 block">{myStudentRecord.attendanceRate}% Attendance</span>
            </div>
            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Tuition Fee Status</span>
              <span className={`font-bold text-sm ${myStudentRecord.feeBalance === 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
                {myStudentRecord.feeBalance === 0 ? 'Paid in Full' : `Due: ETB ${myStudentRecord.feeBalance.toLocaleString()}`}
              </span>
              <span className="text-[11px] text-slate-300 block">CMC Main Campus</span>
            </div>
          </div>
        </div>
      )}

      {/* Parent Portal Children Showcase (Active when logged in as Parent) */}
      {userRole === 'parent' && parentChildren.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>My Enrolled Children ({parentChildren.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct guardian access to academic milestones, memorization progress, and official IDs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentChildren.map((child) => (
              <div
                key={child.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={child.photoUrl}
                      alt={child.firstName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {child.firstName} {child.lastName}
                      </h4>
                      <p className="text-xs font-arabic text-emerald-800 dark:text-emerald-400 font-semibold">
                        {child.arabicName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">#{child.admissionNumber}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {child.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Class</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{child.currentClass}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Qur'an</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{child.quranProgress.juzCompleted}/30 Juz</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Fee Status</span>
                    <span className={`font-bold ${child.feeBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {child.feeBalance === 0 ? 'Paid' : `ETB ${child.feeBalance}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedStudent(child);
                      setIsDetailOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Dossier</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(child);
                      setIsIdCardOpen(true);
                    }}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>ID Card</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, admission #, guardian phone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Statuses</option>
            <option value="active" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Active</option>
            <option value="graduated" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Graduated</option>
            <option value="suspended" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Suspended</option>
            <option value="transferred" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Transferred</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Genders</option>
            <option value="male" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Male (Boys)</option>
            <option value="female" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Female (Girls)</option>
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 font-medium cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Classes / Levels</option>
            <option value="Ibtida'i" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Ibtida'i (Primary)</option>
            <option value="I'dadi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">I'dadi (Junior)</option>
            <option value="Thanawi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Thanawi (Secondary)</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Student / Admission #</th>
                <th className="px-4 py-3">Class & Hifz Circle</th>
                <th className="px-4 py-3">Qur'an Progress</th>
                <th className="px-4 py-3">Guardian & Address</th>
                <th className="px-4 py-3">Attendance & GPA</th>
                <th className="px-4 py-3">Fee Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No students found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl}
                          alt={student.firstName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">
                              {student.firstName} {student.lastName}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                student.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {student.status}
                            </span>
                          </div>
                          <p className="text-xs font-arabic text-emerald-800 font-semibold mt-0.5">
                            {student.arabicName}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">
                            {student.admissionNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Class & Hifz */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{student.currentClass}</span>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        {student.hifzCircleName || 'Hifz Circle'}
                      </span>
                    </td>

                    {/* Qur'an Progress */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-900">
                            {student.quranProgress.juzCompleted} / 30 Juz
                          </span>
                          {student.quranProgress.juzCompleted >= 30 ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                              Hafiz 🌟
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">
                              {Math.round((student.quranProgress.juzCompleted / 30) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${(student.quranProgress.juzCompleted / 30) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                          {student.quranProgress.currentSurahName}
                        </span>
                      </div>
                    </td>

                    {/* Guardian Info */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 block">{student.guardianName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {student.guardianPhone}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {student.subCity}
                      </span>
                    </td>

                    {/* Attendance & GPA */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[11px]">
                          {student.attendanceRate}% Att.
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-[11px]">
                          GPA {student.academicGPA}
                        </span>
                      </div>
                    </td>

                    {/* Fee Status */}
                    <td className="px-4 py-3">
                      {student.feeBalance === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Paid in Full
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Due: ETB {student.feeBalance.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsIdCardOpen(true);
                          }}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition-colors cursor-pointer"
                          title="Print Student ID Card"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors cursor-pointer"
                            title="Edit Student Information"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdminOrPrincipal && (
                          <button
                            onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer Modal */}
      {isDetailOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.firstName}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="text-base font-arabic font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {selectedStudent.arabicName}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedStudent.admissionNumber} • Enrolled: {selectedStudent.enrollmentDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Photo Updater for Administrator */}
            {isAdmin && (
              <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <ImageUploadField
                  label="Update Student Photo (for Badge & Database)"
                  value={selectedStudent.photoUrl}
                  bucket="student-photos"
                  customFileName={`student_${selectedStudent.admissionNumber}`}
                  onChange={(newUrl) => {
                    if (newUrl) {
                      updateStudent(selectedStudent.id, { photoUrl: newUrl });
                      setSelectedStudent({ ...selectedStudent, photoUrl: newUrl });
                    }
                  }}
                  helperText="Upload or snap new photo to automatically update student ID card and cloud database"
                />
              </div>
            )}

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 my-4 text-xs font-bold">
              <button
                onClick={() => setDetailTab('profile')}
                className={`pb-2 px-3 transition-colors border-b-2 ${
                  detailTab === 'profile'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Profile & Guardian
              </button>
              <button
                onClick={() => setDetailTab('quran')}
                className={`pb-2 px-3 transition-colors border-b-2 ${
                  detailTab === 'quran'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Qur'an Progress
              </button>
              <button
                onClick={() => setDetailTab('fees')}
                className={`pb-2 px-3 transition-colors border-b-2 ${
                  detailTab === 'fees'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Fees & Balances
              </button>
            </div>

            {/* Tab Contents */}
            {detailTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-slate-400 block font-semibold">Date of Birth</span>
                    <span className="font-bold text-slate-800">{selectedStudent.dob} ({selectedStudent.gender})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Place of Birth & Nationality</span>
                    <span className="font-bold text-slate-800">{selectedStudent.placeOfBirth}, {selectedStudent.nationality}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Current Class / Grade</span>
                    <span className="font-bold text-slate-800">{selectedStudent.currentClass} ({selectedStudent.currentLevel})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Blood Group & Medical</span>
                    <span className="font-bold text-slate-800">{selectedStudent.bloodGroup} • {selectedStudent.medicalNotes || 'Healthy'}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <h3 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-700" /> Guardian & Residence Information (Addis Ababa)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-500 font-semibold block">Guardian Name</span>
                      <span className="font-bold text-slate-900">{selectedStudent.guardianName} ({selectedStudent.guardianRelationship})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Phone Number</span>
                      <span className="font-bold text-slate-900">{selectedStudent.guardianPhone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 font-semibold block">Sub-City & Physical Address</span>
                      <span className="font-medium text-slate-900">{selectedStudent.address} ({selectedStudent.subCity}, {selectedStudent.woreda})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'quran' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-950 text-sm">Hifz Circle & Status</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-900">
                      {selectedStudent.quranProgress.juzCompleted} / 30 Juz
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Assigned Circle: <span className="font-bold text-slate-900">{selectedStudent.hifzCircleName}</span>
                  </p>
                  <p className="text-slate-700 mt-1">
                    Current Surah Target: <span className="font-bold text-emerald-800 font-arabic text-sm">{selectedStudent.quranProgress.currentSurahName}</span> (Ayah {selectedStudent.quranProgress.currentAyah})
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-slate-700">
                    <div>Memorization Score: <strong className="text-emerald-700">{selectedStudent.quranProgress.memorizationScoreAvg}%</strong></div>
                    <div>Tajweed Score: <strong className="text-emerald-700">{selectedStudent.quranProgress.tajweedScoreAvg}%</strong></div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'fees' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-900 text-sm">Financial Account Balance</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedStudent.feeBalance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {selectedStudent.feeBalance === 0 ? 'Settled' : `ETB ${selectedStudent.feeBalance.toLocaleString()} Pending`}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Monthly Tuition: ETB 1,200. Supported payment methods include Telebirr (Merchant 48921) and Commercial Bank of Ethiopia (CBE Birr).
                  </p>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsIdCardOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Generate Official ID Card</span>
                </button>

                {isSuperAdminOrPrincipal && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove student record for ${selectedStudent.firstName} ${selectedStudent.lastName}? This action cannot be undone.`)) {
                        deleteStudent(selectedStudent.id);
                        setIsDetailOpen(false);
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Delete Student Record (Admin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Student ID Card Modal (Front & Back) */}
      {isIdCardOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 no-print">
              <div>
                <h3 className="font-black text-slate-900 text-base">Al-Imran Official Student ID Card</h3>
                <p className="text-xs text-slate-500">Official student identity card with verification QR code</p>
              </div>
              <div className="flex items-center gap-2">
                {isPrintIdAuthorized ? (
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print ID Card</span>
                  </button>
                ) : (
                  <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Print ID: Admin Only</span>
                  </div>
                )}
                <button
                  onClick={() => setIsIdCardOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ID Card Graphics (Card Front & Back) */}
            <div className="space-y-4 flex flex-col items-center">
              {/* ID Card Front */}
              <div className="w-[340px] sm:w-[380px] h-[230px] rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-4 shadow-xl border-2 border-amber-400/40 relative overflow-hidden flex flex-col justify-between select-none">
                {/* Islamic Star background watermark */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-700/20 rounded-full blur-xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2">
                  <MadrasaLogo size="sm" showAmharic={false} />
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-widest">
                      STUDENT ID
                    </span>
                    <span className="text-[9px] font-mono text-emerald-200">
                      {selectedStudent.admissionNumber}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex items-center gap-3 my-auto">
                  <img
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.firstName}
                    className="w-20 h-24 rounded-xl object-cover ring-2 ring-amber-400/80 shadow-md shrink-0"
                  />
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-extrabold text-sm text-white leading-tight">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h4>
                    <p className="text-xs font-arabic font-bold text-amber-300">
                      {selectedStudent.arabicName}
                    </p>
                    <p className="text-[10px] text-emerald-200">
                      Class: <span className="font-bold text-white">{selectedStudent.currentClass}</span>
                    </p>
                    <p className="text-[10px] text-emerald-200">
                      Blood Group: <span className="font-bold text-white">{selectedStudent.bloodGroup}</span>
                    </p>
                    <p className="text-[10px] text-emerald-200">
                      Valid Thru: <span className="font-bold text-amber-300">Aug 2027</span>
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-emerald-700/60 text-[9px] text-emerald-300">
                  <span>CMC Michael, Addis Ababa</span>
                  <span className="font-amharic font-semibold">አል ዒምራን መድረሳ</span>
                </div>
              </div>

              {/* ID Card Back */}
              <div className="w-[340px] sm:w-[380px] h-[230px] rounded-2xl bg-slate-900 text-slate-100 p-4 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between select-none">
                <div className="text-[10px] space-y-1">
                  <span className="font-bold text-amber-400 block uppercase tracking-wider">
                    Emergency & Return Instructions
                  </span>
                  <p className="text-[9px] text-slate-300">
                    If found, please return to Al-Imran CMC Madrasa or contact Principal's office at +251 911 234 567.
                  </p>
                  <div className="bg-slate-800 p-2 rounded-lg text-[9px] text-slate-300 mt-1">
                    <div>Guardian: <strong className="text-white">{selectedStudent.guardianName}</strong></div>
                    <div>Emergency Contact: <strong className="text-amber-300">{selectedStudent.guardianPhone}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  {/* Verification QR Representation */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                    <span className="text-[8px] text-slate-400 max-w-[90px]">
                      Scan to verify student status & Hifz record
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-arabic text-amber-400 text-xs font-bold">توقيع المدير</div>
                    <span className="text-[8px] text-slate-400 block">Authorized Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Student Admission Form Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">New Student Admission (Ethiopia)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic">استمارة تسجيل طالب جديد - مدرسة آل عمران</p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold">Dual-Table Database Sync:</span> Enrolling a student writes their student dossier into the <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">students</code> table and creates their authentication record in <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">profiles</code> for portal access.
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[11px] mb-2">
                  1. Student Personal Information & Photo
                </h3>

                <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <ImageUploadField
                    label="Student Passport Photo / Image"
                    value={formData.photoUrl || ''}
                    onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                    aspectRatio="square"
                    helperText="Upload real student photo for student card and Sanad certificate"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ibrahim"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Last Name / Father *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mustafa"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Arabic Name (الاسم بالعربي)</label>
                    <input
                      type="text"
                      placeholder="إبراهيم مصطفى"
                      value={formData.arabicName}
                      onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-arabic text-sm focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
                    >
                      <option value="male" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Male (Boy)</option>
                      <option value="female" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Female (Girl)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
                    >
                      <option value="O+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">O+</option>
                      <option value="A+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">A+</option>
                      <option value="B+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">B+</option>
                      <option value="AB+" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">AB+</option>
                      <option value="O-" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ethiopian Address & Guardian */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[11px] mb-2">
                  2. Residence & Guardian Details (Ethiopia)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mustafa Ali"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Guardian Phone (Telebirr) *</label>
                    <input
                      type="text"
                      required
                      placeholder="+251 911 ..."
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Sub-City (Addis Ababa)</label>
                    <input
                      type="text"
                      placeholder="e.g. Yeka / Bole"
                      value={formData.subCity}
                      onChange={(e) => setFormData({ ...formData, subCity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Physical Address / Landmark</label>
                    <input
                      type="text"
                      placeholder="CMC Michael, near Sunshine Real Estate, House 42"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Class & Hifz Assignment */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[11px] mb-2">
                  3. Class & Qur'an Hifz Allocation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Assigned Class</label>
                    <input
                      type="text"
                      placeholder="e.g. Class 3-A"
                      value={formData.currentClass}
                      onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Hifz Circle (الحلقة)</label>
                    <select
                      value={formData.hifzCircleName}
                      onChange={(e) => setFormData({ ...formData, hifzCircleName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
                    >
                      <option value="Halqah Imam Asim (Advanced)" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Halqah Imam Asim (Advanced)</option>
                      <option value="Halqah Imam Nafi (Intermediate)" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Halqah Imam Nafi (Intermediate)</option>
                      <option value="Halqah Hafsah bint Umar (Girls)" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Halqah Hafsah bint Umar (Girls)</option>
                      <option value="Halqah Noorani Beginners" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Halqah Noorani Beginners</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Initial Juz Memorized</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={formData.juzCompleted}
                      onChange={(e) => setFormData({ ...formData, juzCompleted: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-98"
                >
                  Complete Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditOpen && editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Edit Student Profile & Dossier
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update student academic allocation, guardian info, and fees
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              {/* Photo & Identity */}
              <div>
                <h3 className="font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2">
                  1. Student Identity & Photo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">First Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.firstName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Last Name (Father's Name) *</label>
                    <input
                      type="text"
                      required
                      value={editingStudent.lastName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Arabic Full Name</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={editingStudent.arabicName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, arabicName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-arabic font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Status</label>
                    <select
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as StudentStatus })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="graduated">Graduated</option>
                      <option value="suspended">Suspended</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Gender</label>
                    <select
                      value={editingStudent.gender}
                      onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as 'male' | 'female' })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium cursor-pointer"
                    >
                      <option value="male">Male (Boy)</option>
                      <option value="female">Female (Girl)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={editingStudent.photoUrl}
                      onChange={(e) => setEditingStudent({ ...editingStudent, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian & Residence */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2">
                  2. Guardian & Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={editingStudent.guardianName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Guardian Phone</label>
                    <input
                      type="text"
                      value={editingStudent.guardianPhone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Sub-City</label>
                    <input
                      type="text"
                      value={editingStudent.subCity}
                      onChange={(e) => setEditingStudent({ ...editingStudent, subCity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Class, Qur'an & Fees */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2">
                  3. Academic Class, Hifz Circle & Fee Balance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Current Class</label>
                    <input
                      type="text"
                      value={editingStudent.currentClass}
                      onChange={(e) => setEditingStudent({ ...editingStudent, currentClass: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Hifz Circle</label>
                    <input
                      type="text"
                      value={editingStudent.hifzCircleName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, hifzCircleName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">Fee Balance (ETB)</label>
                    <input
                      type="number"
                      value={editingStudent.feeBalance}
                      onChange={(e) => setEditingStudent({ ...editingStudent, feeBalance: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-98 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
