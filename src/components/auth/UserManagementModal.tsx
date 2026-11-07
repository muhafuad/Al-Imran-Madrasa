import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  UserPlus,
  Shield,
  Trash2,
  Key,
  CheckCircle2,
  Users,
  Building,
  Mail,
  Phone,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';
import type { UserRole, UserProfile } from '../../types';

interface UserManagementModalProps {
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const { allUsers, registerUserByAdmin, deleteUserAccount, updateUserPassword, t, currentUser } = useMadrasa();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Alimran2026!');
  const [phone, setPhone] = useState('+251 911 000000');
  const [role, setRole] = useState<UserRole>('teacher');
  const [assignedClasses, setAssignedClasses] = useState('Class 4-A, Class 8-B');
  const [assignedSubjects, setAssignedSubjects] = useState("Qur'an, Tajweed, Aqeedah");
  const [loading, setLoading] = useState(false);

  // Password reset inline modal
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState('');

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'principal', title: 'Principal (Madrasa Director)', desc: 'Full academic & staff administrative supervision' },
    { role: 'vice_principal', title: 'Vice Principal', desc: 'Academic scheduling and curriculum oversight' },
    { role: 'registrar', title: 'Registrar', desc: 'Student admissions, enrollment & certificates' },
    { role: 'finance_officer', title: 'Finance Officer', desc: 'Fee collections, Telebirr/CBE receipts & accounting' },
    { role: 'hifz_teacher', title: 'Hifz Ustaz / Sheikh', desc: 'Qur\'an memorization recording (Sabaq, Sabqi, Muraja\'ah)' },
    { role: 'teacher', title: 'Academic / Islamic Studies Teacher', desc: 'Class attendance, homework & exam grading' },
    { role: 'parent', title: 'Parent Account', desc: 'View student progress, reports & pay fees online' },
    { role: 'student', title: 'Student Account', desc: 'View Qur\'an progress, timetable & homework' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredUsers = allUsers.filter((usr) => {
    const matchesSearch =
      usr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.arabicName && usr.arabicName.includes(searchQuery)) ||
      (usr.email && usr.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (usr.phone && usr.phone.includes(searchQuery));
    const matchesRole = filterRole === 'all' || usr.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Permanently remove staff account and revoke role permissions for "${userName}"?`)) {
      setDeletingId(userId);
      try {
        await deleteUserAccount(userId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required.');
      return;
    }

    setLoading(true);
    try {
      await registerUserByAdmin({
        name,
        arabicName,
        email,
        password,
        role,
        phone,
        assignedClasses: assignedClasses.split(',').map(s => s.trim()).filter(Boolean),
        assignedSubjects: assignedSubjects.split(',').map(s => s.trim()).filter(Boolean),
      });
      setName('');
      setArabicName('');
      setEmail('');
      setPassword('Alimran2026!');
      setActiveTab('list');
    } catch (err: any) {
      alert('Error registering staff: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const roleColorMap: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    principal: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    vice_principal: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
    registrar: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    finance_officer: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    teacher: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    hifz_teacher: 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
    parent: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    student: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Admin Staff & Role Registration (RBAC)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create accounts for Principals, Teachers, Finance Officers & assign system permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active System Users ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'add'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Staff / Teacher</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff by name, email, phone..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Roles ({allUsers.length})</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="principal">Principal</option>
                  <option value="vice_principal">Vice Principal</option>
                  <option value="registrar">Registrar</option>
                  <option value="finance_officer">Finance Officer</option>
                  <option value="hifz_teacher">Hifz Ustaz / Sheikh</option>
                  <option value="teacher">Academic Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  {allUsers.length === 0
                    ? 'No staff accounts registered. Click "Register New Staff" above to create one.'
                    : 'No users found matching the selected filter or search query.'}
                </div>
              ) : (
                filteredUsers.map((usr) => (
                  <div
                    key={usr.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {usr.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{usr.name}</span>
                          {usr.arabicName && (
                            <span className="text-xs font-arabic text-emerald-600 dark:text-emerald-400">({usr.arabicName})</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{usr.email}</span>
                          <span>•</span>
                          <span>{usr.phone}</span>
                        </div>
                        {usr.assignedClasses && usr.assignedClasses.length > 0 && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{usr.assignedClasses.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColorMap[usr.role]}`}>
                        {usr.role.replace('_', ' ').toUpperCase()}
                      </span>

                      <button
                        onClick={() => {
                          setResetTargetUser(usr);
                          setNewPasswordVal('');
                          setResetSuccessNotice('');
                        }}
                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors cursor-pointer"
                        title="Set or Reset User Password (Syncs with Cloud DB)"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      {usr.id !== currentUser?.id && usr.role !== 'super_admin' && (
                        <button
                          disabled={deletingId === usr.id}
                          onClick={() => handleDeleteUser(usr.id, usr.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User and Revoke Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Password Reset Modal */}
              {resetTargetUser && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>Update Cloud Password for {resetTargetUser.name}</span>
                    </div>
                    <button
                      onClick={() => setResetTargetUser(null)}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {resetSuccessNotice ? (
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{resetSuccessNotice}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        placeholder="Enter new password (min 4 characters)..."
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        disabled={resettingPassword || !newPasswordVal.trim()}
                        onClick={async () => {
                          if (!newPasswordVal || newPasswordVal.length < 4) {
                            alert('Password must be at least 4 characters long.');
                            return;
                          }
                          setResettingPassword(true);
                          const res = await updateUserPassword(resetTargetUser.id, newPasswordVal);
                          setResettingPassword(false);
                          if (res.success) {
                            setResetSuccessNotice(`Password updated & synced to Supabase database!`);
                            setTimeout(() => {
                              setResetTargetUser(null);
                              setResetSuccessNotice('');
                            }, 1800);
                          } else {
                            alert(res.message || 'Error updating password');
                          }
                        }}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {resettingPassword ? 'Saving to Database...' : 'Save Password'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold">Dual-Table Insertion:</span> When registering any user, credentials and role permissions are recorded in the central <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">profiles</code> table (and Supabase Auth), while their domain-specific record is simultaneously inserted into their dedicated database table (<code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">teachers</code> for instructors, <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">students</code> for learners).
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Staff Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ustaz Bilal Dawud"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Arabic Name (الاسم بالعربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    placeholder="أستاذ بلال داود"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bilal@alimran-madrasa.et"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone (Ethiopia)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 000 000"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    {rolesList.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(role === 'teacher' || role === 'hifz_teacher') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">Assigned Classes</label>
                    <input
                      type="text"
                      value={assignedClasses}
                      onChange={(e) => setAssignedClasses(e.target.value)}
                      placeholder="Class 1-A, Class 2-B"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">Assigned Subjects / Halqah</label>
                    <input
                      type="text"
                      value={assignedSubjects}
                      onChange={(e) => setAssignedSubjects(e.target.value)}
                      placeholder="Qur'an Recitation, Tajweed"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Registering Staff Member...' : 'Register Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
