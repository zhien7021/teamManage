import React, { useState, useEffect } from 'react';
import {
  Role,
  Member,
  TeamEvent,
  LearningTask,
  TeamPendingTask,
  Equipment,
  MaterialItem,
  AttendanceRecord,
  Department,
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_TASKS,
  INITIAL_PENDING_TASKS,
  INITIAL_EQUIPMENT,
  INITIAL_MATERIALS,
  INITIAL_ATTENDANCE,
} from './data/seedData';
import { Navbar } from './components/common/Navbar';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { LoginModal } from './components/auth/LoginModal';

// Admin Components
import { MemberManagement } from './components/admin/MemberManagement';
import { AdminCalendar } from './components/admin/AdminCalendar';
import { AdminTaskReview } from './components/admin/AdminTaskReview';
import { AdminEquipment } from './components/admin/AdminEquipment';
import { AdminAttendance } from './components/admin/AdminAttendance';

// Member Components
import { MemberProfile } from './components/member/MemberProfile';
import { MemberCalendar } from './components/member/MemberCalendar';
import { MemberLearning } from './components/member/MemberLearning';
import { MemberTasks } from './components/member/MemberTasks';
import { MemberAttendanceForm } from './components/member/MemberAttendanceForm';
import { MemberMaterials } from './components/member/MemberMaterials';

// Parent Component
import { ParentPortal } from './components/parent/ParentPortal';

