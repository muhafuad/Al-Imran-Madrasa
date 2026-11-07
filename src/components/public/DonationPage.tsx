import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  Heart,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Building,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  CreditCard,
  Phone,
  QrCode,
  Lock,
  Globe,
  Sun,
  Moon,
  LogIn,
  Printer,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DonationCause, DonationRecord } from '../../types';

export const DonationPage: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    setActiveTab,
    currentUser,
    donationCauses,
    donations,
    addDonation,
  } = useMadrasa();

  // Selected cause filter
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Active donation modal state
  const [activeModalCause, setActiveModalCause] = useState<DonationCause | null>(null);

  // Donation form state
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'annual'>('one-time');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe' | 'awash' | 'abyssinia' | 'card'>('telebirr');
  const [transactionRef, setTransactionRef] = useState('');
  const [dedicationMessage, setDedicationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Success Receipt State
  const [completedReceipt, setCompletedReceipt] = useState<{
    receiptNumber: string;
    donorName: string;
    amount: number;
    currency: string;
    causeTitle: string;
    date: string;
    hijriDate: string;
    paymentMethod: string;
    dedication?: string;
  } | null>(null);

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const filteredCauses = donationCauses.filter(cause => {
    if (selectedFilter === 'all') return true;
    return cause.type === selectedFilter;
  });

  const totalRaisedETB = donationCauses.reduce((acc, c) => acc + c.raisedAmountETB, 0);
  const totalDonorsCount = donationCauses.reduce((acc, c) => acc + c.donorsCount, 0);
  const totalTargetETB = donationCauses.reduce((acc, c) => acc + c.targetAmountETB, 0);

  const handleOpenDonateModal = (cause: DonationCause, defaultAmt?: number) => {
    setActiveModalCause(cause);
    if (defaultAmt) {
      setAmount(defaultAmt);
    } else {
      setAmount(cause.suggestedAmountsETB[1] || 1500);
    }
    setCompletedReceipt(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalCause) return;

    if (!amount || amount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      alert('Please enter your name or check "Make donation anonymous".');
      return;
    }

    const receiptNum = addDonation({
      donorName: isAnonymous ? 'Anonymous Donor' : donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorPhone: donorPhone.trim(),
      amount: Number(amount),
      currency,
      frequency,
      cause: activeModalCause.id,
      causeTitle: activeModalCause.title,
      paymentMethod,
      transactionRef: transactionRef.trim() || `TXN-${Date.now().toString().slice(-6)}`,
      dedicationMessage: dedicationMessage.trim(),
      isAnonymous,
    });

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#d97706', '#0284c7', '#fbbf24'],
      });
    } catch (err) {
      console.log('Confetti triggered');
    }

    setCompletedReceipt({
      receiptNumber: receiptNum,
      donorName: isAnonymous ? 'Anonymous Servant of Allah' : donorName.trim(),
      amount: Number(amount),
      currency,
      causeTitle: activeModalCause.title,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      hijriDate: '29 Safar 1448 AH',
      paymentMethod: paymentMethod.toUpperCase(),
      dedication: dedicationMessage.trim(),
    });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Back to Home & Logo */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setActiveTab('landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t.home}</span>
              </button>

              <div
                className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"
                onClick={() => setActiveTab('landing')}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-700/20">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-white font-serif">
                    {language === 'ar'
                      ? 'صندوق الوقف والصدقة الجارية'
                      : language === 'am'
                      ? 'የአል ዒምራን የዋቅፍና የሶደቃ ጃሪያ ፈንድ'
                      : 'Al-Imran Waqf & Sadaqah Fund'}
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-arabic">
                    {language === 'ar'
                      ? 'مجمع آل عمران القرآني الوقفي • أديس أبابا'
                      : language === 'am'
                      ? 'አል ዒምራን የቁርኣን መድረሳ • አዲስ አበባ'
                      : 'Al-Imran Quranic Madrasa • Addis Ababa'}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
              {/* Language Switcher */}
              <div className="relative flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-stone-500 mx-1" />
                {(['en', 'am', 'ar'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-1 rounded font-medium transition-colors ${
                      language === lang
                        ? 'bg-white dark:bg-stone-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'عربي'}
                  </button>
                ))}
              </div>

              {/* Day / Night Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title={theme === 'dark' ? t.dayMode : t.nightMode}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
              </button>

              {/* Portal Login */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{currentUser ? t.dashboard : t.madrasaPortal}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 text-white py-14 sm:py-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-800/80 border border-amber-600/40 text-amber-200 text-xs sm:text-sm font-arabic">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif text-white max-w-4xl mx-auto leading-tight">
            {language === 'ar'
              ? 'وقف أهل القرآن • صدقة جارية تثمر خيراً إلى يوم القيامة'
              : language === 'am'
              ? 'የአል ዒምራን መድረሳ የዋቅፍና የሰደቃ ጃሪያ ፈንድ'
              : 'Sow the Seeds of Endless Reward with Al-Imran Waqf'}
          </h1>

          <p className="text-base sm:text-lg text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
            {language === 'ar'
              ? 'كفالة طلاب تحفيظ القرآن الكريم، طباعة وتوزيع المصاحف، وتوسعة مبنى المجمع التعليمي بسي إم سي بأديስ أبابا.'
              : language === 'am'
              ? 'የየቲሞችን የቁርኣን ሂፍዝ ስፖንሰር ያድርጉ፣ ሙስሐፍ ያበርክቱ እንዲሁም የመድረሳውን የካምፓስ ማስፋፊያ ህንጻ ይገንቡ።'
              : 'Directly support underprivileged Hifz students, provide Mus\'hafs, and expand our campus infrastructure for generations to come.'}
          </p>

          {/* Quick Aggregate Stats Ribbon */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-amber-950/60 backdrop-blur-md rounded-xl p-4 border border-amber-500/30 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-300">
                {totalRaisedETB.toLocaleString()} ETB
              </div>
              <div className="text-xs text-amber-200 mt-1">
                {language === 'ar'
                  ? 'إجمالي أموال الأوقاف المحصلة'
                  : language === 'am'
                  ? 'አጠቃላይ የተሰበሰበ የዋቅፍ ፈንድ'
                  : 'Total Waqf Funds Contributed'}
              </div>
            </div>

            <div className="bg-amber-950/60 backdrop-blur-md rounded-xl p-4 border border-amber-500/30 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-300">
                {totalDonorsCount}{' '}
                <span className="text-lg">
                  {language === 'ar' ? 'متبرع' : language === 'am' ? 'ለጋሾች' : 'Donors'}
                </span>
              </div>
              <div className="text-xs text-amber-200 mt-1">
                {language === 'ar'
                  ? 'مساهم ومحسن كريم'
                  : language === 'am'
                  ? 'ልገሳ ያደረጉ የበጎ አድራጊዎች ቁጥር'
                  : 'Generous Community Supporters'}
              </div>
            </div>

            <div className="bg-amber-950/60 backdrop-blur-md rounded-xl p-4 border border-amber-500/30 text-center">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-300">
                {language === 'ar' ? '١٠٠٪ أثر مباشر' : language === 'am' ? '100% ቀጥተኛ ተደራሽነት' : '100% Direct Impact'}
              </div>
              <div className="text-xs text-amber-200 mt-1">
                {language === 'ar'
                  ? 'إشراف شرعي وبدون أي استقطاعات إدارية'
                  : language === 'am'
                  ? 'በሸሪዓዊ ቁጥጥር ስር ያለና ያለምንም አስተዳደራዊ ቅነሳ'
                  : 'Shariah Supervised & Zero Admin Fee'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Ethiopian Bank Accounts and Telebirr Information Ribbon */}
      <section className="py-6 bg-amber-50 dark:bg-stone-900 border-b border-amber-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                  {language === 'ar'
                    ? 'حسابات التبرع الرسمية المعتمدة'
                    : language === 'am'
                    ? 'ኦፊሴላዊ የልገሳ ሂሳቦች'
                    : 'Official Donation Accounts'}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {language === 'ar'
                    ? 'اسم الحساب: جمعية آل عمران للتعليم والتربية الإسلامية'
                    : language === 'am'
                    ? 'የሂሳብ ስም: የአል ዒምራን እስላማዊ ትምህርት ማህበር'
                    : 'Account Name: Al-Imran Islamic Educational Association'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Telebirr:</span>
                <span className="font-mono font-bold">+251 911 234 567</span>
                <button
                  onClick={() => handleCopy('+251911234567', 'telebirr')}
                  className="text-stone-400 hover:text-stone-600 ml-1"
                  title="Copy Telebirr Number"
                >
                  {copiedAccount === 'telebirr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
                <span className="font-semibold text-purple-700 dark:text-purple-400">CBE:</span>
                <span className="font-mono font-bold">1000 4567 8901 2</span>
                <button
                  onClick={() => handleCopy('1000456789012', 'cbe')}
                  className="text-stone-400 hover:text-stone-600 ml-1"
                  title="Copy CBE Account"
                >
                  {copiedAccount === 'cbe' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs">
                <span className="font-semibold text-amber-700 dark:text-amber-400">Awash Bank:</span>
                <span className="font-mono font-bold">0132 0892 1100 00</span>
                <button
                  onClick={() => handleCopy('01320892110000', 'awash')}
                  className="text-stone-400 hover:text-stone-600 ml-1"
                  title="Copy Awash Account"
                >
                  {copiedAccount === 'awash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Causes Grid */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white">
              {language === 'ar'
                ? 'أبواب الوقف والمشاريع الخيرية المتاحة'
                : language === 'am'
                ? 'የዋቅፍ እና የልገሳ አማራጮች'
                : t.selectDonationCause}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {language === 'ar'
                ? 'اختر الصندوق أو المشروع المناسب للمساهمة برعايته وكفالته'
                : language === 'am'
                ? 'ተስማሚውን ፈንድ ይምረጡ ወይም ተማሪን በቀጥታ ይደግፉ'
                : 'Select a designated fund or sponsor a student directly'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-semibold">
            {[
              {
                id: 'all',
                label: language === 'ar' ? 'جميع الأوقاف' : language === 'am' ? 'ሁሉም ፈንዶች' : 'All Causes',
              },
              {
                id: 'sponsorship',
                label: language === 'ar' ? 'كفالة الطلاب والمعلمين' : language === 'am' ? 'የተማሪዎችና ኡስታዞች ድጋፍ' : 'Student & Teacher Sponsorship',
              },
              {
                id: 'campus_waqf',
                label: language === 'ar' ? 'وقف البناء والمنشآت' : language === 'am' ? 'የግንባታ ዋቅፍ' : 'Building Waqf',
              },
              {
                id: 'quran_print',
                label: language === 'ar' ? 'طباعة المصاحف والكتب' : language === 'am' ? 'ሙስሐፍና መጽሐፍት' : "Mus'haf & Library",
              },
              {
                id: 'zakat',
                label: language === 'ar' ? 'زكاة المال والإغاثة' : language === 'am' ? 'የገንዘብ ዘካና እፎይታ' : 'Zakat al-Mal & Relief',
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedFilter === tab.id
                    ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCauses.map(cause => {
            const pct = Math.min(100, Math.round((cause.raisedAmountETB / cause.targetAmountETB) * 100));
            const displayTitle =
              language === 'ar' ? cause.arabicTitle || cause.title : language === 'am' ? cause.amharicTitle || cause.title : cause.title;
            const displayDesc =
              language === 'ar'
                ? cause.arabicDescription || cause.description
                : language === 'am'
                ? cause.amharicDescription || cause.description
                : cause.description;
            const displayBadge =
              language === 'ar' ? cause.arabicBadge || cause.badge : language === 'am' ? cause.amharicBadge || cause.badge : cause.badge;

            return (
              <div
                key={cause.id}
                className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-stone-800">
                    <img src={cause.imageUrl} alt={cause.title} className="w-full h-full object-cover" />
                    {displayBadge && (
                      <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-md">
                        {displayBadge}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 rounded-md text-xs font-semibold bg-black/70 text-amber-300 backdrop-blur-xs font-arabic">
                      {cause.arabicTitle}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white font-serif">{displayTitle}</h3>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                        {displayDesc}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {cause.raisedAmountETB.toLocaleString()} ETB
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                          {language === 'ar' ? 'الهدف:' : language === 'am' ? 'ዒላማ:' : 'Target:'}{' '}
                          {cause.targetAmountETB.toLocaleString()} ETB
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-2xs text-stone-500 dark:text-stone-400">
                        <span>
                          {pct}% {language === 'ar' ? 'مكتمل' : language === 'am' ? 'ተሰብስቧል' : 'Funded'}
                        </span>
                        <span>
                          {cause.donorsCount} {language === 'ar' ? 'متبرع' : language === 'am' ? 'ለጋሾች' : 'Donors'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Amount Suggestion Chips */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
                      <span className="text-2xs font-semibold text-stone-500 uppercase tracking-wider">
                        {language === 'ar' ? 'تعهد سريع:' : language === 'am' ? 'ፈጣን ቃል ኪዳን:' : 'Quick Pledge:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cause.suggestedAmountsETB.map(sAmt => (
                          <button
                            key={sAmt}
                            onClick={() => handleOpenDonateModal(cause, sAmt)}
                            className="px-2.5 py-1 rounded-md bg-stone-50 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                          >
                            {sAmt.toLocaleString()} ETB
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenDonateModal(cause)}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>
                      {language === 'ar'
                        ? 'تبرع لهذا الوقف'
                        : language === 'am'
                        ? 'ለዚህ ፈንድ ይለግሱ'
                        : 'Donate to This Cause'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Generous Donors Wall */}
      <section className="py-12 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
              {language === 'ar'
                ? 'لوحة شرف الواقفين والداعمين'
                : language === 'am'
                ? 'የለጋሾችና الواقفين ዝርዝር'
                : t.recentDonors}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {language === 'ar'
                ? 'بارك الله في كل من ساهم في نشر كتابه الكريم وضاعف له الأجر والمثوبة.'
                : language === 'am'
                ? 'አላህ የአላህን ቃል ለማሰራጨት አስተዋጽኦ ያደረጉትን ሁሉ ይባርክ፣ ምንዳቸውንም ያብዛላቸው።'
                : 'May Allah bless and multiply the rewards of all who contribute to the propagation of His Words.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {donations.slice(0, 8).map(don => {
              const matchedCause = donationCauses.find(c => c.id === don.cause);
              const localizedCauseTitle = matchedCause
                ? language === 'ar'
                  ? matchedCause.arabicTitle
                  : language === 'am'
                  ? matchedCause.amharicTitle || matchedCause.title
                  : matchedCause.title
                : don.causeTitle;

              const localizedDonorName = don.isAnonymous
                ? language === 'ar'
                  ? 'فاعل خير (متبرع مجهول)'
                  : language === 'am'
                  ? 'ስሙ እንዳይገለጽ የፈለገ ለጋሽ'
                  : 'Anonymous Donor'
                : don.donorName;

              return (
                <div
                  key={don.id}
                  className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200 dark:border-stone-700/60 flex flex-col justify-between text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-white">{localizedDonorName}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {don.amount.toLocaleString()} {don.currency}
                      </span>
                    </div>

                    <p className="text-stone-500 dark:text-stone-400 text-2xs truncate">
                      {localizedCauseTitle}
                    </p>

                    {don.dedicationMessage && (
                      <p className="text-stone-600 dark:text-stone-300 italic text-2xs line-clamp-2">
                        "{don.dedicationMessage}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-stone-200 dark:border-stone-700 text-3xs text-stone-400 flex items-center justify-between">
                    <span>{don.date}</span>
                    <span className="font-mono uppercase">{don.paymentMethod}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shariah Guidelines & Waqf Transparency */}
      <section className="py-12 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
              {language === 'ar'
                ? 'الالتزام بالضوابط الشرعية والشفافية الوقفية'
                : language === 'am'
                ? 'የሸሪዓዊ ተገዢነት እና የዋቅፍ ግልጽነት'
                : 'Shariah Compliance & Waqf Transparency'}
            </h3>
            <p className="text-stone-500 dark:text-stone-400">
              {language === 'ar'
                ? 'تلتزم إدارة المجمع بالفصل التام والدقيق بين أموال الزكاة، وأموال الأوقاف، والتبرعات والصدقات العامة.'
                : language === 'am'
                ? 'መድረሳችን በዘካ፣ በዋቅፍ እና በአጠቃላይ እርዳታዎች መካከል ጥብቅ የገንዘብ ክፍፍል እና ቁጥጥር ያደርጋል።'
                : 'Our Madrasa maintains strict financial separation between Zakat, Waqf Endowments, and General Donations.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
              <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'ar'
                    ? 'مصارف زكاة المال الشرعية'
                    : language === 'am'
                    ? 'የዘካተል ማል ድልድል'
                    : 'Zakat al-Mal Allocation'}
                </span>
              </h4>
              <p className="text-stone-600 dark:text-stone-400 text-2xs leading-relaxed">
                {language === 'ar'
                  ? 'تُصرف أموال الزكاة حصراً لمستحقيها الشرعيين من الطلاب الفقراء والمساكين والأيتام لتغطية رسومهم ومعيشتهم ومستلزمات دراستهم امتثالاً لقوله تعالى في سورة التوبة: ﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ﴾.'
                  : language === 'am'
                  ? 'የዘካ መዋጮዎች በቁርኣን 9፡60 መሰረት ሙሉ ትምህርታቸውን፣ የኑሮ አበላቸውን እና የቁርኣን መማሪያ ቁሳቁሶችን ለመሸፈን ለችግረኛ፣ ምስኪን እና የቲም ተማሪዎች ብቻ በጥብቅ ይውላል።'
                  : 'Zakat contributions are strictly designated for poor, needy, and orphan students to cover their full tuition, living stipends, and Quranic study supplies in compliance with Quran 9:60.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
              <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'ar'
                    ? 'حماية الأصول الوقفية المؤبدة'
                    : language === 'am'
                    ? 'የዘላቂ ዋቅፍ ንብረት ጥበቃ'
                    : 'Eternal Waqf Asset Protection'}
                </span>
              </h4>
              <p className="text-stone-600 dark:text-stone-400 text-2xs leading-relaxed">
                {language === 'ar'
                  ? 'تُعتبر أصول المجمع (الفصول الدراسية، المصلى، استوديو التسجيل الصوتي) أوقافاً إسلامية مؤبدة محبسة على منفعة حفظة كتاب الله، لا يجوز بيعها ولا التصرف فيها بغير شرط الواقف.'
                  : language === 'am'
                  ? 'የዋቅፍ ንብረቶች (የመማሪያ ክፍሎች፣ የመስገጃ አዳራሽ፣ የድምፅ መቅረጫ መሳሪያዎች) ለሙስሊሙ ማህበረሰብ የተበረከቱ ዘላቂ እስላማዊ ንብረቶች በመሆናቸው ሊሸጡ ወይም ሊወገዱ አይችሉም።'
                  : 'Waqf assets (campus classrooms, prayer hall, audio recording equipment) are held in perpetuity as Islamic community endowments and cannot be sold or liquidated.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Donation Checkout Modal */}
      {activeModalCause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-6 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-600/60 text-amber-200 text-xs font-semibold mb-1">
                  <Heart className="w-3.5 h-3.5 fill-amber-200" />
                  <span>{activeModalCause.badge}</span>
                </div>
                <h3 className="text-lg font-bold font-serif">{activeModalCause.title}</h3>
                <p className="text-xs text-amber-200 font-arabic">{activeModalCause.arabicTitle}</p>
              </div>

              <button
                onClick={() => {
                  setActiveModalCause(null);
                  setCompletedReceipt(null);
                }}
                className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-600/50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {completedReceipt ? (
                /* Completed Receipt View with Printable Certificate */
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold font-serif text-emerald-800 dark:text-emerald-300">
                      {language === 'ar'
                        ? 'جزاكم الله خيراً وتقبل منكم!'
                        : language === 'am'
                        ? 'ጀዛኩሙላሁ ኸይራን!'
                        : 'JazakAllah Khair!'}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      {language === 'ar'
                        ? 'تقبل الله وقفكم المبارك وضاعف أجركم أضعافاً مضاعفة في ميزان حسناتكم.'
                        : language === 'am'
                        ? 'አላህ ያደረጉትን መልካም የዋቅፍ ስጦታ ይቀበልዎት፣ ምንዳዎንም በእጥፍ ያብዛልዎት።'
                        : 'May Allah accept your Waqf and multiply your rewards abundantly.'}
                    </p>
                  </div>

                  {/* Printable Receipt Card */}
                  <div className="p-6 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-left rtl:text-right space-y-3 font-sans text-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-3">
                      <div>
                        <div className="font-bold text-sm text-stone-900 dark:text-white">Al-Imran CMC Madrasa</div>
                        <div className="text-2xs text-stone-500 font-arabic">مجمع آل عمران القرآني الوقفي</div>
                      </div>
                      <div className="text-right rtl:text-left">
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {completedReceipt.receiptNumber}
                        </div>
                        <div className="text-2xs text-stone-500">{completedReceipt.date}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-500 block text-2xs">
                          {language === 'ar' ? 'اسم المتبرع:' : language === 'am' ? 'የለጋሽ ስም:' : 'Donor Name:'}
                        </span>
                        <span className="font-semibold text-stone-900 dark:text-white">{completedReceipt.donorName}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-2xs">
                          {language === 'ar' ? 'المبلغ المساهم به:' : language === 'am' ? 'የተበረከተ መጠን:' : 'Amount Contributed:'}
                        </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {completedReceipt.amount.toLocaleString()} {completedReceipt.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-2xs">
                          {language === 'ar' ? 'المشروع المخصص:' : language === 'am' ? 'የተመረጠ ፈንድ:' : 'Designated Fund:'}
                        </span>
                        <span className="font-medium text-stone-900 dark:text-white">{completedReceipt.causeTitle}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-2xs">
                          {language === 'ar' ? 'وسيلة الدفع:' : language === 'am' ? 'የመክፈያ ዘዴ:' : 'Payment Channel:'}
                        </span>
                        <span className="font-medium text-stone-900 dark:text-white">{completedReceipt.paymentMethod}</span>
                      </div>
                    </div>

                    {completedReceipt.dedication && (
                      <div className="pt-2 border-t border-stone-200 dark:border-stone-700 text-2xs italic text-stone-600 dark:text-stone-400">
                        {language === 'ar' ? 'الإهداء / الدعاء:' : language === 'am' ? 'መታሰቢያ:' : 'Dedication:'} "{completedReceipt.dedication}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handlePrintReceipt}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>
                        {language === 'ar'
                          ? 'طباعة الإيصال الرسمي'
                          : language === 'am'
                          ? 'ኦፊሴላዊ ደረሰኝ አትም'
                          : 'Print Official Receipt'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveModalCause(null);
                        setCompletedReceipt(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                    >
                      {language === 'ar' ? 'تم' : language === 'am' ? 'ጨርስ' : 'Done'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Donation Form */
                <form onSubmit={handleDonationSubmit} className="space-y-4">
                  {/* Amount Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {language === 'ar'
                        ? 'اختر مبلغ التبرع (بالبر الإثيوبي) *'
                        : language === 'am'
                        ? 'የልገሳ መጠን ይምረጡ (በኢትዮጵያ ብር) *'
                        : 'Select Donation Amount (ETB) *'}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[500, 1500, 3000, 5000, 10000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                            amount === amt
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500'
                          }`}
                        >
                          {amt.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="relative mt-2">
                      <span className="absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-xs font-bold text-stone-500">
                        ETB
                      </span>
                      <input
                        type="number"
                        min="50"
                        required
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        placeholder={
                          language === 'ar'
                            ? 'مبلغ مخصص بالبر'
                            : language === 'am'
                            ? 'የራስዎን መጠን በብር ያስገቡ'
                            : 'Custom amount in Birr'
                        }
                        className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Frequency Toggle */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {language === 'ar'
                        ? 'دورية المساهمة'
                        : language === 'am'
                        ? 'የልገሳ ድግግሞሽ'
                        : 'Giving Frequency'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: 'one-time',
                          label: language === 'ar' ? 'مرة واحدة' : language === 'am' ? 'አንድ ጊዜ' : 'One-Time',
                        },
                        {
                          id: 'monthly',
                          label: language === 'ar' ? 'وقف شهري' : language === 'am' ? 'ወርሃዊ ዋቅፍ' : 'Monthly Waqf',
                        },
                        {
                          id: 'annual',
                          label: language === 'ar' ? 'كفالة سنوية' : language === 'am' ? 'ዓመታዊ ድጋፍ' : 'Annual Sponsorship',
                        },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFrequency(f.id as any)}
                          className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            frequency === f.id
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Donor Name & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'ar'
                          ? 'اسم المتبرع / الواقف'
                          : language === 'am'
                          ? 'የለጋሹ ሙሉ ስም'
                          : 'Donor Name'}{' '}
                        {!isAnonymous && '*'}
                      </label>
                      <input
                        type="text"
                        disabled={isAnonymous}
                        value={isAnonymous ? (language === 'ar' ? 'فاعل خير' : language === 'am' ? 'ስሙ ያልተጠቀሰ' : 'Anonymous') : donorName}
                        onChange={e => setDonorName(e.target.value)}
                        placeholder={language === 'ar' ? 'مثال: عبد الرحمن محمد' : language === 'am' ? 'ምሳሌ፡ አብዱራሕማን መሐመድ' : 'e.g. Abdurahman Mohammed'}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'ar'
                          ? 'رقم الهاتف / واتساب'
                          : language === 'am'
                          ? 'ስልክ / ዋትስአፕ'
                          : 'Phone / WhatsApp'}
                      </label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={e => setDonorPhone(e.target.value)}
                        placeholder="+251 9..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Dedication Message & Anonymous Option */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      {language === 'ar'
                        ? 'إهداء أو دعاء لوالديك (اختياري)'
                        : language === 'am'
                        ? 'መታሰቢያ / ዱዓ ለወላጆች (አማራጭ)'
                        : "Dedication Note / Du'a Request (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={dedicationMessage}
                      onChange={e => setDedicationMessage(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'مثال: صدقة جارية عن والديّ رحمهما الله تعالى'
                          : language === 'am'
                          ? 'ምሳሌ፡ ለውድ ወላጆቼ መታሰቢያ ይሁንልኝ'
                          : 'e.g. On behalf of my late parents, may Allah forgive them'
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="anonCheck" className="text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                      {language === 'ar'
                        ? 'التبرع كفاعل خير (إخفاء الاسم من لوحة الشرف العامة)'
                        : language === 'am'
                        ? 'ስሜ እንዳይገለጽ (የተደበቀ ልገሳ)'
                        : 'Keep this donation anonymous on the public donor wall'}
                    </label>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {language === 'ar'
                        ? 'اختر وسيلة الدفع *'
                        : language === 'am'
                        ? 'የመክፈያ ዘዴ ይምረጡ *'
                        : 'Choose Payment Method *'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'telebirr', name: 'Telebirr', num: '+251 911 234 567' },
                        { id: 'cbe', name: 'CBE Bank', num: '1000 4567 8901 2' },
                        { id: 'awash', name: 'Awash Bank', num: '0132 0892 1100 00' },
                        {
                          id: 'card',
                          name: language === 'ar' ? 'بطاقة دولية' : language === 'am' ? 'የውጭ ካርድ' : 'Diaspora Card',
                          num: 'Intl USD/EUR',
                        },
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`p-2 rounded-lg text-left rtl:text-right border transition-all ${
                            paymentMethod === method.id
                              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-900 dark:text-amber-200'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="font-bold text-2xs">{method.name}</div>
                          <div className="text-3xs text-stone-500 truncate">{method.num}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Reference Input */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      {language === 'ar'
                        ? 'رقم مرجع التحويل البنكي / تيليبر (اختياري)'
                        : language === 'am'
                        ? 'የባንክ / የቴሌብር ማስተላለፊያ ማጣቀሻ ቁጥር (አማራጭ)'
                        : 'Bank / Telebirr Transaction Reference ID (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      placeholder="e.g. FT2608..., TB-9948..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-900/20 transition-transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>
                      {language === 'ar'
                        ? `تأكيد وتسجيل التبرع الوقفي (${amount.toLocaleString()} بر إثيوبي)`
                        : language === 'am'
                        ? `ልገሳውን አረጋግጥና ደረሰኝ አውጣ (${amount.toLocaleString()} ብር)`
                        : `Confirm & Generate Waqf Receipt (${amount.toLocaleString()} ETB)`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
