import React, { useState } from 'react';
import { Student, Class, Invoice, BankConfig, Session, User } from '../../types';
import { MonthlyRevenueWidget } from './MonthlyRevenueWidget';
import { WeeklyTimetable } from '../common/WeeklyTimetable';
import { StorageEngine } from '../../lib/storage';
import { formatVND } from '../../lib/vietqr';
import {
  Users,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  QrCode,
  Share2,
  Lock,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Crown,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  students: Student[];
  classes: Class[];
  invoices: Invoice[];
  sessions: Session[];
  bankConfig: BankConfig;
  onUpdateStudents: () => void;
  onUpdateClasses: () => void;
  onUpdateInvoices: () => void;
  onOpenPublicLink: (hash: string) => void;
  onOpenAddSession: (classId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  students,
  classes,
  invoices,
  sessions,
  bankConfig,
  onUpdateStudents,
  onUpdateClasses,
  onUpdateInvoices,
  onOpenPublicLink,
  onOpenAddSession,
}) => {
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<'timetable' | 'revenue' | 'classes' | 'students' | 'invoices'>('timetable');

  // Form Modals State
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('Teacher Alex Smith');
  const [newSchedule, setNewSchedule] = useState('T2 - T4 - T6 (18:00 - 19:30)');
  const [newCourseName, setNewCourseName] = useState('IELTS Breakthrough');
  const [newZoomLink, setNewZoomLink] = useState('');
  const [classMaterialTitle, setClassMaterialTitle] = useState('');
  const [classMaterialUrl, setClassMaterialUrl] = useState('');

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentClassId, setNewStudentClassId] = useState(classes[0]?.id || '');
  const [newTuitionPrice, setNewTuitionPrice] = useState(2000000);
  const [newSessionCount, setNewSessionCount] = useState(8);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Chỉ có Super Admin (Người điều hành cao nhất) mới có quyền tạo lớp!');
      return;
    }

    if (!newClassName || !newClassCode) return;

    StorageEngine.addClass({
      className: newClassName,
      code: newClassCode,
      teacherId: 'u_teacher_01',
      teacherName: newTeacherName,
      schedule: newSchedule,
      room: 'Phòng Online / Zoom Premium',
      courseName: newCourseName,
      zoomLink: newZoomLink,
      resourceLinks: classMaterialTitle && classMaterialUrl ? [
        { id: `res_${Date.now()}`, title: classMaterialTitle, url: classMaterialUrl }
      ] : [],
    });

    alert('Đã tạo lớp học thành công!');
    setIsAddClassOpen(false);
    onUpdateClasses();
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Chỉ có Super Admin mới có quyền thêm học viên vào lớp!');
      return;
    }

    if (!newStudentName || !newStudentPhone) return;

    StorageEngine.addStudent({
      name: newStudentName,
      email: newStudentEmail || `${newStudentName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      phone: newStudentPhone,
      classIds: [newStudentClassId],
      remainingSessions: newSessionCount,
      totalPaidSessions: newSessionCount,
      tuitionPackagePrice: newTuitionPrice,
      packageSessionCount: newSessionCount,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    alert('Đã thêm học viên mới vào lớp thành công!');
    setIsAddStudentOpen(false);
    onUpdateStudents();
  };

  return (
    <div className="space-y-6">
      
      {/* Role Notice Banner */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between text-xs font-bold shadow-sm ${
        isSuperAdmin
          ? 'bg-amber-500 text-white border-amber-400'
          : 'bg-purple-600 text-white border-purple-500'
      }`}>
        <div className="flex items-center space-x-2">
          {isSuperAdmin ? <Crown className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          <span>
            {isSuperAdmin
              ? 'Bạn đang truy cập với quyền SUPER ADMIN (Người điều hành cao nhất): Toàn quyền quản lý lớp, gán GV, học phí & doanh thu tháng.'
              : 'Bạn đang truy cập với quyền QUẢN TRỊ VIÊN (Admin): Theo dõi lớp/học viên (không sửa), có quyền Thêm Buổi Học.'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
            activeTab === 'timetable'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50'
          }`}
        >
          Thời Khóa Biểu Tuần
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
              activeTab === 'revenue'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
            }`}
          >
            Doanh Thu Tháng
          </button>
        )}

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
            activeTab === 'classes'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50'
          }`}
        >
          Tất Cả Lớp Học ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
            activeTab === 'students'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50'
          }`}
        >
          Danh Sách Học Viên ({students.filter(s => s.status !== 'soft_deleted').length})
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 ${
              activeTab === 'invoices'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50'
            }`}
          >
            Hóa Đơn Học Phí
          </button>
        )}
      </div>

      {/* TAB 1: WEEKLY TIMETABLE */}
      {activeTab === 'timetable' && (
        <WeeklyTimetable
          classes={classes}
          students={students}
          sessions={sessions}
          onOpenAddSession={onOpenAddSession}
        />
      )}

      {/* TAB 2: MONTHLY REVENUE (Super Admin Only) */}
      {activeTab === 'revenue' && isSuperAdmin && (
        <MonthlyRevenueWidget />
      )}

      {/* TAB 3: CLASSES LIST */}
      {activeTab === 'classes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-purple-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-600" /> Quản Lý Lớp Học
            </h3>

            {isSuperAdmin && (
              <button
                onClick={() => setIsAddClassOpen(!isAddClassOpen)}
                className="px-4 py-2 rounded-2xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700 transition shadow-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Tạo Lớp Mới
              </button>
            )}
          </div>

          {/* Add Class Form (Super Admin Only) */}
          {isAddClassOpen && isSuperAdmin && (
            <form onSubmit={handleCreateClass} className="p-4 rounded-3xl bg-purple-50/80 border border-purple-200 space-y-3 animate-fadeIn text-xs">
              <h4 className="font-black text-purple-900 uppercase">Tạo Lớp Học Mới</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tên lớp (e.g. IELTS Intensive 6.5+)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Mã lớp (e.g. VY-IELTS-65)"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Tên giáo viên phụ trách"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Lịch học (e.g. T2 - T4 - T6 18:00 - 19:30)"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Giáo trình học"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                />
                <input
                  type="url"
                  placeholder="Link Zoom học trực tuyến"
                  value={newZoomLink}
                  onChange={(e) => setNewZoomLink(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <input
                  type="text"
                  placeholder="Tiêu đề tài liệu học tập (Nếu có)"
                  value={classMaterialTitle}
                  onChange={(e) => setClassMaterialTitle(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white"
                />
                <input
                  type="url"
                  placeholder="Đường link tài liệu lớp (Google Drive/PDF...)"
                  value={classMaterialUrl}
                  onChange={(e) => setClassMaterialUrl(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-extrabold shadow-md"
                >
                  Lưu & Tạo Lớp
                </button>
              </div>
            </form>
          )}

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="p-5 rounded-3xl border border-purple-100 bg-purple-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {cls.className}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                    {cls.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600"><strong>Giáo viên:</strong> {cls.teacherName}</p>
                <p className="text-xs text-slate-600"><strong>Lịch học:</strong> {cls.schedule}</p>
                <p className="text-xs text-slate-600"><strong>Giáo trình:</strong> {cls.courseName}</p>

                {cls.zoomLink && (
                  <a href={cls.zoomLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold underline block truncate">
                    🔗 Link Zoom: {cls.zoomLink}
                  </a>
                )}

                <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenAddSession(cls.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition flex items-center"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Thêm Buổi Học
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS LIST */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-purple-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" /> Quản Lý Danh Sách Học Viên
            </h3>

            {isSuperAdmin && (
              <button
                onClick={() => setIsAddStudentOpen(!isAddStudentOpen)}
                className="px-4 py-2 rounded-2xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700 transition shadow-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm Học Viên Vào Lớp
              </button>
            )}
          </div>

          {/* Add Student Form */}
          {isAddStudentOpen && isSuperAdmin && (
            <form onSubmit={handleCreateStudent} className="p-4 rounded-3xl bg-purple-50/80 border border-purple-200 space-y-3 animate-fadeIn text-xs">
              <h4 className="font-black text-purple-900 uppercase">Thêm Học Viên Mới</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tên học viên *"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Số điện thoại *"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                  required
                />
                <input
                  type="email"
                  placeholder="Email học viên"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-medium"
                />
                <select
                  value={newStudentClassId}
                  onChange={(e) => setNewStudentClassId(e.target.value)}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Giá gói học phí (e.g. 2000000)"
                  value={newTuitionPrice}
                  onChange={(e) => setNewTuitionPrice(Number(e.target.value))}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-mono"
                />
                <input
                  type="number"
                  placeholder="Số buổi của gói (e.g. 8)"
                  value={newSessionCount}
                  onChange={(e) => setNewSessionCount(Number(e.target.value))}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-extrabold shadow-md"
                >
                  Lưu & Tạo Học Viên
                </button>
              </div>
            </form>
          )}

          {/* Students List */}
          <div className="space-y-3">
            {students.filter(s => s.status !== 'soft_deleted').map((std) => (
              <div key={std.id} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img src={std.avatar} alt={std.name} className="w-12 h-12 rounded-2xl object-cover border border-purple-200" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{std.name}</h4>
                    <p className="text-xs text-slate-500">SĐT: {std.phone} • Gói: {formatVND(std.tuitionPackagePrice || 2000000)} / {std.packageSessionCount || 8} buổi</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenPublicLink(std.publicHash)}
                    className="px-3.5 py-1.5 rounded-xl bg-pink-100 text-pink-800 font-bold text-xs hover:bg-pink-200 transition flex items-center"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" /> Mở Link Xem Học Tập
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INVOICES (Super Admin Only) */}
      {activeTab === 'invoices' && isSuperAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-purple-800 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-emerald-600" /> Quản Lý Hóa Đơn Học Phí
          </h3>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{inv.code} • {inv.studentName}</h4>
                  <p className="text-xs text-slate-500 font-mono">Số tiền: {formatVND(inv.amount)} • {inv.sessionsPurchased} buổi</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {inv.status === 'paid' ? '✓ Đã Thanh Toán' : 'Chưa Thanh Toán'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
