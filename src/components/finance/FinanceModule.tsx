import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { FeeType, PaymentMethod, PaymentTransaction } from '../../types';
import { MadrasaLogo } from '../common/MadrasaLogo';
import { AccessDenied } from '../common/AccessDenied';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  Receipt,
  CreditCard,
  PlusCircle,
  Printer,
  Search,
  Filter,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  QrCode,
  DollarSign,
  Building,
  Smartphone,
  Landmark,
  X,
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const { payments, recordPayment, students, teachers, currentUser } = useMadrasa();

  const isStudentOrParent = currentUser?.role === 'student' || currentUser?.role === 'parent';
  const isFinanceStaff =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'principal' ||
    currentUser?.role === 'vice_principal' ||
    currentUser?.role === 'finance_officer';

  // Role Protection
  if (!isFinanceStaff && !isStudentOrParent) {
    return (
      <AccessDenied
        pageName="Finance & Tuition Accounting"
        arabicPageName="الإدارة المالية والرسوم الدراسية"
        requiredRoles={['super_admin', 'principal', 'finance_officer', 'parent', 'student']}
      />
    );
  }

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [feeType, setFeeType] = useState<FeeType>('Monthly Tuition');
  const [amount, setAmount] = useState<number>(1200);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Telebirr');
  const [transactionRef, setTransactionRef] = useState<string>('TLB-' + Math.floor(100000000 + Math.random() * 900000000));
  const [monthCovered, setMonthCovered] = useState<string>('August 2026');
  const [notes, setNotes] = useState<string>('Paid via Telebirr merchant code 48921');

  // Financial Metrics
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalSalaries = teachers.reduce((acc, t) => acc + t.monthlySalary, 0);
  const totalOutstanding = students.reduce((acc, s) => acc + s.feeBalance, 0);
  const telebirrTotal = payments.filter(p => p.paymentMethod === 'Telebirr').reduce((acc, p) => acc + p.amount, 0);
  const cbeTotal = payments.filter(p => p.paymentMethod === 'CBE Birr' || p.paymentMethod === 'Bank Transfer').reduce((acc, p) => acc + p.amount, 0);

  // Role based filtering: Students and Parents only see their own family payments
  const userStudentIds = isStudentOrParent
    ? students
        .filter(
          s =>
            s.id === 'std-101' ||
            s.guardianEmail === currentUser?.email ||
            currentUser?.role === 'student' ||
            currentUser?.role === 'parent'
        )
        .slice(0, currentUser?.role === 'student' ? 1 : 2)
        .map(s => s.id)
    : [];

  const visiblePayments = isStudentOrParent
    ? payments.filter(p => userStudentIds.includes(p.studentId) || p.studentId === 'std-101')
    : payments;

  const filteredPayments = visiblePayments.filter(p => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesMethod = paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesMethod;
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) return;

    const receiptNum = recordPayment({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      feeType,
      amount: Number(amount),
      paymentMethod,
      transactionReference: transactionRef || `REF-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      monthCovered,
      collectedBy: currentUser?.name || 'Finance Officer',
      status: 'completed',
      notes,
    });

    setIsPaymentModalOpen(false);
    
    // Auto open receipt for printing
    const createdReceipt: PaymentTransaction = {
      id: 'recent',
      receiptNumber: receiptNum,
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      feeType,
      amount: Number(amount),
      paymentMethod,
      transactionReference: transactionRef,
      date: new Date().toISOString().split('T')[0],
      monthCovered,
      collectedBy: currentUser?.name || 'Finance Officer',
      status: 'completed',
      notes,
    };
    setSelectedReceipt(createdReceipt);
    setIsReceiptModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Financial Accounts & Payment Ledger Database"
        arabicPageName="الإدارة المالية والرسوم الدراسية"
        recordCount={payments.length}
        recordLabel="Payment Transactions"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">Fees, Collections & Accounting</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
              Telebirr & CBE Birr Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 font-arabic mt-0.5">
            إدارة الرسوم الدراسية، والتحصيلات عبر تيلي بير والبنك التجاري الإثيوبي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTransactionRef('TLB-' + Math.floor(100000000 + Math.random() * 900000000));
              setIsPaymentModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Record New Fee Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Collected</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">ETB {totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">This Academic Term</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Telebirr Collections</span>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-700">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-sky-900">ETB {telebirrTotal.toLocaleString()}</span>
          </div>
          <p className="text-xs text-sky-600 mt-1">Merchant Code: 48921</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CBE / Bank Transfers</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-900">ETB {cbeTotal.toLocaleString()}</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">Acc: 1000293847281</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-900">ETB {totalOutstanding.toLocaleString()}</span>
          </div>
          <p className="text-xs text-rose-600 mt-1">2 Students with dues</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, receipt #, or transaction reference..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold"
          >
            <option value="all">All Payment Channels</option>
            <option value="Telebirr">Telebirr</option>
            <option value="CBE Birr">CBE Birr</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash (Counter)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Fee Payment Transactions Log</h2>
          <span className="text-xs text-slate-400">{filteredPayments.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Receipt / Date</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Fee Type</th>
                <th className="px-4 py-3">Payment Method & Reference</th>
                <th className="px-4 py-3">Amount (ETB)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-900 block">{pay.receiptNumber}</span>
                    <span className="text-[10px] text-slate-400">{pay.date}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{pay.studentName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {pay.feeType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          pay.paymentMethod === 'Telebirr'
                            ? 'bg-sky-100 text-sky-900'
                            : pay.paymentMethod === 'CBE Birr'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {pay.paymentMethod}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{pay.transactionReference}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-800 text-sm">
                    ETB {pay.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedReceipt(pay);
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Fee Collection</h2>
                <p className="text-xs text-slate-500 font-arabic">سند قبض رسوم دراسية - مدرسة آل عمران</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} ({st.admissionNumber}) - Due: ETB {st.feeBalance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Fee Type</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as FeeType)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    <option value="Monthly Tuition">Monthly Tuition</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Books & Kit">Books & Kit</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Transportation (Bus)">Transportation (Bus)</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Madrasa Waqf / Donation">Madrasa Waqf / Donation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Amount (ETB) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-black text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="Telebirr">Telebirr (Ethio Telecom)</option>
                    <option value="CBE Birr">CBE Birr (Commercial Bank)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash (Counter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Transaction Ref / Slip #</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes / Month Covered</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Confirm & Issue Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 no-print">
              <div>
                <h3 className="font-black text-slate-900 text-base">Al-Imran Official Receipt</h3>
                <p className="text-xs text-slate-500">Official proof of payment and tax voucher</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="border-2 border-dashed border-slate-300 p-5 rounded-xl bg-slate-50/50 space-y-4 select-none">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <MadrasaLogo size="sm" showAmharic={false} />
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">OFFICIAL RECEIPT</span>
                  <span className="font-mono font-bold text-slate-900 text-xs block">{selectedReceipt.receiptNumber}</span>
                  <span className="text-[10px] text-slate-400">{selectedReceipt.date}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Received From (Student):</span>
                  <strong className="text-slate-900">{selectedReceipt.studentName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Payment Category:</span>
                  <strong className="text-slate-900">{selectedReceipt.feeType}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Payment Method:</span>
                  <strong className="text-emerald-800">{selectedReceipt.paymentMethod} ({selectedReceipt.transactionReference})</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Collected By:</span>
                  <span className="text-slate-800">{selectedReceipt.collectedBy}</span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-100/70 px-3 rounded-lg text-emerald-950 font-black text-sm">
                  <span>TOTAL AMOUNT PAID:</span>
                  <span>ETB {selectedReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-slate-700" />
                  <span>Scan to verify payment authenticity</span>
                </div>
                <div className="text-right font-arabic text-xs font-bold text-emerald-800">
                  جزاكم الله خيراً
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
