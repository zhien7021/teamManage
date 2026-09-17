import React, { useState } from 'react';
import {
  Wrench,
  Bot,
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  Edit2,
} from 'lucide-react';
import {
  Equipment,
  MaterialItem,
  MaterialCategory,
  Member,
} from '../../types';

interface AdminEquipmentProps {
  equipment: Equipment[];
  materials: MaterialItem[];
  members: Member[];
  onBorrowEquipment: (id: string, borrowerName: string, notes?: string) => void;
  onReturnEquipment: (id: string) => void;
  onUpdateMaterialQuantity: (id: string, newQty: number) => void;
  onAddMaterial: (material: Omit<MaterialItem, 'id'>) => void;
  onShowToast: (
    title: string,
    message?: string,
    type?: 'success' | 'warning' | 'info' | 'error'
  ) => void;
}

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  '馬達',
  '齒輪',
  '皮帶',
  '感測器',
  '氣壓件',
  '五金螺絲',
  '控制器與電控',
  '其他',
];

export const AdminEquipment: React.FC<AdminEquipmentProps> = ({
  equipment,
  materials,
  members,
  onBorrowEquipment,
  onReturnEquipment,
  onUpdateMaterialQuantity,
  onAddMaterial,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'equipment' | 'materials'>('equipment');

  // Equipment filters & modals
  const [eqCategoryFilter, setEqCategoryFilter] = useState<string>('all');
  const [eqStatusFilter, setEqStatusFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [eqSearch, setEqSearch] = useState('');

  // Borrow Modal
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [borrowTargetEquipment, setBorrowTargetEquipment] = useState<Equipment | null>(null);
  const [borrowerName, setBorrowerName] = useState(members[1]?.name || '');
  const [borrowNotes, setBorrowNotes] = useState('');

  // Material filters & modals
  const [matCategoryFilter, setMatCategoryFilter] = useState<string>('all');
  const [matSearch, setMatSearch] = useState('');
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCat, setNewMatCat] = useState<MaterialCategory>('馬達');
  const [newMatQty, setNewMatQty] = useState(1);
  const [newMatUnit, setNewMatUnit] = useState('顆');
  const [newMatSpec, setNewMatSpec] = useState('');
  const [newMatLocation, setNewMatLocation] = useState('');

  // Equipment filtering
  const filteredEquipment = equipment.filter((eq) => {
    if (eqCategoryFilter !== 'all' && eq.category !== eqCategoryFilter) return false;
    if (eqStatusFilter !== 'all' && eq.status !== eqStatusFilter) return false;
    if (eqSearch.trim()) {
      const q = eqSearch.toLowerCase();
      return (
        eq.name.toLowerCase().includes(q) ||
        eq.id.toLowerCase().includes(q) ||
        (eq.borrowedBy && eq.borrowedBy.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Material filtering
  const filteredMaterials = materials.filter((mat) => {
    if (matCategoryFilter !== 'all' && mat.category !== matCategoryFilter) return false;
    if (matSearch.trim()) {
      const q = matSearch.toLowerCase();
      return (
        mat.name.toLowerCase().includes(q) ||
        mat.specification.toLowerCase().includes(q) ||
        mat.storageLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Open borrow modal
  const handleOpenBorrow = (eq: Equipment) => {
    setBorrowTargetEquipment(eq);
    setIsBorrowModalOpen(true);
  };

  // Submit borrow
  const handleSubmitBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowTargetEquipment || !borrowerName.trim()) {
      onShowToast('登記失敗', '請輸入借用人姓名', 'error');
      return;
    }
    onBorrowEquipment(borrowTargetEquipment.id, borrowerName.trim(), borrowNotes.trim());
    onShowToast(
      '出借登記成功',
      `「${borrowTargetEquipment.name}」已登記借出給 ${borrowerName}`,
      'success'
    );
    setIsBorrowModalOpen(false);
    setBorrowNotes('');
  };

  // Return equipment
  const handleReturn = (eq: Equipment) => {
    onReturnEquipment(eq.id);
    onShowToast('設備已歸還', `「${eq.name}」已成功歸還，狀態恢復為可借用。`, 'info');
  };

  // Add material submit
  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) {
      onShowToast('新增失敗', '請填寫耗材/材料名稱', 'error');
      return;
    }
    onAddMaterial({
      name: newMatName.trim(),
      category: newMatCat,
      quantity: Number(newMatQty) || 0,
      unit: newMatUnit.trim() || '個',
      specification: newMatSpec.trim() || '-',
      storageLocation: newMatLocation.trim() || '未指定',
    });
    onShowToast('材料新增成功', `已建立「${newMatName}」庫存項目。`, 'success');
    setIsAddMaterialModalOpen(false);
    setNewMatName('');
    setNewMatSpec('');
    setNewMatLocation('');
  };

  const availableEqCount = equipment.filter((e) => e.status === 'available').length;
  const borrowedEqCount = equipment.filter((e) => e.status === 'borrowed').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <Wrench className="w-4 h-4" />
            <span>Equipment & Inventory Management</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            機具設備與材料耗材管理清單
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            即時掌握 MARC 訓練機器人 01-30 號、工具儀器之借調狀態與借用人；維護馬達、齒輪、皮帶等材料耗材數量。
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('equipment')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'equipment'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-orange-400" />
            <span>機具設備 ({equipment.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'materials'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-orange-400" />
            <span>材料耗材庫存 ({materials.length})</span>
          </button>
        </div>
      </div>

      {/* 1. EQUIPMENT VIEW */}
      {activeSubTab === 'equipment' && (
        <div className="space-y-4">
          {/* Status Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setEqStatusFilter('all')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                eqStatusFilter === 'all'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <p className="text-xs text-zinc-400 font-medium">總列管機具設備</p>
              <p className="text-2xl font-black mt-1">{equipment.length}</p>
            </div>

            <div
              onClick={() => setEqStatusFilter('available')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                eqStatusFilter === 'available'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-zinc-900 border-zinc-200 hover:border-emerald-300'
              }`}
            >
              <p className="text-xs text-emerald-600 font-medium">目前可借用 (Available)</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{availableEqCount}</p>
            </div>

            <div
              onClick={() => setEqStatusFilter('borrowed')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                eqStatusFilter === 'borrowed'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-zinc-900 border-zinc-200 hover:border-orange-300'
              }`}
            >
              <p className="text-xs text-orange-600 font-medium">已被借出 (Borrowed)</p>
              <p className="text-2xl font-black text-orange-600 mt-1">{borrowedEqCount}</p>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={eqSearch}
                onChange={(e) => setEqSearch(e.target.value)}
                placeholder="搜尋編號 (例: MARC-01)、設備名稱或借用人姓名..."
                className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold text-zinc-700">分類：</span>
              <select
                value={eqCategoryFilter}
                onChange={(e) => setEqCategoryFilter(e.target.value)}
                className="p-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none"
              >
                <option value="all">全部分類</option>
                <option value="訓練機器人">訓練機器人 (MARC)</option>
                <option value="電動工具">電動工具</option>
                <option value="量測儀器">量測儀器</option>
                <option value="大型機具">大型機具</option>
                <option value="氣動設備">氣動設備</option>
              </select>
            </div>
          </div>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((eq) => {
              const isBorrowed = eq.status === 'borrowed';

              return (
                <div
                  key={eq.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                    isBorrowed
                      ? 'border-amber-300 bg-amber-50/15'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black px-2 py-0.5 bg-zinc-900 text-white rounded-md">
                        {eq.id}
                      </span>
                      {isBorrowed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          已被借用
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          可借用
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                      {eq.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500">類別：{eq.category}</p>

                    {/* Borrowed details */}
                    {isBorrowed && (
                      <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-amber-800 text-[11px]">目前在誰那裡：</span>
                          <span className="font-bold text-zinc-900">{eq.borrowedBy}</span>
                        </div>
                        {eq.borrowedAt && (
                          <div className="text-[11px] text-zinc-500">
                            借出時間：{eq.borrowedAt}
                          </div>
                        )}
                        {eq.notes && (
                          <div className="text-[11px] text-zinc-600 italic">
                            用途：{eq.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-end">
                    {isBorrowed ? (
                      <button
                        onClick={() => handleReturn(eq)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        <span>歸還設備</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenBorrow(eq)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>登記出借</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MATERIALS VIEW */}
      {activeSubTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={matSearch}
                onChange={(e) => setMatSearch(e.target.value)}
                placeholder="搜尋材料名稱、規格型號、存放位置..."
                className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700">分類：</span>
              <select
                value={matCategoryFilter}
                onChange={(e) => setMatCategoryFilter(e.target.value)}
                className="p-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none"
              >
                <option value="all">全部分類</option>
                {MATERIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增材料項目</span>
              </button>
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">分類</th>
                    <th className="py-3 px-4">材料 / 耗材名稱</th>
                    <th className="py-3 px-4">規格 / 型號</th>
                    <th className="py-3 px-4">存放位置</th>
                    <th className="py-3 px-4 text-center">庫存數量</th>
                    <th className="py-3 px-4 text-right">數量增減調整</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredMaterials.map((mat) => {
                    const isLow = mat.quantity <= 5;

                    return (
                      <tr key={mat.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-700">
                          <span className="px-2 py-0.5 bg-zinc-100 rounded-md border border-zinc-200">
                            {mat.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900 text-sm">
                          {mat.name}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-mono text-[11px]">
                          {mat.specification}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500">
                          {mat.storageLocation}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full ${
                              isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {mat.quantity} {mat.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                onUpdateMaterialQuantity(
                                  mat.id,
                                  Math.max(0, mat.quantity - 1)
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-bold transition-colors"
                              title="減少 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() =>
                                onUpdateMaterialQuantity(
                                  mat.id,
                                  mat.quantity + 1
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-bold transition-colors"
                              title="增加 1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Borrow Registration Modal */}
      {isBorrowModalOpen && borrowTargetEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              機具設備出借登記
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              登記出借編號：
              <span className="font-mono font-bold text-zinc-900">
                {borrowTargetEquipment.id}
              </span>{' '}
              ({borrowTargetEquipment.name})
            </p>

            <form onSubmit={handleSubmitBorrow} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  借用人姓名 (隊員或老師) *
                </label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="例如：林恩萱 (10114-002)"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  借用用途或備註
                </label>
                <input
                  type="text"
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                  placeholder="例如：Swerve 視覺導航實機除錯"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold"
                >
                  確認登記出借
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              新增材料或耗材項目
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              建立校隊備料清單，供隊員查閱與管理員調控
            </p>

            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  材料名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="例如：Kraken X60 永磁無刷馬達"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    分類 *
                  </label>
                  <select
                    value={newMatCat}
                    onChange={(e) =>
                      setNewMatCat(e.target.value as MaterialCategory)
                    }
                    className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                  >
                    {MATERIAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    初始數量與單位 *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={newMatQty}
                      onChange={(e) => setNewMatQty(Number(e.target.value))}
                      className="w-2/3 p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900 font-mono"
                    />
                    <input
                      type="text"
                      value={newMatUnit}
                      onChange={(e) => setNewMatUnit(e.target.value)}
                      className="w-1/3 p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                      placeholder="顆/條"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  規格 / 型號說明
                </label>
                <input
                  type="text"
                  value={newMatSpec}
                  onChange={(e) => setNewMatSpec(e.target.value)}
                  placeholder="例如：6000 RPM, 整合 Talon FX"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  存放位置
                </label>
                <input
                  type="text"
                  value={newMatLocation}
                  onChange={(e) => setNewMatLocation(e.target.value)}
                  placeholder="例如：電控專用防潮櫃 A-01"
                  className="w-full p-2.5 border border-zinc-300 rounded-lg text-xs text-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
