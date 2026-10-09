'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  TaskItem,
  AttendanceRecord,
  LeaveRequest,
  Announcement,
  NotificationItem,
} from '../lib/types';
import {
  initialEmployees,
  managerProfile,
  initialTasks,
  initialAttendanceRecords,
  initialLeaveRequests,
  initialAnnouncements,
} from '../lib/mockData';
import { supabase } from '../lib/supabase';
import { sendEmailJSCredentials } from '../lib/emailjs';

interface EMSContextType {
  // Auth & Role
  currentRole: UserRole;
  currentUser: UserProfile;
  isLoggedIn: boolean;
  authView: 'login' | 'activate' | 'first-login' | 'app';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setAuthView: (view: 'login' | 'activate' | 'first-login' | 'app') => void;
  switchRole: (role: UserRole) => void;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
  activateAccount: (employeeId: string, email: string) => Promise<{ success: boolean; message?: string; tempPassword?: string }>;
  updateFirstLoginCredentials: (username: string, defaultPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;

  // Clock in / out
  todayAttendance: AttendanceRecord | null;
  toggleClockInOut: () => void;

  // Tasks
  tasks: TaskItem[];
  createTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];

  // Leave Requests
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'dateFiled' | 'status' | 'employeeId' | 'employeeName' | 'employeePosition' | 'employeeEmail'>) => LeaveRequest;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string, reason: string) => void;

  // Announcements
  announcements: Announcement[];
  postAnnouncement: (data: Omit<Announcement, 'id' | 'datePosted' | 'postedBy' | 'department' | 'isBookmarkedBy' | 'readBy'>) => Announcement;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  toggleBookmarkAnnouncement: (id: string) => void;
  markAnnouncementRead: (id: string) => void;

  // Employees Directory
  employees: UserProfile[];

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const EMSContext = createContext<EMSContextType | undefined>(undefined);

