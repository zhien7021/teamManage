import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Star,
  Bell,
  Clock,
  MapPin,
  Check,
  Plus,
  Filter,
  Users,
  UserCheck,
  Layers,
  X,
} from 'lucide-react';
import { TeamEvent, Member, EventAttendee } from '../../types';

interface MemberCalendarProps {
  events: TeamEvent[];
  member: Member;
  members?: Member[];
  customSavedEventIds: (string | number)[];
  onToggleSaveEvent: (eventId: string | number) => void;
  onUpdateEvent?: (event: TeamEvent) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const MemberCalendar: React.FC<MemberCalendarProps> = ({
  events,
  member,
  members: _members = [],
  customSavedEventIds,
  onToggleSaveEvent,
  onUpdateEvent,
  onShowToast,
}) => {
  // SubTab: 'list' (活動表清單) | 'survey' (活動參與人數調查)
  const [subTab, setSubTab] = useState<'list' | 'survey'>('list');
  // Switch between 'personal' and 'team'
  const [activeView, setActiveView] = useState<'personal' | 'team'>('personal');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | number | null>(null);

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

  const surveyedEvents = useMemo(() => {
    return sortedEvents.filter((e) => e.allowRegistration);
  }, [sortedEvents]);

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
            個人行事曆自動排入所屬「{member.departments.join('、')}」活動；亦可切換至「活動參與人數調查」進行意願報名與查看同行隊員！
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
          {/* Sub-Tabs Switcher: 1. 活動表 (清單) 3. 活動參與人數調查 */}
          <div className="flex items-center bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSubTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subTab === 'list'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>1. 活動表 (清單)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('survey')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subTab === 'survey'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>3. 活動參與人數調查</span>
              {surveyedEvents.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-orange-600 text-white shadow-2xs">
                  {surveyedEvents.length}
                </span>
              )}
            </button>
          </div>

