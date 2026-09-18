import React, { useState, useEffect, useRef } from 'react';
import {
  Quote,
  Save,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  User,
  Edit,
  X,
} from 'lucide-react';
import { Member, LearningTask, TeamEvent } from '../../types';

interface MemberProfileProps {
  member: Member;
  learningTasks: LearningTask[];
  events: TeamEvent[];
  onUpdateMotto: (newMotto: string) => void;
  onUpdateAvatar?: (memberId: string, avatarUrl: string) => void;
  onRemoveAvatar?: (memberId: string) => void;
  onUpdateMember?: (updated: Member) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({
  member,
  learningTasks,
  events,
  onUpdateMotto,
  onUpdateAvatar,
  onRemoveAvatar,
  onUpdateMember,
  onShowToast,
}) => {
  const [mottoText, setMottoText] = useState(member.motto || '');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile fields state & modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(member.name || '');
  const [editEnglishName, setEditEnglishName] = useState(member.englishName || '');
  const [editPassportName, setEditPassportName] = useState(member.passportName || '');
  const [editBirthDate, setEditBirthDate] = useState(member.birthDate || '');
  const [editNationalId, setEditNationalId] = useState(member.nationalId || '');
  const [editAddress, setEditAddress] = useState(member.address || '');
  const [editEmail, setEditEmail] = useState(member.email || '');
  const [editPhone, setEditPhone] = useState(member.phone || '');
  const [editGuardianName, setEditGuardianName] = useState(member.guardianName || '');
  const [editGuardianPhone, setEditGuardianPhone] = useState(member.guardianPhone || '');

  useEffect(() => {
    setEditName(member.name || '');
    setEditEnglishName(member.englishName || '');
    setEditPassportName(member.passportName || '');
    setEditBirthDate(member.birthDate || '');
    setEditNationalId(member.nationalId || '');
    setEditAddress(member.address || '');
    setEditEmail(member.email || '');
    setEditPhone(member.phone || '');
    setEditGuardianName(member.guardianName || '');
    setEditGuardianPhone(member.guardianPhone || '');
  }, [member]);

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateMember) return;
    const updated: Member = {
      ...member,
      name: editName.trim() || member.name,
      englishName: editEnglishName.trim(),
      passportName: editPassportName.trim().toUpperCase(),
      birthDate: editBirthDate.trim(),
      nationalId: editNationalId.trim().toUpperCase(),
      address: editAddress.trim(),
      email: editEmail.trim() || member.email,
      phone: editPhone.trim(),
      guardianName: editGuardianName.trim(),
      guardianPhone: editGuardianPhone.trim(),
    };
    onUpdateMember(updated);
    setIsEditProfileOpen(false);
    onShowToast('個人資料儲存成功', '個人出賽與身分登記資料已更新', 'success');
  };

  const myTasks = learningTasks.filter((t) => t.studentId === member.id);
  const myCompletedTasks = myTasks.filter((t) => t.status === 'completed');

  // Count my department events
  const myEvents = events.filter((ev) =>
    ev.departments.some((d) => member.departments.includes(d))
  );

  const handleSaveMotto = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMotto(mottoText.trim());
    setIsEditing(false);
    onShowToast('初心座右銘已儲存', '隨時提醒自己當初加入 FRC 的熱忱與心願！', 'success');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('格式錯誤', '請選擇圖片檔案（支援 JPG、PNG、WebP、GIF 等）', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (onUpdateAvatar) onUpdateAvatar(member.id, dataUrl);
          onShowToast('相片上傳成功', '個人大頭貼已更新', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Identity Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Clickable Avatar Box with Hover Overlay & Corner Badge */}
            <div className="relative group flex-shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                title="點擊上傳或更換個人大頭貼相片"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-black text-2xl sm:text-3xl border border-zinc-800 shadow-md overflow-hidden cursor-pointer relative hover:border-orange-500 transition-all select-none"
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-orange-500">{member.name.slice(0, 1)}</span>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 text-[11px] font-bold">
                  <Camera className="w-5 h-5 text-orange-400" />
                  <span>{member.avatar ? '更換' : '上傳'}</span>
                </div>
              </div>

              {/* Corner Camera Button Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="更換相片"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform hover:scale-110"
              >
                <Camera className="w-3 h-3" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                  {member.name}
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-zinc-900 text-white rounded-md">
                  {member.id}
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 font-semibold rounded-md">
                  FRC 10114 隊員
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">{member.email}</p>

              {/* Department Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs font-bold text-zinc-600 mr-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-orange-500" /> 所屬組別：
                </span>
                {member.departments.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-0.5 bg-orange-600 text-white text-xs font-semibold rounded-md shadow-2xs"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Upload / Remove Actions */}
              <div className="flex items-center gap-2 pt-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  <Upload className="w-3 h-3" />
                  <span>{member.avatar ? '更換個人大頭照' : '上傳個人照片'}</span>
                </button>
                {member.avatar && (
                  <>
                    <span className="text-zinc-300">·</span>
                    <button
                      type="button"
                      onClick={() => onRemoveAvatar && onRemoveAvatar(member.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>移除照片</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 self-stretch md:self-auto min-w-[240px]">
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 mb-1">
                <Award className="w-3.5 h-3.5 text-orange-500" />
                <span>技能集章進度</span>
              </div>
              <span className="text-xl font-black text-zinc-900">
                {myCompletedTasks.length} / {myTasks.length}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>本組近期活動</span>
              </div>
              <span className="text-xl font-black text-zinc-900">
                {myEvents.length} 場
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 隊員詳細個人資料檔案 (賽務與保險登記) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">隊員詳細個人資料（出賽與身分登記）</h3>
              <p className="text-[11px] text-zinc-400">賽事檢錄、出入境機票、平安保險與緊急聯絡專屬資料</p>
            </div>
          </div>
          {onUpdateMember && (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5 text-orange-400" />
              <span>編輯詳細資料</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-400">1. 常用英文名</span>
            <p className="font-bold text-zinc-900 text-sm">{member.englishName || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-400">2. 護照英文名</span>
            <p className="font-mono font-bold text-zinc-900 text-sm">{member.passportName || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-400">3. 出生年月日 (西元)</span>
            <p className="font-mono font-bold text-zinc-900 text-sm">{member.birthDate || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-400">4. 身分證字號</span>
            <p className="font-mono font-bold text-zinc-900 text-sm">{member.nationalId || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-400">6. 電子信箱</span>
            <p className="font-mono text-zinc-800 truncate">{member.email || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-zinc-400">7. 聯絡電話</span>
            <p className="font-mono font-bold text-zinc-900">{member.phone || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 md:col-span-2 lg:col-span-3">
            <span className="text-[11px] font-bold text-zinc-400">5. 戶籍 / 通訊地址</span>
            <p className="font-medium text-zinc-800">{member.address || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl space-y-1 md:col-span-1 lg:col-span-1">
            <span className="text-[11px] font-bold text-orange-700">8. 監護人姓名</span>
            <p className="font-bold text-zinc-900 text-sm">{member.guardianName || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>

          <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl space-y-1 md:col-span-1 lg:col-span-2">
            <span className="text-[11px] font-bold text-orange-700">9. 監護人聯絡電話</span>
            <p className="font-mono font-bold text-zinc-900 text-sm">{member.guardianPhone || <span className="text-zinc-400 font-normal italic">尚未填寫</span>}</p>
          </div>
        </div>
      </div>

      {/* Feature 1: 給自己的一句話 (Motto /初心提醒) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                給自己的一句話（初心座右銘）
              </h3>
              <p className="text-xs text-zinc-500">
                隨時提醒自己當初加入 FRC 錦和 10114 時的心情與渴望實現的目標
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
            >
              編輯小語
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveMotto} className="space-y-3">
            <textarea
              rows={3}
              value={mottoText}
              onChange={(e) => setMottoText(e.target.value)}
              placeholder="寫下加入校隊的初心，例如：堅持熱愛，讓機構與程式在賽場上精準綻放！"
              className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setMottoText(member.motto || '');
                  setIsEditing(false);
                }}
                className="px-3.5 py-1.5 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>儲存座右銘</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-transparent border border-orange-200 rounded-xl relative">
            <Sparkles className="w-5 h-5 text-orange-400 absolute top-4 right-4" />
            <p className="text-base font-extrabold text-zinc-900 italic tracking-wide leading-relaxed">
              「{member.motto || '堅持熱愛，讓一行行程式與機構在賽場上精準綻放！'}」
            </p>
            <p className="text-[11px] text-zinc-400 mt-2 font-mono">
              — {member.name} • FRC 10114 ({member.departments.join(' & ')})
            </p>
          </div>
        )}
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Learning Status */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span>我的近期學習驗收</span>
            </h4>
            <span className="text-xs text-zinc-400">
              共 {myTasks.length} 項
            </span>
          </div>

          <div className="space-y-2">
            {myTasks.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">
                尚未指派任務，可至「學習集章」頁面提交
              </p>
            ) : (
              myTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-zinc-800">{t.taskName}</span>
                  {t.status === 'completed' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      已蓋章通過
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      待審核
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Member Upcoming Activities */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>本組即將到來活動</span>
            </h4>
            <span className="text-xs text-zinc-400">
              共 {myEvents.length} 場
            </span>
          </div>

          <div className="space-y-2">
            {myEvents.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-zinc-800 block">
                    {ev.name}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {ev.date} • {ev.startTime}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-semibold text-[10px]">
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 編輯個人詳細資料彈窗 */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-xl rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">編輯個人詳細資料</h3>
                <p className="text-xs text-zinc-500">更新個人出賽檢錄、英文證照與保險緊急聯絡資料</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">中文姓名 *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="請輸入中文姓名"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">1. 常用英文名</label>
                  <input
                    type="text"
                    value={editEnglishName}
                    onChange={(e) => setEditEnglishName(e.target.value)}
                    placeholder="例如：Alex / Eric / David"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">2. 護照英文名</label>
                  <input
                    type="text"
                    value={editPassportName}
                    onChange={(e) => setEditPassportName(e.target.value.toUpperCase())}
                    placeholder="例如：LIN, EN-XUAN (依護照拼音)"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">3. 出生年月日 (西元) *</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">4. 身分證字號</label>
                  <input
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value.toUpperCase())}
                    placeholder="例如：A123456789 (出入境與保險查驗用)"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">7. 聯絡電話</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="例如：0912-345-678"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">6. 電子信箱</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="例如：student@frc10114.org"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">5. 戶籍 / 通訊地址</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="例如：新北市中和區錦和路xxx號"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-orange-50/60 border border-orange-200 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-orange-900 mb-1">8. 監護人姓名</label>
                  <input
                    type="text"
                    value={editGuardianName}
                    onChange={(e) => setEditGuardianName(e.target.value)}
                    placeholder="例如：林爸爸"
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-900 mb-1">9. 監護人聯絡電話</label>
                  <input
                    type="tel"
                    value={editGuardianPhone}
                    onChange={(e) => setEditGuardianPhone(e.target.value)}
                    placeholder="例如：0988-111-222"
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>儲存更新</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
