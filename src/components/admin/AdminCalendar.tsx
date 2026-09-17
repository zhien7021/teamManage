import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  Filter,
  Check,
} from 'lucide-react';
import { TeamEvent, EventType, Department } from '../../types';

interface AdminCalendarProps {
  events: TeamEvent[];
  onAddEvent: (event: Omit<TeamEvent, 'id'>) => void;
  onDeleteEvent: (id: number | string) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

const EVENT_TYPES: EventType[] = [
  '機電整合組培訓',
  '程式設計組培訓',
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
  onAddEvent,
  onDeleteEvent,
  onShowToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFilterDept, setSelectedFilterDept] = useState<string>('all');
  const [selectedFilterType, setSelectedFilterType] = useState<string>('all');

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<EventType>('機電整合組培訓');
  const [formDate, setFormDate] = useState('2026-09-22');
  const [formStartTime, setFormStartTime] = useState('18:00');
  const [formEndTime, setFormEndTime] = useState('20:30');
  const [formDepts, setFormDepts] = useState<Department[]>(['機電整合組']);
  const [formLocation, setFormLocation] = useState('機器人實作工坊 (科學樓 B1)');
  const [formDescription, setFormDescription] = useState('');

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
    });

    onShowToast(
      '活動發布成功',
      `「${formName}」已排入行事曆，並依時間序更新公告。`,
      'success'
    );
    setIsAddModalOpen(false);
    setFormName('');
    setFormDescription('');
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
            發布與刪除團隊活動。系統自動依據「日期 +
            起始時間」由近至遠時序排序，越靠近的時間排在越上方。
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>發布新活動</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-zinc-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>組別篩選：</span>
          </span>
          <button
            onClick={() => setSelectedFilterDept('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
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
                程式設計組培訓: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                行銷管理組培訓: 'bg-purple-50 text-purple-700 border-purple-200',
                多元競賽: 'bg-orange-50 text-orange-700 border-orange-200',
                教育推廣: 'bg-amber-50 text-amber-700 border-amber-200',
                團隊經營: 'bg-zinc-100 text-zinc-800 border-zinc-300',
                國際交流: 'bg-cyan-50 text-cyan-700 border-cyan-200',
              }[ev.type] || 'bg-zinc-100 text-zinc-700 border-zinc-200';

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
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
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
