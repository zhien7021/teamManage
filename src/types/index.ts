export type Role = 'admin' | 'member' | 'parent';

export type Department = '機電整合組' | '程式控制組' | '行銷管理組';

export type EventType =
  | '機電整合組培訓'
  | '程式控制組培訓'
  | '行銷管理組培訓'
  | '多元競賽'
  | '教育推廣'
  | '團隊經營'
  | '國際交流';

export interface Member {
  id: string;
  name: string;
  email: string;
  departments: Department[];
  motto?: string;
  phone?: string;
  avatar?: string; // Base64 Data URL or image path
  role?: 'admin' | 'member';
  password?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface TeamEvent {
  id: number | string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  departments: Department[];
  description?: string;
  location?: string;
}

export interface LearningTask {
  id: number | string;
  studentId: string;
  studentName: string;
  taskName: string;
  department: Department;
  status: 'pending' | 'completed';
  verifiedAt?: string;
  verifiedBy?: string;
  badgeIcon?: string;
}

export interface TeamPendingTask {
  id: string | number;
  title: string;
  department: Department;
  description?: string;
  status: 'todo' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'borrowed';
  borrowedBy?: string;
  borrowedAt?: string;
  notes?: string;
}

export type MachineType = 'CNC銑床' | '傳統銑床' | '傳統車床';

export interface MachineReservation {
  id: string;
  machine: MachineType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00-10:00"
  studentId: string;
  studentName: string;
  purpose: string;
  createdAt: string;
}

export type EduEquipmentCategory = string;

export interface EduEquipmentCategoryItem {
  id: string;
  name: string;
  icon: string;
  prefix: string;
}

export interface EduEquipmentItem {
  id: string; // e.g. "MINI-01"
  number: string; // e.g. "01"
  category: EduEquipmentCategory;
  name: string;
  status: 'available' | 'borrowed';
  borrowedBy?: string;
  borrowedAt?: string;
  notes?: string;
}

export type MaterialCategory =
  | '馬達'
  | '齒輪'
  | '皮帶'
  | '感測器'
  | '氣壓件'
  | '五金螺絲'
  | '控制器與電控'
  | '其他';

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  specification: string;
  storageLocation: string;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: 'attendance' | 'leave';
  date: string; // YYYY-MM-DD
  slots: TimeSlot[]; // morning: 09-12, afternoon: 13-17, evening: 18-21
  reason?: string;
  submittedAt: string;
}
