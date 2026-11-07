import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';

interface AccessDeniedProps {
  pageName: string;
  arabicPageName?: string;
  requiredRoles?: string[];
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  pageName,
  arabicPageName,
  requiredRoles = ['super_admin', 'principal'],
}) => {
  const { currentUser, setActiveTab, t, language } = useMadrasa();

  const formattedRequiredRoles = requiredRoles
    .map((r) => {
      const roleKey = r as keyof typeof t;
      return t[roleKey] || r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    })
    .join(language === 'ar' ? ' أو ' : language === 'am' ? ' ወይም ' : ' or ');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Lock className="w-3 h-3" />
            <span>{t.accessRestricted}</span>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {language === 'ar' ? `وصول مقيد إلى ${arabicPageName || pageName}` : language === 'am' ? `የተገደበ መዳረሻ፡ ${pageName}` : `Access Restricted to ${pageName}`}
          </h2>
          {arabicPageName && language !== 'ar' && (
            <p className="text-sm font-arabic text-slate-500 dark:text-slate-400">
              {arabicPageName}
            </p>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {t.accessRestrictedDesc}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {language === 'ar' ? `الصلاحية المطلوبة: ${formattedRequiredRoles}` : language === 'am' ? `የሚያስፈልገው ፈቃድ፡ ${formattedRequiredRoles}` : `Required Role: ${formattedRequiredRoles}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.dashboard}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quran')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.quranMemorization}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
