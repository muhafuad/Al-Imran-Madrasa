import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { Teacher } from '../../types';
import { AccessDenied } from '../common/AccessDenied';
import { ImageUploadField } from '../common/ImageUploadField';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  Users,
  UserCheck,
  PlusCircle,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  BookOpen,
  Calendar,
  Building,
  DollarSign,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const { teachers, addTeacher, deleteTeacher, currentUser } = useMadrasa();

  // Role Protection
  if (
    currentUser?.role !== 'super_admin' &&
    currentUser?.role !== 'principal' &&
    currentUser?.role !== 'vice_principal'
  ) {
    return (
      <AccessDenied
        pageName="Staff & Teachers Management"
        arabicPageName="إدارة هيئة التدريس والمشايخ"
        requiredRoles={['super_admin', 'principal', 'vice_principal']}
      />
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    arabicName: '',
    email: '',
    phone: '+251 9',
    role: 'hifz_teacher' as 'teacher' | 'hifz_teacher',
    gender: 'male' as 'male' | 'female',
    qualifications: 'B.A. Islamic Studies, Al-Azhar University',
    islamicCertificates: "Ijazah in Hafs 'an Asim, Tajweed & Qira'at",
    experienceYears: 5,
    subjects: "Qur'an Recitation, Tajweed, Aqeedah",
    assignedClasses: 'Class 4-A, Class 8-B',
    monthlySalary: 14500,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active' as 'active' | 'on_leave' | 'inactive',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      alert('Please fill in teacher full name and email address.');
      return;
    }

    addTeacher({
      fullName: formData.fullName,
      arabicName: formData.arabicName || formData.fullName,
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone,
      gender: formData.gender,
      role: formData.role,
      qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(Boolean),
      islamicCertificates: formData.islamicCertificates.split(',').map(c => c.trim()).filter(Boolean),
      experienceYears: Number(formData.experienceYears) || 1,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      assignedClasses: formData.assignedClasses.split(',').map(c => c.trim()).filter(Boolean),
      monthlySalary: Number(formData.monthlySalary) || 12000,
      joinDate: new Date().toISOString().split('T')[0],
      photoUrl: formData.photoUrl,
      status: formData.status,
    });

    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      arabicName: '',
      email: '',
      phone: '+251 9',
      role: 'hifz_teacher',
      gender: 'male',
      qualifications: 'B.A. Islamic Studies, Al-Azhar University',
      islamicCertificates: "Ijazah in Hafs 'an Asim, Tajweed & Qira'at",
      experienceYears: 5,
      subjects: "Qur'an Recitation, Tajweed, Aqeedah",
      assignedClasses: 'Class 4-A, Class 8-B',
      monthlySalary: 14500,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'active',
    });
  };

  const filteredTeachers = teachers.filter(t => {
    const name = t.fullName || '';
    const arabic = t.arabicName || '';
    const email = t.email || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arabic.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRole === 'all' || t.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Faculty & Shuyookh Database"
        arabicPageName="إدارة هيئة التدريس والمشايخ"
        recordCount={teachers.length}
        recordLabel="Faculty Members"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Faculty &amp; Shuyookh Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {teachers.length} Active Instructors
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic mt-0.5">
            إدارة هيئة التدريس، المشايخ، ومقرئي القرآن الكريم بالسند
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Faculty Member</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by instructor name, Arabic title, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="all">All Roles &amp; Specializations</option>
            <option value="hifz_teacher">Hifz Sheikh (تحفيظ القرآن)</option>
            <option value="teacher">Academic &amp; Islamic Studies Teacher</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3">
                <img
                  src={teacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={teacher.fullName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {teacher.fullName}
                  </h3>
                  <p className="text-xs font-arabic font-bold text-emerald-800 dark:text-emerald-400 mt-0.5 truncate">
                    {teacher.arabicName}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {teacher.role === 'hifz_teacher' ? "Qur'an Hifz Sheikh" : 'Islamic Studies Teacher'}
                  </span>
                </div>
              </div>

              {/* Qualifications & Subjects */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Sanad &amp; Certifications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(teacher.islamicCertificates || teacher.qualifications || []).map((q, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  {teacher.assignedClasses && teacher.assignedClasses.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Classes: <strong>{teacher.assignedClasses.join(', ')}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                ETB {(teacher.monthlySalary || 0).toLocaleString()}
                <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  teacher.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {teacher.status || 'active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Faculty Member / Sheikh</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic">تسجيل شيخ / معلّم جديد مع حساب الدخول المباشر</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">Dual-Table Synchronization:</span> Registering an instructor automatically inserts their entry into Supabase <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">teachers</code> AND provisions a login in <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">profiles</code>.
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                <ImageUploadField
                  label="Faculty Profile Photo / Image"
                  value={formData.photoUrl || ''}
                  onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                  aspectRatio="square"
                  helperText="Upload instructor photo for staff ID and attendance records"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sheikh Bilal Ibrahim"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-800 dark:text-slate-200 font-bold">Arabic Name (الاسم بالعربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="الشيخ بلال إبراهيم"
                    value={formData.arabicName}
                    onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl font-arabic focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="bilal@alimran-madrasa.et"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Role / Position</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="hifz_teacher">Hifz Ustaz / Sheikh (تحفيظ القرآن)</option>
                    <option value="teacher">Academic / Islamic Studies Teacher</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Telephone</label>
                  <input
                    type="text"
                    placeholder="+251 9..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Assigned Classes</label>
                  <input
                    type="text"
                    value={formData.assignedClasses}
                    onChange={(e) => setFormData({ ...formData, assignedClasses: e.target.value })}
                    placeholder="Class 1-A, Class 3-B"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">Sanad &amp; Ijazah Certifications</label>
                <input
                  type="text"
                  placeholder="e.g. Ijazah Hafs 'an Asim, Al-Azhar Certification"
                  value={formData.islamicCertificates}
                  onChange={(e) => setFormData({ ...formData, islamicCertificates: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Monthly Salary (ETB)</label>
                  <input
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="male">Male (معلم / شيخ)</option>
                    <option value="female">Female (معلمة / أستاذة)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  Register Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
