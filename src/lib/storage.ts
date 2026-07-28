import {
  Student,
  Class,
  Session,
  HomeworkTask,
  HomeworkSubmission,
  Invoice,
  User,
  BankConfig,
  AttendanceRecord,
  ResourceLink,
  MonthlyRevenueReport,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SESSIONS,
  INITIAL_HOMEWORK_TASKS,
  INITIAL_HOMEWORK_SUBMISSIONS,
  INITIAL_INVOICES,
  INITIAL_USERS,
  INITIAL_BANK_CONFIG,
} from '../data/mockData';
import { generatePublicHash } from './obfuscate';

const STORAGE_KEYS = {
  STUDENTS: 'vy_students_v2',
  CLASSES: 'vy_classes_v2',
  SESSIONS: 'vy_sessions_v2',
  HOMEWORK_TASKS: 'vy_hw_tasks_v2',
  HOMEWORK_SUBMISSIONS: 'vy_hw_submissions_v2',
  INVOICES: 'vy_invoices_v2',
  USERS: 'vy_users_v2',
  BANK_CONFIG: 'vy_bank_config_v2',
  CURRENT_USER: 'vy_current_user_v2',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
  }
  return defaultValue;
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageEngine = {
  // Current Logged-in User Session
  getCurrentUser(): User | null {
    return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default Super Admin
  },
  setCurrentUser(user: User | null) {
    if (user) setItem(STORAGE_KEYS.CURRENT_USER, user);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Users & Auth Management
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: User[]) {
    setItem(STORAGE_KEYS.USERS, users);
  },
  authenticateUser(emailOrUsername: string, passwordInput: string): User | null {
    const users = this.getUsers();
    const cleanInput = emailOrUsername.trim().toLowerCase();
    return users.find((u) => {
      const matchEmail = u.email.toLowerCase() === cleanInput;
      const matchUsername = u.email.split('@')[0].toLowerCase() === cleanInput;
      const matchPassword = (u.password || 'admin123') === passwordInput;
      return (matchEmail || matchUsername) && matchPassword;
    }) || null;
  },
  addUser(userData: Omit<User, 'uid' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      uid: `u_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },
  updateUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx !== -1) {
      users[idx] = user;
      this.saveUsers(users);
    }
  },
  deleteUser(uid: string) {
    const users = this.getUsers();
    const updated = users.filter((u) => u.uid !== uid);
    this.saveUsers(updated);
  },

  // Data Fetching
  getStudents(): Student[] {
    return getItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudents(students: Student[]) {
    setItem(STORAGE_KEYS.STUDENTS, students);
  },

  getClasses(): Class[] {
    return getItem<Class[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  },
  saveClasses(classes: Class[]) {
    setItem(STORAGE_KEYS.CLASSES, classes);
  },

  getSessions(): Session[] {
    return getItem<Session[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  },
  saveSessions(sessions: Session[]) {
    setItem(STORAGE_KEYS.SESSIONS, sessions);
  },

  getHomeworkTasks(): HomeworkTask[] {
    return getItem<HomeworkTask[]>(STORAGE_KEYS.HOMEWORK_TASKS, INITIAL_HOMEWORK_TASKS);
  },
  saveHomeworkTasks(tasks: HomeworkTask[]) {
    setItem(STORAGE_KEYS.HOMEWORK_TASKS, tasks);
  },

  getHomeworkSubmissions(): HomeworkSubmission[] {
    return getItem<HomeworkSubmission[]>(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, INITIAL_HOMEWORK_SUBMISSIONS);
  },
  saveHomeworkSubmissions(subs: HomeworkSubmission[]) {
    setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, subs);
  },

  getInvoices(): Invoice[] {
    return getItem<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  },
  saveInvoices(invoices: Invoice[]) {
    setItem(STORAGE_KEYS.INVOICES, invoices);
  },

  getBankConfig(): BankConfig {
    return getItem<BankConfig>(STORAGE_KEYS.BANK_CONFIG, INITIAL_BANK_CONFIG);
  },
  saveBankConfig(config: BankConfig) {
    setItem(STORAGE_KEYS.BANK_CONFIG, config);
  },

  // Database Reset
  resetDatabase() {
    localStorage.clear();
    setItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    setItem(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    setItem(STORAGE_KEYS.HOMEWORK_TASKS, INITIAL_HOMEWORK_TASKS);
    setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, INITIAL_HOMEWORK_SUBMISSIONS);
    setItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.BANK_CONFIG, INITIAL_BANK_CONFIG);
    setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  // Student Operations
  addStudent(studentData: Omit<Student, 'id' | 'publicHash' | 'createdAt' | 'status' | 'stars' | 'badges'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}`,
      publicHash: generatePublicHash(studentData.name),
      status: 'active',
      stars: 10,
      badges: ['b_super_star'],
      completedSessionHomeworkIds: [],
      resourceLinks: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  },

  updateStudent(student: Student) {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx !== -1) {
      students[idx] = student;
      this.saveStudents(students);
    }
  },

  softDeleteStudent(studentId: string) {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === studentId);
    if (idx !== -1) {
      students[idx].status = 'soft_deleted';
      this.saveStudents(students);
    }
  },

  // Student Homework Check Toggle
  toggleStudentHomeworkCheck(studentId: string, sessionId: string): boolean {
    const students = this.getStudents();
    const std = students.find((s) => s.id === studentId);
    let isCheckedNow = false;

    if (std) {
      if (!std.completedSessionHomeworkIds) {
        std.completedSessionHomeworkIds = [];
      }
      const existingIdx = std.completedSessionHomeworkIds.indexOf(sessionId);
      if (existingIdx !== -1) {
        std.completedSessionHomeworkIds.splice(existingIdx, 1);
        isCheckedNow = false;
      } else {
        std.completedSessionHomeworkIds.push(sessionId);
        std.stars = (std.stars || 0) + 2; // +2 stars bonus
        isCheckedNow = true;
      }
      this.saveStudents(students);
    }
    return isCheckedNow;
  },

  // Class Operations
  addClass(classData: Omit<Class, 'id' | 'totalStudents' | 'status'>): Class {
    const classes = this.getClasses();
    const newClass: Class = {
      ...classData,
      id: `cls_${Date.now()}`,
      totalStudents: 0,
      status: 'active',
      resourceLinks: classData.resourceLinks || [],
    };
    classes.push(newClass);
    this.saveClasses(classes);
    return newClass;
  },

  updateClass(cls: Class) {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === cls.id);
    if (idx !== -1) {
      classes[idx] = cls;
      this.saveClasses(classes);
    }
  },

  // Session & Attendance Operations
  recordBulkSession(sessionData: {
    classId: string;
    teacherId: string;
    teacherName?: string;
    date: string;
    lessonContent: string;
    strengths?: string;
    improvements?: string;
    homeworkAssigned?: string;
    homeworkAttachmentLink?: string;
    recordLink?: string;
    sessionMaterials?: ResourceLink[];
    attendanceList: AttendanceRecord[];
  }): Session {
    const sessions = this.getSessions();
    const classes = this.getClasses();
    const targetClass = classes.find((c) => c.id === sessionData.classId);

    // Calculate session number for this class
    const existingClassSessions = sessions.filter((s) => s.classId === sessionData.classId);
    const sessionNumber = existingClassSessions.length + 1;

    const newSession: Session = {
      id: `ses_${Date.now()}`,
      classId: sessionData.classId,
      className: targetClass?.className || 'Lớp Học',
      sessionNumber,
      date: sessionData.date,
      teacherId: sessionData.teacherId,
      teacherName: sessionData.teacherName || targetClass?.teacherName,
      attendance: sessionData.attendanceList,
      lessonContent: sessionData.lessonContent,
      strengths: sessionData.strengths,
      improvements: sessionData.improvements,
      homeworkAssigned: sessionData.homeworkAssigned,
      homeworkAttachmentLink: sessionData.homeworkAttachmentLink,
      recordLink: sessionData.recordLink,
      sessionMaterials: sessionData.sessionMaterials || [],
      createdAt: new Date().toISOString(),
    };

    sessions.unshift(newSession);
    this.saveSessions(sessions);

    // Deduct 1 session for present / late students & add +2 stars
    const students = this.getStudents();
    let updated = false;

    sessionData.attendanceList.forEach((att) => {
      if (att.status === 'present' || att.status === 'late') {
        const std = students.find((s) => s.id === att.studentId);
        if (std && std.remainingSessions > 0) {
          std.remainingSessions -= 1;
          std.stars += 2;
          updated = true;
        }
      }
    });

    if (updated) {
      this.saveStudents(students);
    }

    return newSession;
  },

  // Monthly Revenue Calculation (Super Admin Feature)
  calculateMonthlyRevenue(yearMonth: string): MonthlyRevenueReport {
    // yearMonth format: "YYYY-MM" e.g. "2025-07"
    const sessions = this.getSessions();
    const students = this.getStudents();

    // Filter sessions in the selected month
    const monthSessions = sessions.filter((s) => s.date.startsWith(yearMonth));

    let totalRevenue = 0;
    const studentBreakdown: {
      studentId: string;
      studentName: string;
      sessionsTaughtInMonth: number;
      perSessionPrice: number;
      monthlyRevenue: number;
    }[] = [];

    students.forEach((std) => {
      if (std.status === 'soft_deleted') return;

      const pkgPrice = std.tuitionPackagePrice || 2000000;
      const pkgCount = std.packageSessionCount || 8;
      const perSessionPrice = Math.round(pkgPrice / pkgCount);

      // Count how many sessions this student attended in this month
      let countInMonth = 0;
      monthSessions.forEach((ses) => {
        const att = ses.attendance.find((a) => a.studentId === std.id);
        if (att && (att.status === 'present' || att.status === 'late')) {
          countInMonth += 1;
        }
      });

      const monthlyRevenue = countInMonth * perSessionPrice;
      totalRevenue += monthlyRevenue;

      studentBreakdown.push({
        studentId: std.id,
        studentName: std.name,
        sessionsTaughtInMonth: countInMonth,
        perSessionPrice,
        monthlyRevenue,
      });
    });

    return {
      monthYear: yearMonth,
      totalRevenue,
      studentBreakdown,
    };
  },
};
