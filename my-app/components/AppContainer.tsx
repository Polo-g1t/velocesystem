'use client';

import React, { useState } from 'react';
import { EMSProvider, useEMS } from '../context/EMSContext';
import { AuthContainer } from './auth/AuthContainer';

// Common
import { Navbar } from './common/Navbar';
import { Sidebar } from './common/Sidebar';

// Employee Views
import { EmployeeDashboard } from './employee/EmployeeDashboard';
import { EmployeeTasks } from './employee/EmployeeTasks';
import { EmployeeAttendance } from './employee/EmployeeAttendance';
import { EmployeeAnnouncements } from './employee/EmployeeAnnouncements';
import { EmployeeLeaveRequests } from './employee/EmployeeLeaveRequests';
import { EmployeeProfile } from './employee/EmployeeProfile';

// Manager Views
import { ManagerDashboard } from './manager/ManagerDashboard';
import { ManagerEmployees } from './manager/ManagerEmployees';
import { ManagerTasks } from './manager/ManagerTasks';
import { ManagerLeaveRequests } from './manager/ManagerLeaveRequests';
import { ManagerAnnouncements } from './manager/ManagerAnnouncements';

function MainApp() {
  const { isLoggedIn, authView, currentRole, activeTab, setActiveTab } = useEMS();
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);
  const [targetAnnId, setTargetAnnId] = useState<string | null>(null);

  // If not logged in or in login / activation / first-login workflow
  if (!isLoggedIn || authView !== 'app') {
    return <AuthContainer />;
  }

  return (
    <div className="min-h-screen bg-[#1E222B] flex flex-col text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[calc(100vw-16rem)] min-h-[calc(100vh-61px)]">
          {currentRole === 'employee' ? (
            <>
              {activeTab === 'dashboard' && (
                <EmployeeDashboard
                  onOpenTaskDetails={(id) => {
                    setTargetTaskId(id);
                    setActiveTab('tasks');
                  }}
                  onOpenAnnouncement={(id) => {
                    setTargetAnnId(id);
                    setActiveTab('announcements');
                  }}
                />
              )}
              {activeTab === 'tasks' && <EmployeeTasks initialTaskId={targetTaskId} />}
              {activeTab === 'attendance' && <EmployeeAttendance />}
              {activeTab === 'announcements' && <EmployeeAnnouncements initialAnnId={targetAnnId} />}
              {activeTab === 'leaves' && <EmployeeLeaveRequests />}
              {activeTab === 'profile' && <EmployeeProfile />}
            </>
          ) : (
            <>
              {activeTab === 'dashboard' && <ManagerDashboard />}
              {activeTab === 'employees' && <ManagerEmployees />}
              {activeTab === 'tasks' && <ManagerTasks />}
              {activeTab === 'leaves' && <ManagerLeaveRequests />}
              {activeTab === 'announcements' && <ManagerAnnouncements />}
              {activeTab === 'profile' && <EmployeeProfile />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AppContainer() {
  return (
    <EMSProvider>
      <MainApp />
    </EMSProvider>
  );
}
