import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  Server,
  Sparkles,
  Zap,
  Key,
} from 'lucide-react';
import { SupabaseConnectModal } from './SupabaseConnectModal';
import { canViewDatabaseBanner, canAdministerDatabase } from '../../utils/permissions';

interface DatabaseStatusBannerProps {
  pageName: string;
  arabicPageName?: string;
  recordCount?: number;
  recordLabel?: string;
}

/**
 * Universal Database Connectivity & Cloud Sync Widget
 * Displays live Postgres/Supabase database connectivity, replication health,
 * active branch connection, and quick sync action across all Madrasa modules.
 * Note: Strictly hidden for student and parent roles.
 */
export const DatabaseStatusBanner: React.FC<DatabaseStatusBannerProps> = ({
  pageName,
  arabicPageName,
  recordCount,
  recordLabel = 'Records',
}) => {
  const {
    isSupabaseActive,
    isSyncing,
    lastCloudSync,
    pushAllToCloud,
    pullAllFromCloud,
    currentUser,
    currentMadrasaBranch,
    storageStats,
  } = useMadrasa();

  // If user is a student, parent, or unauthorized viewer, do not render database sync banner
  if (!canViewDatabaseBanner(currentUser?.role)) {
    return null;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [dbWarning, setDbWarning] = useState<{ message: string; is401?: boolean; table?: string } | null>(null);

  const isAdmin = canAdministerDatabase(currentUser?.role);

  useEffect(() => {
    const handleDbWarning = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setDbWarning({
          message: detail.message,
          is401: detail.is401,
          table: detail.table,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('madrasa-db-sync-warning', handleDbWarning);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('madrasa-db-sync-warning', handleDbWarning);
      }
    };
  }, []);

  const handleQuickSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncFeedback('Syncing with database...');
    const res = await pushAllToCloud();
    if (res.success) {
      setSyncFeedback('Synchronized');
      setDbWarning(null);
      setTimeout(() => setSyncFeedback(null), 3000);
    } else {
      if (res.errors && res.errors.length > 0) {
        const isAuth = res.errors.some(err => err.toLowerCase().includes('401') || err.toLowerCase().includes('unauthorized') || err.toLowerCase().includes('jwt'));
        const isRls = res.errors.some(err => err.toLowerCase().includes('row-level security') || err.toLowerCase().includes('rls'));
        
        if (isAuth) {
          setDbWarning({
            message: '401 Unauthorized: Invalid Anon API Key. Click "Update Anon Key" to enter the correct public anon key from Supabase.',
            is401: true,
          });
        } else if (isRls) {
          setDbWarning({
            message: 'Row-Level Security (RLS) policies blocked writing to some tables (profiles, teachers, causes, homework). Click "Fix RLS Policies" to resolve this in 10 seconds.',
            is401: false,
          });
        }
      }
      setSyncFeedback('Saved locally (Offline mode)');
      setTimeout(() => setSyncFeedback(null), 3500);
    }
  };

  return (
    <>
      <div className="w-full bg-slate-900 text-white rounded-2xl p-3 sm:px-4 sm:py-3 border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs mb-4 no-print">
        {/* Left: DB Health Status */}
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-xl flex items-center justify-center shrink-0 ${
              isSupabaseActive
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                : 'bg-amber-950 text-amber-400 border border-amber-800/80'
            }`}
          >
            <Database className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>{pageName}</span>
                <span className="text-[10px] font-normal text-slate-400">Database Layer</span>
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSupabaseActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
                {isSupabaseActive ? 'Supabase Postgres Live' : 'IndexedDB Engine Active'}
              </span>

              {storageStats && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                  title={`IndexedDB Storage: ${storageStats.usageMB.toFixed(2)} MB of ${storageStats.quotaMB} MB capacity used`}
                >
                  <Database className="w-2.5 h-2.5 text-emerald-400" />
                  <span>IDB: {storageStats.usageMB.toFixed(1)}MB</span>
                </span>
              )}

              {recordCount !== undefined && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  {recordCount} {recordLabel}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {isSupabaseActive ? (
                <>
                  Continuous real-time replication active for <span className="text-slate-300 font-semibold">{currentMadrasaBranch}</span>.
                  {lastCloudSync && <span className="ml-1 text-slate-500">Last sync: {lastCloudSync}</span>}
                </>
              ) : (
                <>
                  Offline persistence enabled with instant sync upon database cloud provisioning.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {syncFeedback && (
            <span className="text-[11px] font-medium text-emerald-400 animate-in fade-in">
              {syncFeedback}
            </span>
          )}

          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-[11px] font-semibold border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
            title="Force synchronization between client and database"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="Open Supabase Cloud Database Configuration & SQL Schema"
            >
              <Zap className="w-3 h-3" />
              <span>DB Setup &amp; Keys</span>
            </button>
          )}
        </div>
      </div>

      {dbWarning && (
        <div className="w-full mb-4 p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">
                {dbWarning.is401 ? 'Supabase Authentication Required (401)' : 'Database Notice'}
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                {dbWarning.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                {dbWarning.is401 ? <Key className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                <span>{dbWarning.is401 ? 'Update Anon Key' : 'Fix RLS Policies'}</span>
              </button>
            )}
            <button
              onClick={() => setDbWarning(null)}
              className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              title="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <SupabaseConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
