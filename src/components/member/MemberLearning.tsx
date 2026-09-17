import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle,
  Clock,
  Plus,
  Send,
} from 'lucide-react';
import { LearningTask, Member, Department } from '../../types';

interface MemberLearningProps {
  member: Member;
  tasks: LearningTask[];
  onRequestReview: (taskName: string, department: Department) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const MemberLearning: React.FC<MemberLearningProps> = ({
  member,
  tasks,
  onRequestReview,
  onShowToast,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [taskNameInput, setTaskNameInput] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department>(
    member.departments[0] || '機電整合組'
  );

  // Filter tasks that belong to this member
  const myTasks = tasks.filter((t) => t.studentId === member.id);
  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const pendingTasks = myTasks.filter((t) => t.status === 'pending');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNameInput.trim()) {
      onShowToast('提交失敗', '請輸入驗收項目名稱', 'error');
      return;
    }

    onRequestReview(taskNameInput.trim(), selectedDept);
    onShowToast(
      '已送出驗收申請',
      `「${taskNameInput}」已送出，請至實作工坊找管理員教練進行技術檢核！`,
      'success'
    );
    setIsSubmitModalOpen(false);
    setTaskNameInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Learning Task Stamp Card</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            個人學習成果審核與技能集章卡
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            包含機構、電控、軟體與行銷各項核心考核項目。完成自主實作後找教練檢核，審核通過後點亮專屬 PASSED 戳章！
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>申請技術驗收</span>
        </button>
      </div>

      {/* Stamp Progress Scoreboard */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-6 shadow-md border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>FRC 10114 技能認證勳章</span>
          </div>
          <h3 className="text-xl font-black tracking-tight">
            {member.name} 的學習認證進度
          </h3>
          <p className="text-xs text-zinc-400">
            所屬組別：{member.departments.join(' · ')}
          </p>
        </div>

        <div className="flex items-center gap-6 z-10 bg-zinc-800/80 p-4 rounded-xl border border-zinc-700/60">
          <div className="text-center">
            <p className="text-xs text-zinc-400">已點亮集章</p>
            <p className="text-3xl font-black text-orange-400 mt-0.5">
              {completedTasks.length}
            </p>
          </div>
          <div className="w-px h-10 bg-zinc-700" />
          <div className="text-center">
            <p className="text-xs text-zinc-400">等待審核</p>
            <p className="text-3xl font-black text-amber-400 mt-0.5">
              {pendingTasks.length}
            </p>
          </div>
          <div className="w-px h-10 bg-zinc-700" />
          <div className="text-center">
            <p className="text-xs text-zinc-400">總驗收項目</p>
            <p className="text-3xl font-black text-white mt-0.5">
              {myTasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
            我的技能驗收任務列表 ({myTasks.length} 項)
          </span>
          <span className="text-xs text-zinc-400">
            * 由管理員檢核通過後自動自「未完成」轉為「已完成」
          </span>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center text-zinc-400">
            <Award className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-medium">目前尚無排定任務，點擊上方按鈕申請驗收！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.map((task) => {
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`bg-white border rounded-xl p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                    isCompleted
                      ? 'border-emerald-300 bg-white'
                      : 'border-zinc-200 bg-zinc-50/50'
                  }`}
                >
                  {/* Real Stamp Badge overlay when completed */}
                  {isCompleted && (
                    <div className="absolute -right-3 -bottom-3 pointer-events-none rotate-[-12deg] z-10 select-none">
                      <div className="border-3 border-emerald-600 bg-white/95 text-emerald-700 rounded-xl px-4 py-2 text-center font-mono font-black shadow-md border-dashed">
                        <div className="text-[10px] tracking-widest">★ 10114 VERIFIED ★</div>
                        <div className="text-base font-black">PASSED 核可</div>
                        <div className="text-[9px] text-zinc-500 font-sans mt-0.5">
                          {task.verifiedAt?.slice(0, 10)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        {task.department}
                      </span>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          已完成檢核
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          未完成 (待管理員驗收)
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">
                        {task.taskName}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        對象：{task.studentName} ({task.studentId})
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    {isCompleted ? (
                      <span className="text-[11px] font-medium text-emerald-700">
                        審核教練：{task.verifiedBy || '許教練'} • {task.verifiedAt}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium">
                        請自主完成後，於實作時段找教練實機考核
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Review Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              申請技術檢核與集章
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              填寫您已完成自主研習的技能項目，提交後管理員即可為您驗收蓋章
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  技能任務名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={taskNameInput}
                  onChange={(e) => setTaskNameInput(e.target.value)}
                  placeholder="例如：Limelight 3G 空間姿態校正"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  對應組別 *
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as Department)}
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                >
                  {member.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>送出驗收申請</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
