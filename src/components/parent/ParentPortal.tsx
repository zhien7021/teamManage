import React, { useState } from 'react';
import {
  HeartHandshake,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { AttendanceRecord, TeamEvent, Member, TimeSlot } from '../../types';

interface ParentPortalProps {
  studentName: string;
  members: Member[];
  events: TeamEvent[];
  attendanceRecords: AttendanceRecord[];
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  studentName,
  members,
  events,
  attendanceRecords,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [portalTab, setPortalTab] = useState<'attendance' | 'events'>('attendance');

  // Find target student
  const matchedStudent = members.find((m) =>
    m.name.includes(studentName) || studentName.includes(m.name)
  );

  // Base date: Monday 2026-09-14
  const baseMonday = new Date(2026, 8, 14);
  const currentMonday = new Date(baseMonday);
  currentMonday.setDate(baseMonday.getDate() + weekOffset * 7);

  // 7 days of the selected week
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dayName = dayNames[d.getDay()];

    return {
      dateStr,
      displayDate: `${d.getMonth() + 1}月${d.getDate()}日`,
      dayName,
      isToday: dateStr === '2026-09-17',
    };
  });

  const slotLabel = (slot: TimeSlot) => {
    return {
      morning: '早 09-12',
      afternoon: '午 13-17',
      evening: '晚 18-21',
    }[slot];
  };

  // Student specific records in this week
  const studentWeekRecords = attendanceRecords.filter((r) => {
    const isTarget = matchedStudent
      ? r.studentId === matchedStudent.id
      : r.studentName.includes(studentName);
    const inWeek = daysOfWeek.some((d) => d.dateStr === r.date);
    return isTarget && inWeek;
  });

  // Sorted upcoming events
  const sortedEvents = [...events].sort((a, b) =>
    `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
  );

  return (
    <div className="space-y-6">
      {/* Warm Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50/40 border border-orange-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-bold shadow-2xs">
              <HeartHandshake className="w-4 h-4" />
              <span>家長關心專區 (免密碼登入)</span>
            </div>

            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              {studentName} 家長 您好！
            </h2>
            <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
              歡迎關心新北市立錦和高中 FRC 10114 機器人校隊！此頁面專為家長呈現貴子弟在校實作活動安排、本週留校時段與請假狀態，陪伴孩子在科技工程路上發光發熱。
            </p>
          </div>

          {matchedStudent && (
            <div className="p-4 bg-white rounded-xl border border-orange-200 shadow-xs text-xs space-y-1 self-start md:self-auto min-w-[220px]">
              <div className="text-[11px] text-zinc-400">學生基本資料</div>
              <div className="font-extrabold text-base text-zinc-900">
                {matchedStudent.name}
              </div>
              <div className="text-zinc-500 font-mono">
                學號編號：{matchedStudent.id}
              </div>
              <div className="text-orange-600 font-semibold pt-1">
                所屬組別：{matchedStudent.departments.join(' / ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child's Attendance Status Quick Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>貴子弟「{studentName}」本週到校實作與請假動態</span>
          </h3>
          <span className="text-xs text-zinc-400">
            共登記 {studentWeekRecords.length} 筆時段
          </span>
        </div>

        {studentWeekRecords.length === 0 ? (
          <p className="text-xs text-zinc-400 py-3 text-center">
            本週尚未有登記紀錄，或孩子於實作前一日晚上 21:00 前完成填寫
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {studentWeekRecords.map((r) => {
              const isAttend = r.type === 'attendance';

              return (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    isAttend
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-zinc-900">{r.date}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAttend
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAttend ? '到校留校實作' : '請假未到'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {r.slots.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] font-mono text-zinc-700"
                      >
                        {slotLabel(s)}
                      </span>
                    ))}
                  </div>

                  {r.reason && (
                    <p className="text-[11px] text-zinc-600 italic">
                      事由：{r.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dual Tab Switcher for Parent: 1. 全隊一週到校名單 2. 團隊活動行程 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setPortalTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              portalTab === 'attendance'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>全隊到校學習與請假名單 (週曆)</span>
          </button>

          <button
            onClick={() => setPortalTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              portalTab === 'events'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>團隊活動行程與公告 ({events.length})</span>
          </button>
        </div>

        {/* Week Switcher (if in attendance tab) */}
        {portalTab === 'attendance' && (
          <div className="flex items-center gap-1.5 bg-zinc-50 p-1 rounded-lg border border-zinc-200 text-xs">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1 text-zinc-600 hover:bg-white rounded"
              title="上週"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold px-2 text-zinc-800">
              {weekOffset === 0 ? '本週' : `${weekOffset > 0 ? '+' : ''}${weekOffset} 週`}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1 text-zinc-600 hover:bg-white rounded"
              title="下週"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 1. WEEKLY ATTENDANCE MATRIX FOR PARENTS */}
      {portalTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {daysOfWeek.map((day) => {
            const dayRecords = attendanceRecords.filter((r) => r.date === day.dateStr);
            const presentList = dayRecords.filter((r) => r.type === 'attendance');
            const leaveList = dayRecords.filter((r) => r.type === 'leave');

            return (
              <div
                key={day.dateStr}
                className={`bg-white border rounded-xl shadow-xs overflow-hidden flex flex-col justify-between ${
                  day.isToday
                    ? 'border-orange-500 ring-2 ring-orange-500/10'
                    : 'border-zinc-200'
                }`}
              >
                {/* Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between ${
                    day.isToday
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-900">
                      {day.displayDate}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                      {day.dayName}
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                      今天
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-3 flex-1 text-xs">
                  {/* Present */}
                  <div>
                    <span className="text-emerald-800 font-bold flex items-center gap-1 mb-1 text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      留校名單 ({presentList.length} 人)
                    </span>
                    {presentList.length === 0 ? (
                      <p className="text-zinc-400 text-[11px] italic">尚無留校隊員</p>
                    ) : (
                      <div className="space-y-1">
                        {presentList.map((rec) => {
                          const isMyChild =
                            matchedStudent && rec.studentId === matchedStudent.id;

                          return (
                            <div
                              key={rec.id}
                              className={`p-1.5 rounded flex items-center justify-between ${
                                isMyChild
                                  ? 'bg-orange-50 border border-orange-300 font-bold text-orange-950'
                                  : 'bg-zinc-50 text-zinc-800'
                              }`}
                            >
                              <span>
                                {rec.studentName} {isMyChild && '★ (貴子弟)'}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {rec.slots.map((s) => slotLabel(s)).join(', ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Leave */}
                  <div>
                    <span className="text-amber-800 font-bold flex items-center gap-1 mb-1 text-[11px]">
                      <UserX className="w-3.5 h-3.5 text-amber-600" />
                      請假人員 ({leaveList.length} 人)
                    </span>
                    {leaveList.length === 0 ? (
                      <p className="text-zinc-400 text-[11px] italic">無請假人員</p>
                    ) : (
                      <div className="space-y-1">
                        {leaveList.map((rec) => {
                          const isMyChild =
                            matchedStudent && rec.studentId === matchedStudent.id;

                          return (
                            <div
                              key={rec.id}
                              className={`p-1.5 rounded flex items-center justify-between ${
                                isMyChild
                                  ? 'bg-amber-100 border border-amber-300 font-bold text-amber-950'
                                  : 'bg-zinc-50 text-zinc-700'
                              }`}
                            >
                              <span>
                                {rec.studentName} {isMyChild && '★ (貴子弟)'}
                              </span>
                              <span className="text-[10px] text-zinc-500 italic">
                                {rec.reason || '事假'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TEAM ACTIVITIES LIST FOR PARENTS */}
      {portalTab === 'events' && (
        <div className="space-y-3">
          {sortedEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-[11px] font-bold">
                    {ev.type}
                  </span>
                  {ev.departments.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[11px]"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <h4 className="text-sm font-extrabold text-zinc-900">
                  {ev.name}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1 text-zinc-900 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {ev.startTime} - {ev.endTime}
                  </span>
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {ev.location}
                    </span>
                  )}
                </div>

                {ev.description && (
                  <p className="text-xs text-zinc-500 pt-1 leading-relaxed">
                    {ev.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
