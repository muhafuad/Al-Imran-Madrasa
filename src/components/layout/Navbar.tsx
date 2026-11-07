import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import {
  Bell,
  Search,
  Building,
  BookOpen,
  Receipt,
  CheckCircle2,
  ChevronDown,
  Shield,
  Sun,
  Moon,
  Globe,
  UserPlus,
  LogOut,
  LogIn,
  Key,
  Users,
  Menu,
  Database,
  Cloud,
  Heart,
  ExternalLink,
} from 'lucide-react';
import type { UserRole } from '../../types';
import type { Language } from '../../i18n/translations';
import { UserManagementModal } from '../auth/UserManagementModal';
import { LoginModal } from '../auth/LoginModal';
import { SupabaseConnectModal } from '../common/SupabaseConnectModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    switchRole,
    logoutUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    currentMadrasaBranch,
    allUsers,
    isSupabaseActive,
    isSyncing,
  } = useMadrasa();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    super_admin: { label: t.super_admin, bg: 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-300' },
    principal: { label: t.principal, bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300' },
    vice_principal: { label: t.vice_principal, bg: 'bg-teal-100 dark:bg-teal-950/80 border-teal-300 dark:border-teal-800', text: 'text-teal-800 dark:text-teal-300' },
    registrar: { label: t.registrar, bg: 'bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300' },
    finance_officer: { label: t.finance_officer, bg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300' },
    teacher: { label: t.teacher, bg: 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800', text: 'text-indigo-800 dark:text-indigo-300' },
    hifz_teacher: { label: t.hifz_teacher, bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700', text: 'text-emerald-900 dark:text-emerald-300' },
    parent: { label: t.parent, bg: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800', text: 'text-rose-800 dark:text-rose-300' },
    student: { label: t.student, bg: 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-300 dark:border-cyan-800', text: 'text-cyan-800 dark:text-cyan-300' },
  };

  const userRole = currentUser?.role || 'super_admin';
  const roleConfig = roleLabels[userRole] || { label: userRole, bg: 'bg-slate-100', text: 'text-slate-800' };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 lg:px-8 py-2.5 transition-colors duration-200 no-print text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Sidebar Toggle + Brand Logo */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Sidebar Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <MadrasaLogo size="md" />

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentMadrasaBranch}</span>
            </div>

            {/* Supabase Cloud Connection Status Badge (Admin Only) */}
            {(currentUser?.role === 'super_admin' || currentUser?.role === 'principal') && (
              <button
                onClick={() => setShowSupabaseModal(true)}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  isSupabaseActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
                title="Click to configure Supabase Cloud Database"
              >
                <Database className={`w-3 h-3 ${isSupabaseActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{isSupabaseActive ? 'Supabase Live' : 'Supabase Ready'}</span>
                {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
              </button>
            )}
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-850 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Actions, Theme, Language, Notifications, User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Action Button */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setActiveTab('landing')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition-all active:scale-95 cursor-pointer"
                title="View Public Madrasa Landing Website"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ar' ? 'الموقع العام' : language === 'am' ? 'የመድረሳው ገጽ' : 'Public Site'}</span>
              </button>

              <button
                onClick={() => setActiveTab('donate')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Waqf & Donations Portal"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>{language === 'ar' ? 'الوقف والتبرع' : language === 'am' ? 'ሰደቃና ዋቅፍ' : 'Waqf Fund'}</span>
              </button>

              <button
                onClick={() => setActiveTab('quran')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.sabaq.split(' ')[0]}</span>
              </button>
            </div>

            {/* Supabase Live DB Status & Sync Button (Visible ONLY to Super Admin) */}
            {currentUser?.role === 'super_admin' && (
              <button
                onClick={() => setShowSupabaseModal(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSupabaseActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                }`}
                title="Supabase PostgreSQL Cloud Connection & CRUD Settings (Super Admin Only)"
              >
                <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                <span className="hidden md:inline font-bold">
                  {isSupabaseActive ? (isSyncing ? 'Syncing DB...' : 'Supabase Live') : 'Connect Supabase'}
                </span>
                <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              </button>
            )}

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowUserMenu(false);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                title={t.language}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { code: 'en', label: 'English', flag: '🇬🇧' },
                    { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
                    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as Language);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        language === item.code
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title={theme === 'dark' ? t.dayMode : t.nightMode}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:text-indigo-600 transition-transform" />
              )}
            </button>

            {/* Realtime Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                  setShowLangMenu(false);
                }}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors border border-slate-200 dark:border-slate-700"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">Notifications</span>
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 my-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account & Role Profile Menu */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                    setShowLangMenu(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <div className="text-xs font-bold text-slate-900 dark:text-white max-w-[100px] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      {roleConfig.label}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.login}</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {showUserMenu && currentUser && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in duration-100">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.bg} ${roleConfig.text}`}>
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs">
                    {/* Super Admin / Principal Quick Action: User Registration */}
                    {(currentUser.role === 'super_admin' || currentUser.role === 'principal') && (
                      <button
                        onClick={() => {
                          setShowUserManagement(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">{t.registerStaffMember}</span>
                      </button>
                    )}

                    {/* Teacher shortcuts (visible only for teachers/hifz_teachers) */}
                    {(currentUser.role === 'teacher' || currentUser.role === 'hifz_teacher') && (
                      <div className="space-y-0.5 pb-1">
                        <button
                          onClick={() => {
                            setActiveTab('quran');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hifz Circles & Sabaq</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('attendance');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Mark Attendance</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('exams');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-500" />
                          <span>Exams & Grading</span>
                        </button>
                      </div>
                    )}

                    {/* Role Switcher (Visible ONLY for Super Admin) */}
                    {currentUser.role === 'super_admin' && (
                      <div className="pt-2">
                        <div className="pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Role Switcher ({allUsers.length})</span>
                          <span className="text-[9px] text-purple-600 dark:text-purple-400 font-mono font-bold">Admin Only</span>
                        </div>

                        <div className="max-h-36 overflow-y-auto space-y-0.5">
                          {allUsers.map((usr) => (
                            <button
                              key={usr.id}
                              onClick={() => {
                                switchRole(usr.role);
                                setShowUserMenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                                currentUser.id === usr.id
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-700 dark:text-emerald-300'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate">{usr.name}</span>
                              <span className="text-[9px] uppercase font-mono opacity-70">{usr.role.replace('_', ' ')}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                      {(currentUser.role === 'super_admin' || currentUser.role === 'principal') && (
                        <button
                          onClick={() => {
                            setShowSupabaseModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-medium transition-colors"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Supabase Database Config</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logoutUser();
                          setShowUserMenu(false);
                          setShowLoginModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        onClick={() => {
                          logoutUser();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagementModal onClose={() => setShowUserManagement(false)} />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Supabase Connect Modal (Super Admin Only) */}
      {showSupabaseModal && currentUser?.role === 'super_admin' && (
        <SupabaseConnectModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
      )}
    </>
  );
};
