import React, { useState } from 'react';
import {
  Package,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Bot,
} from 'lucide-react';
import { Equipment, MaterialItem, MaterialCategory } from '../../types';

interface MemberMaterialsProps {
  equipment: Equipment[];
  materials: MaterialItem[];
}

export const MemberMaterials: React.FC<MemberMaterialsProps> = ({
  equipment,
  materials,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'equipment'>('materials');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories: MaterialCategory[] = [
    '馬達',
    '齒輪',
    '皮帶',
    '感測器',
    '氣壓件',
    '五金螺絲',
    '控制器與電控',
    '其他',
  ];

  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.specification.toLowerCase().includes(q) ||
        m.storageLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredEquipment = equipment.filter((eq) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        eq.name.toLowerCase().includes(q) ||
        eq.id.toLowerCase().includes(q) ||
        (eq.borrowedBy && eq.borrowedBy.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 tracking-wider uppercase mb-1">
            <Package className="w-4 h-4" />
            <span>Team Inventory & Materials</span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">
            機具設備與材料耗材清單
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            提供全隊隊員即時查閱各項馬達、齒輪、皮帶等材料耗材庫存與存放位置，方便機構與電控實作備料。
          </p>
        </div>

        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'materials'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-orange-400" />
            <span>材料耗材庫存 ({materials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'equipment'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-orange-400" />
            <span>機具設備狀態 ({equipment.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋名稱、規格型號、存放櫃位..."
            className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
          />
        </div>

        {activeTab === 'materials' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-700">分類：</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 focus:outline-none"
            >
              <option value="all">全部分類</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content View */}
      {activeTab === 'materials' ? (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">分類</th>
                  <th className="py-3 px-4">材料名稱</th>
                  <th className="py-3 px-4">規格 / 型號說明</th>
                  <th className="py-3 px-4">存放位置</th>
                  <th className="py-3 px-4 text-right">目前庫存</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-700">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-md">
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900 text-sm">
                      {mat.name}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-mono text-[11px]">
                      {mat.specification}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-medium">
                      {mat.storageLocation}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                        {mat.quantity} {mat.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((eq) => {
            const isBorrowed = eq.status === 'borrowed';

            return (
              <div
                key={eq.id}
                className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
                  isBorrowed
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-zinc-200'
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
                        已被借出
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        可借用
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900">{eq.name}</h4>
                  <p className="text-[11px] text-zinc-500">類別：{eq.category}</p>

                  {isBorrowed && (
                    <div className="p-2 bg-amber-50 rounded-lg text-xs text-amber-900">
                      <div className="font-semibold">借用人：{eq.borrowedBy}</div>
                      {eq.borrowedAt && (
                        <div className="text-[11px] text-zinc-500">
                          時間：{eq.borrowedAt}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
