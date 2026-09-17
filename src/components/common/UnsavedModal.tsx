import React from 'react';
import { AlertTriangle, Save, Trash2, ArrowLeft } from 'lucide-react';

interface UnsavedModalProps {
  isOpen: boolean;
  targetMemberName?: string;
  onSaveAndProceed: () => void;
  onDiscardAndProceed: () => void;
  onCancel: () => void;
}

export const UnsavedModal: React.FC<UnsavedModalProps> = ({
  isOpen,
  targetMemberName,
  onSaveAndProceed,
  onDiscardAndProceed,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 w-full max-w-md rounded-xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">未儲存的變更提醒</h3>
        </div>

        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
          您目前的隊員草稿資料已進行修改但尚未儲存。
          {targetMemberName ? (
            <span>
              若直接切換至 <span className="font-semibold text-zinc-900">「{targetMemberName}」</span>，未儲存的內容將會遺失。
            </span>
          ) : (
            <span>若離開當前頁面，未儲存的內容將會遺失。</span>
          )}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onSaveAndProceed}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            儲存變更並切換
          </button>

          <button
            onClick={onDiscardAndProceed}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 font-medium rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            放棄未儲存變更
          </button>

          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-medium rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            取消 (留在本頁繼續編輯)
          </button>
        </div>
      </div>
    </div>
  );
};
