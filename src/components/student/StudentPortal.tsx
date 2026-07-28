import React, { useState } from 'react';
import {
  Student,
  Session,
  Class,
  HomeworkTask,
  HomeworkSubmission,
  Invoice,
  BankConfig,
  ResourceLink,
} from '../../types';
import {
  GraduationCap,
  Clock,
  BookOpen,
  User,
  Calendar,
  CheckCircle2,
  Video,
  FileText,
  ExternalLink,
  Flame,
  Sparkles,
  QrCode,
  Award,
  Download,
  Check,
} from 'lucide-react';
import { StorageEngine } from '../../lib/storage';
import confetti from 'canvas-confetti';

interface StudentPortalProps {
  currentStudent: Student;
  classes: Class[];
  sessions: Session[];
  homeworkTasks: HomeworkTask[];
  homeworkSubmissions: HomeworkSubmission[];
  invoices: Invoice[];
  bankConfig: BankConfig;
  onRefreshData: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  classes,
  sessions,
  homeworkTasks,
  homeworkSubmissions,
  invoices,
  bankConfig,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'materials'>('sessions');

  // Filter student's class & sessions
  const studentClass = classes.find((c) => currentStudent.classIds.includes(c.id)) || classes[0];
  
  const studentSessions = sessions
    .filter((s) => s.attendance.some((att) => att.studentId === currentStudent.id))
    .sort((a, b) => a.sessionNumber - b.sessionNumber);

  // Compute Overall Progress Bar %
  const totalSessionsCount = Math.max(1, studentSessions.length);
  const completedHomeworkCount = currentStudent.completedSessionHomeworkIds
    ? currentStudent.completedSessionHomeworkIds.length
    : 0;
  
  const overallProgressPercent = Math.min(
    100,
    Math.round((completedHomeworkCount / totalSessionsCount) * 100)
  );

  // Toggle Homework Checkbox per session
  const handleToggleHomeworkCheck = (sessionId: string) => {
    const isNowChecked = StorageEngine.toggleStudentHomeworkCheck(currentStudent.id, sessionId);
    
    if (isNowChecked) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    onRefreshData();
  };

  // Collect all session materials + class resources into one Hub
  const allMaterials: ResourceLink[] = [];
  
  if (studentClass?.resourceLinks) {
    allMaterials.push(...studentClass.resourceLinks);
  }

