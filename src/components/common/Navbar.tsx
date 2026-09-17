import React from 'react';
import {
  Users,
  Calendar,
  CheckSquare,
  Wrench,
  Clock,
  UserCheck,
  Shield,
  HeartHandshake,
  LogOut,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Role, Member } from '../../types';

interface NavbarProps {
  currentRole: Role | null;
  currentMember: Member | null;
  parentStudentName: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentMember,
  parentStudentName,
  activeTab,
  onTabChange,
  onOpenLogin,
  onLogout,
  onResetData,
}) => {
  const getAdminTabs = () => [
    { id: 'members', label: '隊員管理', icon: Users },
    { id: 'calendar', label: '隊伍行事曆', icon: Calendar },
    { id: 'tasks', label: '任務審核', icon: CheckSquare },
    { id: 'equipment', label: '機具與材料', icon: Wrench },
    { id: 'attendance', label: '到校/請假週表', icon: Clock },
  ];

  const getMemberTabs = () => [
    { id: 'profile', label: '個人資料', icon: UserCheck },
    { id: 'calendar', label: '活動行事曆', icon: Calendar },
    { id: 'learning', label: '學習集章', icon: Sparkles },
    { id: 'tasks', label: '待完成任務', icon: CheckSquare },
    { id: 'attendance', label: '到校申請/請假', icon: Clock },
    { id: 'equipment', label: '設備材料清單', icon: Wrench },
  ];

  const getParentTabs = () => [
    { id: 'portal', label: '家長關心首頁', icon: HeartHandshake },
    { id: 'attendance', label: '本週到校與請假', icon: Clock },
    { id: 'calendar', label: '團隊行程公告', icon: Calendar },
  ];

  const tabs =
    currentRole === 'admin'
      ? getAdminTabs()
      : currentRole === 'member'
      ? getMemberTabs()
      : currentRole === 'parent'
      ? getParentTabs()
      : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
      {/* Top Banner with Brand & User Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Team Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 px-3.5 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black tracking-tight border border-zinc-800 shadow-sm select-none gap-0.5">
              <span className="text-orange-500 font-black text-lg">10</span>
              <span className="text-white font-black text-lg">114</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-900">
                  FRC 10114 隊務系統
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-orange-50 text-orange-600 rounded-md border border-orange-200">
                  錦和高中
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Jinhe Senior High School Robotics Team
              </p>
            </div>
          </div>

          {/* User Role Indicator & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentRole ? (
              <>
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 py-1.5 px-3 rounded-lg text-xs">
                  {currentRole === 'admin' && (
                    <>
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span className="font-bold text-zinc-900">管理員教練</span>
                    </>
                  )}
                  {currentRole === 'member' && currentMember && (
                    <>
                      {currentMember.avatar ? (
                        <img
                          src={currentMember.avatar}
                          alt={currentMember.name}
                          className="w-5 h-5 rounded-full object-cover border border-orange-400"
                        />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span className="text-zinc-600">隊員:</span>
                      <span className="font-bold text-zinc-900">
                        {currentMember.name}
                      </span>
                      <span className="hidden md:inline text-zinc-400 font-mono">
                        ({currentMember.id})
                      </span>
                    </>
                  )}
                  {currentRole === 'parent' && (
                    <>
                      <HeartHandshake className="w-4 h-4 text-orange-500" />
                      <span className="text-zinc-600">家長身分:</span>
                      <span className="font-bold text-zinc-900">
                        {parentStudentName} 的家長
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg transition-colors"
                  title="切換身分或隊員"
                >
                  切換身分
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors"
              >
                身分登入
              </button>
            )}

            {/* Reset data helper */}
            <button
              onClick={onResetData}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              title="重設為原廠示範資料"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重設資料</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar (Only if logged in) */}
      {currentRole && (
        <div className="border-t border-zinc-100 bg-zinc-50/70 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-orange-400' : 'text-zinc-500'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
