import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  BookMarked,
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  Search,
  FileText,
  Clock,
  Layers,
  Award,
} from 'lucide-react';

interface SubjectItem {
  id: string;
  name: string;
  nameArabic: string;
  category: 'Quranic Sciences' | 'Hadith & Seerah' | 'Fiqh & Creed' | 'Arabic & Grammar' | 'Character & Adab';
  code: string;
  assignedTeacher: string;
  weeklyHours: number;
  coreTextbook: string;
  targetLevel: string;
  description: string;
}

export const SubjectsModule: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const subjects: SubjectItem[] = [
    {
      id: 'subj-1',
      name: 'Qur\'an Hifz & Tilawah',
      nameArabic: 'القرآن الكريم والحفظ المتقن',
      category: 'Quranic Sciences',
      code: 'QRN-101',
      assignedTeacher: 'Sheikh Bilal Ibrahim Al-Habashi',
      weeklyHours: 12,
      coreTextbook: 'Mus\'haf Al-Madinah (Hafs \'an Asim)',
      targetLevel: 'All Levels (Halawat 1-6)',
      description: 'Daily memorization circles focusing on precision recitation, Ayah retention, and continuous revision.',
    },
    {
      id: 'subj-2',
      name: 'Tajweed Rules & Phonetics',
      nameArabic: 'علم التجويد ومخارج الحروف',
      category: 'Quranic Sciences',
      code: 'TJW-102',
      assignedTeacher: 'Sheikh Bilal & Ustaza Maryam',
      weeklyHours: 4,
      coreTextbook: 'Matn Tuhfat Al-Atfal & Matn Al-Jazariyyah',
      targetLevel: "Ibtida'i 3 through Thanawi 3",
      description: 'Systematic study of Noon Sakinah, Meem Sakinah, Madd types, Sifaat, and Makharij with practical oral exams.',
    },
    {
      id: 'subj-3',
      name: 'Arabic Grammar (Nahw & I\'rab)',
      nameArabic: 'النحو العربي وقواعد الإعراب',
      category: 'Arabic & Grammar',
      code: 'ARB-201',
      assignedTeacher: 'Ustaz Abdulaziz Kemal (Al-Azhar)',
      weeklyHours: 6,
      coreTextbook: 'Matn Al-Ajrumiyyah & Sharh Ibn Aqeel',
      targetLevel: "I'dadi 1 - Thanawi 3",
      description: 'Mastery of Arabic sentence structures, verb declensions, nominatives, accusatives, and genitives.',
    },
    {
      id: 'subj-4',
      name: 'Arabic Morphology (Sarf)',
      nameArabic: 'علم الصرف والميزان الصرفي',
      category: 'Arabic & Grammar',
      code: 'ARB-202',
      assignedTeacher: 'Ustaz Abdulaziz Kemal',
      weeklyHours: 3,
      coreTextbook: 'Al-Bina\' wa Al-Asas & Tasreef Al-Af\'al',
      targetLevel: "I'dadi 2 - Thanawi 3",
      description: 'Study of trilateral and quadrilateral verb patterns, derived nouns, plurals, and morphological transformations.',
    },
    {
      id: 'subj-5',
      name: 'Islamic Creed (Aqeedah & Tawheed)',
      nameArabic: 'العقيدة الإسلامية والتوحيد الخالص',
      category: 'Fiqh & Creed',
      code: 'AQD-301',
      assignedTeacher: 'Sheikh Ousman Teshale',
      weeklyHours: 4,
      coreTextbook: 'Kitab At-Tawheed & Al-Aqeedah Al-Wasitiyyah',
      targetLevel: 'All Intermediate & Advanced Classes',
      description: 'Foundations of Tawheed (Ruboobiyyah, Uluhiyyah, Asma wa Sifat), pillars of Iman, and refutation of doubts.',
    },
    {
      id: 'subj-6',
      name: 'Islamic Jurisprudence (Fiqh Al-Ibadat)',
      nameArabic: 'الفقه الإسلامي وأحكام العبادات',
      category: 'Fiqh & Creed',
      code: 'FQH-302',
      assignedTeacher: 'Ustaz Abdulaziz Kemal',
      weeklyHours: 4,
      coreTextbook: 'Al-Fiqh Al-Muyassar & Matn Abi Shuja\'',
      targetLevel: "Ibtida'i 4 - Thanawi 3",
      description: 'Practical jurisprudence of Taharah (Purification), Salah, Sawm (Fasting), Zakat calculation, and Hajj.',
    },
    {
      id: 'subj-7',
      name: 'Prophetic Traditions (Hadith)',
      nameArabic: 'الحديث النبوي الشريف ومصطلح الحديث',
      category: 'Hadith & Seerah',
      code: 'HDT-401',
      assignedTeacher: 'Sheikh Ousman Teshale',
      weeklyHours: 3,
      coreTextbook: 'Al-Arba\'in An-Nawawiyyah & Riyadh As-Saliheen',
      targetLevel: 'All Classes',
      description: 'Memorization and comprehension of authentic prophetic traditions with practical life applications.',
    },
    {
      id: 'subj-8',
      name: 'Prophetic Biography (Seerah) & History',
      nameArabic: 'السيرة النبوية والتاريخ الإسلامي',
      category: 'Hadith & Seerah',
      code: 'SRH-402',
      assignedTeacher: 'Sheikh Ousman Teshale',
      weeklyHours: 3,
      coreTextbook: 'Ar-Raheeq Al-Makhtum (The Sealed Nectar)',
      targetLevel: 'All Classes',
      description: 'Comprehensive study of the life of Prophet Muhammad (ﷺ), the Rightly Guided Caliphs, and early Islam in Abyssinia (Habasha).',
    },
    {
      id: 'subj-9',
      name: 'Islamic Manners & Akhlaq',
      nameArabic: 'الآداب الشرعية وتزكية النفوس',
      category: 'Character & Adab',
      code: 'ADK-501',
      assignedTeacher: 'Ustaza Maryam Siraj',
      weeklyHours: 2,
      coreTextbook: 'Hilyat Talib Al-Ilm & Adab Al-Mu\'allim wa Al-Muta\'allim',
      targetLevel: 'All Primary & Junior Classes',
      description: 'Cultivating Islamic manners, respect for parents and elders, honesty, cleanliness, and brotherhood.',
    },
  ];

  const filteredSubjects = subjects.filter(s => {
    const matchesCat = filterCategory === 'all' || s.category === filterCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nameArabic.includes(searchTerm) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignedTeacher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Curriculum, Syllabi & Islamic Sciences Database"
        arabicPageName="المناهج والعلوم الشرعية"
        recordCount={subjects.length}
        recordLabel="Core Subjects"
      />

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">Islamic Sciences & Curriculum</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              {subjects.length} Core Disciplines
            </span>
          </div>
          <p className="text-xs text-slate-500 font-arabic mt-0.5">
            المناهج والعلوم الشرعية واللغة العربية - مدرسة آل عمران
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Quranic Sciences', 'Arabic & Grammar', 'Fiqh & Creed', 'Hadith & Seerah', 'Character & Adab'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Disciplines' : cat}
              </button>
            )
          )}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {sub.code}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{sub.weeklyHours} hrs/week</span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{sub.name}</h3>
              <p className="text-sm font-arabic font-bold text-emerald-800 mt-0.5">{sub.nameArabic}</p>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                {sub.description}
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-[11px] text-slate-600">
                <div>
                  <span className="font-semibold text-slate-400 block">Instructor</span>
                  <span className="font-bold text-slate-900">{sub.assignedTeacher}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block">Primary Reference / Matn</span>
                  <span className="font-medium text-emerald-900">{sub.coreTextbook}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">{sub.targetLevel}</span>
              <span className="text-emerald-700 font-bold">Standard Syllabus</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