  studentSessions.forEach((ses) => {
    if (ses.sessionMaterials) {
      allMaterials.push(...ses.sessionMaterials);
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. BẢNG THÔNG TIN CHUNG CỦA HỌC VIÊN & LOGO */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-400 to-indigo-500 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
        
        {/* Background Decorative Blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Logo & Student Info */}
          <div className="flex items-center space-x-4 text-center sm:text-left">
            <img
              src="/logo.jpg"
              alt="Ms. Vy English Logo"
              className="w-20 h-20 rounded-3xl object-cover border-4 border-white/60 shadow-lg shrink-0"
            />

            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h2 className="text-2xl font-black">{currentStudent.name}</h2>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-wider backdrop-blur-sm">
                  Cổng Học Viên Online
                </span>
              </div>

              <p className="text-xs text-purple-100 mt-1 font-medium">
                {currentStudent.honorNickname || '👑 Học Viên MS. VY ENGLISH'}
              </p>
            </div>
          </div>

          {/* Student Info Card Details */}
          <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-xs font-medium space-y-1.5 w-full sm:w-auto shrink-0">
            <p className="flex items-center text-purple-100">
              <User className="w-4 h-4 mr-2 text-pink-200 shrink-0" />
              Tên Giáo Viên: <strong className="text-white ml-1">{studentClass?.teacherName || 'Teacher Alex Smith'}</strong>
            </p>

            <p className="flex items-center text-purple-100">
              <BookOpen className="w-4 h-4 mr-2 text-pink-200 shrink-0" />
              Giáo Trình: <strong className="text-white ml-1">{studentClass?.courseName || 'IELTS Breakthrough'}</strong>
            </p>

            <p className="flex items-center text-purple-100">
              <Clock className="w-4 h-4 mr-2 text-pink-200 shrink-0" />
              Lịch Học: <strong className="text-white ml-1">{studentClass?.schedule || 'T2 - T4 - T6'}</strong>
            </p>

            <p className="flex items-center text-amber-200 font-bold">
              <Flame className="w-4 h-4 mr-2 text-amber-300 shrink-0 animate-bounce" />
              Số Buổi Học Phí Còn Lại: <strong className="text-white ml-1 text-sm font-black">{currentStudent.remainingSessions} / {currentStudent.totalPaidSessions} buổi</strong>
            </p>
          </div>

        </div>

        {/* 2. THANH TỔNG TIẾN ĐỘ ĐÃ HOÀN THÀNH */}
        <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="flex items-center text-purple-100">
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
              THANH TỔNG TIẾN ĐỘ HOÀN THÀNH BÀI TẬP VỀ NHÀ:
            </span>
            <span className="text-amber-300 text-sm">{overallProgressPercent}% Hoàn Thành ({completedHomeworkCount}/{totalSessionsCount} buổi)</span>
          </div>

          <div className="w-full bg-black/30 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-emerald-300 transition-all duration-500 shadow-sm"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-sm">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'sessions'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-purple-300 hover:bg-purple-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>DANH SÁCH TỪNG BUỔI HỌC ({studentSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'materials'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-purple-300 hover:bg-purple-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>TỔNG HỢP TÀI LIỆU HỌC TẬP ({allMaterials.length})</span>
        </button>
      </div>

      {/* 3. DANH SÁCH THEO TỪNG BUỔI HỌC */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {studentSessions.map((ses) => {
            const isDone = currentStudent.completedSessionHomeworkIds
              ? currentStudent.completedSessionHomeworkIds.includes(ses.id)
              : false;

            return (
              <div
                key={ses.id}
                className={`p-6 rounded-3xl border transition-all duration-300 space-y-4 ${
                  isDone
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Header Buổi Học */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-800/60 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-3.5 py-1.5 rounded-2xl bg-purple-600 text-white text-xs font-black shadow-sm">
                      BUỔI {ses.sessionNumber}
                    </span>
                    <span className="font-extrabold text-xs text-purple-700 dark:text-purple-300">
                      📅 Ngày học: {ses.date}
                    </span>
                  </div>

                  {/* CHECKBOX HOÀN THÀNH BÀI TẬP */}
                  <button
                    onClick={() => handleToggleHomeworkCheck(ses.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center shadow-sm ${
                      isDone
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-800 border border-slate-200'
                    }`}
                  >
                    <Check className={`w-4 h-4 mr-1.5 ${isDone ? 'stroke-[3]' : ''}`} />
                    {isDone ? '✓ Đã Hoàn Thành Bài Tập' : '☐ Đánh Dấu Đã Làm Bài'}
                  </button>
                </div>

                {/* Nội Dung Bài Học */}
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5 text-purple-600" /> Nội Dung Bài Học:
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 font-medium bg-purple-50/60 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100/80">
                    {ses.lessonContent}
                  </p>
                </div>

                {/* Nhận Xét Của Giáo Viên: Điểm Mạnh & Điểm Cần Cải Thiện */}
                {(ses.strengths || ses.improvements) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ses.strengths && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                        <span className="font-black flex items-center text-emerald-700 dark:text-emerald-300 uppercase text-[11px]">
                          💪 Điểm Mạnh Trong Buổi:
                        </span>
                        <p className="font-medium">{ses.strengths}</p>
                      </div>
                    )}

                    {ses.improvements && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <span className="font-black flex items-center text-amber-700 dark:text-amber-300 uppercase text-[11px]">
                          🎯 Điểm Cần Cải Thiện:
                        </span>
                        <p className="font-medium">{ses.improvements}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bài Tập Về Nhà Cần Làm & Link Đính Kèm */}
                {ses.homeworkAssigned && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 space-y-2 text-xs">
                    <span className="font-black text-indigo-900 dark:text-indigo-200 flex items-center uppercase text-[11px]">
                      📝 Bài Tập Về Nhà Cần Làm:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {ses.homeworkAssigned}
                    </p>

                    {ses.homeworkAttachmentLink && (
                      <a
                        href={ses.homeworkAttachmentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Xem Đề Bài / File Đính Kèm
                      </a>
                    )}
                  </div>
                )}

                {/* Link Record Buổi Học */}
                {ses.recordLink && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200">
                    <span className="text-xs font-bold text-pink-900 dark:text-pink-200 flex items-center">
                      <Video className="w-4 h-4 mr-1.5 text-pink-600" /> Link Record Xem Lại Buổi Học:
                    </span>
                    <a
                      href={ses.recordLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-pink-600 text-white font-extrabold text-xs hover:bg-pink-700 transition shadow-sm"
                    >
                      Bật Video Record ▶
                    </a>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* 4. TỔNG HỢP TÀI LIỆU HỌC TẬP */}
      {activeTab === 'materials' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-100 dark:border-purple-800 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" /> Kho Tổng Hợp Tài Liệu Học Tập
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Tất cả các đường link tài liệu do giáo viên cập nhật từ các buổi học và giáo trình lớp
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allMaterials.map((mat) => (
              <a
                key={mat.id}
                href={mat.url}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl border border-purple-100 dark:border-purple-800 bg-purple-50/50 hover:bg-purple-100 transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-black text-xs text-purple-900 dark:text-purple-200 group-hover:text-purple-600 transition">
                    {mat.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {mat.url}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
