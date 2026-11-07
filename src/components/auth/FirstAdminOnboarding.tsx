import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { MadrasaLogo } from '../common/MadrasaLogo';
import { ShieldCheck, User, Mail, Lock, Phone, Building, ArrowRight, CheckCircle2, Sparkles, Globe, Sun, Moon, ArrowLeft } from 'lucide-react';
import type { Language } from '../../i18n/translations';

interface FirstAdminOnboardingProps {
  onBack?: () => void;
}

export const FirstAdminOnboarding: React.FC<FirstAdminOnboardingProps> = ({ onBack }) => {
  const { registerFirstAdmin, language, setLanguage, t, theme, toggleTheme, customLogoUrl, setCustomLogoUrl, setActiveTab } = useMadrasa();

  const [name, setName] = useState('Fuad Nuru');
  const [arabicName, setArabicName] = useState('فؤاد نورو');
  const [email, setEmail] = useState('fuadnuru45@gmail.com');
  const [password, setPassword] = useState('AlimranAdmin2026!');
  const [phone, setPhone] = useState('+251 911 234567');
  const [branchName, setBranchName] = useState('Al-Imran CMC Main Campus (Addis Ababa)');
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogoUrl);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setCustomLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all required administrator details.');
      return;
    }

    setLoading(true);
    try {
      await registerFirstAdmin({
        name,
        arabicName,
        email,
        password,
        phone,
        madrasaBranchName: branchName,
      });
    } catch (err: any) {
      alert('Failed to register: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white p-4 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-200">
      {/* Background Islamic Geometric Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Top Header Controls: Language, Theme & Back */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack || (() => setActiveTab('landing'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t.home || 'Public Site'}</span>
          </button>
          <MadrasaLogo size="md" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs font-semibold shadow-xs">
            {(['en', 'am', 'ar'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === lang
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'am' ? 'አማርኛ' : 'العربية'}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-xs cursor-pointer"
            title={theme === 'dark' ? t.dayMode : t.nightMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Setup Container */}
      <div className="relative z-10 max-w-2xl mx-auto w-full my-8">
        <div className="bg-white dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/10 dark:shadow-emerald-950/50 space-y-6">
          {/* Title Badge */}
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.firstAdminSetupTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Al-Imran CMC Madrasa System
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
              {t.firstAdminSetupDesc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sheikh Fuad Nuru"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Arabic Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Arabic Name (الاسم بالعربية)</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  placeholder="الشيخ فؤاد نورو"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-arabic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Admin Email *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@alimran-madrasa.et"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Phone Number (Ethiopia)</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 911 000 000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Admin Password *</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Primary Madrasa Branch</span>
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Al-Imran CMC Main Campus"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Custom Logo Upload Section */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.customLogoUpload}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload your Madrasa emblem image or use our authentic SVG vector</p>
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setCustomLogoUrl(null);
                    }}
                    className="text-[10px] text-rose-500 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Reset to Default Logo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="cursor-pointer px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs">
                  <span>Browse Image File (PNG/JPG/SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <img src={logoPreview} alt="Uploaded logo preview" className="w-8 h-8 object-contain rounded-md bg-white p-0.5 border" />
                    <span>Logo Loaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Initializing System...</span>
              ) : (
                <>
                  <span>{t.createAdminAccount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="relative z-10 text-center text-xs text-slate-500">
        <p>© 2026 Al-Imran CMC Madrasa Management System • Powered by Supabase & RBAC</p>
      </div>
    </div>
  );
};
