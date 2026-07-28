import React, { useState } from 'react';
import { Class, Student, AttendanceRecord, ResourceLink } from '../../types';
import { StorageEngine } from '../../lib/storage';
import { PlusCircle, Calendar, BookOpen, Video, Link2, CheckCircle2, UserCheck, X, FileText, Image, Sparkles } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  students: Student[];
  initialClassId?: string;
  onSessionAdded: () => void;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  initialClassId,
  onSessionAdded,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes[0]?.id || '')
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [improvements, setImprovements] = useState<string>('');
  const [homeworkAssigned, setHomeworkAssigned] = useState<string>('');
  const [homeworkAttachmentLink, setHomeworkAttachmentLink] = useState<string>('');
  const [recordLink, setRecordLink] = useState<string>('');
  
  // Dynamic Materials List
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [materialUrl, setMaterialUrl] = useState<string>('');
  const [materials, setMaterials] = useState<ResourceLink[]>([]);

  // Attendance map: studentId -> status ('present' | 'excused' | 'unexcused' | 'late')
  const classStudents = students.filter((s) => s.classIds.includes(selectedClassId));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'excused' | 'unexcused' | 'late'>>({});

  if (!isOpen) return null;

  const handleAddMaterial = () => {
    if (!materialTitle || !materialUrl) {
      alert('Vui lòng điền tiêu đề và đường link tài liệu!');
      return;
    }
    setMaterials([
      ...materials,
      {
        id: `mat_${Date.now()}`,
        title: materialTitle,
        url: materialUrl,
        addedDate: date,
      },
    ]);
    setMaterialTitle('');
    setMaterialUrl('');
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId || !lessonContent) {
      alert('Vui lòng chọn Lớp học và nhập Nội dung bài học!');
      return;
    }

    const currentClass = classes.find((c) => c.id === selectedClassId);

    // Build Attendance List
    const attendanceList: AttendanceRecord[] = classStudents.map((std) => ({
      studentId: std.id,
      studentName: std.name,
      status: attendanceMap[std.id] || 'present',
    }));

    StorageEngine.recordBulkSession({
      classId: selectedClassId,
      teacherId: currentClass?.teacherId || 'u_teacher_01',
      teacherName: currentClass?.teacherName || 'Giáo viên',
      date,
      lessonContent,
      strengths,
      improvements,
      homeworkAssigned,
      homeworkAttachmentLink,
      recordLink,
      sessionMaterials: materials,
      attendanceList,
    });

    alert('Đã cập nhật buổi học thành công!');
    onSessionAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-purple-100 dark:border-purple-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-3 border-b border-purple-100 dark:border-purple-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center font-black">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Cập Nhật Buổi Học Đã Dạy (Admin & Giáo Viên)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Nhập chi tiết nội dung, nhận xét điểm mạnh/cải thiện, bài tập & đính kèm link record
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-slate-700 dark:text-purple-200 uppercase mb-1">
                Chọn Lớp Học *
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 font-extrabold text-xs"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} ({cls.schedule})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 dark:text-purple-200 uppercase mb-1">
                Ngày Học *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 font-extrabold text-xs"
                required
              />
            </div>
          </div>

          {/* Lesson Content */}
          <div>
            <label className="block font-black text-slate-700 dark:text-purple-200 uppercase mb-1">
              Nội Dung Học Trong Buổi *
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Unit 2 Speaking Part 2 - Từ vựng chủ đề Travel, Thì quá khứ hoàn thành..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-purple-200 bg-white font-medium text-xs"
              required
            />
          </div>

          {/* Teacher Feedback Split: Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <label className="block font-black text-emerald-800 uppercase text-[11px]">
                💪 Nhận Xét: Điểm Mạnh Học Viên
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Phát âm chuẩn tự nhiên, làm bài nghe rất tốt..."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs font-medium"
              />
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
              <label className="block font-black text-amber-800 uppercase text-[11px]">
                🎯 Nhận Xét: Điểm Cần Cải Thiện
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Cần chú ý nhấn trọng âm từ 3 âm tiết, căn giờ làm bài 40 phút..."
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                className="w-full p-2 rounded-xl border border-amber-200 bg-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Homework & Attachment Link */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <label className="block font-black text-indigo-900 uppercase text-[11px]">
              📝 Bài Tập Về Nhà Cần Làm
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Vẽ sơ đồ tư duy và ghi âm 2 phút phát biểu Speaking Part 2..."
              value={homeworkAssigned}
              onChange={(e) => setHomeworkAssigned(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs font-medium"
            />

            <div>
              <label className="block font-bold text-indigo-800 text-[10px] uppercase mb-1">
                Link/Ảnh Đính Kèm Bài Tập Về Nhà (Nếu có):
              </label>
              <input
                type="url"
                placeholder="Dán link Drive/File ảnh đề bài tập (e.g. https://drive.google.com/file/...)"
                value={homeworkAttachmentLink}
                onChange={(e) => setHomeworkAttachmentLink(e.target.value)}
                className="w-full p-2 rounded-xl border border-indigo-200 bg-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Record Link */}
          <div>
            <label className="block font-black text-slate-700 dark:text-purple-200 uppercase mb-1">
              🎬 Link Record Video Buổi Học (Zoom / Drive / Youtube)
            </label>
            <input
              type="url"
              placeholder="https://zoom.us/rec/play/... hoặc link Google Drive video"
              value={recordLink}
              onChange={(e) => setRecordLink(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs font-mono"
            />
          </div>

          {/* Dynamic Session Materials */}
          <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
            <label className="block font-black text-purple-900 uppercase text-[11px]">
              📚 Tài Liệu Đính Kèm Trong Buổi Học
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tiêu đề tài liệu (e.g. Slide Bài Giảng Unit 2 PDF)"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="p-2 rounded-xl border border-purple-200 bg-white text-xs"
              />
              <input
                type="url"
                placeholder="Đường link tài liệu (https://...)"
                value={materialUrl}
                onChange={(e) => setMaterialUrl(e.target.value)}
                className="p-2 rounded-xl border border-purple-200 bg-white text-xs font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleAddMaterial}
              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition"
            >
              + Gắn Link Tài Liệu Vào Buổi Học
            </button>

            {materials.length > 0 && (
              <div className="space-y-1 pt-1">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-200 text-xs">
                    <span className="font-bold text-purple-900 truncate">{m.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(m.id)}
                      className="text-rose-500 font-bold ml-2 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance Checklist */}
          <div>
            <label className="block font-black text-slate-700 dark:text-purple-200 uppercase mb-2">
              Điểm Danh Học Viên Có Mặt Trong Buổi:
            </label>
            <div className="space-y-2">
              {classStudents.map((std) => {
                const currentAtt = attendanceMap[std.id] || 'present';

                return (
                  <div
                    key={std.id}
                    className="p-3 rounded-2xl border border-purple-100 bg-purple-50/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <img src={std.avatar} alt={std.name} className="w-8 h-8 rounded-xl object-cover" />
                      <span className="font-extrabold text-xs text-slate-800">{std.name}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setAttendanceMap({ ...attendanceMap, [std.id]: 'present' })}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                          currentAtt === 'present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        ✓ Có mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceMap({ ...attendanceMap, [std.id]: 'excused' })}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                          currentAtt === 'excused'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Vắng có phép
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs hover:from-purple-700 hover:to-pink-700 shadow-md"
            >
              Lưu Buổi Học Này
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
