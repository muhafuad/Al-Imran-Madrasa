import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import type { AttendanceStatus } from '../../types';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import { canTakeAttendance } from '../../utils/permissions';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  Printer,
  FileDown,
  Sparkles,
  Calendar,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { students, attendanceRecords, recordBatchAttendance, currentUser } = useMadrasa();

  const userRole = currentUser?.role;
  const canTake = canTakeAttendance(userRole);
  const isStudent = userRole === 'student';
  const isParent = userRole === 'parent';

  // Find student record if logged in as student
  const myStudentRecord = isStudent
    ? students.find(
        (s) =>
          s.id === currentUser?.id ||
          s.guardianEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
          `${s.firstName} ${s.lastName}`.toLowerCase() === currentUser?.name?.toLowerCase()
      ) || students[0]
    : null;

  const [selectedClass, setSelectedClass] = useState<string>(
    myStudentRecord?.currentClass || 'Class 8-A'
  );
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Attendance status mapping for the live sheet
  const classStudents = students.filter(
    (s) => s.currentClass === selectedClass || selectedClass === 'All Classes'
  );

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      initial[s.id] = 'present';
    });
    return initial;
  });

  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!canTake) return;
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    if (!canTake) return;
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceMap((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveAttendance = () => {
    if (!canTake) return;
    const batch = classStudents.map((s) => ({
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      date: selectedDate,
      classId: selectedClass.toLowerCase().replace(/\s+/g, '-'),
      className: selectedClass,
      status: attendanceMap[s.id] || 'present',
      remarks: remarksMap[s.id] || '',
      recordedBy: currentUser?.name || 'Class Ustaz',
    }));

    recordBatchAttendance(batch);
    alert(`Alhamdulillah! Attendance saved for ${batch.length} students in ${selectedClass}.`);
  };

  // Metrics for current class sheet
  const presentCount = classStudents.filter((s) => (attendanceMap[s.id] || 'present') === 'present').length;
  const lateCount = classStudents.filter((s) => attendanceMap[s.id] === 'late').length;
  const excusedCount = classStudents.filter((s) => attendanceMap[s.id] === 'excused').length;
  const absentCount = classStudents.filter((s) => attendanceMap[s.id] === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status (Automatically hidden for student/parent) */}
      <DatabaseStatusBanner
        pageName="Daily Attendance & Rosters Database"
        arabicPageName="سجل الحضور والغياب"
        recordCount={attendanceRecords.length}
        recordLabel="Attendance Logs"
      />

      {/* Student Personal Attendance Dossier (When logged in as Student) */}
      {isStudent && myStudentRecord && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={myStudentRecord.photoUrl}
                alt={myStudentRecord.firstName}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-400/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Official Student Profile
                  </span>
                  <span className="text-xs text-emerald-200 font-mono">
                    ID: {myStudentRecord.admissionNumber}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {myStudentRecord.firstName} {myStudentRecord.lastName}
                </h2>
                <p className="text-xs text-emerald-200 font-arabic">
                  {myStudentRecord.arabicName} • {myStudentRecord.currentClass}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
              <div className="text-center">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Term Attendance
                </span>
                <span className="text-2xl font-black text-white">
                  {myStudentRecord.attendanceRate}%
                </span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                  Status
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 inline-block mt-0.5">
                  Regular / ممتاز
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {isStudent ? 'My Attendance & Class Register' : 'Attendance Register & Analytics'}
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {isStudent ? 'Student View' : 'Daily Roster'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic mt-0.5">
            {isStudent
              ? 'متابعة سجل الحضور والغياب اليومي ونسبة المواظبة'
              : 'سجل الحضور والغياب اليومي للطلاب وهيئة التدريس'}
          </p>
        </div>

        {canTake && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Save Attendance Sheet</span>
            </button>
          </div>
        )}
      </div>

      {/* Class & Date Selector + Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Select Class / Halqah
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="Class 8-A" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Class 8-A (I'dadi 2)</option>
            <option value="Class 4-B (Girls)" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Class 4-B (Girls Section)</option>
            <option value="Class 9-A" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Class 9-A (Thanawi 1)</option>
            <option value="Class 2-A" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Class 2-A (Ibtida'i 2)</option>
            <option value="Class 5-A" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Class 5-A (Ibtida'i 5)</option>
            <option value="All Classes" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Registered Students</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Attendance Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!canTake}
            className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 ${
              !canTake ? 'opacity-80 cursor-default' : ''
            }`}
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-around bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2 border border-slate-100 dark:border-slate-700 text-xs">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Present</span>
            <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-black">{presentCount}</strong>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Late</span>
            <strong className="text-amber-600 dark:text-amber-400 text-sm font-black">{lateCount}</strong>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Excused</span>
            <strong className="text-blue-600 dark:text-blue-400 text-sm font-black">{excusedCount}</strong>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Absent</span>
            <strong className="text-rose-600 dark:text-rose-400 text-sm font-black">{absentCount}</strong>
          </div>
        </div>
      </div>

      {/* Attendance Roll Call Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Student Name / ID</th>
                <th className="px-4 py-3">Attendance Status</th>
                <th className="px-4 py-3">Remarks / Reason</th>
                <th className="px-4 py-3 text-right">Term Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.map((student) => {
                const currentStatus = attendanceMap[student.id] || 'present';
                const isCurrentMe = myStudentRecord?.id === student.id;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isCurrentMe
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 font-semibold'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl}
                          alt={student.firstName}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {student.firstName} {student.lastName}
                            </span>
                            {isCurrentMe && (
                              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-arabic text-emerald-800 dark:text-emerald-400 font-semibold">
                            {student.arabicName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {student.admissionNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Display or Interactive Buttons */}
                    <td className="px-4 py-3">
                      {canTake ? (
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'late')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'excused')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              currentStatus === 'excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Excused
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          {currentStatus === 'present' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Present (حاضر)</span>
                            </span>
                          )}
                          {currentStatus === 'late' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Late (متأخر)</span>
                            </span>
                          )}
                          {currentStatus === 'excused' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Excused (معذور)</span>
                            </span>
                          )}
                          {currentStatus === 'absent' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>Absent (غائب)</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Remarks Display or Input */}
                    <td className="px-4 py-3">
                      {canTake ? (
                        <input
                          type="text"
                          placeholder="Optional reason e.g. sick with doctor note..."
                          value={remarksMap[student.id] || ''}
                          onChange={(e) =>
                            setRemarksMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                          }
                          className="w-full max-w-xs px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-xs italic">
                          {remarksMap[student.id] || 'Verified regular attendance'}
                        </span>
                      )}
                    </td>

                    {/* Term Attendance Rate */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {student.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
