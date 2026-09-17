import React, { useState } from 'react';
import {
  CheckSquare,
  Award,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { LearningTask, Member, Department } from '../../types';

interface AdminTaskReviewProps {
  tasks: LearningTask[];
  members: Member[];
  onVerifyTask: (id: number | string, verifiedBy: string) => void;
  onAddTask: (task: Omit<LearningTask, 'id' | 'status'>) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const AdminTaskReview: React.FC<AdminTaskReviewProps> = ({
  tasks,
  members,
  onVerifyTask,
  onAddTask,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState(members[1]?.id || members[0]?.id || '');
  const [newTaskName, setNewTaskName] = useState('');
  const [newDept, setNewDept] = useState<Department>('機電整合組');

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterDept !== 'all' && t.department !== filterDept) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.taskName.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.studentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVerify = (task: LearningTask) => {
    onVerifyTask(task.id, '管理員教練');
    onShowToast(
      '審核驗收通過！',
      `隊員「${task.studentName}」的任務「${task.taskName}」已蓋章核可。`,
      'success'
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      onShowToast('建立失敗', '請填寫任務名稱', 'error');
      return;
    }
    const student = members.find((m) => m.id === targetStudentId);
    if (!student) return;

    onAddTask({
      studentId: student.id,
      studentName: student.name,
      taskName: newTaskName.trim(),
      department: newDept,
    });

    onShowToast(
      '已指派學習任務',
      `已為「${student.name}」建立學習任務「${newTaskName}」`,
      'success'
    );
    setIsAddModalOpen(false);
    setNewTaskName('');
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Learning Task Stamp Verification</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            學習任務進度審核與集章
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            隊員完成學習後找管理員驗收，點擊通過即可完成蓋章核可，即時同步更新至該隊員個人介面。
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>指派新學習任務</span>
          </button>
        </div>
      </div>

      {/* Metric Counters & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus('all')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'all'
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
              : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <p className="text-xs text-zinc-400 font-medium">總學習任務數</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black">{tasks.length}</span>
            <span className="text-xs opacity-75">件任務</span>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('pending')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'pending'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-zinc-800 border-zinc-200 hover:border-orange-300'
          }`}
        >
          <p className="text-xs text-amber-500 font-medium">待審核驗收</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-orange-600 group-hover:text-white">
              {pendingCount}
            </span>
            <span className="text-xs text-zinc-500">等待教練蓋章</span>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('completed')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            filterStatus === 'completed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-zinc-800 border-zinc-200 hover:border-emerald-300'
          }`}
        >
          <p className="text-xs text-emerald-600 font-medium">已審核通過 (已集章)</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {completedCount}
            </span>
            <span className="text-xs text-zinc-500">通過率 {Math.round((completedCount / (tasks.length || 1)) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Search & Dept Filters */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋學生姓名、學號或學習任務關鍵字..."
            className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-bold text-zinc-700">組別：</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="p-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none"
          >
            <option value="all">全部分組</option>
            <option value="機電整合組">機電整合組</option>
            <option value="程式控制組">程式控制組</option>
            <option value="行銷管理組">行銷管理組</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center text-zinc-400">
            <Award className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-medium">沒有符合條件的學習驗收任務</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                  isDone
                    ? 'border-zinc-200'
                    : 'border-orange-300 bg-orange-50/10 hover:border-orange-400'
                }`}
              >
                {/* Stamp watermark effect for completed tasks */}
                {isDone && (
                  <div className="absolute -right-2 -bottom-2 pointer-events-none opacity-85 select-none rotate-[-12deg]">
                    <div className="border-2 border-dashed border-emerald-600 text-emerald-700 rounded-lg px-3 py-1 text-center font-mono font-black text-xs uppercase tracking-widest bg-emerald-50/90 shadow-xs">
                      <div>★ FRC 10114 ★</div>
                      <div className="text-sm font-extrabold">PASSED 核可</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {task.department}
                    </span>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        已完成驗收
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        待管理員審核
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900 tracking-tight">
                      {task.taskName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600">
                      <span className="font-bold text-zinc-900">
                        {task.studentName}
                      </span>
                      <span className="font-mono text-zinc-400">
                        ({task.studentId})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  {isDone ? (
                    <div className="text-[11px] text-zinc-400">
                      <span>核章時間：{task.verifiedAt}</span>
                      <span className="ml-2 font-medium text-zinc-600">
                        (核准人: {task.verifiedBy || '教練'})
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-600 font-medium">
                      隊員已提交驗收申請
                    </div>
                  )}

                  {!isDone && (
                    <button
                      onClick={() => handleVerify(task)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>審核通過 (蓋章)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              建立學習驗收任務
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              指定隊員與驗收技能項目，隊員練習後可找教練進行審核蓋章
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  選擇目標隊員 *
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  學習任務名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="例如：CAN Bus 匯流排終端電阻量測"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  對應組別 *
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value as Department)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                >
                  <option value="機電整合組">機電整合組</option>
                  <option value="程式控制組">程式控制組</option>
                  <option value="行銷管理組">行銷管理組</option>
                </select>
              </div>

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
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold"
                >
                  建立任務
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
