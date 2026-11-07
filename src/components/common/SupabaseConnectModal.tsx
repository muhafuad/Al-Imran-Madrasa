import React, { useState, useEffect } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Database,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download,
  CloudUpload,
  CloudDownload,
  ExternalLink,
  Shield,
  Layers,
  Key,
  Globe,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  SUPABASE_RLS_FIX_SQL,
  isSupabaseConfigured,
  extractSupabaseProjectRef,
  isValidJwtFormat,
} from '../../lib/supabase';
import { HelpCircle, Info, Lock, Wrench } from 'lucide-react';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    isSupabaseActive,
    isSyncing,
    lastCloudSync,
    pushAllToCloud,
    pullAllFromCloud,
    students,
    teachers,
    hifzSessions,
    attendanceRecords,
    payments,
    allUsers,
  } = useMadrasa();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    isAuthError?: boolean;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  const [activeTab, setActiveTab] = useState<'credentials' | 'schema' | 'sync' | 'guide'>('credentials');
  const [schemaMode, setSchemaMode] = useState<'full' | 'rls_fix'>('full');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedRlsFix, setCopiedRlsFix] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const projectRef = extractSupabaseProjectRef(url);
  const isKeyJwt = isValidJwtFormat(anonKey);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      if (config.url) setUrl(config.url);
      if (config.anonKey) setAnonKey(config.anonKey);
      setAutoSync(config.autoSync);
      setSyncStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        tested: true,
        success: false,
        message: 'Please enter both your Supabase Project URL and Anon API Key.',
      });
      return;
    }

    setTesting(true);
    setTestResult({ tested: false, success: false, message: '' });
    saveSupabaseConfig(url, anonKey, autoSync);

    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult({
      tested: true,
      success: res.success,
      isAuthError: res.isAuthError,
      message: res.message,
    });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleCopyRlsFix = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
    setCopiedRlsFix(true);
    setTimeout(() => setCopiedRlsFix(false), 2500);
  };

  const handleDownloadSchema = () => {
    const content = schemaMode === 'full' ? SUPABASE_SQL_SCHEMA : SUPABASE_RLS_FIX_SQL;
    const filename = schemaMode === 'full' ? 'alimran_madrasa_supabase_schema.sql' : 'alimran_madrasa_rls_fix.sql';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePush = async () => {
    setSyncStatusMsg(null);
    const res = await pushAllToCloud();
    if (res.success) {
      setSyncStatusMsg({
        type: 'success',
        text: `Successfully synced ${res.count} records to Supabase!`,
      });
    } else {
      setSyncStatusMsg({
        type: 'error',
        text: `Sync completed with warnings: ${res.errors.join(', ')}`,
      });
    }
  };

  const handlePull = async () => {
    setSyncStatusMsg(null);
    const res = await pullAllFromCloud();
    if (res.success) {
      setSyncStatusMsg({
        type: 'success',
        text: 'All records updated successfully from Supabase.',
      });
    } else {
      setSyncStatusMsg({
        type: 'error',
        text: res.message || 'Failed to pull records from cloud.',
      });
    }
  };

  return (
    <div
      id="supabase-connect-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Connect with Supabase</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isSupabaseActive
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {isSupabaseActive ? '🟢 Live Connected' : '🟡 Standby / Local'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PostgreSQL Cloud Database, Row Level Security & Real-Time Synchronization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {[
            { id: 'credentials', label: '1. API Credentials', icon: Key },
            { id: 'schema', label: '2. SQL Schema', icon: Layers },
            { id: 'sync', label: '3. Push & Pull Sync', icon: RefreshCw },
            { id: 'guide', label: 'Setup Guide', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Credentials */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Connect Your Madrasa Cloud Database</span>
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  Enter your Supabase project credentials. They will be stored securely in your browser's persistent state or loaded from <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> environment variables.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Supabase Project URL
                    </label>
                    {url && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]
                          ? `Project: ${url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]}`
                          : 'Custom URL'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://revcdxwrugdcsfrronxk.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Supabase Anon / Public API Key
                    </label>
                    {url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1] && (
                      <a
                        href={`https://supabase.com/dashboard/project/${url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]}/settings/api`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>Find Key in Dashboard</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none ${
                      anonKey && (!anonKey.trim().startsWith('eyJ') || anonKey.trim().startsWith('sbp_'))
                        ? 'border-amber-400 dark:border-amber-600 focus:border-amber-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {anonKey && anonKey.trim().startsWith('sbp_') && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>This is a Personal Access Token (sbp_...). Please use the <strong>anon public</strong> key (starts with eyJ...).</span>
                    </p>
                  )}
                  {anonKey && !anonKey.trim().startsWith('eyJ') && !anonKey.trim().startsWith('sbp_') && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Anon Key should be a JWT starting with &quot;eyJ...&quot;. Make sure you did not paste the database password or project ID.</span>
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your public anonymous API key (JWT token starting with <code className="text-emerald-600 dark:text-emerald-400 font-bold">eyJhbGciOi...</code>)
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoSyncToggle"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="autoSyncToggle" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Enable automatic background cloud synchronization
                  </label>
                </div>
              </div>

              {testResult.tested && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</p>
                      <p className="text-[11px] mt-0.5">{testResult.message}</p>
                    </div>
                  </div>

                  {!testResult.success && testResult.message.includes('401') && (
                    <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-200 space-y-1.5 text-[11px]">
                      <p className="font-bold text-rose-700 dark:text-rose-400">💡 How to fix 401 Unauthorized:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                        <li>
                          Open your Supabase project settings:{' '}
                          {url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1] ? (
                            <a
                              href={`https://supabase.com/dashboard/project/${url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]}/settings/api`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-emerald-600 dark:text-emerald-400 underline inline-flex items-center gap-0.5"
                            >
                              <span>API Settings ({url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i)?.[1]})</span>
                              <ExternalLink className="w-2.5 h-2.5 inline" />
                            </a>
                          ) : (
                            <span>Supabase Dashboard &gt; Project Settings &gt; API</span>
                          )}
                        </li>
                        <li>Look under <strong>Project API keys</strong> and find the <strong>anon public</strong> key.</li>
                        <li>Click <strong>Copy</strong> (the key is a long string starting with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">eyJhbGciOi...</code>).</li>
                        <li>Paste it into the <strong>Supabase Anon / Public API Key</strong> box above and click <strong>Test &amp; Save Connection</strong>.</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Open Supabase Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={handleTestAndSave}
                  disabled={testing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing Connection...' : 'Test & Save Connection'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SQL Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              {/* Toggle Full Schema vs RLS Fix Script */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSchemaMode('full')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      schemaMode === 'full'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Full Migration (17 Tables)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchemaMode('rls_fix')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      schemaMode === 'rls_fix'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>⚡ Fix RLS Warnings Only</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSchema}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-indigo-500" />
                    <span>Download .sql</span>
                  </button>

                  <button
                    onClick={schemaMode === 'full' ? handleCopySchema : handleCopyRlsFix}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      schemaMode === 'rls_fix' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    <span>
                      {schemaMode === 'full'
                        ? copiedSchema
                          ? 'SQL Copied!'
                          : 'Copy Full SQL'
                        : copiedRlsFix
                        ? 'RLS Fix Copied!'
                        : 'Copy RLS Fix SQL'}
                    </span>
                  </button>
                </div>
              </div>

              {schemaMode === 'rls_fix' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Fix &quot;new row violates row-level security policy&quot; in 10 seconds:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/90">
                    If you got warnings for <strong>profiles, teachers, donation_causes, homework_assignments</strong> during sync, copy this script and execute it in your Supabase SQL Editor. It grants full upsert/insert permissions to your Anon API key with <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">WITH CHECK (true)</code>.
                  </p>
                  {projectRef && (
                    <div className="pt-1">
                      <a
                        href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline"
                      >
                        <span>Open SQL Editor for Project ({projectRef})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <pre className="p-3.5 bg-slate-950 text-emerald-400 rounded-2xl text-[11px] font-mono h-64 overflow-y-auto leading-relaxed border border-slate-800">
                  {schemaMode === 'full' ? SUPABASE_SQL_SCHEMA : SUPABASE_RLS_FIX_SQL}
                </pre>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How to execute this script in Supabase:</span>
                </p>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 pl-1">
                  <li>Click <strong>{schemaMode === 'full' ? 'Copy Full SQL' : 'Copy RLS Fix SQL'}</strong> above.</li>
                  <li>In your Supabase project, click <strong>SQL Editor</strong> on the left sidebar.</li>
                  <li>Click <strong>New Query</strong>, paste the copied code, and click <strong>Run</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Push & Pull Sync */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{students.length}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Students</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{teachers.length}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Teachers</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{hifzSessions.length}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Hifz Logs</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{payments.length}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Payments</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Last Cloud Sync:</span>
                </div>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                  {lastCloudSync || 'Never synced'}
                </span>
              </div>

              {syncStatusMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold space-y-2 ${
                    syncStatusMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {syncStatusMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    )}
                    <div className="flex-1">
                      <p>{syncStatusMsg.text}</p>
                    </div>
                  </div>

                  {syncStatusMsg.type === 'error' && syncStatusMsg.text.toLowerCase().includes('row-level security') && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-700 text-slate-800 dark:text-slate-200 space-y-2 text-[11px]">
                      <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>How to fix Row-Level Security policy warnings:</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Your Supabase tables have restrictive RLS policies blocking write operations. Run our instant RLS Fix script:
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCopyRlsFix}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedRlsFix ? 'RLS Fix Script Copied!' : 'Copy 10-Second RLS Fix SQL'}</span>
                        </button>

                        {projectRef && (
                          <a
                            href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1"
                          >
                            <span>Open SQL Editor</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePush}
                  disabled={isSyncing}
                  className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>Push All Local Records to Cloud</span>
                  <span className="text-[10px] opacity-80 font-normal">Uploads students, teachers & sessions</span>
                </button>

                <button
                  type="button"
                  onClick={handlePull}
                  disabled={isSyncing}
                  className="p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CloudDownload className={`w-5 h-5 text-indigo-500 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>Pull Latest Records from Cloud</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Restores data from Supabase</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Quick Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Create a Free Supabase Project</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-7">
                    Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold underline">supabase.com</a>, log in with GitHub or email, and click <strong>New Project</strong>. Choose a name like <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">alimran-madrasa</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Copy Project URL & Anon Key</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-7">
                    Inside your Supabase project, go to <strong>Project Settings &gt; API</strong>. Copy the <strong>Project URL</strong> and the <strong>anon public</strong> API key, then paste them into Tab 1 of this modal.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Run the SQL Schema</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-7">
                    Copy the SQL script from Tab 2, paste it in Supabase <strong>SQL Editor</strong>, and click <strong>Run</strong>. This creates all tables and permissions automatically.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                    <span>Click Push All Local Records</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-7">
                    Go to Tab 3 and click <strong>Push All Local Records to Cloud</strong>. Your Madrasa data is now backed up and synchronized in real-time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isSupabaseConfigured() ? '✅ Configuration saved in browser' : '⚠️ Enter credentials to connect'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
