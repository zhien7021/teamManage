import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Filter,
  Check,
  Users,
  UserPlus,
  UserCheck,
  Copy,
  Download,
  Layers,
} from 'lucide-react';
import { TeamEvent, EventType, Department, Member, EventAttendee } from '../../types';

interface AdminCalendarProps {
  events: TeamEvent[];
  members?: Member[];
  onAddEvent: (event: Omit<TeamEvent, 'id'>) => void;
  onUpdateEvent?: (event: TeamEvent) => void;
  onDeleteEvent: (id: number | string) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

const EVENT_TYPES: EventType[] = [
  '機電整合組培訓',
  '程式控制組培訓',
  '行銷管理組培訓',
  '多元競賽',
  '教育推廣',
  '團隊經營',
  '國際交流',
];

const ALL_DEPARTMENTS: Department[] = [
  '機電整合組',
  '程式控制組',
  '行銷管理組',
];

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
  events,
  members = [],
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'list' | 'survey'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFilterDept, setSelectedFilterDept] = useState<string>('all');
  const [selectedFilterType, setSelectedFilterType] = useState<string>('all');

  // Survey subTab states
  const [manualAddEventId, setManualAddEventId] = useState<string | number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<EventType>('機電整合組培訓');
  const [formDate, setFormDate] = useState('2026-09-22');
  const [formStartTime, setFormStartTime] = useState('18:00');
  const [formEndTime, setFormEndTime] = useState('20:30');
  const [formDepts, setFormDepts] = useState<Department[]>(['機電整合組']);
  const [formLocation, setFormLocation] = useState('機器人實作工坊 (科學樓 B1)');
  const [formDescription, setFormDescription] = useState('');
  const [formAllowRegistration, setFormAllowRegistration] = useState(false);

  // Requirement: 越靠近的時間排在越上方 (Auto sorted by date + startTime ascending)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.startTime}`;
      const dateTimeB = `${b.date}T${b.startTime}`;
      return dateTimeA.localeCompare(dateTimeB);
    });
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((ev) => {
      if (
        selectedFilterDept !== 'all' &&
        !ev.departments.includes(selectedFilterDept as Department)
      ) {
        return false;
      }
      if (selectedFilterType !== 'all' && ev.type !== selectedFilterType) {
        return false;
      }
      return true;
    });
  }, [sortedEvents, selectedFilterDept, selectedFilterType]);

  const surveyedEvents = useMemo(() => {
    return sortedEvents.filter((e) => e.allowRegistration);
  }, [sortedEvents]);

  const toggleFormDept = (dept: Department) => {
    if (formDepts.includes(dept)) {
      if (formDepts.length > 1) {
        setFormDepts(formDepts.filter((d) => d !== dept));
      } else {
        onShowToast('提醒', '活動至少需勾選一個參與組別', 'warning');
      }
    } else {
      setFormDepts([...formDepts, dept]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onShowToast('建立失敗', '請輸入活動名稱', 'error');
      return;
    }
    if (!formDate || !formStartTime || !formEndTime) {
      onShowToast('建立失敗', '請完整設定日期與起訖時間', 'error');
      return;
    }

    onAddEvent({
      name: formName.trim(),
      type: formType,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      departments: formDepts,
      location: formLocation.trim() || '錦和高中創客基地',
      description: formDescription.trim(),
      allowRegistration: formAllowRegistration,
      attendees: [],
    });

    onShowToast(
      '活動發布成功',
      `「${formName}」已排入行事曆，並依時間序更新公告。`,
      'success'
    );
    setIsAddModalOpen(false);
    setFormName('');
    setFormDescription('');
    setFormAllowRegistration(false);
  };

  const handleDelete = (id: number | string, name: string) => {
    if (window.confirm(`確定要刪除「${name}」此項活動嗎？`)) {
      onDeleteEvent(id);
      onShowToast('活動已刪除', `已自隊伍行事曆移除「${name}」`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Team Calendar & Announcements</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            隊伍行事曆與公告設定
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            發布與管理團隊活動清單，亦可開啟各項活動之參與意願與人數調查。
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
          {/* Sub-Tabs Switcher */}
          <div className="flex items-center bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSubTab('list')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                subTab === 'survey'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span>3. 活動參與人數調查</span>
              {surveyedEvents.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-orange-600 text-white">
                  {surveyedEvents.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>發布新活動</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 活動表清單 */}
      {subTab === 'list' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-zinc-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span>組別篩選：</span>
              </span>
              <button
                onClick={() => setSelectedFilterDept('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedFilterDept === 'all'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                全部組別
              </button>
              {ALL_DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedFilterDept(d)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedFilterDept === d
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-700">類型篩選：</span>
              <select
                value={selectedFilterType}
                onChange={(e) => setSelectedFilterType(e.target.value)}
                className="p-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">所有活動類型</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Events List / Announcements Card View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
                近期待辦活動與公告清單（共 {filteredEvents.length} 項 • 時序由近至遠）
              </span>
              <span className="text-[11px] text-zinc-400">
                * 隊員登入後將依個人所屬組別同步顯示此處行程
              </span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center text-zinc-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                <p className="text-sm font-medium">目前查無符合條件的活動行程</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredEvents.map((ev, index) => {
                  const typeColor = {
                    機電整合組培訓: 'bg-blue-50 text-blue-700 border-blue-200',
                    程式控制組培訓: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    行銷管理組培訓: 'bg-purple-50 text-purple-700 border-purple-200',
                    多元競賽: 'bg-orange-50 text-orange-700 border-orange-200',
                    教育推廣: 'bg-amber-50 text-amber-700 border-amber-200',
                    團隊經營: 'bg-zinc-100 text-zinc-800 border-zinc-300',
                    國際交流: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                  }[ev.type] || 'bg-zinc-100 text-zinc-700 border-zinc-200';

                  const attendeesCount = (ev.attendees || []).length;

                  return (
                    <div
                      key={ev.id}
                      className="bg-white border border-zinc-200 hover:border-orange-300 rounded-xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
                    >
                      {index === 0 && (
                        <div className="absolute top-0 left-0 bg-orange-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-br-lg tracking-wider">
                          NEXT UP • 最靠近活動
                        </div>
                      )}

                      {/* Left info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeColor}`}
                          >
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
                          {ev.allowRegistration && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded border border-orange-300 flex items-center gap-1">
                              <Users className="w-3 h-3 text-orange-600" />
                              <span>開啟調查 (已報名 {attendeesCount} 人)</span>
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
                          <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl pt-0.5">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => handleDelete(ev.id, ev.name)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                          title="刪除此活動"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 活動參與人數調查 */}
      {subTab === 'survey' && (
        <div className="space-y-6">
          {/* Survey Summary Banner */}
          <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-white border border-orange-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-700 mb-1">
                <Users className="w-4 h-4 text-orange-600" />
                <span>活動參與意願與人數調查控管中心</span>
              </div>
              <p className="text-xs text-zinc-600">
                凡在發布活動時勾選「是否開啟投票參加」之活動將彙整於此。隊員可於學生端自主報名，管理員在此享有查看統計、名冊排序、手動新增與刪除隊員之完整編輯權限。
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 bg-white border border-orange-200 rounded-xl shadow-2xs text-center">
                <span className="text-[10px] text-zinc-500 font-bold block">進行中調查</span>
                <span className="text-lg font-black text-orange-600">
                  {surveyedEvents.length}
                </span>
              </div>
              <div className="px-3.5 py-2 bg-white border border-orange-200 rounded-xl shadow-2xs text-center">
                <span className="text-[10px] text-zinc-500 font-bold block">累計報名人次</span>
                <span className="text-lg font-black text-zinc-900">
                  {surveyedEvents.reduce(
                    (sum, ev) => sum + (ev.attendees ? ev.attendees.length : 0),
                    0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Survey Cards */}
          <div className="space-y-5">
            {surveyedEvents.map((ev) => {
              const attendees = ev.attendees || [];
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

              const isAdding = manualAddEventId === ev.id;
              const availableMembers = members.filter(
                (m) =>
                  !attendees.some(
                    (a) => a.studentId === m.id || a.studentName === m.name
                  )
              );

              return (
                <div
                  key={ev.id}
                  className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden"
                >
                  <div className="p-5 border-b border-zinc-100 bg-zinc-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
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
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>已報名：{sortedAttendees.length} 人</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                        {ev.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                        <span className="font-bold text-zinc-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          {ev.date}
                        </span>
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {ev.startTime} - {ev.endTime}
                        </span>
                        {ev.location && (
                          <span className="text-zinc-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setManualAddEventId(isAdding ? null : ev.id);
                          setSelectedMemberId('');
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isAdding
                            ? 'bg-zinc-800 text-white'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{isAdding ? '關閉新增' : '手動新增人員'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const listStr =
                            sortedAttendees.length > 0
                              ? sortedAttendees
                                  .map(
                                    (a, idx) =>
                                      `${idx + 1}. [${a.className || '無班級'}${
                                        a.seatNumber ? `-${a.seatNumber}號` : ''
                                      }] ${a.studentName} (${a.department || '隊員'})`
                                  )
                                  .join('\n')
                              : '(尚無隊員報名)';
                          const fullText = `📢 【${ev.name}】活動參與調查名冊\n📅 日期：${ev.date} ${ev.startTime}-${ev.endTime}\n📍 地點：${ev.location || '錦和高中創客基地'}\n👥 報名總人數：${sortedAttendees.length} 人\n\n名冊清單：\n${listStr}`;
                          navigator.clipboard.writeText(fullText);
                          onShowToast('已複製名冊', `「${ev.name}」名單已複製至剪貼簿`, 'success');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>複製名冊</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const headers = ['序號', '學號', '班級', '座號', '姓名', '組別', '報名時間'];
                          const rows = sortedAttendees.map((a, idx) => [
                            idx + 1,
                            a.studentId,
                            a.className || '',
                            a.seatNumber || '',
                            a.studentName,
                            a.department || '',
                            a.signedUpAt || '',
                          ]);
                          const BOM = '\uFEFF';
                          const csvContent =
                            BOM +
                            [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
                              '\n'
                            );
                          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `FRC10114_${ev.name}_活動調查名冊.csv`;
                          link.click();
                          URL.revokeObjectURL(url);
                          onShowToast('已匯出 CSV', `「${ev.name}」名冊已下載`, 'success');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>匯出 CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Add Box */}
                  {isAdding && (
                    <div className="p-4 bg-orange-50/70 border-b border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-bold text-zinc-800 shrink-0 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-orange-600" />
                          <span>選擇要手動加入的隊員：</span>
                        </span>
                        <select
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="flex-1 p-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">
                            -- 請選擇學生名單 (共 {availableMembers.length} 位可加入) --
                          </option>
                          {availableMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.className ? `[${m.className}${m.seatNumber ? `-${m.seatNumber}號` : ''}] ` : ''}
                              {m.name} ({m.departments ? m.departments.join('、') : '隊員'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedMemberId) {
                              onShowToast('請選擇隊員', '請先從下拉選單選取欲加入的學生', 'warning');
                              return;
                            }
                            const targetM = members.find((m) => m.id === selectedMemberId);
                            if (!targetM) return;
                            const now = new Date();
                            const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            const newAtt: EventAttendee = {
                              studentId: targetM.id,
                              studentName: targetM.name,
                              className: targetM.className || '',
                              seatNumber: targetM.seatNumber || '',
                              department: (targetM.departments && targetM.departments[0]) || '隊員',
                              signedUpAt: nowStr,
                            };
                            const nextAttendees = [...attendees, newAtt];
                            if (onUpdateEvent) {
                              onUpdateEvent({ ...ev, attendees: nextAttendees });
                            }
                            setSelectedMemberId('');
                            setManualAddEventId(null);
                            onShowToast('已新增參加人員', `已將「${targetM.name}」加入「${ev.name}」名單`, 'success');
                          }}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          確認加入名單
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setManualAddEventId(null);
                            setSelectedMemberId('');
                          }}
                          className="px-3 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Attendees Table */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                        <span>已登記報名名冊（依班級與座號順序排列）</span>
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        共 {sortedAttendees.length} 位預計參加
                      </span>
                    </div>

                    {sortedAttendees.length === 0 ? (
                      <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-zinc-400">
                        <UserCheck className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                        <p className="text-xs font-bold text-zinc-600">目前尚無隊員報名此活動</p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          隊員可於學生端線上點選報名，亦可點擊上方「手動新增人員」直接指派。
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3.5 w-12 text-center">序號</th>
                              <th className="py-2.5 px-3">班級</th>
                              <th className="py-2.5 px-3">座號</th>
                              <th className="py-2.5 px-4">姓名</th>
                              <th className="py-2.5 px-4">所屬組別</th>
                              <th className="py-2.5 px-4">報名時間</th>
                              <th className="py-2.5 px-3.5 text-center">管理員操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 font-medium">
                            {sortedAttendees.map((att, idx) => (
                              <tr key={att.studentId || idx} className="hover:bg-orange-50/30 transition-colors">
                                <td className="py-2.5 px-3.5 text-center font-mono text-zinc-400 text-[11px]">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                                    {att.className || '未設定'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-zinc-600">
                                  {att.seatNumber ? `${att.seatNumber} 號` : '-'}
                                </td>
                                <td className="py-2.5 px-4 font-bold text-zinc-900">
                                  {att.studentName}
                                </td>
                                <td className="py-2.5 px-4 text-zinc-600">
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                                    {att.department || '隊員'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 font-mono text-zinc-400 text-[11px]">
                                  {att.signedUpAt || '-'}
                                </td>
                                <td className="py-2.5 px-3.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `確定要將「${att.studentName}」從「${ev.name}」參加名單中移除嗎？`
                                        )
                                      ) {
                                        const nextAttendees = attendees.filter(
                                          (a) => a.studentId !== att.studentId
                                        );
                                        if (onUpdateEvent) {
                                          onUpdateEvent({ ...ev, attendees: nextAttendees });
                                        }
                                        onShowToast(
                                          '已移除名單',
                                          `已將「${att.studentName}」自「${ev.name}」移除`,
                                          'info'
                                        );
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                                    title="自此活動名單中移除"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>移除</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {surveyedEvents.length === 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-400 shadow-xs">
                <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <h3 className="text-base font-bold text-zinc-800">目前尚無開啟報名投票的活動</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 mb-5">
                  若您有近期需要統計隊員出席意願的培訓、競賽或推廣活動，請點擊上方「發布新活動」並勾選「是否開啟投票參加」。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormAllowRegistration(true);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>發布新活動 (開啟人數調查)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900">
                  發布團隊新活動
                </h3>
                <p className="text-xs text-zinc-500">
                  系統將依活動時間由近至遠自動時序排序
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  活動名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：機構加工與底盤組裝培訓"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  活動類型 *
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as EventType)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    日期 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    起始時間 *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full p-2 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    結束時間 *
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full p-2 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                  />
                </div>
              </div>

              {/* Target Departments (Multi-Select) */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  對應參與組別 (可複選)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DEPARTMENTS.map((dept) => {
                    const isChecked = formDepts.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleFormDept(dept)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          isChecked
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                        <span>{dept}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  活動地點
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="例如：機器人實作工坊 (科學樓 B1)"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  活動備註或說明
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="填寫活動重點或攜帶物品..."
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                />
              </div>

              {/* Allow Registration Checkbox */}
              <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="formAllowRegistration"
                  checked={formAllowRegistration}
                  onChange={(e) => setFormAllowRegistration(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-orange-600 rounded border-zinc-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="formAllowRegistration" className="text-xs text-zinc-700 cursor-pointer select-none">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    是否開啟投票參加 (活動參與人數調查)
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-0.5 block">
                    勾選後此活動將自動進入「3. 活動參與人數調查」列表，隊員可在學生端自主登記或取消參加，管理員亦可即時查閱名冊。
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  確認發布活動
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
