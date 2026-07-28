export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  password?: string; // Mật khẩu đăng nhập
  avatarUrl?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  addedDate?: string;
}

export interface Student {
  id: string;
  publicHash: string; // NanoID cho đường dẫn riêng bảo mật của học viên
  name: string;
  email: string;
  phone: string;
  parentPhone?: string;
  classIds: string[];
  remainingSessions: number;
  totalPaidSessions: number;
  tuitionPackagePrice?: number; // Ví dụ: 2,000,000đ
  packageSessionCount?: number; // Ví dụ: 8 buổi
  status: 'active' | 'soft_deleted';
  stars: number;
  badges: string[]; // Danh sách Badge IDs
  avatar: string;
  notes?: string;
  honorNickname?: string; // Biệt danh vinh danh thi đua (e.g. 👑 Chiến Thần Chăm Học)
  completedSessionHomeworkIds?: string[]; // IDs các buổi học viên đã làm bài tập
  resourceLinks?: ResourceLink[]; // Link tài liệu học tập dành riêng
  createdAt: string;
}

export interface Class {
  id: string;
  className: string;
  code: string;
  teacherId: string;
  teacherName: string;
  schedule: string; // e.g. "T2 - T4 - T6 (18:00 - 19:30)"
  room: string;
  courseName: string; // Giáo trình học
  totalStudents: number;
  status: 'active' | 'completed' | 'paused';
  zoomLink?: string; // Link lớp học trực tuyến Zoom/Google Meet
  resourceLinks?: ResourceLink[]; // Link tài liệu học tập của lớp
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Session {
  id: string;
  classId: string;
  className: string;
  sessionNumber: number; // Số thứ tự buổi học (Buổi 1, Buổi 2...)
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName?: string;
  attendance: AttendanceRecord[];
  lessonContent: string; // Nội dung bài học
  strengths?: string; // Điểm mạnh của học viên/lớp
  improvements?: string; // Điểm cần cải thiện
  homeworkAssigned?: string; // Bài tập về nhà
  homeworkAttachmentLink?: string; // Link/ảnh bài tập đính kèm
  recordLink?: string; // Link record video buổi học
  sessionMaterials?: ResourceLink[]; // Link tài liệu đính kèm trong buổi học
  createdAt: string;
}

export interface HomeworkTask {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  title: string;
  content: string;
  attachmentLink?: string;
  deadline: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  isCompleted: boolean;
  content?: string;
  attachmentUrl?: string;
  submissionDate?: string;
  feedback?: string;
  ratingStars?: number;
  badgeAwarded?: string;
}

export interface Invoice {
  id: string;
  code: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  sessionsPurchased: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdDate: string;
  paidDate?: string;
  qrContent: string;
  bankId: string;
  accountNo: string;
  accountName: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface StarReward {
  id: string;
  title: string;
  starsRequired: number;
  description: string;
  icon: string;
  category: 'voucher' | 'gift' | 'privilege';
}

export interface BankConfig {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  centerLogoUrl?: string;
}

export interface MonthlyRevenueReport {
  monthYear: string; // "2025-07"
  totalRevenue: number;
  studentBreakdown: {
    studentId: string;
    studentName: string;
    sessionsTaughtInMonth: number;
    perSessionPrice: number;
    monthlyRevenue: number;
  }[];
}
