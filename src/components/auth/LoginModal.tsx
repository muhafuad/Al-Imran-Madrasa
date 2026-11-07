import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import {
  isSupabaseConfigured,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  ensureSupabaseClient,
  syncServerSupabaseConfig,
} from '../../lib/supabase';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  AlertCircle,
  Sun,
  Moon,
  Database,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Globe,
  Heart,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Language } from '../../i18n/translations';

interface LoginModalProps {
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const {
    loginUser,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    setActiveTab,
  } = useMadrasa();

  const [isCloudActive, setIsCloudActive] = useState(isSupabaseConfigured());
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Cloud DB Config Drawer state
  const [showDbDrawer, setShowDbDrawer] = useState(!isSupabaseConfigured());
  const [customUrl, setCustomUrl] = useState('');
  const [customAnonKey, setCustomAnonKey] = useState('');
  const [savingDb, setSavingDb] = useState(false);
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-sync on mount
  useEffect(() => {
    const initSync = async () => {
      const synced = await syncServerSupabaseConfig();
      if (synced || isSupabaseConfigured()) {
        setIsCloudActive(true);
        setShowDbDrawer(false);
      }
      const stored = getStoredSupabaseConfig();
      if (stored.url) setCustomUrl(stored.url);
      if (stored.anonKey) setCustomAnonKey(stored.anonKey);
    };
    initSync();
  }, []);

  const handleFetchFromServer = async () => {
    setSavingDb(true);
    setDbNotice(null);
    try {
      const synced = await syncServerSupabaseConfig();
      if (synced) {
        const stored = getStoredSupabaseConfig();
        setCustomUrl(stored.url);
        setCustomAnonKey(stored.anonKey);
        setIsCloudActive(true);
        setDbNotice({ type: 'success', text: 'Loaded Supabase Cloud credentials from server successfully!' });
      } else {
        setDbNotice({ type: 'error', text: 'No cloud database credentials found on server yet. Please enter them below.' });
      }
    } catch {
      setDbNotice({ type: 'error', text: 'Failed to connect to server configuration endpoint.' });
    } finally {
      setSavingDb(false);
    }
  };

  const handleSaveDbConfig = async () => {
    if (!customUrl.trim() || !customAnonKey.trim()) {
      setDbNotice({ type: 'error', text: 'Please enter both Supabase Project URL and Anon API Key.' });
      return;
    }

    setSavingDb(true);
    setDbNotice(null);
    try {
      saveSupabaseConfig(customUrl.trim(), customAnonKey.trim(), true);
      const testRes = await testSupabaseConnection(customUrl.trim(), customAnonKey.trim());
      if (testRes.success) {
        setIsCloudActive(true);
        setDbNotice({ type: 'success', text: 'Connected to Supabase Cloud Database! You can now sign in.' });
        setTimeout(() => setShowDbDrawer(false), 1500);
      } else {
        setDbNotice({
          type: 'error',
          text: `Connection test warning: ${testRes.message}. Credentials saved locally and to server.`,
        });
        setIsCloudActive(true);
      }
    } catch (e: any) {
      setDbNotice({ type: 'error', text: e?.message || 'Failed to save configuration.' });
    } finally {
      setSavingDb(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    setLoading(true);
    await ensureSupabaseClient();
    const result = await loginUser(emailOrPhone.trim(), password);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Login failed. Please check your credentials.');
      if (!isCloudActive) {
        setShowDbDrawer(true);
      }
    } else {
      setActiveTab('dashboard');
      if (result.source === 'supabase') {
        setSuccessNotice(result.message || 'Authenticated via Supabase Cloud Auth & Database.');
      } else {
        setSuccessNotice(result.message || 'Signed in successfully.');
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 relative overflow-hidden my-auto">
        
        {/* Top Header Row with System Indicator, Controls & Close */}
        <div className="flex items-center justify-between gap-2">
          <MadrasaLogo size="sm" />

          <div className="flex items-center gap-2">
            {/* Supabase Status Pill / Toggle */}
            <button
              type="button"
              onClick={() => setShowDbDrawer(!showDbDrawer)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                isCloudActive
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 animate-pulse'
              }`}
              title="Click to view or configure Supabase Cloud Database credentials"
            >
              <Database className="w-3 h-3" />
              <span>{isCloudActive ? 'Supabase Live' : 'Connect Cloud DB'}</span>
              {showDbDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold border border-slate-200 dark:border-slate-700">
              {(['en', 'am', 'ar'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'عر'}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button / Return to Public Website */}
            <button
              onClick={onClose || (() => setActiveTab('landing'))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Return to Public Madrasa Website"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Supabase Cloud Connection Drawer (for Chrome / Edge cross-browser configuration) */}
        {showDbDrawer && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Supabase Cloud Database Setup
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Syncs credentials across Chrome, Edge, and all devices.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFetchFromServer}
                disabled={savingDb}
                className="px-2 py-1 text-[11px] bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Fetch credentials saved by Edge or other browsers"
              >
                <RefreshCw className={`w-3 h-3 ${savingDb ? 'animate-spin' : ''}`} />
                <span>Auto-Fetch</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Supabase Anon API Key
                </label>
                <input
                  type="password"
                  value={customAnonKey}
                  onChange={(e) => setCustomAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {dbNotice && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  dbNotice.type === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300'
                }`}
              >
                {dbNotice.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                )}
                <span>{dbNotice.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDbDrawer(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleSaveDbConfig}
                disabled={savingDb}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{savingDb ? 'Connecting...' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Security Alert Header */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start gap-3">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <span>Secure Madrasa Portal Gate</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
              Sensitive student records, exam marks, and financial data are strictly protected. Please sign in with your verified account.
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.loginTitle}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-arabic">
            تسجيل الدخول الآمن إلى البوابة الأكاديمية لمدرسة آل عمران
          </p>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            {!isCloudActive && (
              <button
                type="button"
                onClick={() => setShowDbDrawer(true)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3 h-3" />
                <span>Click here to link Supabase Cloud Database credentials</span>
              </button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.emailOrUsername}</span>
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. user@domain.com or phone number"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.password}</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Please contact the Madrasa administrator to reset your portal password.')}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? <span>Verifying Cloud Credentials...</span> : <span>{t.signIn}</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Public Browsing Navigation (For visitors without login) */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            onClick={() => setActiveTab('landing')}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visit Public Madrasa Website</span>
          </button>

          <button
            onClick={() => setActiveTab('donate')}
            className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold cursor-pointer transition-colors"
          >
            <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Waqf & Donations Fund</span>
          </button>
        </div>

        {/* Security & Access Notice */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-arabic">
            مدرسة آل عمران لتحفيظ القرآن الكريم والعلوم الشرعية • بوابة الإدارة المعتمدة
          </p>
        </div>
      </div>
    </div>
  );
};
