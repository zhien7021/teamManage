import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Star,
  Bell,
  Clock,
  MapPin,
  Sparkles,
  Check,
  Plus,
  Filter,
} from 'lucide-react';
import { TeamEvent, Member } from '../../types';

interface MemberCalendarProps {
  events: TeamEvent[];
  member: Member;
  customSavedEventIds: (string | number)[];
  onToggleSaveEvent: (eventId: string | number) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const MemberCalendar: React.FC<MemberCalendarProps> = ({
  events,
  member,
  customSavedEventIds,
  onToggleSaveEvent,
  onShowToast,
}) => {
  // Switch between 'personal' and 'team'
  const [activeView, setActiveView] = useState<'personal' | 'team'>('personal');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Sorted events by date + startTime ascending (nearest first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const timeA = `${a.date}T${a.startTime}`;
      const timeB = `${b.date}T${b.startTime}`;
      return timeA.localeCompare(timeB);
    });
  }, [events]);

  // Determine which events belong to "Personal Calendar":
  // 1. Events that match member's departments
  // 2. OR events explicitly saved by the member
  const personalEvents = useMemo(() => {
    return sortedEvents.filter((ev) => {
      const isDeptMatch = ev.departments.some((d) =>
        member.departments.includes(d)
      );
      const isCustomSaved = customSavedEventIds.includes(ev.id);
      return isDeptMatch || isCustomSaved;
    });
  }, [sortedEvents, member.departments, customSavedEventIds]);

  // Displayed events based on active tab & filters
  const displayedEvents = useMemo(() => {
    const baseList = activeView === 'personal' ? personalEvents : sortedEvents;
    if (deptFilter === 'all') return baseList;
    return baseList.filter((ev) =>
      ev.departments.includes(deptFilter as any)
    );
  }, [activeView, personalEvents, sortedEvents, deptFilter]);

  // Upcoming reminders (events in next few days, e.g. 2026-09-18, 2026-09-19)
  const upcomingReminders = useMemo(() => {
    return personalEvents.slice(0, 2);
  }, [personalEvents]);

  const handleToggle = (eventId: string | number, eventName: string) => {
    onToggleSaveEvent(eventId);
    const isNowSaved = !customSavedEventIds.includes(eventId);
    if (isNowSaved) {
      onShowToast('已加入個人行事曆', `「${eventName}」已加到您的個人專屬時程與提醒中！`, 'success');
    } else {
      onShowToast('已從個人行事曆移除', `「${eventName}」已移除自選收藏。`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Team vs Personal Switcher */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Schedule & Activity Calendar</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            團隊與個人專屬行事曆
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            個人行事曆自動排入所屬「{member.departments.join('、')}」活動；亦可自由探索隊伍行事曆，將跨組或多元活動一鍵加入個人行程！
          </p>
        </div>

        {/* Big Switcher Toggle Buttons */}
        <div className="flex items-center bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 self-start md:self-auto">
          <button
            onClick={() => setActiveView('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'personal'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>個人專屬行事曆 ({personalEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveView('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'team'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>全隊隊伍行事曆 ({sortedEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Feature Notification: 活動即將到來提醒 */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-white border border-orange-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-900 mb-2">
            <Bell className="w-4 h-4 text-orange-600 animate-bounce" />
            <span>個人行事曆即將到來提醒 (Upcoming Notifications)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingReminders.map((ev) => (
              <div
                key={ev.id}
                className="bg-white/90 border border-orange-200/80 rounded-lg p-3 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <span className="font-extrabold text-xs text-zinc-900 block">
                    {ev.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-orange-500" />
                    {ev.date} {ev.startTime} - {ev.endTime}
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-800 rounded">
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-bold text-zinc-700">組別過濾：</span>
          <button
            onClick={() => setDeptFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              deptFilter === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            全部
          </button>
          {['機電整合組', '程式控制組', '行銷管理組'].map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                deptFilter === d
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <span className="text-zinc-500 text-[11px]">
          目前檢視：
          <span className="font-bold text-zinc-800">
            {activeView === 'personal' ? '個人行事曆' : '隊伍行事曆'}
          </span>{' '}
          • 共 {displayedEvents.length} 場活動 (由近至遠時序排序)
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {displayedEvents.length === 0 ? (
          <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center text-zinc-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-medium">目前無排定活動</p>
          </div>
        ) : (
          displayedEvents.map((ev, index) => {
            const isDeptDefault = ev.departments.some((d) =>
              member.departments.includes(d)
            );
            const isCustomSaved = customSavedEventIds.includes(ev.id);
            const isInPersonal = isDeptDefault || isCustomSaved;

            return (
              <div
                key={ev.id}
                className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
              >
                {index === 0 && (
                  <div className="absolute top-0 left-0 bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-br-lg tracking-wider">
                    COMING NEXT • 近期優先
                  </div>
                )}

                <div className="space-y-2 flex-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      {ev.type}
                    </span>
                    {ev.departments.map((d) => (
                      <span
                        key={d}
                        className="text-[11px] font-medium px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200"
                      >
                        {d}
                      </span>
                    ))}
                    {isDeptDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                        ✓ 本組排定
                      </span>
                    )}
                    {!isDeptDefault && isCustomSaved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                        ★ 個人自選收藏
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">
                    {ev.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-600 font-medium">
                    <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono">
                        {ev.startTime} - {ev.endTime}
                      </span>
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </div>

                  {ev.description && (
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Add to Personal Calendar Button */}
                <div className="self-end md:self-center flex-shrink-0">
                  {isDeptDefault ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>已在個人行程中 (所屬組別)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(ev.id, ev.name)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                        isCustomSaved
                          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {isCustomSaved ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>移出個人行事曆</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>加入個人行事曆</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
