import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  FileSpreadsheet,
  Receipt,
  BookMarked,
  Package,
  Library,
  Megaphone,
  Award,
  Settings,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  UserPlus,
  X,
  Globe,
  Heart,
  UserCheck,
  Database,
  CheckCircle2,
} from 'lucide-react';
import type { UserRole } from '../../types';
import { UserManagementModal } from '../auth/UserManagementModal';
import { SupabaseConnectModal } from '../common/SupabaseConnectModal';
import { canViewDatabaseBanner } from '../../utils/permissions';

interface NavItem {
  id: string;
  labelKey?: 'dashboard' | 'students' | 'teachers' | 'quranMemorization' | 'attendance' | 'subjectsCurriculum' | 'examsReports' | 'financeFees' | 'homework' | 'inventory' | 'library' | 'announcements' | 'certificatesSanad' | 'settings';
  customLabel?: string;
  arabicLabel: string;
  amharicLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  allowedRoles?: UserRole[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    students,
    teachers,
    notifications,
    entranceApplications,
    isSupabaseActive,
    isSyncing,
    t,
    language,
  } = useMadrasa();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingAssessmentsCount = (entranceApplications || []).filter(
    a => a.status === 'pending' || a.status === 'scheduled' || a.status === 'assessed'
  ).length;
  const userRole = currentUser?.role || 'super_admin';

