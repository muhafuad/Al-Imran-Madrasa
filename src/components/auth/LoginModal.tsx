import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import {
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
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Globe,
  Heart,
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

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Silently sync server-managed Supabase configuration on mount (never exposed in login UI)
  useEffect(() => {
    syncServerSupabaseConfig().catch(() => {});
  }, []);

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
    } else {
      setActiveTab('dashboard');
      setSuccessNotice(result.message || 'Signed in successfully.');
      setTimeout(() => {
        if (onClose) onClose();
      }, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 relative overflow-hidden my-auto">
        
        {/* Top Header Row with Logo, Language/Theme Controls & Close */}
        <div className="flex items-center justify-between gap-2">
          <MadrasaLogo size="sm" />

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold border border-slate-200 dark:border-slate-700">
              {(['en', 'am', 'ar'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
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
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button / Return to Public Website */}
            <button
              type="button"
              onClick={onClose || (() => setActiveTab('landing'))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Return to Public Madrasa Website"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

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
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
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
                onClick={() => setErrorMessage('Please contact the Madrasa administrator to reset your portal password.')}
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
            {loading ? <span>Verifying Credentials...</span> : <span>{t.signIn}</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Public Browsing Navigation (For visitors without login) */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visit Public Madrasa Website</span>
          </button>

          <button
            type="button"
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
