import React, { useState } from 'react';
import {
  Shield,
  User,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Role, Member } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  members: Member[];
  onSelectRole: (
    role: Role,
    member?: Member,
    parentStudentName?: string
  ) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  members,
  onSelectRole,
}) => {
  const [selectedTab, setSelectedTab] = useState<'admin' | 'member' | 'parent'>(
    'admin'
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members.find((m) => m.id === '10114-002')?.id || members[0]?.id || ''
  );
  const [parentInput, setParentInput] = useState<string>('林恩萱家長');
  const [parentError, setParentError] = useState<string>('');

  if (!isOpen) return null;

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = parentInput.trim();
    if (!trimmed) {
      setParentError('請輸入格式：學生名字 + 家長（例如：林恩萱家長）');
      return;
    }

    // Match if string ends with "家長" or contains student name
    const cleanStudentName = trimmed
      .replace(/家長$/, '')
      .replace(/媽媽$/, '')
      .replace(/爸爸$/, '')
      .trim();

    const matchedMember = members.find(
      (m) =>
        m.name.includes(cleanStudentName) ||
        cleanStudentName.includes(m.name) ||
        trimmed.includes(m.name)
    );

    if (matchedMember) {
      setParentError('');
      onSelectRole('parent', undefined, matchedMember.name);
    } else {
      // If student is not strictly found in list, still allow login with the student name
      if (cleanStudentName.length >= 2) {
        setParentError('');
        onSelectRole('parent', undefined, cleanStudentName);
      } else {
        setParentError(
          `查無學生名冊，請確認格式（例如：林恩萱家長、陳大明家長）`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with FRC 10114 Branding */}
        <div className="bg-zinc-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>新北市立錦和高級中學機器人校隊</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
            <span>FRC</span>
            <span className="text-orange-500 font-mono">10114</span>
            <span>隊務管理系統</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            請選擇您的身分登入系統以存取專屬權限與功能
          </p>
        </div>

        {/* Role Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              setSelectedTab('admin');
              setParentError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              selectedTab === 'admin'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 text-orange-600'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Shield className="w-4 h-4 text-orange-600" />
            <span>管理員登入</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTab('member');
              setParentError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              selectedTab === 'member'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 text-orange-600'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <User className="w-4 h-4 text-orange-600" />
            <span>隊員登入</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTab('parent');
              setParentError('');
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              selectedTab === 'parent'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 text-orange-600'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-orange-600" />
            <span>家長登入</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* 1. Admin Login Form */}
          {selectedTab === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl text-xs text-orange-950 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-orange-900">
                  <Shield className="w-4 h-4 text-orange-600" />
                  管理員 / 教練權限
                </div>
                具備隊員名冊管理、行事曆活動發布與刪除、學習任務集章驗收、機具設備出借與耗材數量調校、全隊到校/請假週曆審核等完整權限。
              </div>

              <div className="border border-zinc-200 rounded-xl p-3.5 bg-zinc-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">預設管理員帳號</p>
                  <p className="text-sm font-bold text-zinc-900">
                    10114-001 許教練 (Coach Hsu)
                  </p>
                  <p className="text-xs text-zinc-600">coach@frc10114.org</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  已授權
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const adminMember =
                    members.find((m) => m.id === '10114-001') || members[0];
                  onSelectRole('admin', adminMember);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <span>進入管理員控制台</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </div>
          )}

          {/* 2. Member Login Form */}
          {selectedTab === 'member' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-zinc-900">
                  <User className="w-4 h-4 text-orange-600" />
                  隊員身分登入
                </div>
                登入後可設定個人初心座右銘、檢視隊伍與組別行事曆（支援加到個人行程）、查看待完成工作、申請留校時段與請假。
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  選擇登入隊員 (包含編號、姓名與組別)
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name} ({m.departments.join(' / ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick info about selected member */}
              {(() => {
                const cur = members.find((m) => m.id === selectedMemberId);
                if (!cur) return null;
                return (
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-500">已選隊員：</span>
                      <span className="font-bold text-zinc-900">{cur.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-600">
                      <span>分組配置：</span>
                      <div className="flex gap-1">
                        {cur.departments.map((d) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded font-medium text-[11px]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => {
                  const target = members.find(
                    (m) => m.id === selectedMemberId
                  );
                  if (target) onSelectRole('member', target);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <span>以隊員身分登入</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3. Parent Login Form */}
          {selectedTab === 'parent' && (
            <form
              onSubmit={handleParentLogin}
              className="space-y-4 animate-in fade-in duration-150"
            >
              <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl text-xs text-orange-950 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-orange-900">
                  <HeartHandshake className="w-4 h-4 text-orange-600" />
                  家長專用免密碼快速通道
                </div>
                家長無需密碼，只需輸入
                <span className="font-bold text-orange-900">
                  「學生名字 + 家長」
                </span>
                （例如：林恩萱家長），即可進入查看全隊活動排程及孩子一週到校留校實作與請假狀態。
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  請輸入學生名字+家長
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parentInput}
                    onChange={(e) => {
                      setParentInput(e.target.value);
                      if (parentError) setParentError('');
                    }}
                    placeholder="例如：林恩萱家長"
                    className="w-full p-3 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium placeholder-zinc-400"
                  />
                  {parentInput && (
                    <span className="absolute right-3 top-3 text-xs text-zinc-400">
                      免密碼
                    </span>
                  )}
                </div>
                {parentError && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{parentError}</span>
                  </p>
                )}
              </div>

              {/* Quick suggestion tags */}
              <div>
                <span className="text-[11px] text-zinc-500 block mb-1.5">
                  快速體驗示範學生：
                </span>
                <div className="flex flex-wrap gap-2">
                  {members
                    .filter((m) => m.id !== '10114-001')
                    .slice(0, 3)
                    .map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setParentInput(`${m.name}家長`);
                          setParentError('');
                        }}
                        className="px-2.5 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md border border-zinc-200 transition-colors"
                      >
                        {m.name}家長
                      </button>
                    ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                <span>進入家長關心專區</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
          <span>FRC Team 10114 • 錦和高中</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="w-3 h-3" /> 系統正常運作中
          </span>
        </div>
      </div>
    </div>
  );
};
