import React, { useState } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, Member, TimeSlot } from '../../types';

interface AdminAttendanceProps {
  records: AttendanceRecord[];
  members: Member[];
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const AdminAttendance: React.FC<AdminAttendanceProps> = ({
  records,
  members,
}) => {
  // Week offset: 0 = current week (2026-09-14 to 2026-09-20), -1 = previous, 1 = next
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Base date for "current week": Monday 2026-09-14
  const baseMonday = new Date(2026, 8, 14); // Sep 14, 2026 (Month is 0-indexed)

  const currentMonday = new Date(baseMonday);
  currentMonday.setDate(baseMonday.getDate() + weekOffset * 7);

  // Generate 7 days (Monday to Sunday)
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

  const weekRangeText = `${daysOfWeek[0].displayDate} (${daysOfWeek[0].dayName}) ~ ${daysOfWeek[6].displayDate} (${daysOfWeek[6].dayName})`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <Clock className="w-4 h-4" />
            <span>Attendance & Leave Weekly Matrix</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            到校學習與請假週曆列表
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            統計全隊每週各日留校實作成員與請假人員名冊。隊員填寫之申請即時彙整呈現。
          </p>
        </div>

        {/* Week Switcher Buttons */}
        <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200 self-start md:self-auto">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-white hover:shadow-xs rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上週</span>
          </button>

          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              weekOffset === 0
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-white'
            }`}
          >
            <span>本週</span>
          </button>

          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-white hover:shadow-xs rounded-lg transition-all"
          >
            <span>下週</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Title & Summary Indicator */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-extrabold text-zinc-900">
            {weekOffset === 0
              ? `【本週賽季週曆】 ${weekRangeText}`
              : weekOffset < 0
              ? `【前 ${Math.abs(weekOffset)} 週歷史紀錄】 ${weekRangeText}`
              : `【未來第 ${weekOffset} 週預填排程】 ${weekRangeText}`}
          </span>
        </div>
        <span className="text-xs text-zinc-500 hidden sm:inline">
          共列出週一至週日 7 天完整考勤
        </span>
      </div>

      {/* 7-Day Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {daysOfWeek.map((day) => {
          // Find records on this day
          const dayRecords = records.filter((r) => r.date === day.dateStr);
          const presentList = dayRecords.filter((r) => r.type === 'attendance');
          const leaveList = dayRecords.filter((r) => r.type === 'leave');

          return (
            <div
              key={day.dateStr}
              className={`bg-white border rounded-xl shadow-xs transition-all overflow-hidden flex flex-col justify-between ${
                day.isToday
                  ? 'border-orange-500 ring-2 ring-orange-500/10'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {/* Day Card Header */}
              <div
                className={`p-3.5 border-b flex items-center justify-between ${
                  day.isToday
                    ? 'bg-orange-50/80 border-orange-200'
                    : 'bg-zinc-50/70 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-zinc-900 text-sm">
                    {day.displayDate}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      day.dayName === '星期六' || day.dayName === '星期日'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>

                {day.isToday && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-orange-600 px-2 py-0.5 rounded-md tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    TODAY 今天
                  </span>
                )}
              </div>

              {/* Day Card Body: 留校名單 & 請假名單 */}
              <div className="p-4 space-y-4 flex-1">
                {/* 1. 留校實作名單 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>留校實作 ({presentList.length} 人)</span>
                    </span>
                  </div>

                  {presentList.length === 0 ? (
                    <div className="p-2.5 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg text-center text-zinc-400 text-xs">
                      尚無隊員登記留校
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {presentList.map((rec) => {
                        const m = members.find((x) => x.id === rec.studentId);

                        return (
                          <div
                            key={rec.id}
                            className="p-2 bg-emerald-50/50 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-zinc-900">
                                {rec.studentName}
                              </span>
                              {m && (
                                <span className="ml-1.5 text-[10px] text-zinc-500 font-medium">
                                  [{m.departments[0] || '校隊'}]
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {rec.slots.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-300 font-mono text-[10px] font-semibold"
                                >
                                  {slotLabel(s)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. 請假人員名單 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                      <UserX className="w-3.5 h-3.5 text-amber-600" />
                      <span>請假人員 ({leaveList.length} 人)</span>
                    </span>
                  </div>

                  {leaveList.length === 0 ? (
                    <div className="p-2 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg text-center text-zinc-400 text-xs">
                      全員無請假
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {leaveList.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-2 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900">
                              {rec.studentName}
                            </span>
                            <div className="flex gap-1">
                              {rec.slots.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-white text-amber-900 border border-amber-300 font-mono text-[10px]"
                                >
                                  {slotLabel(s)}
                                </span>
                              ))}
                            </div>
                          </div>
                          {rec.reason && (
                            <p className="text-[11px] text-zinc-600 italic">
                              事由：{rec.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Day Card Footer */}
              <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                <span>到校應到率良好</span>
                <span className="font-medium text-zinc-700">
                  登記總數: {dayRecords.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
