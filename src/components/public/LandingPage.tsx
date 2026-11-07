import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import {
  BookOpen,
  GraduationCap,
  Heart,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Calendar,
  ChevronDown,
  ChevronUp,
  Building,
  Quote,
  Star,
  ExternalLink,
  BookMarked,
  Sun,
  Moon,
  Globe,
  LogIn,
  Check,
  X,
} from 'lucide-react';
import { CAMPUS_PROGRAMS, FACULTY_MEMBERS, MADRASA_TESTIMONIALS, FAQ_ITEMS, CURRENT_MADRASA_INFO } from '../../data/mockData';
import { EntranceApplicationForm } from '../assessment/EntranceApplicationForm';

export const LandingPage: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    setActiveTab,
    currentUser,
    donationCauses,
    submitAdmissionInquiry,
    addNotification,
  } = useMadrasa();

  // Inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    studentName: '',
    guardianName: '',
    phone: '',
    email: '',
    programInterested: 'Full-Time Qur\'an Hifz & Sanad Program',
    studentAge: '10',
    notes: '',
  });
  const [inquirySubmittedId, setInquirySubmittedId] = useState<string | null>(null);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // FAQ open index state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Selected program for detail modal
  const [selectedProgram, setSelectedProgram] = useState<(typeof CAMPUS_PROGRAMS)[0] | null>(null);
  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.studentName || !inquiryForm.guardianName || !inquiryForm.phone) {
      alert('Please fill in the required fields: Student Name, Guardian Name, and Phone.');
      return;
    }

    setSubmittingInquiry(true);
    setTimeout(() => {
      const id = submitAdmissionInquiry({
        studentName: inquiryForm.studentName,
        guardianName: inquiryForm.guardianName,
        phone: inquiryForm.phone,
        email: inquiryForm.email,
        programInterested: inquiryForm.programInterested,
        studentAge: parseInt(inquiryForm.studentAge) || 8,
        notes: inquiryForm.notes,
      });

      setInquirySubmittedId(id);
      setSubmittingInquiry(false);
      setInquiryForm({
        studentName: '',
        guardianName: '',
        phone: '',
        email: '',
        programInterested: 'Full-Time Qur\'an Hifz & Sanad Program',
        studentAge: '10',
        notes: '',
      });
    }, 600);
  };

  const totalRaised = donationCauses.reduce((acc, c) => acc + c.raisedAmountETB, 0);
  const totalDonors = donationCauses.reduce((acc, c) => acc + c.donorsCount, 0);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Notification Bar */}
      <div className="bg-emerald-800 dark:bg-emerald-950 text-emerald-100 px-4 py-2 text-xs md:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-700 dark:bg-emerald-900 text-emerald-100">
              {language === 'ar' ? 'التسجيل مفتوح' : language === 'am' ? 'ምዝገባ ተከፍቷል' : 'Admissions Open'}
            </span>
            <span>
              {language === 'ar'
                ? 'موسم التسجيل لعام 1448 هـ / 2026 م لحلقات التحفيظ والدراسات الإسلامية'
                : language === 'am'
                ? 'የ2026/1448 ዓ.ሂ የቁርኣን ሂፍዝና የሸሪዓ ትምህርት ምዝገባ ተጀምሯል'
                : 'Academic Year 2026 / 1448 AH Hifz & Shariah Enrollment is now live'}
            </span>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> +251 911 234 567
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> CMC Ayat, Addis Ababa
            </span>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-300 font-serif">
                    {CURRENT_MADRASA_INFO.name}
                  </h1>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-arabic">
                  {CURRENT_MADRASA_INFO.arabicName}
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium text-stone-700 dark:text-stone-300">
              <a href="#about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                {language === 'ar' ? 'عن المجمع' : language === 'am' ? 'ስለ መድረሳው' : 'About Us'}
              </a>
              <a href="#programs" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                {t.ourPrograms}
              </a>
              <a href="#faculty" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                {t.ourFaculty}
              </a>
              <a href="#admissions" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                {t.admissions}
              </a>
              <a href="#faq" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                {t.faq}
              </a>
            </nav>

            {/* Actions: Donate, Day/Night, Lang, Portal */}
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

              {/* Donate Button */}
              <button
                onClick={() => setActiveTab('donate')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span className="hidden xs:inline">{t.donateAndWaqf}</span>
                <span className="xs:hidden">{t.donateNow}</span>
              </button>

              {/* Portal Login / Dashboard Button */}
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-950 text-white py-16 sm:py-24">
        {/* Background Islamic Geometric Pattern Accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
              {/* Ayat Calligraphy Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-arabic">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-white leading-tight">
                {language === 'ar'
                  ? 'صرح قرآني رائد لتربية الأجيال على هدى القرآن والسنة'
                  : language === 'am'
                  ? 'ቁርኣንን በሂፍዝ፣ በዕውቀትና በሥነ-ምግባር የሚያስተምር የልህቀት ማዕከል'
                  : 'Nurturing Generations upon the Noble Qur\'an & Prophetic Sunnah'}
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'مجمع آل عمران بسي إم سي بأديስ أبابا يقدم برامج تحفيظ متكاملة بالسند المتصل إلى النبي ﷺ، مع تعليم متين للغة العربية والعلوم الشرعية لجميع الأعمار في بيئة تربوية ملهمة.'
                  : language === 'am'
                  ? 'በሲኤምሲ አዲስ አበባ የሚገኘው አል ዒምራን መድረሳ የተሟላ የቁርኣን ሂፍዝ፣ የተጅዊድ ሰነድ፣ የሸሪዓ እውቀቶችና የአረብኛ ቋንቋ ትምህርት በልዩ ጥራት ያቀርባል።'
                  : 'Al-Imran CMC Madrasa provides accredited full-time and weekend Qur\'an Tahfeez with continuous Sanad transmission to the Prophet ﷺ, classical Arabic Nahw, and Islamic Sciences in Addis Ababa.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <a
                  href="#admissions"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/30 transition-transform active:scale-95"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>{t.applyNow}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </a>

                <button
                  onClick={() => setActiveTab('donate')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-900/30 transition-transform active:scale-95"
                >
                  <Heart className="w-5 h-5 fill-amber-950" />
                  <span>{t.donateAndWaqf}</span>
                </button>

                <a
                  href="#programs"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/90 text-white font-semibold text-sm border border-emerald-600/40 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.ourPrograms}</span>
                </a>
              </div>

              {/* Accreditation Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Accredited Sanad & Ijazah</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Shariah Board Supervised</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-300 shrink-0" />
                  <span>Separate Boys & Girls Halawat</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Card / Visual Spotlight */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 dark:bg-stone-900/40 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 shadow-2xl text-white space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-sm">Al-Imran CMC Campus</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200">
                    Est. 2018 / 1439 AH
                  </span>
                </div>

                {/* Live Campus Highlights */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center shrink-0">
                      <BookMarked className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Authentic Sanad Chain</h4>
                      <p className="text-xs text-emerald-200">Connected through Hafs 'an Asim with Shatibiyyah and Durrah pathways.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-teal-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">520+ Active Enrolled Students</h4>
                      <p className="text-xs text-emerald-200">Morning Tahfeez, Afternoon Islamic Academy, and Weekend Community Circles.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 text-rose-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Orphan & Needy Hifz Sponsorship</h4>
                      <p className="text-xs text-emerald-200">Over 80+ underprivileged students fully sponsored through Waqf donations.</p>
                    </div>
                  </div>
                </div>

                {/* Quick Waqf Progress Mini-Card */}
                <div className="bg-emerald-950/60 rounded-xl p-4 border border-emerald-500/30">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-emerald-200 font-medium">Campus Expansion & Waqf Fund</span>
                    <span className="text-amber-400 font-bold">{((totalRaised / 5000000) * 100).toFixed(0)}% Funded</span>
                  </div>
                  <div className="w-full bg-emerald-900/80 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (totalRaised / 5000000) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300">{totalRaised.toLocaleString()} ETB Raised</span>
                    <button
                      onClick={() => setActiveTab('donate')}
                      className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1"
                    >
                      <span>Donate Now</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Impact Ribbon */}
      <section className="bg-emerald-800 dark:bg-emerald-950 text-white border-y border-emerald-700 dark:border-emerald-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">520+</div>
              <div className="text-xs sm:text-sm text-emerald-100 font-medium">Enrolled Students</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">18</div>
              <div className="text-xs sm:text-sm text-emerald-100 font-medium">Hafiz Graduates with Sanad</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">24+</div>
              <div className="text-xs sm:text-sm text-emerald-100 font-medium">Certified Sheikhs & Ustazas</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">100%</div>
              <div className="text-xs sm:text-sm text-emerald-100 font-medium">Waqf Shariah Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Madrasa Section */}
      <section id="about" className="py-16 sm:py-24 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: About Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Our Heritage & Mission</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif text-stone-900 dark:text-white">
                {language === 'ar'
                  ? 'رسالتنا: تنشئة جيل قرآني متقن، ذي علم وخلق وريادة'
                  : language === 'am'
                  ? 'ተልእኮአችን፡ ቁርኣንን በልብ የያዘ፣ እውቀትና መልካም ስነ-ምግባር የተላበሰ ትውልድ ማፍራት'
                  : 'Cultivating Hearts with the Words of Allah & Noble Character'}
              </h2>

              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
                Established under the guidance of esteemed Ethiopian Islamic scholars and Sheikhs, Al-Imran CMC Madrasa is dedicated to serving the Muslim community through structured, traditional, and pedagogically sound Quranic education.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Rigorous Tahfeez Methodology</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Systematic daily Sabaq (new memorization), Sabqi (recent review), and cumulative Muraja'ah tracked in our digital ledger.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ahlus-Sunnah Shariah Basis</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Grounded in sound Aqeedah, Fiqh of worship, Hadith memorization, Seerah, and Islamic manners (Adab).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connected Sanad Transmission</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Qualifying graduates receive accredited Ijazah certificates verifying their recitation connected to the Prophet ﷺ.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Holistic Student Care</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Safe transport bus service, nutritious meals for full-time students, and dedicated sisters wing with female Ustazas.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Madrasa Photo / Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-700">
                <img
                  src="/madrasa.jpg"
                  alt="Al-Imran CMC Madrasa"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="p-5 bg-stone-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>CMC Campus Tahfeez Circle</span>
                    <span>President of our Institution</span>
                  </div>
                  <p className="text-xs text-stone-300 font-arabic text-right">
                    «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — رواه البخاري
                  </p>
                  <p className="text-xs text-stone-400 italic">
                    "The best among you are those who learn the Qur'an and teach it." — Sahih Al-Bukhari
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs Section */}
      <section id="programs" className="py-16 sm:py-24 bg-stone-100 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900 dark:text-white">
              {t.ourPrograms}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400">
              Tailored educational pathways designed for children, teenagers, mothers, and working professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAMPUS_PROGRAMS.map(prog => (
              <div
                key={prog.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {prog.badge}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {prog.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white font-serif">{prog.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-arabic mt-0.5">{prog.arabicTitle}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                    <div className="font-semibold text-stone-800 dark:text-stone-200 mb-1">Key Highlights:</div>
                    {prog.highlights.slice(0, 3).map((hl, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400">{prog.targetAge}</span>
                  <a
                    href="#admissions"
                    onClick={() => setInquiryForm(prev => ({ ...prev, programInterested: prog.title }))}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Apply for this</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Distinguished Faculty Section */}
      <section id="faculty" className="py-16 sm:py-24 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Certified Authorities & Scholars</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900 dark:text-white">
              {t.ourFaculty}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400">
              Guided by distinguished graduates of Al-Azhar, Madinah Islamic University, and accredited Sanad holders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACULTY_MEMBERS.map((fac, idx) => (
              <div
                key={idx}
                className="bg-stone-50 dark:bg-stone-800/70 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <img src={fac.photo} alt={fac.name} className="w-full h-48 object-cover object-top" />
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-stone-900 dark:text-white font-serif">{fac.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-arabic">{fac.arabicName}</p>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{fac.role}</p>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {fac.qualifications}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Focus:</span> {fac.specialty}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waqf & Donation Callout Banner */}
      <section className="py-16 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left rtl:lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/50 text-amber-100 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-amber-100" />
                <span>Sadaqah Jariyah & Waqf Endowment</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-serif">
                {language === 'ar'
                  ? '«إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به...»'
                  : language === 'am'
                  ? 'የቁርኣን ሂፍዝ ተማሪዎችን ይደግፉ፤ በሰደቃ ጃሪያ ዘላለማዊ ምንዳን ያግኙ'
                  : 'Invest in Eternal Sadaqah Jariyah for the Qur\'an'}
              </h2>
              <p className="text-amber-100 text-sm sm:text-base max-w-2xl">
                Support orphan students memorizing the Holy Qur'an, donate Mus'hafs, or contribute to our CMC Campus Expansion Waqf. Every Birr contributed directly sustains Quranic education in Ethiopia.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center">
              <button
                onClick={() => setActiveTab('donate')}
                className="w-full sm:w-auto lg:w-full px-6 py-4 rounded-xl bg-white hover:bg-stone-100 text-amber-900 font-extrabold text-sm sm:text-base shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-amber-900" />
                <span>{t.donateAndWaqf}</span>
              </button>

              <button
                onClick={() => setActiveTab('donate')}
                className="w-full sm:w-auto lg:w-full px-6 py-3.5 rounded-xl bg-amber-800/80 hover:bg-amber-900 text-white font-semibold text-xs sm:text-sm border border-amber-400/40 text-center"
              >
                <span>Sponsor a Hafiz Student (1,500 ETB/mo)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Online Admission Inquiry & Enrollment Form */}
      <section id="admissions" className="py-16 sm:py-24 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Admission Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{t.admissionsAndPlacement}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900 dark:text-white">
                {t.admissions}
              </h2>

              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                {t.admissionsHeroSubtitle}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-white">{t.stepOnlineInquiry}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{t.stepOnlineInquiryDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-white">{t.stepOralLevelAssessment}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{t.stepOralLevelAssessmentDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 dark:text-white">{t.stepOrientationStart}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{t.stepOrientationStartDesc}</p>
                  </div>
                </div>
              </div>

              {/* Direct Contact Details */}
              <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <div className="font-semibold text-sm text-stone-900 dark:text-white">{t.admissionsOffice}</div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>+251 911 234 567 / +251 912 887 766</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>admissions@alimran-madrasa.et</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{t.campusLocationText}</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Admission Inquiry Form */}
            <div className="lg:col-span-7 space-y-4">
              {/* Online Entrance Assessment Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-600/40">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>{t.recommendedForProspectiveStudents}</span>
                  </div>
                  <h4 className="font-bold text-base text-white">
                    {t.onlineEntranceApplicationTitle}
                  </h4>
                  <p className="text-xs text-emerald-200/90 max-w-md">
                    {t.onlineEntranceApplicationDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEntranceModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                >
                  <span>{t.openApplicationForm}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-md">
                <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-white mb-1">
                  {t.quickAdmissionInquiryForm}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                  {t.quickAdmissionInquirySubtitle}
                </p>

                {inquirySubmittedId ? (
                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                      {t.admissionInquiryReceivedTitle}
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      {t.admissionInquiryReceivedMsg.replace('{0}', inquirySubmittedId)}
                    </p>
                    <button
                      onClick={() => setInquirySubmittedId(null)}
                      className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                    >
                      {t.submitAnotherInquiry}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          {t.studentFullNameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiryForm.studentName}
                          onChange={e => setInquiryForm({ ...inquiryForm, studentName: e.target.value })}
                          placeholder={t.studentFullNamePlaceholder}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          {t.studentAgeLabel}
                        </label>
                        <select
                          value={inquiryForm.studentAge}
                          onChange={e => setInquiryForm({ ...inquiryForm, studentAge: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="4">{t.age4to6Qaida}</option>
                          <option value="7">{t.age7to9PrimaryHifz}</option>
                          <option value="10">{t.age10to14FullTahfeez}</option>
                          <option value="15">{t.age15to18AdvancedSanad}</option>
                          <option value="19">{t.age19PlusAdults}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          {t.parentGuardianNameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiryForm.guardianName}
                          onChange={e => setInquiryForm({ ...inquiryForm, guardianName: e.target.value })}
                          placeholder={t.parentGuardianNamePlaceholder}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          {t.phoneWhatsAppDirectLabel}
                        </label>
                        <input
                          type="tel"
                          required
                          value={inquiryForm.phone}
                          onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          placeholder="+251 9..."
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          {t.emailOptionalLabel}
                        </label>
                        <input
                          type="email"
                          value={inquiryForm.email}
                          onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          placeholder="guardian@example.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          {t.programInterestedInLabel}
                        </label>
                        <select
                          value={inquiryForm.programInterested}
                          onChange={e => setInquiryForm({ ...inquiryForm, programInterested: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                          {CAMPUS_PROGRAMS.map(p => (
                            <option key={p.id} value={p.title}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        {t.currentMemorizationLevelOrNoteLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={inquiryForm.notes}
                        onChange={e => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                        placeholder={t.currentMemorizationNotePlaceholder}
                        className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingInquiry}
                      className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                    >
                      {submittingInquiry ? (
                        <span>{t.processingInquiry}</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{t.submitAdmissionInquiryBtn}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-16 sm:py-24 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Quote className="w-3.5 h-3.5" />
              <span>{t.testimonials}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900 dark:text-white">
              Words from our Families & Graduates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MADRASA_TESTIMONIALS.map((test, idx) => (
              <div
                key={idx}
                className="bg-stone-50 dark:bg-stone-800/60 p-6 rounded-2xl border border-stone-200 dark:border-stone-700/60 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-700/60">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white font-serif">{test.name}</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">{test.role} • {test.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 sm:py-24 bg-stone-100 dark:bg-stone-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900 dark:text-white">
              {t.faq}
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left rtl:text-right flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <div>
                    <span>{faq.question}</span>
                    <span className="block text-xs font-normal text-stone-500 dark:text-stone-400 font-arabic mt-0.5">
                      {faq.arabicQuestion}
                    </span>
                  </div>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>

                {expandedFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-base font-serif">{CURRENT_MADRASA_INFO.name}</span>
            </div>
            <p className="leading-relaxed">
              Dedicated to pure Islamic education, noble Qur'anic memorization with Sanad, and raising righteous leaders in Ethiopia.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Quick Links</h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#about" className="hover:text-emerald-400">About Al-Imran</a>
              </li>
              <li>
                <a href="#programs" className="hover:text-emerald-400">Academic Programs</a>
              </li>
              <li>
                <a href="#admissions" className="hover:text-emerald-400">Admissions & Placement</a>
              </li>
              <li>
                <button onClick={() => setActiveTab('donate')} className="hover:text-emerald-400">
                  Donate & Waqf Fund
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Portals & Access</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400">
                  Administrative Portal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('students')} className="hover:text-emerald-400">
                  Student Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('quran')} className="hover:text-emerald-400">
                  Hifz Progress Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Contact Information</h4>
            <p>CMC Road, near Michael Church, Addis Ababa, Ethiopia</p>
            <p>Phone: +251 911 234 567 / +251 912 887 766</p>
            <p>Email: contact@alimran-madrasa.et</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500">
          <p>© {new Date().getFullYear()} Al-Imran CMC Madrasa. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>CMC Addis Ababa</span>
            <span>•</span>
            <span>Accredited Tahfeez Center</span>
          </div>
        </div>
      </footer>

      {/* Online Entrance Assessment Modal */}
      {isEntranceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Online Entrance Application Portal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEntranceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <EntranceApplicationForm
                isPublicView={true}
                onSuccess={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
