import React, { useState } from 'react';
import { MadrasaProvider, useMadrasa } from './context/MadrasaContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { FirstAdminOnboarding } from './components/auth/FirstAdminOnboarding';
import { LandingPage } from './components/public/LandingPage';
import { DonationPage } from './components/public/DonationPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StudentManagement } from './components/students/StudentManagment';
import { TeacherManagement } from './components/teachers/TeacherManagement';
import { QuranMemorizationModule } from './components/quran/QuranMemorizationModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { SubjectsModule } from './components/subjects/SubjectsModule';
import { ExamReportCardModule } from './components/exams/ExamReportCardModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { HomeworkModule } from './components/homework/HomeWorkModule';
import { CertificatesModule } from './components/certificates/CertificatesModule';
import { EntranceAssessmentModule } from './components/assessment/EntranceAssessmentModule';
import { NotificationsModule } from './components/notifications/NotificationsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { IDCardStudio } from './components/IdCards/IDCardsStudio';
import { AuditTrailModule } from './components/audit/AuditTrailModule';
import { AccessDenied } from './components/common/AccessDenied';
import { LoginModal } from './components/auth/LoginModal';

const MadrasaAppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isFirstTimeSetup, theme, dir } = useMadrasa();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Standalone Public Pages (Landing & Donation) - always openly accessible without login
  if (activeTab === 'landing') {
    return <LandingPage />;
  }

  if (activeTab === 'donate') {
    return <DonationPage />;
  }

  if (activeTab === 'onboarding') {
    return <FirstAdminOnboarding onBack={() => setActiveTab('landing')} />;
  }

  // If activeTab is 'login' or not logged in, show secure login portal with back-to-landing option
  if (activeTab === 'login' || !currentUser) {
    return (
      <div
        dir={dir}
        className={`min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-white ${
          theme === 'dark' ? 'dark' : ''
        }`}
      >
        <LoginModal onClose={() => setActiveTab('landing')} />
      </div>
    );
  }

  const userRole = currentUser?.role || 'teacher';
  const isAdmin = userRole === 'super_admin' || userRole === 'principal';
  const isExecutiveOrRegistrar = isAdmin || userRole === 'vice_principal' || userRole === 'registrar';

  const canAccessStudents = isExecutiveOrRegistrar || userRole === 'finance_officer' || userRole === 'hifz_teacher' || userRole === 'teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessTeachers = isAdmin || userRole === 'vice_principal' || userRole === 'registrar' || userRole === 'teacher' || userRole === 'hifz_teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessQuran = isExecutiveOrRegistrar || userRole === 'hifz_teacher' || userRole === 'teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessAttendance = isExecutiveOrRegistrar || userRole === 'hifz_teacher' || userRole === 'teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessSubjects = isAdmin || userRole === 'vice_principal' || userRole === 'registrar' || userRole === 'teacher' || userRole === 'hifz_teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessExams = isAdmin || userRole === 'vice_principal' || userRole === 'teacher' || userRole === 'hifz_teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessFinance = isAdmin || userRole === 'finance_officer' || userRole === 'parent' || userRole === 'student' || userRole === 'registrar';
  const canAccessCertificates = isExecutiveOrRegistrar || userRole === 'hifz_teacher' || userRole === 'teacher' || userRole === 'student' || userRole === 'parent';
  const canAccessAssessment = isExecutiveOrRegistrar || userRole === 'parent' || userRole === 'student';
  const canAccessIDCards = isExecutiveOrRegistrar || userRole === 'teacher' || userRole === 'hifz_teacher' || userRole === 'student' || userRole === 'parent';

  return (
    <div
      dir={dir}
      className={`min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/90 dark:bg-slate-950/90 transition-all">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && <DashboardOverview />}

            {activeTab === 'students' && (
              canAccessStudents ? (
                <StudentManagement />
              ) : (
                <AccessDenied
                  pageName="Student Directory & Records"
                  arabicPageName="سجل الطلاب والقبول"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'registrar', 'finance_officer', 'teacher']}
                />
              )
            )}

            {activeTab === 'teachers' && (
              canAccessTeachers ? (
                <TeacherManagement />
              ) : (
                <AccessDenied
                  pageName="Staff & Faculty Management"
                  arabicPageName="إدارة هيئة التدريس والمشايخ"
                  requiredRoles={['super_admin', 'principal', 'vice_principal']}
                />
              )
            )}

            {activeTab === 'quran' && (
              canAccessQuran ? (
                <QuranMemorizationModule />
              ) : (
                <AccessDenied
                  pageName="Qur'an Memorization Administration"
                  arabicPageName="إدارة تحفيظ القرآن الكريم"
                  requiredRoles={['super_admin', 'principal', 'hifz_teacher', 'student', 'parent']}
                />
              )
            )}

            {activeTab === 'attendance' && (
              canAccessAttendance ? (
                <AttendanceModule />
              ) : (
                <AccessDenied
                  pageName="Attendance Tracking"
                  arabicPageName="سجل الحضور والغياب"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'registrar', 'teacher', 'student', 'parent']}
                />
              )
            )}

            {activeTab === 'subjects' && (
              canAccessSubjects ? (
                <SubjectsModule />
              ) : (
                <AccessDenied
                  pageName="Curriculum & Subjects"
                  arabicPageName="المناهج والعلوم الشرعية"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'teacher']}
                />
              )
            )}

            {activeTab === 'exams' && (
              canAccessExams ? (
                <ExamReportCardModule />
              ) : (
                <AccessDenied
                  pageName="Examinations & Official Report Cards"
                  arabicPageName="الاختبارات والشهادات"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'teacher', 'student', 'parent']}
                />
              )
            )}

            {activeTab === 'finance' && (
              canAccessFinance ? (
                <FinanceModule />
              ) : (
                <AccessDenied
                  pageName="Financial Accounts & Fee Collection"
                  arabicPageName="الحسابات والرسوم الدراسية"
                  requiredRoles={['super_admin', 'principal', 'finance_officer', 'parent', 'student']}
                />
              )
            )}

            {activeTab === 'homework' && <HomeworkModule />}

            {activeTab === 'certificates' && (
              canAccessCertificates ? (
                <CertificatesModule />
              ) : (
                <AccessDenied
                  pageName="Sanad & Certificate Issuance"
                  arabicPageName="الإجازات والشهادات المعتمدة"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'registrar', 'hifz_teacher', 'student', 'parent']}
                />
              )
            )}

            {activeTab === 'assessment' && (
              canAccessAssessment ? (
                <EntranceAssessmentModule />
              ) : (
                <AccessDenied
                  pageName="Entrance Assessment & Placement"
                  arabicPageName="اختبار القبول والمستوى"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'registrar', 'parent']}
                />
              )
            )}

            {(activeTab === 'notifications' || activeTab === 'communication') && <NotificationsModule />}

            {activeTab === 'id_cards' && (
              canAccessIDCards ? (
                <IDCardStudio />
              ) : (
                <AccessDenied
                  pageName="Official ID Card & Badge Studio"
                  arabicPageName="استوديو البطاقات الجامعية والتعريفية"
                  requiredRoles={['super_admin', 'principal', 'vice_principal', 'registrar']}
                />
              )
            )}

            {activeTab === 'audit_trail' && (
              isAdmin ? (
                <AuditTrailModule />
              ) : (
                <AccessDenied
                  pageName="System Audit Trail & Security Logs"
                  arabicPageName="سجل العمليات والأمان"
                  requiredRoles={['super_admin', 'principal']}
                />
              )
            )}

            {activeTab === 'settings' && (
              isAdmin ? (
                <SettingsModule />
              ) : (
                <AccessDenied
                  pageName="Madrasa Administration & Database Settings"
                  arabicPageName="الإعدادات وقاعدة البيانات"
                  requiredRoles={['super_admin', 'principal']}
                />
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MadrasaProvider>
      <MadrasaAppContent />
    </MadrasaProvider>
  );
}