  const navItems: NavItem[] = [
    {
      id: 'landing',
      customLabel: 'Public Website',
      arabicLabel: 'الموقع التعريفي العام',
      amharicLabel: 'የመድረሳው ገጽ',
      icon: Globe,
      badge: 'Public',
      badgeColor: 'bg-teal-900/60 text-teal-300 border border-teal-700 text-[9px]',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'finance_officer', 'teacher', 'hifz_teacher', 'parent', 'student'],
    },
    {
      id: 'donate',
      customLabel: 'Waqf & Donations',
      arabicLabel: 'الوقف والصدقة الجارية',
      amharicLabel: 'ሰደቃና ዋቅፍ',
      icon: Heart,
      badge: 'Waqf',
      badgeColor: 'bg-amber-900/60 text-amber-300 border border-amber-700 text-[9px]',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'finance_officer', 'teacher', 'hifz_teacher', 'parent', 'student'],
    },
    {
      id: 'dashboard',
      labelKey: 'dashboard',
      customLabel: userRole === 'student' ? 'My Student Portal' : userRole === 'parent' ? 'Family Portal' : userRole === 'finance_officer' ? 'Finance Dashboard' : userRole === 'hifz_teacher' ? 'Tahfeez Dashboard' : userRole === 'teacher' ? 'Teacher Dashboard' : 'Executive Dashboard',
      arabicLabel: userRole === 'student' ? 'بوابة الطالب الشخصية' : userRole === 'parent' ? 'بوابة ولي الأمر' : userRole === 'finance_officer' ? 'لوحة المالية والحسابات' : userRole === 'hifz_teacher' ? 'لوحة التحفيظ والإقراء' : userRole === 'teacher' ? 'لوحة المعلم والتدريس' : 'لوحة التحكم والمتابعة',
      amharicLabel: userRole === 'student' ? 'የተማሪ ገጽ' : userRole === 'parent' ? 'የወላጅ ገጽ' : userRole === 'finance_officer' ? 'የፋይናንስ ዳሽቦርድ' : userRole === 'hifz_teacher' ? 'የሂፍዝ ዳሽቦርድ' : userRole === 'teacher' ? 'የአስተማሪ ዳሽቦርድ' : 'ዋና ዳሽቦርድ',
      icon: LayoutDashboard,
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'finance_officer', 'hifz_teacher', 'teacher', 'parent', 'student'],
    },
    {
      id: 'quran',
      labelKey: 'quranMemorization',
      customLabel: userRole === 'student' ? 'My Qur\'an Progress' : userRole === 'parent' ? 'Children\'s Hifz Tracker' : 'Qur\'an Hifz & Muraja\'ah',
      arabicLabel: userRole === 'student' ? 'متابعة حفظي للقرآن' : userRole === 'parent' ? 'متابعة حفظ الأبناء' : 'تحفيظ القرآن والمراجعة',
      amharicLabel: userRole === 'student' ? 'የእኔ ቁርኣን ሂፍዝ' : userRole === 'parent' ? 'የልጆች ቁርኣን ክትትል' : 'ቁርኣንና ሂፍዝ',
      icon: BookOpen,
      badge: '30 Juz',
      badgeColor: 'bg-amber-100 text-amber-900 font-bold dark:bg-amber-950 dark:text-amber-300',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'hifz_teacher', 'student', 'parent'],
    },
    {
      id: 'homework',
      labelKey: 'homework',
      customLabel: userRole === 'student' ? 'My Homework & Recitations' : userRole === 'parent' ? 'Children\'s Homework' : 'Homework & Assignments',
      arabicLabel: userRole === 'student' ? 'واجباتي وتلاواتي الصوتية' : userRole === 'parent' ? 'واجبات الأبناء والتكاليف' : 'الواجبات والتكاليف',
      amharicLabel: userRole === 'student' ? 'የእኔ የቤት ስራና ንባብ' : userRole === 'parent' ? 'የልጆች የቤት ስራ' : 'የቤት ስራና ምዘና',
      icon: GraduationCap,
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'teacher', 'hifz_teacher', 'student', 'parent'],
    },
    {
      id: 'attendance',
      labelKey: 'attendance',
      customLabel: userRole === 'student' ? 'My Attendance Record' : userRole === 'parent' ? 'Children\'s Attendance' : 'Attendance Register',
      arabicLabel: userRole === 'student' ? 'سجل حضوري وغيابي' : userRole === 'parent' ? 'حضور وغياب الأبناء' : 'سجل الحضور والغياب',
      amharicLabel: userRole === 'student' ? 'የእኔ የሰዓት ክትትል' : userRole === 'parent' ? 'የልጆች ክትትል' : 'የተማሪዎች ክትትል',
      icon: CalendarCheck,
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'hifz_teacher', 'teacher', 'student', 'parent'],
    },
    {
      id: 'exams',
      labelKey: 'examsReports',
      customLabel: userRole === 'student' ? 'My Term Report Card' : userRole === 'parent' ? 'Children\'s Report Cards' : 'Exams & Report Cards',
      arabicLabel: userRole === 'student' ? 'شهادتي وكشف درجاتي' : userRole === 'parent' ? 'كشوف درجات الأبناء' : 'الاختبارات والشهادات',
      amharicLabel: userRole === 'student' ? 'የእኔ ሪፖርት ካርድ' : userRole === 'parent' ? 'የልጆች ሪፖርት ካርድ' : 'ፈተናዎችና ሪፖርት ካርድ',
      icon: FileSpreadsheet,
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'teacher', 'student', 'parent'],
    },
    {
      id: 'finance',
      labelKey: 'financeFees',
      customLabel: userRole === 'student' || userRole === 'parent' ? 'Tuition & Payment' : 'Fees & Financial Ledger',
      arabicLabel: userRole === 'student' || userRole === 'parent' ? 'الرسوم ودفع الأقساط' : 'الرسوم والمالية والميزانية',
      amharicLabel: userRole === 'student' || userRole === 'parent' ? 'ክፍያና ደረሰኝ' : 'ክፍያና ፋይናንስ',
      icon: Receipt,
      badge: 'Telebirr/CBE',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px]',
      allowedRoles: ['super_admin', 'principal', 'finance_officer', 'parent', 'student'],
    },
    {
      id: 'assessment',
      customLabel: userRole === 'parent' ? 'Enroll New Child' : 'Entrance Assessment',
      arabicLabel: userRole === 'parent' ? 'تسجيل طالب جديد' : 'اختبار القبول والمستوى',
      amharicLabel: userRole === 'parent' ? 'አዲስ ተማሪ ምዝገባ' : 'የመግቢያ ምዘናና ምዝገባ',
      icon: UserCheck,
      badge: pendingAssessmentsCount > 0 && userRole !== 'parent' ? `${pendingAssessmentsCount} Pending` : undefined,
      badgeColor: 'bg-emerald-600 text-white font-semibold text-[9px] shadow-sm',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'parent'],
    },
    {
      id: 'students',
      labelKey: 'students',
      customLabel: userRole === 'student' ? 'My Student Dossier' : userRole === 'parent' ? "My Children's Records" : userRole === 'finance_officer' ? 'Student Fee Directory' : userRole === 'hifz_teacher' ? 'My Halqah Students' : userRole === 'teacher' ? 'My Class Students' : 'Student Records',
      arabicLabel: userRole === 'student' ? 'ملفي وبياناتي' : userRole === 'parent' ? 'ملفات الأبناء' : userRole === 'finance_officer' ? 'سجل رسوم الطلاب' : userRole === 'hifz_teacher' ? 'طلاب حلقتي' : userRole === 'teacher' ? 'طلاب فصولي' : 'شؤون الطلاب والقبول',
      amharicLabel: userRole === 'student' ? 'የእኔ የተማሪ መረጃ' : userRole === 'parent' ? 'የልጆች የተማሪ መረጃ' : userRole === 'finance_officer' ? 'የተማሪዎች ክፍያ ማውጫ' : userRole === 'hifz_teacher' ? 'የሀለቃዬ ተማሪዎች' : userRole === 'teacher' ? 'የክፍሌ ተማሪዎች' : 'የተማሪዎች ማውጫ',
      icon: Users,
      badge: userRole === 'student' ? 1 : students.length,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'finance_officer', 'hifz_teacher', 'teacher', 'student', 'parent'],
    },
    {
      id: 'teachers',
      labelKey: 'teachers',
      customLabel: userRole === 'student' || userRole === 'parent' ? 'Faculty & Ustazs' : 'Faculty & Ustazs',
      arabicLabel: 'هيئة التدريس والمشايخ',
      amharicLabel: 'አስተማሪዎችና ኡስታዞች',
      icon: ShieldCheck,
      badge: teachers.length,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'teacher', 'hifz_teacher', 'student', 'parent'],
    },
    {
      id: 'subjects',
      labelKey: 'subjectsCurriculum',
      arabicLabel: 'المناهج والعلوم الشرعية',
      amharicLabel: 'ስርዓተ-ትምህርትና ኪታቦች',
      icon: BookMarked,
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'teacher', 'hifz_teacher', 'student', 'parent'],
    },
    {
      id: 'certificates',
      labelKey: 'certificatesSanad',
      customLabel: userRole === 'student' || userRole === 'parent' ? 'My Certificates & Sanad' : 'Certificates & Sanad Issuance',
      arabicLabel: userRole === 'student' || userRole === 'parent' ? 'شهاداتي وإجازاتي' : 'الإجازات والشهادات المعتمدة',
      amharicLabel: userRole === 'student' || userRole === 'parent' ? 'የእኔ ሰርተፊኬቶች' : 'የሂፍዝ ሰነድና ሰርተፊኬት',
      icon: Award,
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'hifz_teacher', 'student', 'parent'],
    },
    {
      id: 'id_cards',
      customLabel: 'ID Cards & Badges',
      arabicLabel: 'البطاقات الجامعية والتعريفية',
      amharicLabel: 'የመታወቂያ ካርዶች',
      icon: ShieldCheck,
      badge: 'Admin Print',
      badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px]',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar'],
    },
    {
      id: 'audit_trail',
      customLabel: 'Audit Trail & Logs',
      arabicLabel: 'سجل العمليات والأمان',
      amharicLabel: 'የኦዲትና እንቅስቃሴ መዝገብ',
      icon: Sparkles,
      badge: 'Super Admin',
      badgeColor: 'bg-purple-950 text-purple-300 border border-purple-800 text-[9px]',
      allowedRoles: ['super_admin', 'principal'],
    },
    {
      id: 'communication',
      labelKey: 'announcements',
      arabicLabel: 'الإعلانات والتعاميم',
      amharicLabel: 'ማስታወቂያዎች',
      icon: Megaphone,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: 'bg-rose-500 text-white',
      allowedRoles: ['super_admin', 'principal', 'vice_principal', 'registrar', 'finance_officer', 'teacher', 'hifz_teacher', 'parent', 'student'],
    },
    {
      id: 'settings',
      labelKey: 'settings',
      arabicLabel: 'الإعدادات وقاعدة البيانات',
      amharicLabel: 'ቅንብሮችና ሱፓቤዝ',
      icon: Settings,
      allowedRoles: ['super_admin', 'principal'],
    },
  ];

  // Filter navigation items by role
  const visibleNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 lg:w-72 bg-slate-900 dark:bg-slate-950 text-slate-200 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 min-h-[calc(100vh-60px)] select-none no-print transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="p-3 lg:p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Header on mobile with close button */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 lg:hidden">
            <span className="text-xs font-bold text-slate-300">Navigation Menu</span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>{language === 'ar' ? 'القائمة الرئيسية' : language === 'am' ? 'ዋና ማውጫ' : 'Menu & Modules'}</span>
            <span className="font-mono text-[9px] text-emerald-400 font-semibold uppercase">{userRole.replace('_', ' ')}</span>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = item.customLabel
                ? (language === 'ar' ? item.arabicLabel : language === 'am' ? item.amharicLabel : item.customLabel)
                : (item.labelKey ? t[item.labelKey] : item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <div className="flex flex-col items-start leading-tight text-left">
                      <span>{label}</span>
                      {language === 'en' && (
                        <span className="text-[9px] text-slate-400 font-arabic opacity-70">
                          {item.arabicLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Staff Management CTA for Admin / Principal */}
        <div className="p-3 lg:p-4 border-t border-slate-800 space-y-2">
          {/* Supabase DB Connectivity Status Pill (Staff & Admin only) */}
          {canViewDatabaseBanner(userRole) && (
            <button
              onClick={() => {
                if (userRole === 'super_admin' || userRole === 'principal') {
                  setShowSupabaseModal(true);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium border transition-all ${
                isSupabaseActive
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/70'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="truncate">{isSupabaseActive ? 'Supabase Connected' : 'Supabase Local Storage'}</span>
              </div>
              {isSyncing ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              )}
            </button>
          )}

          {(userRole === 'super_admin' || userRole === 'principal') && (
            <button
              onClick={() => setShowUserModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.registerStaffMember}</span>
            </button>
          )}

          <div className="px-2 text-[10px] text-slate-500 text-center">
            <span>Al-Imran Madrasa System v2.0 • Ethiopia</span>
          </div>
        </div>
      </aside>

      {showUserModal && (
        <UserManagementModal onClose={() => setShowUserModal(false)} />
      )}

      {showSupabaseModal && (
        <SupabaseConnectModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
      )}
    </>
  );
};
