'use client';

import React, { createContext, useContext, useState } from 'react';
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
  login: (username: string, password: string) => { success: boolean; message?: string };
  activateAccount: (employeeId: string, email: string) => { success: boolean; message?: string; tempPassword?: string };
  updateFirstLoginCredentials: (username: string, defaultPassword: string, newPassword: string) => { success: boolean; message?: string };
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message?: string };

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

  const login = (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    if (trimmedUser === 'mrivera' && password === 'manager123') {
      setCurrentRole('manager');
      setIsLoggedIn(true);
      setAuthView('app');
      setActiveTab('dashboard');
      return { success: true };
    }

    const emp = employees.find(e => e.username.toLowerCase() === trimmedUser);
    if (emp && (password === 'password123' || password === 'veloce123' || password === 'Pass123!')) {
      setCurrentRole('employee');
      setIsLoggedIn(true);
      setAuthView('app');
      setActiveTab('dashboard');
      return { success: true };
    }

    return { success: false, message: 'The username does not exist or password is invalid.' };
  };

  const activateAccount = (employeeId: string, email: string) => {
    const trimmedId = employeeId.trim().toUpperCase();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedId || !trimmedEmail) {
      return { success: false, message: 'Employee ID and company email are required.' };
    }

    if (!trimmedEmail.endsWith('@veloce.com')) {
      return { success: false, message: 'Please provide a valid company email (@veloce.com).' };
    }

    const matched = employees.find(
      e => e.employeeNumber.toUpperCase() === trimmedId && e.email.toLowerCase() === trimmedEmail
    );

    if (!matched) {
      return { success: false, message: 'Employee ID and company email do not match our records.' };
    }

    return { 
      success: true, 
      message: `Activation verified! A default password has been issued to ${matched.email}.`,
      tempPassword: 'VeloceDefault#2026'
    };
  };

  const updateFirstLoginCredentials = (username: string, defaultPassword: string, newPassword: string) => {
    if (!username.trim()) {
      return { success: false, message: 'New username is required.' };
    }
    if (defaultPassword !== 'VeloceDefault#2026' && defaultPassword !== 'password123') {
      return { success: false, message: 'Default password does not match the credential sent to your email.' };
    }
    if (newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    setEmployees(prev => prev.map((e, idx) => idx === 0 ? { ...e, username: username.trim(), defaultPasswordChanged: true } : e));
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
      setEmployees(prev => prev.map((e, idx) => idx === 0 ? { ...e, ...updatedData } : e));
    } else {
      setManager(prev => ({ ...prev, ...updatedData }));
    }
    addNotification('Profile Updated', 'Your profile information has been saved successfully.', 'system', 'profile');
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!oldPass || !newPass) {
      return { success: false, message: 'All fields are required.' };
    }
    if (newPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters.' };
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
