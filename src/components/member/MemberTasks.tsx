import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TeamPendingTask, Member, Department } from '../../types';

interface MemberTasksProps {
  tasks: TeamPendingTask[];
  member: Member;
  onToggleComplete: (taskId: string | number) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const MemberTasks: React.FC<MemberTasksProps> = ({
  tasks,
  member,
  onToggleComplete,
  onShowToast,
}) => {
  const [statusTab, setStatusTab] = useState<'todo' | 'completed' | 'all'>('todo');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Filter tasks that match this member's departments
  const myDeptTasks = tasks.filter((t) =>
    member.departments.includes(t.department)
  );

  const filteredTasks = myDeptTasks.filter((t) => {
    if (statusTab !== 'all' && t.status !== statusTab) return false;
    if (selectedDept !== 'all' && t.department !== selectedDept) return false;
    return true;
  });

  const todoCount = myDeptTasks.filter((t) => t.status === 'todo').length;
  const completedCount = myDeptTasks.filter((t) => t.status === 'completed').length;

  const handleToggle = (task: TeamPendingTask) => {
    onToggleComplete(task.id);
    if (task.status === 'todo') {
      onShowToast('任務完成！', `「${task.title}」已標示為完成並移入已完成區域。`, 'success');
    } else {
      onShowToast('已重設為進行中', `「${task.title}」已移回待完成清單。`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Department Work Backlog</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            組別待完成工作清單
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            顯示所屬「{member.departments.join('、')}」尚未完成之團隊工程任務。所有同組成員皆可即時同步工作目標與完成狀態。
          </p>
        </div>

        {/* Status Switcher Tabs */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start md:self-auto">
          <button
            onClick={() => setStatusTab('todo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusTab === 'todo'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>待完成 ({todoCount})</span>
          </button>

          <button
            onClick={() => setStatusTab('completed')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusTab === 'completed'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已完成 ({completedCount})</span>
          </button>

          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusTab === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            全部 ({myDeptTasks.length})
          </button>
        </div>
      </div>

      {/* Dept Filter */}
      {member.departments.length > 1 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-xs flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-bold text-zinc-700">組別切換：</span>
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedDept === 'all'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            我的所有分組
          </button>
          {member.departments.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedDept === d
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-12 text-center text-zinc-400">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm font-medium">目前沒有符合條件的組別待辦任務</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'border-zinc-200 opacity-80 bg-zinc-50/50'
                      : 'border-zinc-200 hover:border-orange-300'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {task.department}
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          已完成
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                          <Clock className="w-3 h-3" />
                          進行中待辦
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-base font-extrabold text-zinc-900 tracking-tight ${
                        isDone ? 'line-through text-zinc-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="text-[11px] text-zinc-400 font-mono">
                      建立日期：{task.createdAt}{' '}
                      {task.completedAt && `• 完成時間：${task.completedAt}`}
                    </div>
                  </div>

                  {/* Toggle Complete button */}
                  <div className="self-end sm:self-center">
                    <button
                      onClick={() => handleToggle(task)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                        isDone
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      }`}
                    >
                      {isDone ? (
                        <span>標記為未完成</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>點擊標示完成</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
