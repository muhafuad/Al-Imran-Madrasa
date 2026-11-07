import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { AuditLogEntry, AuditLogCategory } from '../../types';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  User,
  KeyRound,
  DollarSign,
  GraduationCap,
  BookOpen,
  FileCheck,
  Eye,
  X,
  FileCode,
  Layers,
  Database,
  Lock,
} from 'lucide-react';

export const AuditTrailModule: React.FC = () => {
  const { auditLogs, currentUser, clearAuditLogs, isSupabaseActive } = useMadrasa();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [inspectingLog, setInspectingLog] = useState<AuditLogEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Security authorization check: Super Admin or Principal only
  const isAuthorized =
    currentUser?.role === 'super_admin' || currentUser?.role === 'principal';

  if (!isAuthorized) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-rose-200 dark:border-rose-900/40 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Restricted Security Zone
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The System Audit Trail &amp; Forensic Activity Logs are restricted exclusively to Super Administrators and Madrasa Principals.
        </p>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetEntityName && log.targetEntityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.targetEntityId && log.targetEntityId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // Calculate Metrics
  const authCount = auditLogs.filter((l) => l.category === 'AUTH').length;
  const financeCount = auditLogs.filter((l) => l.category === 'FINANCE').length;
  const warningCount = auditLogs.filter((l) => l.severity === 'warning' || l.severity === 'critical').length;

  const exportToCSV = () => {
    if (auditLogs.length === 0) return;
    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Actor Role', 'Category', 'Action', 'Severity', 'Details', 'Target Entity', 'IP Address'];
    const rows = auditLogs.map((l) => [
      l.timestamp,
      `"${l.actorName.replace(/"/g, '""')}"`,
      l.actorEmail,
      l.actorRole,
      l.category,
      `"${l.action.replace(/"/g, '""')}"`,
      l.severity,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.targetEntityName || l.targetEntityId || '').replace(/"/g, '""')}"`,
      l.ipAddress || '197.156.104.22',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alimran_system_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `alimran_system_audit_trail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryBadge = (cat: AuditLogCategory) => {
    switch (cat) {
      case 'AUTH':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Auth / User</span>;
      case 'STUDENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Student</span>;
      case 'TEACHER':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Teacher</span>;
      case 'FINANCE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Finance</span>;
      case 'EXAM':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Exam / Grade</span>;
      case 'QURAN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">Hifz</span>;
      case 'CERTIFICATE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">Certificate</span>;
      case 'SECURITY':
      case 'SYSTEM':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">System</span>;
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="System Audit Trail & Forensic Security Database"
        arabicPageName="سجل العمليات والأمان والامتثال"
        recordCount={auditLogs.length}
        recordLabel="Forensic Audit Logs"
      />

      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Security Compliance
            </span>
            {isSupabaseActive && (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 rounded-full">
                Cloud Sync Active
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System Audit Trail &amp; Activity Log
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable, real-time audit journal capturing every user registration, financial collection, student admission, grade publication, and configuration change.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={exportToJSON}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-500" />
            JSON
          </button>
          {currentUser?.role === 'super_admin' && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Recorded Events</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{auditLogs.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Auth &amp; Account Ops</p>
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{authCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financial Transactions</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{financeCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Warnings &amp; Alerts</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{warningCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, target entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="AUTH">Authentication / RBAC</option>
              <option value="STUDENT">Student Management</option>
              <option value="TEACHER">Teacher / Faculty</option>
              <option value="FINANCE">Finance &amp; Tuition</option>
              <option value="EXAM">Exams &amp; Results</option>
              <option value="QURAN">Hifz &amp; Quran</option>
              <option value="CERTIFICATE">Certificates</option>
              <option value="SYSTEM">System &amp; Database</option>
            </select>
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Action &amp; Forensic Details</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-[11px] shrink-0 border border-slate-200 dark:border-slate-700">
                          {log.actorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {log.actorName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {log.actorRole}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">{getCategoryBadge(log.category)}</td>

                    <td className="p-3.5">
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(log.severity)}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {log.action}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {log.details}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {log.targetEntityName ? (
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {log.targetEntityName}
                          </p>
                          {log.targetEntityId && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {log.targetEntityId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg transition cursor-pointer"
                        title="Inspect Log Entry"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No audit records match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Detail Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Audit Log Forensic Inspection
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {inspectingLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Action</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{inspectingLog.action}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
                  {getCategoryBadge(inspectingLog.category)}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Actor</span>
                  <p className="font-bold text-slate-900 dark:text-white">{inspectingLog.actorName} ({inspectingLog.actorEmail})</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Role</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{inspectingLog.actorRole}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Details &amp; Narrative</span>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-mono">
                  {inspectingLog.details}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Raw Payload (JSON)</span>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(inspectingLog, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/40 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Clear All Audit Trail Records?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This action permanently deletes all recorded event logs from local and session storage. Export a CSV or JSON backup first if needed.
            </p>
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAuditLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Yes, Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
