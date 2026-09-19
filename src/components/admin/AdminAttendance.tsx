import React, { useState, useMemo } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  Send,
  Check,
  AlertCircle,
  X,
  Download,
} from 'lucide-react';
import { AttendanceRecord, Member, TimeSlot } from '../../types';

// Google Spreadsheet Target for Tomorrow's Attendance Report
const GOOGLE_SPREADSHEET_ID = '15zw5HdajgYVGS4odRv8qQeoPPtItgM04bTMOQACsqGg';
const GOOGLE_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/edit`;

function extractClassCode(className?: string): string {
  if (!className) return '';
  const str = String(className).trim();
  const seniorMatch = str.match(/高([一二三123])(\d{1,2})班?/);
  if (seniorMatch) {
    const gradeMap: Record<string, string> = { '一': '1', '1': '1', '二': '2', '2': '2', '三': '3', '3': '3' };
    const grade = gradeMap[seniorMatch[1]] || seniorMatch[1];
    const cls = String(seniorMatch[2]).padStart(2, '0');
    return `${grade}${cls}`;
  }
  const numMatch = str.match(/^(\d{3,4})班?$/);
  if (numMatch) {
    return numMatch[1];
  }
  if (/\d/.test(str)) {
    return str.replace(/班$/, '');
  }
  return str;
}

function formatStudentWithClass(
  studentName: string,
  studentId: string,
  membersList: Member[]
): string {
  const m = membersList.find((x) => x.id === studentId || x.name === studentName);
  const code = m ? extractClassCode(m.className) : '';
  return code ? `${code}${studentName}` : studentName;
}

function sortStudentsByClassOrder(
  studentItems: { studentName: string; studentId: string }[],
  membersList: Member[]
): { studentName: string; studentId: string }[] {
  return [...studentItems].sort((a, b) => {
    const mA = membersList.find((x) => x.id === a.studentId || x.name === a.studentName);
    const mB = membersList.find((x) => x.id === b.studentId || x.name === b.studentName);
    const codeA = mA ? extractClassCode(mA.className) : '';
    const codeB = mB ? extractClassCode(mB.className) : '';

    const numA = parseInt(codeA, 10);
    const numB = parseInt(codeB, 10);
    const hasNumA = !isNaN(numA) && numA > 0;
    const hasNumB = !isNaN(numB) && numB > 0;

    if (hasNumA && hasNumB) {
      if (numA !== numB) return numA - numB;
      const seatA = parseInt(mA?.seatNumber || '', 10);
      const seatB = parseInt(mB?.seatNumber || '', 10);
      if (!isNaN(seatA) && !isNaN(seatB) && seatA !== seatB) {
        return seatA - seatB;
      }
      return (a.studentName || '').localeCompare(b.studentName || '', 'zh-Hant');
    }
    if (hasNumA && !hasNumB) return -1;
    if (!hasNumA && hasNumB) return 1;

    if (codeA !== codeB) return (codeA || '').localeCompare(codeB || '');
    return (a.studentName || '').localeCompare(b.studentName || '', 'zh-Hant');
  });
}

function getTomorrowDateStr(baseDateStr?: string): string {
  let d: Date;
  if (baseDateStr) {
    const parts = baseDateStr.split('-');
    d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    d = new Date();
  }
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getTodayDateStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function exportAttendanceToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const BOM = '\uFEFF';
  const csvRows = [
    headers.map((h) => `"${String(h ?? '').replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob([BOM + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a);
}

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

  // Google Sheets / Tomorrow Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDate, setExportDate] = useState(() => getTomorrowDateStr());
  const [copyFeedback, setCopyFeedback] = useState<'' | 'text' | 'tsv'>('');
  const [gasWebhookUrl, setGasWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('frc10114_sheets_webhook_url') || '';
    } catch {
      return '';
    }
  });
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookNotice, setWebhookNotice] = useState('');
  const [showScriptGuide, setShowScriptGuide] = useState(false);

  const handleSaveWebhookUrl = (url: string) => {
    setGasWebhookUrl(url);
    try {
      localStorage.setItem('frc10114_sheets_webhook_url', url);
    } catch {}
  };

  const exportRecords = useMemo(() => {
    const target = records.filter((r) => r.date === exportDate && r.type === 'attendance');
    const morning = target.filter((r) => (r.slots || []).includes('morning'));
    const afternoon = target.filter((r) => (r.slots || []).includes('afternoon'));
    const evening = target.filter((r) => (r.slots || []).includes('evening'));

    const sortedMorning = sortStudentsByClassOrder(morning, members);
    const sortedAfternoon = sortStudentsByClassOrder(afternoon, members);
    const sortedEvening = sortStudentsByClassOrder(evening, members);

    const morningNames = sortedMorning.map((r) => formatStudentWithClass(r.studentName, r.studentId, members));
    const afternoonNames = sortedAfternoon.map((r) => formatStudentWithClass(r.studentName, r.studentId, members));
    const eveningNames = sortedEvening.map((r) => formatStudentWithClass(r.studentName, r.studentId, members));

    const morningStr = morningNames.length > 0 ? morningNames.join('、') : '無人申請';
    const afternoonStr = afternoonNames.length > 0 ? afternoonNames.join('、') : '無人申請';
    const eveningStr = eveningNames.length > 0 ? eveningNames.join('、') : '';

    let text = `📢 【明日申請在校學習名單】\n📅 日期：${exportDate}\n\n明日申請在校人員如下：\n⛅ 上午 (09-12點)：\n${morningStr}\n\n☀️ 下午 (13-17點)：\n${afternoonStr}`;
    if (eveningStr) {
      text += `\n\n🌙 晚上 (18-21點)：\n${eveningStr}`;
    }

    const tsv = [
      ['日期', '時段', '申請留校名單 (依班級排序)', '人數'].join('\t'),
      [exportDate, '上午 (09-12點)', morningStr, sortedMorning.length].join('\t'),
      [exportDate, '下午 (13-17點)', afternoonStr, sortedAfternoon.length].join('\t'),
      ...(eveningStr ? [[exportDate, '晚上 (18-21點)', eveningStr, sortedEvening.length].join('\t')] : []),
    ].join('\n');

    return {
      targetDate: exportDate,
      morningNames,
      afternoonNames,
      eveningNames,
      morningCount: sortedMorning.length,
      afternoonCount: sortedAfternoon.length,
      eveningCount: sortedEvening.length,
      morningStr,
      afternoonStr,
      eveningStr,
      fullText: text,
      tsv,
    };
  }, [exportDate, records, members]);

  const handleCopyText = (content: string, type: 'text' | 'tsv') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content).then(() => {
        setCopyFeedback(type);
        setTimeout(() => setCopyFeedback(''), 3500);
      }).catch(() => {
        fallbackCopy(content, type);
      });
    } else {
      fallbackCopy(content, type);
    }
  };

  const fallbackCopy = (content: string, type: 'text' | 'tsv') => {
    try {
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopyFeedback(type);
      setTimeout(() => setCopyFeedback(''), 3500);
    } catch {}
  };

  const handleSendWebhook = async () => {
    const url = (gasWebhookUrl || '').trim();
    if (!url) {
      setShowScriptGuide(true);
      setWebhookNotice('⚠️ 請先於下方設定 Google Apps Script Webhook 網址');
      setTimeout(() => setWebhookNotice(''), 4000);
      return;
    }
    setIsSendingWebhook(true);
    setWebhookNotice('');
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: GOOGLE_SPREADSHEET_ID,
          date: exportRecords.targetDate,
          morning: exportRecords.morningStr,
          afternoon: exportRecords.afternoonStr,
          evening: exportRecords.eveningStr || '',
          fullText: exportRecords.fullText,
          submittedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        }),
      });
      setWebhookNotice('✅ 已成功將名單發送至 Google 試算表！');
      setTimeout(() => setWebhookNotice(''), 5000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '網路連線異常';
      setWebhookNotice('⚠️ 發送失敗：' + errMsg);
      setTimeout(() => setWebhookNotice(''), 5000);
    } finally {
      setIsSendingWebhook(false);
    }
  };

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

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setExportDate(getTomorrowDateStr());
              setCopyFeedback('');
              setWebhookNotice('');
              setIsExportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="一鍵輸出明日留校名單至 Google 試算表 (依班級順序排序)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>一鍵輸出明日留校名單</span>
          </button>

          {/* Week Switcher Buttons */}
          <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
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

      {/* Tomorrow Attendance Google Sheets Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-zinc-900">一鍵輸出明日留校學習名單</h3>
                    <span className="text-[10px] px-2 py-0.5 font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                      依班級順序自動排列
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    目標試算表：<code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-[11px] text-zinc-700">{GOOGLE_SPREADSHEET_ID}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Target Date & Quick Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-600" />
                    <span>通報目標日期：</span>
                  </span>
                  <input
                    type="date"
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    className="p-1.5 bg-white border border-zinc-300 rounded-md font-mono text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setExportDate(getTomorrowDateStr())}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      exportDate === getTomorrowDateStr()
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    明日 ({getTomorrowDateStr()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportDate(getTodayDateStr())}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      exportDate === getTodayDateStr()
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    今日
                  </button>
                </div>
              </div>

              {/* Notice Feedback Banner */}
              {copyFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    {copyFeedback === 'text'
                      ? '已成功複製完整公告文字！可直接貼至 LINE、Discord 群組或試算表'
                      : '已複製表格格式 (TSV)！選中 Google 試算表儲存格按 Ctrl+V 即可自動分欄貼入'}
                  </span>
                </div>
              )}

              {webhookNotice && (
                <div className={`p-2.5 border rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
                  webhookNotice.includes('成功') ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  {webhookNotice.includes('成功') ? (
                    <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  )}
                  <span>{webhookNotice}</span>
                </div>
              )}

              {/* Text Preview Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                    <span>即時通報預覽（已依班級順序 102 → 104 → 105 → 106... 排列）</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    上午 {exportRecords.morningCount} 人 · 下午 {exportRecords.afternoonCount} 人{exportRecords.eveningCount > 0 ? ` · 晚上 ${exportRecords.eveningCount} 人` : ''}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-56 overflow-y-auto selection:bg-emerald-600 selection:text-white">
                  {exportRecords.fullText}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyText(exportRecords.fullText, 'text')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>一鍵複製公告文字</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyText(exportRecords.tsv, 'tsv')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                  title="複製為定位字元 (TSV)，貼入 Google 試算表會自動切分成儲存格"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>複製試算表格子 (TSV)</span>
                </button>

                <a
                  href={GOOGLE_SPREADSHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50/50 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs shadow-2xs transition-all text-center cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  <span>開啟 Google 試算表</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    exportAttendanceToCSV(
                      `FRC10114_留校名單_${exportRecords.targetDate}.csv`,
                      ['日期', '時段', '申請留校名單 (依班級順序)', '人數'],
                      [
                        [exportRecords.targetDate, '上午 (09-12點)', exportRecords.morningStr, exportRecords.morningCount],
                        [exportRecords.targetDate, '下午 (13-17點)', exportRecords.afternoonStr, exportRecords.afternoonCount],
                        ...(exportRecords.eveningStr ? [[exportRecords.targetDate, '晚上 (18-21點)', exportRecords.eveningStr, exportRecords.eveningCount]] : []),
                      ]
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>下載 CSV 備份</span>
                </button>
              </div>

              {/* Google Apps Script (GAS) Webhook Direct Send Section */}
              <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>自動傳送至 Google 試算表 (Google Apps Script API)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScriptGuide(!showScriptGuide)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    {showScriptGuide ? '收起教學 ▲' : '📖 1 分鐘快速設定教學 ▼'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={gasWebhookUrl}
                    onChange={(e) => handleSaveWebhookUrl(e.target.value)}
                    placeholder="請貼上您的 Google Apps Script Web App 網址 (https://script.google.com/.../exec)"
                    className="flex-1 p-2 bg-white border border-emerald-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendWebhook}
                    disabled={isSendingWebhook}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-zinc-400 text-white font-bold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  >
                    {isSendingWebhook ? (
                      <span>傳送中...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>立即發送</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsible GAS Setup Guide */}
                {showScriptGuide && (
                  <div className="p-3 bg-white border border-emerald-200 rounded-lg text-xs text-zinc-700 space-y-2 mt-2">
                    <p className="font-bold text-emerald-900">如何讓試算表自動接收名單？</p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 leading-relaxed">
                      <li>開啟您的 Google 試算表（ID: <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">{GOOGLE_SPREADSHEET_ID}</code>）。</li>
                      <li>點選上方選單的 <strong>「擴充功能」 &gt; 「Apps Script」</strong>。</li>
                      <li>清空原有內容，貼上下方已寫好的程式碼並點選「儲存」。</li>
                      <li>點選右上角 <strong>「部署」 &gt; 「新增部署作業」</strong>。</li>
                      <li>種類選擇 <strong>「網路應用程式」</strong>，存取權限選擇 <strong>「任何人 (Anyone)」</strong>。</li>
                      <li>點選部署後複製取得的 <code>https://script.google.com/.../exec</code> 網址，貼到上方輸入框即可！</li>
                    </ol>
                    <div className="relative pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const scriptCode =
                            'function doPost(e) {\\n  try {\\n    var data = JSON.parse(e.postData.contents);\\n    var sheetId = "' +
                            GOOGLE_SPREADSHEET_ID +
                            '";\\n    var ss = SpreadsheetApp.openById(sheetId);\\n    var sheet = ss.getSheetByName("明日申請在校名單") || ss.getActiveSheet();\\n    if (sheet.getLastRow() === 0) {\\n      sheet.appendRow(["日期", "上午名單 (09-12)", "下午名單 (13-17)", "晚上名單 (18-21)", "傳送時間", "完整通報文字"]);\\n    }\\n    sheet.appendRow([\\n      data.date,\\n      data.morning || "無人申請",\\n      data.afternoon || "無人申請",\\n      data.evening || "",\\n      new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),\\n      data.fullText\\n    ]);\\n    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))\\n      .setMimeType(ContentService.MimeType.JSON);\\n  } catch(err) {\\n    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))\\n      .setMimeType(ContentService.MimeType.JSON);\\n  }\\n}';
                          handleCopyText(scriptCode, 'text');
                          alert('已複製 Apps Script 程式碼！');
                        }}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-bold rounded border border-zinc-300 cursor-pointer"
                      >
                        📋 一鍵複製 Apps Script 程式碼
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-500 hidden sm:inline">
                💡 提示：點擊「一鍵複製」即可將整段名單發送至 LINE、Discord 或學校行政通報群
              </span>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-lg transition-colors cursor-pointer ml-auto"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
