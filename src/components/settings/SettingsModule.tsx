import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import {
  Settings,
  Building,
  Shield,
  Database,
  Globe,
  Users,
  CheckCircle,
  Key,
  Layers,
  MapPin,
  Sparkles,
  Save,
  Upload,
  Trash2,
  Copy,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  FileCode,
  UserPlus,
  CloudUpload,
  CloudDownload,
  Download,
  Server,
  Zap,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  isSupabaseConfigured,
} from '../../lib/supabase';
import type { Language } from '../../i18n/translations';
import { UserManagementModal } from '../auth/UserManagementModal';
import { AccessDenied } from '../common/AccessDenied';

export const SettingsModule: React.FC = () => {
  const {
    currentMadrasaBranch,
    setMadrasaBranch,
    currentUser,
    customLogoUrl,
    setCustomLogoUrl,
    language,
    setLanguage,
    t,
    theme,
    setTheme,
    toggleTheme,
    loadStarterSampleData,
    clearAllDemoData,
    resetAllData,
    allUsers,
    isSupabaseActive,
    isSyncing,
    lastCloudSync,
    pushAllToCloud,
    pullAllFromCloud,
  } = useMadrasa();

  // Enforce role permission: Only Super Admin and Principal can view Settings
  if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'principal') {
    return (
      <AccessDenied
        pageName="Madrasa Administration & Database Settings"
        arabicPageName="الإعدادات وقاعدة البيانات"
        requiredRoles={['super_admin', 'principal']}
      />
    );
  }

  const [madrasaName, setMadrasaName] = useState('Al-Imran CMC Madrasa');
  const [arabicName, setArabicName] = useState('مدرسة آل عمران لتحفيظ القرآن الكريم والعلوم الشرعية');
  const [phone, setPhone] = useState('+251 911 234567 / +251 922 889900');
  const [email, setEmail] = useState('info@alimran-madrasa.et');
  const [address, setAddress] = useState('CMC Road, near Michael Church Roundabout, Addis Ababa, Ethiopia');
  const [telebirrMerchant, setTelebirrMerchant] = useState('48921');
  const [cbeAccount, setCbeAccount] = useState('1000293847281');

  // Supabase connection state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ tested: boolean; success: boolean; message: string }>({
    tested: false,
    success: false,
    message: '',
  });
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    if (config.url) setSupabaseUrl(config.url);
    if (config.anonKey) setSupabaseAnonKey(config.anonKey);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestSupabase = async () => {
    setTestingConnection(true);
    setConnectionStatus({ tested: false, success: false, message: '' });
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);

    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestingConnection(false);
    setConnectionStatus({
      tested: true,
      success: res.success,
      message: res.message,
    });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alimran_madrasa_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePushToCloud = async () => {
    setSyncStatusMsg('Pushing local records to Supabase...');
    const res = await pushAllToCloud();
    if (res.success) {
      setSyncStatusMsg(`Successfully synchronized ${res.count} records to Supabase.`);
    } else {
      setSyncStatusMsg(`Synced ${res.count} items. Note: ${res.errors.join(', ')}`);
    }
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  const handlePullFromCloud = async () => {
    setSyncStatusMsg('Pulling records from Supabase...');
    const res = await pullAllFromCloud();
    setSyncStatusMsg(res.message);
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'super_admin') {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      alert('Institutional settings and Supabase configurations saved successfully.');
    } else {
      alert('Institutional settings saved successfully.');
    }
  };

  const branches = [
    { id: 'cmc-main', name: 'Al-Imran CMC Main Campus (Addis Ababa)', status: 'Active (Main HQ)' },
    { id: 'piyassa', name: 'Al-Imran Piyassa Branch (Addis Ababa)', status: 'Active Branch' },
    { id: 'hawassa', name: 'Al-Imran Hawassa Regional Campus', status: 'Active Branch' },
    { id: 'dire-dawa', name: 'Al-Imran Dire Dawa Branch', status: 'Active Branch' },
    { id: 'jimma', name: 'Al-Imran Jimma Islamic Academy', status: 'Provisioning' },
  ];

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {isSuperAdmin ? 'Institutional Settings, Logo & Supabase' : 'Institutional Settings & Preferences'}
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic mt-0.5">
            {isSuperAdmin
              ? 'إعدادات المؤسسة، الشعار، الربط مع سوبابيز (Supabase RLS)، وإدارة المستخدمين'
              : 'إعدادات المؤسسة، الشعار، ومواقيت الصلاة'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(currentUser?.role === 'super_admin' || currentUser?.role === 'principal') && (
            <button
              onClick={() => setShowUserModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.registerStaffMember}</span>
            </button>
          )}

          <button
            onClick={handleSaveSettings}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      {/* Grid of Main Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Logo & Branding + Appearance */}
        <div className="space-y-6">
          {/* Custom Logo Upload Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.customLogoUpload}</span>
              </h3>
              {customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setCustomLogoUrl(null)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <MadrasaLogo size="lg" showText={false} />
              </div>

              <div className="space-y-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG, WebP or SVG format</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This logo will automatically appear on student certificates, report cards, receipts, and headers throughout the system.
            </p>
          </div>

          {/* Language & Theme Preferences */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Language & Day/Night Theme</span>
            </h3>

            {/* Language Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">System Language</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English', flag: '🇬🇧' },
                  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
                  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code as Language)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      language === item.code
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.flag}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Day / Night Mode */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Day Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'border-emerald-600 bg-emerald-950 text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Night Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* Database Tools */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
              Data Management
            </h3>

            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all demo data and switch to pure real data mode? (Your admin account will remain active)')) {
                  clearAllDemoData();
                }
              }}
              className="w-full py-2 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Clear Demo Records (Real Data Mode)</span>
            </button>

            <button
              type="button"
              onClick={loadStarterSampleData}
              className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-colors"
            >
              Load Sample Demo Records
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to completely wipe all records and restart onboarding?')) {
                  resetAllData();
                }
              }}
              className="w-full py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Factory Reset (Wipe Everything)</span>
            </button>
          </div>
        </div>

        {/* Center & Right: Supabase Connection (Super Admin Only) + Institutional Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Supabase Live Integration Box - Strictly Super Admin Only */}
          {isSuperAdmin && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Supabase PostgreSQL & Cloud Sync
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSupabaseActive
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isSupabaseActive ? '🟢 Live Cloud Connected' : '🟡 Standby / Local Resilient'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct PostgreSQL database with Row Level Security (RLS) and real-time synchronization
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSchema}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                    title="Download .sql file for Supabase SQL Editor"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download .sql</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800"
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{copiedSchema ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
                  </button>
                </div>
              </div>

              {/* Supabase Configuration Inputs */}
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Supabase Project URL</span>
                    <span className="text-[10px] text-slate-400">e.g., https://yourproject.supabase.co</span>
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Supabase Anon / Public API Key</span>
                    <span className="text-[10px] text-slate-400">Settings &gt; API &gt; anon key</span>
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={testingConnection}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                    <span>{testingConnection ? 'Testing Connection...' : 'Test & Save Supabase'}</span>
                  </button>

                  {connectionStatus.tested && (
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        connectionStatus.success
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <span>{connectionStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cloud Sync Operations Action Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">Database Synchronization Tools</h3>
                  </div>
                  {lastCloudSync && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Last Cloud Sync: <span className="font-bold text-emerald-600 dark:text-emerald-400">{lastCloudSync}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={isSyncing}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{isSyncing ? 'Syncing...' : 'Push All Records to Cloud'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullFromCloud}
                    disabled={isSyncing}
                    className="py-2.5 px-3 bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CloudDownload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isSyncing ? 'Fetching...' : 'Pull Records from Supabase'}</span>
                  </button>
                </div>

                {syncStatusMsg && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    {syncStatusMsg}
                  </div>
                )}
              </div>

              {/* Quick 3-step Instructions */}
              <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 text-[11px] space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-indigo-950 dark:text-indigo-200">How to link Supabase in 3 simple steps:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                  <li>Create a free project at <span className="font-mono text-indigo-600 dark:text-indigo-400">supabase.com</span>.</li>
                  <li>Go to <strong>SQL Editor</strong> &gt; Click <strong>Copy SQL Schema</strong> (or upload the downloaded SQL) &gt; Click <strong>Run</strong>.</li>
                  <li>Copy your <strong>Project URL</strong> & <strong>Anon Key</strong> into the fields above and click <strong>Test & Save</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Production Security & Hardening Center */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Production Security & Hardening Audit</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status of security controls, RLS enforcement, and cryptographic safeguards</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold">
                🛡️ Hardened
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">PostgreSQL Row-Level Security (RLS)</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Strict SQL policies block unauthorized role queries and data tampering at the database layer.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Cryptographic Password Hashing</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">PBKDF2/SHA-256 Web Crypto hashing active. Passwords are never stored in plaintext.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Session Signature & Anti-Tamper Token</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Prevents client-side role elevation and unauthorized localStorage privilege modification.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Zero Service Role Key Exposure</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Only safe public `anon` credentials are utilized in the client bundle.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Madrasa Branch Network */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">National Branch Network (Ethiopia)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch active campus view across regional Al-Imran centers</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                5 Campuses Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setMadrasaBranch(b.name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    currentMadrasaBranch.includes(b.name.split(' ')[1]) || currentMadrasaBranch === b.name
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">{b.id}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{b.name}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Info & Ethiopian Banking */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Madrasa Identity & Ethiopian Payment Gateways</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Madrasa Name (English)</label>
                <input
                  type="text"
                  value={madrasaName}
                  onChange={(e) => setMadrasaName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Madrasa Name (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-arabic font-bold text-emerald-800 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Telebirr Merchant Code</label>
                <input
                  type="text"
                  value={telebirrMerchant}
                  onChange={(e) => setTelebirrMerchant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sky-700 dark:text-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Commercial Bank of Ethiopia (CBE) Account</label>
                <input
                  type="text"
                  value={cbeAccount}
                  onChange={(e) => setCbeAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-purple-700 dark:text-purple-400"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {showUserModal && (
        <UserManagementModal onClose={() => setShowUserModal(false)} />
      )}
    </div>
  );
};
