import React from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Receipt,
  TrendingUp,
  CreditCard,
  Building,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Search,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const FinanceDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    teachers,
    payments,
    donations,
    setActiveTab,
  } = useMadrasa();

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstanding = students.reduce((acc, s) => acc + s.feeBalance, 0);
  const totalSalaries = teachers.reduce((acc, t) => acc + t.monthlySalary, 0);
  const totalDonations = donations.reduce((acc, d) => acc + d.amount, 0);

  const telebirrTotal = payments.filter(p => p.paymentMethod === 'Telebirr').reduce((acc, p) => acc + p.amount, 0);
  const cbeTotal = payments.filter(p => p.paymentMethod === 'CBE Birr' || p.paymentMethod === 'Bank Transfer').reduce((acc, p) => acc + p.amount, 0);
  const cashTotal = payments.filter(p => p.paymentMethod === 'Cash').reduce((acc, p) => acc + p.amount, 0);

  const paymentBreakdownData = [
    { name: 'Telebirr', value: telebirrTotal || 36500, color: '#0284c7' },
    { name: 'CBE Birr / Bank', value: cbeTotal || 24200, color: '#9333ea' },
    { name: 'Cash Collections', value: cashTotal || 9500, color: '#059669' },
  ];

  const recentTransactions = payments.slice(0, 5);
  const defaulters = students.filter(s => s.feeBalance > 0).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white flex items-center gap-1.5 shadow-sm">
                <Receipt className="w-3.5 h-3.5" />
                <span>Finance & Treasury Desk • إدارة المالية والخزينة</span>
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Fiscal Year 2026/2027 (1448 AH)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Finance & Accounts Dashboard
            </h1>
            <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
              Real-time monitoring of Telebirr and Commercial Bank of Ethiopia (CBE) fee reconciliations, teacher payroll ledgers, and Waqf donation endowments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('finance')}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Fee Payment</span>
            </button>
            <button
              onClick={() => setActiveTab('donate')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4 text-amber-300" />
              <span>Waqf Accounts</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div
          onClick={() => setActiveTab('finance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Collected Revenue</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCollected.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> +14.2% vs Last Month
          </p>
        </div>

        {/* Outstanding Dues */}
        <div
          onClick={() => setActiveTab('finance')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Fees</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-600">{totalOutstanding.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{students.filter(s => s.feeBalance > 0).length} students pending</p>
        </div>

        {/* Payroll Obligations */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Payroll</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalSalaries.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400">ETB / Mo</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{teachers.length} Faculty & Staff Members</p>
        </div>

        {/* Waqf & Donations */}
        <div
          onClick={() => setActiveTab('donate')}
          className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Waqf & Sadaqah</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalDonations.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400">ETB</span>
          </div>
          <p className="mt-2 text-xs text-amber-600 font-semibold">CMC Building & Hifz Waqf</p>
        </div>
      </div>

      {/* Analytics & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Channels Pie Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Rail Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentBreakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {paymentBreakdownData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value.toLocaleString()} ETB</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Payment Transactions</h3>
            <button
              onClick={() => setActiveTab('finance')}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              View All Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Receipt / Ref</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">
                      {tx.receiptNumber}
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-300">
                      {tx.studentName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {tx.amount.toLocaleString()} ETB
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