export const App: React.FC = () => {
  // 1. Core State with LocalStorage Caching
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('frc10114_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [events, setEvents] = useState<TeamEvent[]>(() => {
    const saved = localStorage.getItem('frc10114_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<LearningTask[]>(() => {
    const saved = localStorage.getItem('frc10114_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [pendingTasks, setPendingTasks] = useState<TeamPendingTask[]>(() => {
    const saved = localStorage.getItem('frc10114_pending_tasks');
    return saved ? JSON.parse(saved) : INITIAL_PENDING_TASKS;
  });

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('frc10114_equipment');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('frc10114_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('frc10114_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [customSavedEventIds, setCustomSavedEventIds] = useState<(string | number)[]>(() => {
    const saved = localStorage.getItem('frc10114_saved_events');
    return saved ? JSON.parse(saved) : [3];
  });

  // 2. Authentication & Navigation State
  // Initial default: Admin view, with LoginModal available
  const [currentRole, setCurrentRole] = useState<Role | null>('admin');
  const [currentMember, setCurrentMember] = useState<Member | null>(() => {
    return members.find((m) => m.id === '10114-001') || members[0] || null;
  });
  const [parentStudentName, setParentStudentName] = useState<string | null>('林恩萱');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('members');

  // 3. Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'info'
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('frc10114_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('frc10114_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('frc10114_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('frc10114_pending_tasks', JSON.stringify(pendingTasks));
  }, [pendingTasks]);

  useEffect(() => {
    localStorage.setItem('frc10114_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('frc10114_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('frc10114_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('frc10114_saved_events', JSON.stringify(customSavedEventIds));
  }, [customSavedEventIds]);

  // Handle Role Selection from LoginModal
  const handleSelectRole = (
    role: Role,
    member?: Member,
    studentName?: string
  ) => {
    setCurrentRole(role);
    if (role === 'admin') {
      const adminM = members.find((m) => m.id === '10114-001') || members[0];
      setCurrentMember(adminM);
      setActiveTab('members');
      showToast('歡迎管理員教練', '已進入 FRC 10114 後台控制系統', 'success');
    } else if (role === 'member') {
      const target = member || members.find((m) => m.id === '10114-002') || members[0];
      setCurrentMember(target);
      setActiveTab('profile');
      showToast(`哈囉，${target.name}！`, `已載入「${target.departments.join(' / ')}」隊員工作台`, 'success');
    } else if (role === 'parent') {
      const sName = studentName || '林恩萱';
      setParentStudentName(sName);
      setActiveTab('portal');
      showToast('家長專區已啟用', `歡迎關心 ${sName} 的校隊實作進度！`, 'info');
    }
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setIsLoginModalOpen(true);
  };

  // Reset to seed data
  const handleResetData = () => {
    if (window.confirm('確定要重設為初始示範資料嗎？這將清除所有自訂修改。')) {
      setMembers(INITIAL_MEMBERS);
      setEvents(INITIAL_EVENTS);
      setTasks(INITIAL_TASKS);
      setPendingTasks(INITIAL_PENDING_TASKS);
      setEquipment(INITIAL_EQUIPMENT);
      setMaterials(INITIAL_MATERIALS);
      setAttendance(INITIAL_ATTENDANCE);
      setCustomSavedEventIds([3]);
      localStorage.clear();
      showToast('資料已重設', '已恢復為 FRC 10114 原廠示範資料庫', 'info');
    }
  };

  // 4. ADMIN ACTIONS
  const handleUpdateMember = (updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    if (currentMember && currentMember.id === updated.id) {
      setCurrentMember(updated);
    }
  };

  const handleAddMember = (newM: Member) => {
    setMembers((prev) => [...prev, newM]);
  };

  const handleAddEvent = (ev: Omit<TeamEvent, 'id'>) => {
    const newEvent: TeamEvent = {
      ...ev,
      id: Date.now(),
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: number | string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleVerifyTask = (taskId: number | string, verifiedBy: string) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'completed',
              verifiedAt: dateStr,
              verifiedBy,
            }
          : t
      )
    );
  };

  const handleAddTask = (newTask: Omit<LearningTask, 'id' | 'status'>) => {
    const created: LearningTask = {
      ...newTask,
      id: Date.now(),
      status: 'pending',
    };
    setTasks((prev) => [...prev, created]);
  };

  const handleBorrowEquipment = (id: string, borrowerName: string, notes?: string) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === id
          ? {
              ...eq,
              status: 'borrowed',
              borrowedBy: borrowerName,
              borrowedAt: `${yyyy}-${mm}-${dd} ${hh}:${min}`,
              notes,
            }
          : eq
      )
    );
  };

  const handleReturnEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === id
          ? {
              ...eq,
              status: 'available',
              borrowedBy: undefined,
              borrowedAt: undefined,
              notes: undefined,
            }
          : eq
      )
    );
  };

  const handleUpdateMaterialQuantity = (id: string, newQty: number) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantity: newQty } : m))
    );
  };

  const handleAddMaterial = (newMat: Omit<MaterialItem, 'id'>) => {
    const created: MaterialItem = {
      ...newMat,
      id: `mat-${Date.now()}`,
    };
    setMaterials((prev) => [...prev, created]);
  };

  // 5. MEMBER ACTIONS
  const handleUpdateMotto = (newMotto: string) => {
    if (!currentMember) return;
    const updated = { ...currentMember, motto: newMotto };
    setCurrentMember(updated);
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleUpdateAvatar = (memberId: string, avatarUrl: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, avatar: avatarUrl } : m))
    );
    if (currentMember && currentMember.id === memberId) {
      setCurrentMember((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
    }
  };

  const handleRemoveAvatar = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, avatar: undefined } : m))
    );
    if (currentMember && currentMember.id === memberId) {
      setCurrentMember((prev) => (prev ? { ...prev, avatar: undefined } : prev));
    }
  };

  const handleTogglePendingTaskComplete = (taskId: string | number) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setPendingTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'todo' ? 'completed' : 'todo';
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? timeStr : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleRequestLearningReview = (taskName: string, department: Department) => {
    if (!currentMember) return;
    const newTask: LearningTask = {
      id: Date.now(),
      studentId: currentMember.id,
      studentName: currentMember.name,
      taskName,
      department,
      status: 'pending',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleSubmitAttendanceRecord = (
    rec: Omit<AttendanceRecord, 'id' | 'submittedAt'>
  ) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRecord: AttendanceRecord = {
      ...rec,
      id: `att-${Date.now()}`,
      submittedAt: timeStr,
    };
    setAttendance((prev) => [newRecord, ...prev]);
  };

  const handleToggleBookmarkEvent = (eventId: string | number) => {
    setCustomSavedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        currentMember={currentMember}
        parentStudentName={parentStudentName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If no role is selected */}
        {!currentRole ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-xs max-w-xl mx-auto my-12 space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              10114
            </div>
            <h2 className="text-xl font-black text-zinc-900">
              請登入 FRC 10114 隊務系統
            </h2>
            <p className="text-xs text-zinc-500">
              支援管理員教練、隊員及家長免密碼登入
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
            >
              選擇身分並登入
            </button>
          </div>
        ) : (
          <>
            {/* 1. ADMIN ROLE SCREENS */}
            {currentRole === 'admin' && (
              <>
                {activeTab === 'members' && (
                  <MemberManagement
                    members={members}
                    onUpdateMember={handleUpdateMember}
                    onAddMember={handleAddMember}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'calendar' && (
                  <AdminCalendar
                    events={events}
                    onAddEvent={handleAddEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'tasks' && (
                  <AdminTaskReview
                    tasks={tasks}
                    members={members}
                    onVerifyTask={handleVerifyTask}
                    onAddTask={handleAddTask}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'equipment' && (
                  <AdminEquipment
                    equipment={equipment}
                    materials={materials}
                    members={members}
                    onBorrowEquipment={handleBorrowEquipment}
                    onReturnEquipment={handleReturnEquipment}
                    onUpdateMaterialQuantity={handleUpdateMaterialQuantity}
                    onAddMaterial={handleAddMaterial}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'attendance' && (
                  <AdminAttendance
                    records={attendance}
                    members={members}
                    onShowToast={showToast}
                  />
                )}
              </>
            )}

            {/* 2. MEMBER ROLE SCREENS */}
            {currentRole === 'member' && currentMember && (
              <>
                {activeTab === 'profile' && (
                  <MemberProfile
                    member={currentMember}
                    learningTasks={tasks}
                    events={events}
                    onUpdateMotto={handleUpdateMotto}
                    onUpdateAvatar={handleUpdateAvatar}
                    onRemoveAvatar={handleRemoveAvatar}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'calendar' && (
                  <MemberCalendar
                    events={events}
                    member={currentMember}
                    customSavedEventIds={customSavedEventIds}
                    onToggleSaveEvent={handleToggleBookmarkEvent}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'learning' && (
                  <MemberLearning
                    member={currentMember}
                    tasks={tasks}
                    onRequestReview={handleRequestLearningReview}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'tasks' && (
                  <MemberTasks
                    tasks={pendingTasks}
                    member={currentMember}
                    onToggleComplete={handleTogglePendingTaskComplete}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'attendance' && (
                  <MemberAttendanceForm
                    member={currentMember}
                    records={attendance}
                    onSubmitRecord={handleSubmitAttendanceRecord}
                    onShowToast={showToast}
                  />
                )}
                {activeTab === 'equipment' && (
                  <MemberMaterials
                    equipment={equipment}
                    materials={materials}
                  />
                )}
              </>
            )}

            {/* 3. PARENT ROLE SCREENS */}
            {currentRole === 'parent' && (
              <ParentPortal
                studentName={parentStudentName || '林恩萱'}
                members={members}
                events={events}
                attendanceRecords={attendance}
              />
            )}
          </>
        )}
      </main>

      {/* Modern Sleek Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-900">FRC 10114</span>
            <span>•</span>
            <span>新北市立錦和高級中學機器人校隊</span>
            <span>•</span>
            <span className="text-orange-600 font-semibold">115學年度隊務管理系統</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-400">目前身分：</span>
            <span className="font-bold text-zinc-800">
              {currentRole === 'admin'
                ? '管理員教練'
                : currentRole === 'member'
                ? `隊員 (${currentMember?.name})`
                : currentRole === 'parent'
                ? `家長 (${parentStudentName} 家長)`
                : '未登入'}
            </span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-orange-600 hover:text-orange-700 underline font-medium"
            >
              切換身分
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Role Selection & Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        members={members}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
};