export function EMSProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [employees, setEmployees] = useState<UserProfile[]>(initialEmployees);
  const [manager, setManager] = useState<UserProfile>(managerProfile);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'activate' | 'first-login' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Welcome to Veloce EMS',
      message: 'Explore your daily dashboard, assigned tasks, and company announcements.',
      timestamp: 'Just now',
      read: false,
      type: 'system',
      targetTab: 'dashboard',
    }
  ]);

  // Sync users with Supabase on mount
  useEffect(() => {
    async function loadSupabaseUsers() {
      try {
        const { data, error } = await supabase.from('employees').select('*');
        if (data && data.length > 0 && !error) {
          console.log('[Supabase] Successfully synced users:', data);
          setEmployees(prev => {
            const updated = [...prev];
            data.forEach((row: any) => {
              const rowEmail = (row.email || '').toLowerCase();
              const rowNum = (row.employee_number || '').toUpperCase();
              if (row.role === 'employee' || rowNum.startsWith('EMP-104') || rowNum.startsWith('26-')) {
                const idx = updated.findIndex(e => e.employeeNumber.toUpperCase() === rowNum || e.email.toLowerCase() === rowEmail);
                if (idx !== -1) {
                  updated[idx] = {
                    ...updated[idx],
                    name: row.name || updated[idx].name,
                    email: row.email || updated[idx].email,
                    username: row.username || updated[idx].username,
                    position: row.position || updated[idx].position,
                    department: row.department || updated[idx].department,
                    isActivated: row.is_activated ?? updated[idx].isActivated,
                    defaultPasswordChanged: row.default_password_changed ?? updated[idx].defaultPasswordChanged,
                  };
                }
              } else if (row.role === 'manager' || rowNum.startsWith('MGR') || rowNum === 'EMP-1001') {
                setManager(m => ({
                  ...m,
                  name: row.name || m.name,
                  email: row.email || m.email,
                  username: row.username || m.username,
                  position: row.position || m.position,
                  department: row.department || m.department,
                  isActivated: row.is_activated ?? m.isActivated,
                  defaultPasswordChanged: row.default_password_changed ?? m.defaultPasswordChanged,
                }));
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn('[Supabase] Non-fatal load check:', err);
      }
    }

    loadSupabaseUsers();
  }, []);

  const currentUser = currentRole === 'employee' ? employees[0] : manager;

  // Today's attendance for current employee
  const todayStr = '2026-10-06';
  const todayAttendance = attendanceRecords.find(
    (a) => a.employeeId === currentUser.id && a.date === todayStr
  ) || null;

  const addNotification = (title: string, message: string, type: 'task' | 'leave' | 'announcement' | 'system', targetTab?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
      targetTab,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    setActiveTab('dashboard');
  };

  const login = async (usernameOrEmail: string, password: string) => {
    const trimmed = usernameOrEmail.trim().toLowerCase();
    if (!trimmed || !password) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    // 1. Primary check: query Supabase directly so password updates are immediately recognized
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`username.ilike.${trimmed},email.ilike.${trimmed},employee_number.ilike.${trimmed}`)
        .limit(1);

      if (data && data.length > 0 && !error) {
        const dbUser = data[0];
        const dbPassMatches =
          dbUser.default_password === password ||
          dbUser.password_hash === password ||
          (dbUser.role === 'manager'
            ? password === 'manager123' || password === 'ManagerDefault#2026'
            : password === 'password123' || password === 'VeloceDefault#2026' || password === 'Pass123!');

        const localSavedPass =
          typeof window !== 'undefined'
            ? localStorage.getItem(`veloce_pass_${trimmed}`) ||
              localStorage.getItem(`veloce_pass_${(dbUser.email || '').toLowerCase()}`) ||
              localStorage.getItem('veloce_user_password')
            : null;

        const matchesLocal = localSavedPass === password;

        if (dbPassMatches || matchesLocal) {
          if (dbUser.role === 'manager') {
            setCurrentRole('manager');
            setManager(m => ({
              ...m,
              name: dbUser.name || m.name,
              email: dbUser.email || m.email,
              username: dbUser.username || m.username,
              position: dbUser.position || m.position,
              defaultPasswordChanged: dbUser.default_password_changed,
            }));
          } else {
            setCurrentRole('employee');
            setEmployees(prev =>
              prev.map((e, idx) =>
                idx === 0
                  ? {
                      ...e,
                      name: dbUser.name || e.name,
                      email: dbUser.email || e.email,
                      username: dbUser.username || e.username,
                      position: dbUser.position || e.position,
                      defaultPasswordChanged: dbUser.default_password_changed,
                    }
                  : e
              )
            );
          }
          setIsLoggedIn(true);
          setAuthView('app');
          setActiveTab('dashboard');
          return { success: true };
        } else {
          return { success: false, message: 'Incorrect password entered.' };
        }
      }
    } catch (e) {
      console.warn('[Login] Supabase query notice:', e);
    }

    // 2. Department Manager Side fallback (Marcus Rivera - j7core256@gmail.com / mrivera)
    const isManagerUser =
      trimmed === 'mrivera' ||
      trimmed === 'j7core256@gmail.com' ||
      trimmed === 'mrivera_mgr' ||
      trimmed === 'mgr-2001' ||
      trimmed === 'emp-1001' ||
      trimmed === manager.email.toLowerCase() ||
      trimmed === manager.username.toLowerCase();

    if (isManagerUser) {
      const localSaved =
        typeof window !== 'undefined'
          ? localStorage.getItem(`veloce_pass_${trimmed}`) ||
            localStorage.getItem('veloce_pass_j7core256@gmail.com')
          : null;

      if (
        password === 'manager123' ||
        password === 'ManagerDefault#2026' ||
        password === 'password123' ||
        password === 'Pass123!' ||
        localSaved === password
      ) {
        setCurrentRole('manager');
        setIsLoggedIn(true);
        setAuthView('app');
        setActiveTab('dashboard');
        return { success: true };
      }
      return { success: false, message: 'Incorrect password entered.' };
    }

    // 3. Employee Side fallback (Polo C. Gonzalez - gonzalezpolo256@gmail.com / pgonzalez / ogonzalez)
    const isPolo =
      trimmed === 'pgonzalez' ||
      trimmed === 'ogonzalez' ||
      trimmed === 'gonzalezpolo256@gmail.com' ||
      trimmed === 'emp-1042' ||
      trimmed === '26-1042-001' ||
      trimmed === 'pgonzalez_26';

    const emp = employees.find(
      e =>
        e.username.toLowerCase() === trimmed ||
        e.email.toLowerCase() === trimmed ||
        e.employeeNumber.toLowerCase() === trimmed
    );

    if (isPolo || emp) {
      const localSaved =
        typeof window !== 'undefined'
          ? localStorage.getItem(`veloce_pass_${trimmed}`) ||
            localStorage.getItem('veloce_pass_gonzalezpolo256@gmail.com') ||
            localStorage.getItem('veloce_user_password')
          : null;

      if (
        password === 'password123' ||
        password === 'VeloceDefault#2026' ||
        password === 'veloce123' ||
        password === 'Pass123!' ||
        localSaved === password
      ) {
        setCurrentRole('employee');
        setIsLoggedIn(true);
        setAuthView('app');
        setActiveTab('dashboard');
        return { success: true };
      }
      return { success: false, message: 'Incorrect password entered.' };
    }

    return { success: false, message: 'The username or email does not exist.' };
  };

  const activateAccount = async (employeeId: string, email: string) => {
    const trimmedId = employeeId.trim().toUpperCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedId || !trimmedEmail) {
      return { success: false, message: 'Employee ID and company email are required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    // Match employee (Polo C. Gonzalez)
    const isPolo =
      (trimmedId === 'EMP-1042' || trimmedId === '26-1042-001' || trimmedId === 'EMP-1') &&
      (trimmedEmail === 'gonzalezpolo256@gmail.com' || trimmedEmail === 'pgonzalez@veloce.com');

    // Match manager (Marcus Rivera)
    const isMarcus =
      (trimmedId === 'MGR-2001' || trimmedId === 'EMP-1001' || trimmedId === 'MGR-1') &&
      (trimmedEmail === 'j7core256@gmail.com' || trimmedEmail === 'mrivera@veloce.com');

    const matchedEmployee = employees.find(
      e =>
        (e.employeeNumber.toUpperCase() === trimmedId || e.id.toUpperCase() === trimmedId) &&
        e.email.toLowerCase() === trimmedEmail
    );

    if (!isPolo && !isMarcus && !matchedEmployee) {
      return { success: false, message: 'Employee ID and company email do not match our records.' };
    }

    const recipientName = isPolo
      ? 'Polo C. Gonzalez'
      : isMarcus
      ? 'Marcus Rivera'
      : matchedEmployee?.name || 'Veloce Employee';

    const recipientUsername = isPolo
      ? 'pgonzalez'
      : isMarcus
      ? 'mrivera'
      : matchedEmployee?.username || 'user';

    const tempPassword = isMarcus ? 'ManagerDefault#2026' : 'VeloceDefault#2026';
    const role = isMarcus ? 'manager' : 'employee';
    const department = 'Information Technology';
    const position = isMarcus ? 'IT Department Manager' : 'Frontend Software Engineer';

    // Dispatch real email via EmailJS
    console.log(`[Activation] Sending credentials to ${trimmedEmail} via EmailJS...`);
    const emailResult = await sendEmailJSCredentials({
      to_name: recipientName,
      to_email: trimmedEmail,
      employee_id: trimmedId,
      username: recipientUsername,
      default_password: tempPassword,
      department,
      position,
      role,
    });

    // Mark activated in state
    if (isMarcus) {
      setManager(prev => ({ ...prev, isActivated: true }));
    } else {
      setEmployees(prev =>
        prev.map(e => (e.email.toLowerCase() === trimmedEmail ? { ...e, isActivated: true } : e))
      );
    }

    // Sync to Supabase in background
    try {
      await supabase
        .from('employees')
        .update({ is_activated: true })
        .or(`employee_number.eq.${trimmedId},email.eq.${trimmedEmail}`);
    } catch {
      // Supabase table might not exist yet; non-fatal
    }

    addNotification(
      'Account Activated',
      `Default credentials have been sent to ${trimmedEmail} via EmailJS.`,
      'system'
    );

    return {
      success: true,
      message: emailResult.success
        ? `Activation verified! Default credentials sent to ${trimmedEmail} via EmailJS.`
        : `Activation verified! Default password issued: ${tempPassword}.`,
      tempPassword,
    };
  };

  const updateFirstLoginCredentials = async (username: string, defaultPassword: string, newPassword: string) => {
    if (!username.trim()) {
      return { success: false, message: 'New username is required.' };
    }
    const validDefaults = ['VeloceDefault#2026', 'ManagerDefault#2026', 'password123', 'manager123', 'default'];
    if (!validDefaults.includes(defaultPassword)) {
      return { success: false, message: 'Default password does not match the credential sent to your email.' };
    }
    if (newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    setEmployees(prev =>
      prev.map((e, idx) =>
        idx === 0
          ? { ...e, username: username.trim(), defaultPasswordChanged: true }
          : e
      )
    );

    // Save in local storage for instantaneous offline & fallback sync
    if (typeof window !== 'undefined') {
      localStorage.setItem(`veloce_pass_${username.trim().toLowerCase()}`, newPassword);
      localStorage.setItem(`veloce_pass_gonzalezpolo256@gmail.com`, newPassword);
      localStorage.setItem(`veloce_pass_${employees[0].employeeNumber}`, newPassword);
      localStorage.setItem('veloce_user_password', newPassword);
    }

    // Sync update to Supabase - save new password in both default_password and password_hash
    try {
      const { error: supaErr } = await supabase
        .from('employees')
        .update({
          username: username.trim(),
          default_password: newPassword,
          password_hash: newPassword,
          default_password_changed: true,
        })
        .or(`employee_number.eq.${employees[0].employeeNumber},email.eq.gonzalezpolo256@gmail.com,username.eq.${username.trim()}`);

      if (supaErr) {
        console.error('[Supabase] Error saving password:', supaErr.message);
      } else {
        console.log('[Supabase] Password successfully updated to:', newPassword);
      }
    } catch {
      // Non-fatal
    }

    setIsLoggedIn(true);
    setAuthView('app');
    setActiveTab('dashboard');
    return { success: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAuthView('login');
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (currentRole === 'employee') {
      setEmployees(prev => prev.map((e, idx) => (idx === 0 ? { ...e, ...updatedData } : e)));
    } else {
      setManager(prev => ({ ...prev, ...updatedData }));
    }
    addNotification('Profile Updated', 'Your profile information has been saved successfully.', 'system', 'profile');
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!oldPass || !newPass) {
      return { success: false, message: 'All fields are required.' };
    }
    if (newPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters.' };
    }

    try {
      await supabase
        .from('employees')
        .update({
          default_password: newPass,
          password_hash: newPass,
          default_password_changed: true,
        })
        .or(`employee_number.eq.${currentUser.employeeNumber},email.eq.${currentUser.email}`);
    } catch {
      // Non-fatal
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`veloce_pass_${currentUser.email.toLowerCase()}`, newPass);
      localStorage.setItem(`veloce_pass_${currentUser.username.toLowerCase()}`, newPass);
      localStorage.setItem('veloce_user_password', newPass);
    }

    addNotification('Security Alert', 'Your account password was updated successfully.', 'system', 'profile');
    return { success: true };
  };

  const toggleClockInOut = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!todayAttendance) {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        date: todayStr,
        shift: '08:00 AM - 05:00 PM',
        timeIn: timeFormatted,
        timeOut: '--:--',
        status: 'Present',
        remarks: 'Active Shift',
      };
      setAttendanceRecords(prev => [newRecord, ...prev]);
      addNotification('Shift Started', `Clocked in successfully at ${timeFormatted}.`, 'system', 'attendance');
    } else if (todayAttendance.timeOut === '--:--') {
      setAttendanceRecords(prev => prev.map(rec => {
        if (rec.id === todayAttendance.id) {
          return {
            ...rec,
            timeOut: timeFormatted,
            remarks: 'Shift completed',
          };
        }
        return rec;
      }));
      addNotification('Shift Ended', `Clocked out successfully at ${timeFormatted}.`, 'system', 'attendance');
    }
  };

  const createTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const submitLeaveRequest = (data: Omit<LeaveRequest, 'id' | 'dateFiled' | 'status' | 'employeeId' | 'employeeName' | 'employeePosition' | 'employeeEmail'>) => {
    const newReq: LeaveRequest = {
      ...data,
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeePosition: currentUser.position,
      employeeEmail: currentUser.email,
      dateFiled: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    return newReq;
  };

  const approveLeaveRequest = (id: string) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;

    setLeaveRequests(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: 'Approved',
          reviewedBy: manager.name,
          reviewedAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };
      }
      return l;
    }));
  };

  const rejectLeaveRequest = (id: string, reason: string) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;

    setLeaveRequests(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: 'Rejected',
          rejectionReason: reason,
          reviewedBy: manager.name,
          reviewedAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };
      }
      return l;
    }));
  };

  const postAnnouncement = (data: Omit<Announcement, 'id' | 'datePosted' | 'postedBy' | 'department' | 'isBookmarkedBy' | 'readBy'>) => {
    const newAnn: Announcement = {
      ...data,
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      datePosted: new Date().toISOString().split('T')[0],
      postedBy: `${manager.name} (IT Manager)`,
      department: 'Information Technology',
      isBookmarkedBy: [],
      readBy: [],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    return newAnn;
  };

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const toggleBookmarkAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        const isBookmarked = a.isBookmarkedBy.includes(currentUser.id);
        const updatedBookmarks = isBookmarked
          ? a.isBookmarkedBy.filter(uid => uid !== currentUser.id)
          : [...a.isBookmarkedBy, currentUser.id];
        return { ...a, isBookmarkedBy: updatedBookmarks };
      }
      return a;
    }));
  };

  const markAnnouncementRead = (id: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id && !a.readBy.includes(currentUser.id)) {
        return { ...a, readBy: [...a.readBy, currentUser.id] };
      }
      return a;
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <EMSContext.Provider
      value={{
        currentRole,
        currentUser,
        isLoggedIn,
        authView,
        activeTab,
        setActiveTab,
        setAuthView,
        switchRole,
        login,
        activateAccount,
        updateFirstLoginCredentials,
        logout,
        updateProfile,
        changePassword,
        todayAttendance,
        toggleClockInOut,
        tasks,
        createTask,
        updateTask,
        deleteTask,
        attendanceRecords,
        leaveRequests,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        announcements,
        postAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleBookmarkAnnouncement,
        markAnnouncementRead,
        employees,
        notifications,
        markNotificationAsRead,
        clearNotifications,
      }}
    >
      {children}
    </EMSContext.Provider>
  );
}

export function useEMS() {
  const context = useContext(EMSContext);
  if (!context) {
    throw new Error('useEMS must be used within an EMSProvider');
  }
  return context;
}