          {/* Scope Switcher: only shown in list tab */}
          {subTab === 'list' && (
            <div className="flex items-center bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveView('personal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'personal'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>個人行程 ({personalEvents.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('team')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'team'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>全隊行程 ({sortedEvents.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: 活動表清單 */}
      {subTab === 'list' && (
        <div className="space-y-6">
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
                        {ev.allowRegistration && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-800 rounded border border-orange-300 flex items-center gap-1">
                            <Users className="w-3 h-3 text-orange-600" />
                            <span>開放報名調查</span>
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
      )}

      {/* VIEW 3: 活動參與人數調查 (隊員端點選報名) */}
      {subTab === 'survey' && (
        <div className="space-y-6">
          {/* Survey Banner */}
          <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-white border border-orange-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-700 mb-1">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span>團隊活動參與投票與意願調查</span>
                </div>
                <p className="text-xs text-zinc-600">
                  以下列出目前隊伍開放報名與人數調查的活動行程。點選「點選報名參加」即可即時登記您的出席意願，亦可隨時查閱同行隊員名冊！
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-2 bg-white border border-orange-200 rounded-xl shadow-2xs text-center">
                  <span className="text-[10px] text-zinc-500 font-bold block">開放調查活動</span>
                  <span className="text-lg font-black text-orange-600">
                    {surveyedEvents.length}
                  </span>
                </div>
                <div className="px-3.5 py-2 bg-white border border-orange-200 rounded-xl shadow-2xs text-center">
                  <span className="text-[10px] text-zinc-500 font-bold block">您已報名</span>
                  <span className="text-lg font-black text-emerald-600">
                    {surveyedEvents.filter((e) =>
                      (e.attendees || []).some(
                        (a) => a.studentId === member.id || a.studentName === member.name
                      )
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Survey Events List */}
          <div className="space-y-4">
            {surveyedEvents.map((ev) => {
              const attendees = ev.attendees || [];
              const isRegistered = attendees.some(
                (a) => a.studentId === member.id || a.studentName === member.name
              );
              const myRegistration = attendees.find(
                (a) => a.studentId === member.id || a.studentName === member.name
              );
              const isExpanded = expandedEventId === ev.id;

              // Sort attendees by class, seatNumber, then name
              const sortedAttendees = [...attendees].sort((a, b) => {
                const classA = String(a.className || '').replace(/\D/g, '');
                const classB = String(b.className || '').replace(/\D/g, '');
                if (classA && classB && classA !== classB) {
                  return parseInt(classA, 10) - parseInt(classB, 10);
                }
                const seatA = parseInt(String(a.seatNumber || '0').replace(/\D/g, ''), 10);
                const seatB = parseInt(String(b.seatNumber || '0').replace(/\D/g, ''), 10);
                if (seatA !== seatB) return seatA - seatB;
                return (a.studentName || '').localeCompare(b.studentName || '');
              });

              return (
                <div
                  key={ev.id}
                  className="bg-white border border-zinc-200 hover:border-orange-300 rounded-2xl p-5 shadow-xs transition-all overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          {ev.type}
                        </span>
                        {ev.departments.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200"
                          >
                            {d}
                          </span>
                        ))}
                        {isRegistered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>您已登記參加</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                            尚未報名
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                        {ev.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600 font-medium">
                        <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          {ev.date}
                        </span>
                        <span className="font-mono flex items-center gap-1.5 text-zinc-700">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          {ev.startTime} - {ev.endTime}
                        </span>
                        {ev.location && (
                          <span className="text-zinc-600 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-zinc-400" />
                            {ev.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                          <Users className="w-3.5 h-3.5" />
                          目前報名：{attendees.length} 位隊員
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-zinc-500 max-w-3xl leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {myRegistration?.signedUpAt && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          登記時間：{myRegistration.signedUpAt}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
                      {isRegistered ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`確定要取消報名「${ev.name}」嗎？`)) {
                              const nextAttendees = attendees.filter(
                                (a) =>
                                  a.studentId !== member.id &&
                                  a.studentName !== member.name
                              );
                              if (onUpdateEvent) {
                                onUpdateEvent({ ...ev, attendees: nextAttendees });
                              }
                              onShowToast('已取消報名', `已自「${ev.name}」移除您的報名`, 'info');
                            }
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-zinc-600 hover:text-rose-600 border border-zinc-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>取消報名</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            const newAtt: EventAttendee = {
                              studentId: member.id,
                              studentName: member.name,
                              className: member.className || '',
                              seatNumber: member.seatNumber || '',
                              department:
                                (member.departments && member.departments[0]) || '隊員',
                              signedUpAt: nowStr,
                            };
                            const nextAttendees = [...attendees, newAtt];
                            if (onUpdateEvent) {
                              onUpdateEvent({ ...ev, attendees: nextAttendees });
                            }
                            onShowToast('報名成功！', `您已成功報名參加「${ev.name}」`, 'success');
                          }}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>點選報名參加</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEventId(isExpanded ? null : ev.id)
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium border border-zinc-200 transition-colors cursor-pointer"
                      >
                        <Users className="w-3 h-3 text-zinc-400" />
                        <span>
                          {isExpanded
                            ? '收合同行名單'
                            : `查看同行隊員 (${attendees.length}人)`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Teammates List */}
                  {isExpanded && (
                    <div className="mt-4 px-5 pb-5 pt-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-700">
                          已報名隊員名冊（按班級順序）：
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          共 {sortedAttendees.length} 位
                        </span>
                      </div>

                      {sortedAttendees.length === 0 ? (
                        <p className="text-xs text-zinc-400 py-2">
                          目前尚無其他隊員報名，搶先成為第 1 位吧！
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {sortedAttendees.map((att, idx) => {
                            const isMe =
                              att.studentId === member.id ||
                              att.studentName === member.name;
                            return (
                              <div
                                key={att.studentId || idx}
                                className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                                  isMe
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                                    : 'bg-white border-zinc-200 text-zinc-700'
                                }`}
                              >
                                {att.className && (
                                  <span className="font-mono text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded font-bold">
                                    {att.className}
                                    {att.seatNumber ? `-${att.seatNumber}號` : ''}
                                  </span>
                                )}
                                <span>{att.studentName}</span>
                                {isMe && (
                                  <span className="text-[10px] text-emerald-600 font-black">
                                    (您)
                                  </span>
                                )}
                                {att.department && (
                                  <span className="text-[10px] text-zinc-400">
                                    • {att.department}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {surveyedEvents.length === 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 shadow-xs">
                <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <h3 className="text-base font-bold text-zinc-800">
                  目前尚無開放報名調查的活動
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                  當教練或管理員發布活動並開啟投票參加時，此處將自動列出供您即時登記與查看夥伴出席狀況。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
