import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  RotateCcw,
  AlertTriangle,
  Plus,
  Mail,
  Hash,
  User,
  Layers,
  Check,
  Phone,
  Quote,
  Camera,
  Trash2,
  Download,
  Calendar,
  MapPin,
  Shield,
  Globe,
  FileText,
} from 'lucide-react';
import { Member, Department } from '../../types';
import { UnsavedModal } from '../common/UnsavedModal';

interface MemberManagementProps {
  members: Member[];
  onUpdateMember: (updated: Member) => void;
  onAddMember: (newMember: Member) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

const ALL_DEPARTMENTS: Department[] = [
  '機電整合組',
  '程式控制組',
  '行銷管理組',
];

export const MemberManagement: React.FC<MemberManagementProps> = ({
  members,
  onUpdateMember,
  onAddMember,
  onShowToast,
}) => {
  // Active selected member ID
  const [selectedId, setSelectedId] = useState<string>(members[0]?.id || '');
  // Draft isolation state
  const [draftMember, setDraftMember] = useState<Member | null>(null);
  // Target member pending switch when unsaved warning triggers
  const [pendingSwitchId, setPendingSwitchId] = useState<string | null>(null);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);

  // New member modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState<Partial<Member>>({
    id: `10114-${String(members.length + 1).padStart(3, '0')}`,
    name: '',
    englishName: '',
    passportName: '',
    birthDate: '',
    nationalId: '',
    email: '',
    departments: ['機電整合組'],
    motto: '',
    phone: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
  });

  // Keep draft synchronized when active member changes
  useEffect(() => {
    const active = members.find((m) => m.id === selectedId) || members[0];
    if (active) {
      setDraftMember({ ...active, departments: [...active.departments] });
    }
  }, [selectedId, members]);

  const activeOriginal = members.find((m) => m.id === selectedId);

  // Check if draft has unsaved changes compared to active original
  const isDirty = Boolean(
    draftMember &&
      activeOriginal &&
      (draftMember.name !== activeOriginal.name ||
        draftMember.id !== activeOriginal.id ||
        draftMember.email !== activeOriginal.email ||
        draftMember.phone !== (activeOriginal.phone || '') ||
        (draftMember.englishName || '') !== (activeOriginal.englishName || '') ||
        (draftMember.passportName || '') !== (activeOriginal.passportName || '') ||
        (draftMember.birthDate || '') !== (activeOriginal.birthDate || '') ||
        (draftMember.nationalId || '') !== (activeOriginal.nationalId || '') ||
        (draftMember.address || '') !== (activeOriginal.address || '') ||
        (draftMember.guardianName || '') !== (activeOriginal.guardianName || '') ||
        (draftMember.guardianPhone || '') !== (activeOriginal.guardianPhone || '') ||
        draftMember.motto !== (activeOriginal.motto || '') ||
        (draftMember.avatar || '') !== (activeOriginal.avatar || '') ||
        draftMember.departments.length !== activeOriginal.departments.length ||
        !draftMember.departments.every((d) =>
          activeOriginal.departments.includes(d)
        ))
  );

  // Export full member roster with all personal fields to CSV (Excel UTF-8 BOM)
  const handleExportMembersList = () => {
    const headers = [
      '隊員編號 (學號)',
      '姓名',
      '常用英文名',
      '護照英文名',
      '出生年月日(西元)',
      '身分證字號',
      '電子郵件',
      '聯絡電話',
      '通訊地址',
      '監護人姓名',
      '監護人電話',
      '所屬組別',
      '座右銘'
    ];
    const rows = members.map((m) => [
      m.id,
      m.name,
      m.englishName || '',
      m.passportName || '',
      m.birthDate || '',
      m.nationalId || '',
      m.email || '',
      m.phone || '',
      m.address || '',
      m.guardianName || '',
      m.guardianPhone || '',
      m.departments.join('、'),
      m.motto || '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `FRC10114_隊員完整名冊_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('匯出成功', `已順利下載 ${members.length} 位隊員完整資料 CSV 名冊`, 'success');
  };

  // Handle dropdown switch with unsaved guard
  const handleSelectMember = (nextId: string) => {
    if (nextId === selectedId) return;

    if (isDirty) {
      setPendingSwitchId(nextId);
      setIsUnsavedModalOpen(true);
    } else {
      setSelectedId(nextId);
    }
  };

  // Save changes
  const handleSaveDraft = () => {
    if (!draftMember) return;
    if (!draftMember.name.trim()) {
      onShowToast('儲存失敗', '姓名不得為空白', 'error');
      return;
    }
    if (!draftMember.id.trim()) {
      onShowToast('儲存失敗', '隊員編號不得為空白', 'error');
      return;
    }
    if (draftMember.departments.length === 0) {
      onShowToast('儲存失敗', '請至少勾選一個所屬組別', 'warning');
      return;
    }

    onUpdateMember(draftMember);
    setSelectedId(draftMember.id);
    onShowToast(
      '資料儲存成功',
      `隊員「${draftMember.name}」的資料已成功更新。`,
      'success'
    );
  };

  // Discard draft changes
  const handleDiscardDraft = () => {
    if (activeOriginal) {
      setDraftMember({
        ...activeOriginal,
        departments: [...activeOriginal.departments],
      });
      onShowToast('已還原變更', '已放棄未儲存的修改內容。', 'info');
    }
  };

  // Modal actions for unsaved switch
  const handleSaveAndSwitch = () => {
    if (draftMember) {
      onUpdateMember(draftMember);
      onShowToast('已儲存並切換', `已更新「${draftMember.name}」資料。`, 'success');
    }
    if (pendingSwitchId) {
      setSelectedId(pendingSwitchId);
    }
    setIsUnsavedModalOpen(false);
    setPendingSwitchId(null);
  };

  const handleDiscardAndSwitch = () => {
    if (pendingSwitchId) {
      setSelectedId(pendingSwitchId);
    }
    setIsUnsavedModalOpen(false);
    setPendingSwitchId(null);
    onShowToast('已放棄修改', '已切換至目標隊員。', 'info');
  };

  const handleCancelSwitch = () => {
    setIsUnsavedModalOpen(false);
    setPendingSwitchId(null);
  };

  // Toggle department checkbox in draft
  const handleToggleDepartment = (dept: Department) => {
    if (!draftMember) return;
    const exists = draftMember.departments.includes(dept);
    let nextDepts: Department[];
    if (exists) {
      nextDepts = draftMember.departments.filter((d) => d !== dept);
    } else {
      nextDepts = [...draftMember.departments, dept];
    }
    setDraftMember({ ...draftMember, departments: nextDepts });
  };

  // Add new member submit
  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name?.trim() || !newMemberForm.id?.trim()) {
      onShowToast('新增失敗', '請填寫隊員姓名與編號', 'error');
      return;
    }
    if (!newMemberForm.departments || newMemberForm.departments.length === 0) {
      onShowToast('新增失敗', '請至少勾選一個所屬組別', 'warning');
      return;
    }

    const created: Member = {
      id: newMemberForm.id.trim(),
      name: newMemberForm.name.trim(),
      englishName: newMemberForm.englishName?.trim() || '',
      passportName: newMemberForm.passportName?.trim().toUpperCase() || '',
      birthDate: newMemberForm.birthDate?.trim() || '',
      nationalId: newMemberForm.nationalId?.trim().toUpperCase() || '',
      email: newMemberForm.email?.trim() || `${newMemberForm.id}@frc10114.org`,
      departments: newMemberForm.departments,
      motto: newMemberForm.motto || '熱愛機器人，追求卓越！',
      phone: newMemberForm.phone || '',
      address: newMemberForm.address?.trim() || '',
      guardianName: newMemberForm.guardianName?.trim() || '',
      guardianPhone: newMemberForm.guardianPhone?.trim() || '',
    };

    onAddMember(created);
    setSelectedId(created.id);
    setIsAddModalOpen(false);
    setNewMemberForm({
      id: `10114-${String(members.length + 2).padStart(3, '0')}`,
      name: '',
      englishName: '',
      passportName: '',
      birthDate: '',
      nationalId: '',
      email: '',
      departments: ['機電整合組'],
      motto: '',
      phone: '',
      address: '',
      guardianName: '',
      guardianPhone: '',
    });
    onShowToast('隊員新增成功', `新隊員「${created.name}」已加入名冊`, 'success');
  };

  const pendingTargetMember = members.find((m) => m.id === pendingSwitchId);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Member Management</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            全隊隊員資料管理
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            管理隊員帳號、聯絡資訊與三大核心分組權限。設定之組別將直接決定該隊員可見的組別任務與活動排程。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportMembersList}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-orange-50 border border-orange-300 text-orange-700 font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="將全隊隊員基本資料、英文名、身分證、出生年月日、地址與監護人等完整資料匯出為 Excel / CSV 格式"
          >
            <Download className="w-4 h-4 text-orange-600" />
            <span>匯出隊員資料 (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新增隊員</span>
          </button>
        </div>
      </div>

      {/* Main Form & Member Switcher Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Selector Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              人員即時切換 (下拉選單)
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectMember(e.target.value)}
              className="w-full p-3 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Quick List for fast clicks */}
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              隊員名冊清單 ({members.length} 人)
            </span>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {members.map((m) => {
                const isCurrent = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMember(m.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-between gap-2.5 ${
                      isCurrent
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden border ${
                        isCurrent ? 'bg-zinc-800 border-zinc-700 text-orange-400' : 'bg-zinc-900 border-zinc-800 text-orange-500'
                      }`}>
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{m.name.slice(0, 1)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1.5 truncate">
                          <span>{m.name}</span>
                          <span
                            className={`font-mono text-[10px] ${
                              isCurrent ? 'text-orange-400' : 'text-zinc-400'
                            }`}
                          >
                            ({m.id})
                          </span>
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 truncate ${
                            isCurrent ? 'text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          {m.departments.join(' · ')}
                        </div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Draft Editing Form & Safe Guard Mechanism */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Header of Form with Unsaved Alert Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-lg font-extrabold text-zinc-900">
                編輯隊員資料（草稿模式）
              </h3>
              <p className="text-xs text-zinc-500">
                目前對象：
                <span className="font-bold text-zinc-900">
                  {draftMember?.name}
                </span>{' '}
                <span className="font-mono text-zinc-400">
                  ({draftMember?.id})
                </span>
              </p>
            </div>

            {/* Dynamic Unsaved Changes Warning Badge */}
            {isDirty ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-800 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>有未儲存的變更！</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>所有變更已同步</span>
              </div>
            )}
          </div>

          {draftMember && (
            <div className="space-y-5">
              {/* Avatar Edit Row */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black text-xl border border-zinc-800 shadow-sm overflow-hidden flex-shrink-0">
                    {draftMember.avatar ? (
                      <img src={draftMember.avatar} alt={draftMember.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-orange-500 select-none">{draftMember.name.slice(0, 1)}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">隊員大頭貼相片</div>
                    <p className="text-[11px] text-zinc-500">
                      {draftMember.avatar ? '已設定自訂相片，儲存正式名冊後生效' : '目前使用代表字母，支援上傳個人照'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-bold text-zinc-700 transition-colors shadow-2xs">
                    <Camera className="w-3.5 h-3.5 text-orange-600" />
                    <span>{draftMember.avatar ? '更換照片' : '上傳照片'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
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
                              setDraftMember((prev) => (prev ? { ...prev, avatar: dataUrl } : prev));
                            }
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {draftMember.avatar && (
                    <button
                      type="button"
                      onClick={() => setDraftMember((prev) => (prev ? { ...prev, avatar: undefined } : prev))}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>移除</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500" />
                    <span>姓名</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.name}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, name: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：林恩萱"
                  />
                </div>

                {/* Member ID */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Hash className="w-3.5 h-3.5 text-orange-500" />
                    <span>隊員編號 (ID)</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.id}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, id: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：10114-002"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>常用英文名</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.englishName || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, englishName: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：Enxuan / Eric"
                  />
                </div>

                {/* Passport Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-500" />
                    <span>護照英文名 (大寫英文)</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.passportName || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, passportName: e.target.value.toUpperCase() })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none uppercase"
                    placeholder="例如：LIN, EN-XUAN"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>出生年月日 (西元)</span>
                  </label>
                  <input
                    type="date"
                    value={draftMember.birthDate || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, birthDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-orange-500" />
                    <span>身分證字號</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.nationalId || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, nationalId: e.target.value.toUpperCase() })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-mono font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none uppercase"
                    placeholder="例如：F234567890"
                    maxLength={10}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                    <span>電子信箱 (Email)</span>
                  </label>
                  <input
                    type="email"
                    value={draftMember.email}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, email: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：student@frc10114.org"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>隊員聯絡電話</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.phone || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：0912-345-678"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>通訊地址</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.address || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, address: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：新北市中和區錦和路xxx號"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500" />
                    <span>監護人姓名</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.guardianName || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, guardianName: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：林爸爸"
                  />
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>監護人電話</span>
                  </label>
                  <input
                    type="text"
                    value={draftMember.guardianPhone || ''}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, guardianPhone: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                    placeholder="例如：0988-111-222"
                  />
                </div>
              </div>

              {/* Department Multi-Select Binding */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/70">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-orange-600" />
                    <span>組別綁定 (可複選)</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    勾選決定該隊員可見的任務與訓練活動
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ALL_DEPARTMENTS.map((dept) => {
                    const isChecked = draftMember.departments.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => handleToggleDepartment(dept)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-orange-50 border-orange-400 text-orange-950 shadow-xs'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span>{dept}</span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motto / Note */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  <Quote className="w-3.5 h-3.5 text-orange-500" />
                  <span>給自己的一句話 (座右銘)</span>
                </label>
                <input
                  type="text"
                  value={draftMember.motto || ''}
                  onChange={(e) =>
                    setDraftMember({ ...draftMember, motto: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                  placeholder="隨時提醒自己當初加入時的心情"
                />
              </div>

              {/* Action Buttons: Save & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  disabled={!isDirty}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                    isDirty
                      ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>取消 / 放棄修改</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!isDirty}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-all shadow-xs ${
                    isDirty
                      ? 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>儲存正式變更</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Safe Guard Modal */}
      <UnsavedModal
        isOpen={isUnsavedModalOpen}
        targetMemberName={pendingTargetMember?.name}
        onSaveAndProceed={handleSaveAndSwitch}
        onDiscardAndProceed={handleDiscardAndSwitch}
        onCancel={handleCancelSwitch}
      />

      {/* Add New Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              新增 FRC 10114 隊員
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              填寫新進隊員資料與初始所屬組別
            </p>

            <form onSubmit={handleAddNewMemberSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    隊員姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.name}
                    onChange={(e) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="例: 李明翰"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    隊員編號 (ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.id}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, id: e.target.value })
                    }
                    placeholder="例: 10114-025"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    常用英文名
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.englishName || ''}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, englishName: e.target.value })
                    }
                    placeholder="例: Eric"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    護照英文名
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.passportName || ''}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, passportName: e.target.value.toUpperCase() })
                    }
                    placeholder="例: LEE, MING-HAN"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    電子郵件 (Email)
                  </label>
                  <input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, email: e.target.value })
                    }
                    placeholder="例: student@frc10114.org"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    聯絡電話
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.phone || ''}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, phone: e.target.value })
                    }
                    placeholder="例: 0912-345-678"
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  所屬組別 (可複選)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DEPARTMENTS.map((d) => {
                    const checked = newMemberForm.departments?.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const cur = newMemberForm.departments || [];
                          const next = checked
                            ? cur.filter((x) => x !== d)
                            : [...cur, d];
                          setNewMemberForm({
                            ...newMemberForm,
                            departments: next,
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          checked
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
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
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold"
                >
                  建立隊員
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
