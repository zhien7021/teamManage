import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  UserCheck,
  UserX,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, Member, TimeSlot } from '../../types';

interface MemberAttendanceFormProps {
  member: Member;
  records: AttendanceRecord[];
  onSubmitRecord: (record: Omit<AttendanceRecord, 'id' | 'submittedAt'>) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const MemberAttendanceForm: React.FC<MemberAttendanceFormProps> = ({
  member,
  records,
  onSubmitRecord,
  onShowToast,
}) => {
  // Requirement 1: 在表格第一個可以選要「到校學習申請」還是「請假」
  const [recordType, setRecordType] = useState<'attendance' | 'leave'>('attendance');

  // Date (defaults to tomorrow 2026-09-18 or today)
  const [selectedDate, setSelectedDate] = useState('2026-09-18');

  // Requirement 2: 時段（早上09-12、下午13-17、晚上18-21）
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(['evening']);

  // Leave reason
  const [leaveReason, setLeaveReason] = useState('');

  const slotOptions: { id: TimeSlot; label: string; time: string }[] = [
    { id: 'morning', label: '早上時段', time: '09:00 - 12:00' },
    { id: 'afternoon', label: '下午時段', time: '13:00 - 17:00' },
    { id: 'evening', label: '晚上時段', time: '18:00 - 21:00' },
  ];

  const toggleSlot = (slot: TimeSlot) => {
    if (selectedSlots.includes(slot)) {
      if (selectedSlots.length > 1) {
        setSelectedSlots(selectedSlots.filter((s) => s !== slot));
      } else {
        onShowToast('提醒', '請至少選擇一個留校或請假時段', 'warning');
      }
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.length === 0) {
      onShowToast('送出失敗', '請勾選至少一個時段', 'error');
      return;
    }
    if (recordType === 'leave' && !leaveReason.trim()) {
      onShowToast('送出失敗', '請填寫請假原因（例如：段考溫書、補習等）', 'error');
      return;
    }

    onSubmitRecord({
      studentId: member.id,
      studentName: member.name,
      type: recordType,
      date: selectedDate,
      slots: selectedSlots,
      reason: recordType === 'leave' ? leaveReason.trim() : undefined,
    });

    const typeName = recordType === 'attendance' ? '到校學習申請' : '請假單';
    onShowToast(
      `${typeName}已送出！`,
      `已登錄 ${selectedDate} 的時段，教練與家長可於週曆中查看。`,
      'success'
    );

    if (recordType === 'leave') setLeaveReason('');
  };

  // Recent submissions by this member
  const myRecentSubmissions = records
    .filter((r) => r.studentId === member.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
          <Clock className="w-4 h-4" />
          <span>Attendance & Leave Application</span>
        </div>
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          到校學習申請 / 請假系統
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          登記平日放學後或週末留校實作時間，或針對特定時段填寫請假事由。
        </p>
      </div>

      {/* Requirement 3: 21:00 Rule Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-xs flex items-start gap-3.5">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-800 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-amber-950">
            隊規重要提醒：前一日 21:00 前登記原則
          </h4>
          <p className="text-xs text-amber-900/85 leading-relaxed">
            為維護工坊安全管理、掌握實作教練人力與工具安排，
            <span className="font-bold underline text-amber-950">
              隊員需要在前一天晚上 21:00 前完成隔日之留校時段申請或請假登記
            </span>
            。名冊將即時同步至管理員教練與家長透明專區。
          </p>
        </div>
      </div>

      {/* Main Form & History Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. First Form Option: Select Attendance or Leave */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                1. 申請類別（請選擇到校學習或請假）*
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecordType('attendance')}
                  className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                    recordType === 'attendance'
                      ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs ring-2 ring-orange-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <UserCheck
                    className={`w-5 h-5 ${
                      recordType === 'attendance'
                        ? 'text-orange-600'
                        : 'text-zinc-400'
                    }`}
                  />
                  <div className="text-left">
                    <span className="font-bold text-sm block">到校學習申請</span>
                    <span className="text-[11px] opacity-75">
                      預計留校實作
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordType('leave')}
                  className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                    recordType === 'leave'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <UserX
                    className={`w-5 h-5 ${
                      recordType === 'leave'
                        ? 'text-amber-600'
                        : 'text-zinc-400'
                    }`}
                  />
                  <div className="text-left">
                    <span className="font-bold text-sm block">填寫請假單</span>
                    <span className="text-[11px] opacity-75">無法出席實作</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Date Picker */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                2. 登記日期 *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* 3. Time Slots Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                3. 時段選擇（可複選多個時段）*
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {slotOptions.map((slot) => {
                  const isChecked = selectedSlots.includes(slot.id);

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleSlot(slot.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isChecked
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{slot.label}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-zinc-400 bg-white'
                          }`}
                        >
                          {isChecked && '✓'}
                        </div>
                      </div>
                      <span
                        className={`font-mono text-[11px] ${
                          isChecked ? 'text-zinc-300' : 'text-zinc-500'
                        }`}
                      >
                        {slot.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Leave Reason (If leave) */}
            {recordType === 'leave' && (
              <div className="animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  4. 請假事由 *
                </label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="例如：高中段考物理化學衝刺複習、校外英文補習班、身體微恙等..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold rounded-lg shadow-sm transition-all text-sm"
              >
                <Send className="w-4 h-4" />
                <span>送出{recordType === 'attendance' ? '到校實作登記' : '請假申請'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Recent Submissions History */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h4 className="text-sm font-bold text-zinc-900">
              我的近期申請紀錄
            </h4>
            <span className="text-[11px] text-zinc-400">
              共 {myRecentSubmissions.length} 筆
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {myRecentSubmissions.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                尚未有申請紀錄
              </p>
            ) : (
              myRecentSubmissions.map((rec) => {
                const isAttend = rec.type === 'attendance';

                return (
                  <div
                    key={rec.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      isAttend
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-zinc-900">
                        {rec.date}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAttend
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAttend ? '到校留校' : '請假'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {rec.slots.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700"
                        >
                          {s === 'morning'
                            ? '早 09-12'
                            : s === 'afternoon'
                            ? '午 13-17'
                            : '晚 18-21'}
                        </span>
                      ))}
                    </div>

                    {rec.reason && (
                      <p className="text-[11px] text-zinc-600 italic">
                        事由：{rec.reason}
                      </p>
                    )}

                    <p className="text-[10px] text-zinc-400">
                      填寫時間：{rec.submittedAt}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
