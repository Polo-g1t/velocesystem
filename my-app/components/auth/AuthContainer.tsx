'use client';

import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';
import { LoginPage, VeloceLogo, VeloceBigEmblem } from './LoginPage';
import { ShieldCheck, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const AuthContainer: React.FC = () => {
  const {
    authView,
    setAuthView,
    activateAccount,
    updateFirstLoginCredentials,
  } = useEMS();

  // Activation state
  const [activationEmpId, setActivationEmpId] = useState('EMP-1042');
  const [activationEmail, setActivationEmail] = useState('pgonzalez@veloce.com');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // First-login credential update state
  const [newUsername, setNewUsername] = useState('pgonzalez');
  const [defaultPassInput, setDefaultPassInput] = useState('VeloceDefault#2026');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);

  // Password strength meter
  const hasMinLength = newPassInput.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassInput);
  const hasNumber = /[0-9]/.test(newPassInput);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassInput);
  const passwordsMatch = newPassInput.length > 0 && newPassInput === confirmPassInput;
  const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    setActivationSuccess(null);
    const res = activateAccount(activationEmpId, activationEmail);
    if (res.success) {
      setActivationSuccess(res.message || 'Account activated successfully.');
      setTempPassword(res.tempPassword || 'VeloceDefault#2026');
    } else {
      setActivationError(res.message || 'Activation failed.');
    }
  };

  const handleCredentialUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);

    if (!passwordsMatch) {
      setCredError('New password and confirmation password do not match.');
      return;
    }

    if (strengthScore < 3) {
      setCredError('Please ensure password satisfies security requirements.');
      return;
    }

    const res = updateFirstLoginCredentials(newUsername, defaultPassInput, newPassInput);
    if (res.success) {
      setCredSuccess('Credentials updated successfully! Redirecting...');
    } else {
      setCredError(res.message || 'Credential update failed.');
    }
  };

  if (authView === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen w-full bg-[#1E222B] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 font-sans">
      {/* Top Header Logo */}
      <div className="flex items-center gap-3">
        <VeloceLogo className="w-8 h-8 sm:w-10 sm:h-10" />
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Veloce Systems
        </span>
      </div>

      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pt-6 pb-6">
        {/* Left Side: Form Container */}
        <div className="lg:col-span-5 max-w-md w-full mx-auto lg:mx-0 space-y-6">
          {authView === 'activate' ? (
            /* ---------------- SCREEN 3 & 4: ACCOUNT ACTIVATION ---------------- */
            <form onSubmit={handleActivationSubmit} className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white">
                  ACTIVATE ACCOUNT
                </h1>
                <p className="text-xs text-[#D1D5DB] mt-1.5 leading-relaxed">
                  Verify your Employee ID and company email to receive your default access credentials.
                </p>
              </div>

              {activationError && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{activationError}</span>
                </div>
              )}

              {activationSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Account Verified!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200">{activationSuccess}</p>
                  {tempPassword && (
                    <div className="p-2 rounded bg-emerald-900/60 border border-emerald-700 text-xs font-mono text-white flex items-center justify-between">
                      <span>Temp: <strong>{tempPassword}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setDefaultPassInput(tempPassword);
                          setAuthView('first-login');
                        }}
                        className="text-[11px] text-emerald-300 underline font-sans font-semibold"
                      >
                        Set Password →
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white">Employee ID / Number</label>
                  <input
                    type="text"
                    value={activationEmpId}
                    onChange={(e) => setActivationEmpId(e.target.value)}
                    placeholder="EMP-1042"
                    className="w-full bg-[#D1D5DB] text-slate-900 placeholder-slate-500 px-3.5 py-2.5 rounded-md text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-white">Company Email</label>
                  <input
                    type="email"
                    value={activationEmail}
                    onChange={(e) => setActivationEmail(e.target.value)}
                    placeholder="pgonzalez@veloce.com"
                    className="w-full bg-[#D1D5DB] text-slate-900 placeholder-slate-500 px-3.5 py-2.5 rounded-md text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#8C8275] hover:bg-[#7D7366] text-white font-medium py-3 rounded-lg text-sm transition-colors shadow-md"
                >
                  Activate
                </button>

                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="w-full text-center text-sm text-white underline hover:text-slate-200 transition-colors pt-1"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            /* ---------------- SCREEN 5, 6 & 7: FIRST LOGIN / UPDATE CREDENTIALS ---------------- */
            <form onSubmit={handleCredentialUpdate} className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white">
                  UPDATE USER CREDENTIALS
                </h1>
                <p className="text-xs text-[#D1D5DB] mt-1">
                  Replace default credentials with your new private username and password.
                </p>
              </div>

              {credError && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{credError}</span>
                </div>
              )}

              {credSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{credSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">New Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-[#D1D5DB] text-slate-900 px-3 py-2 rounded-md text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Default Password</label>
                  <input
                    type="password"
                    value={defaultPassInput}
                    onChange={(e) => setDefaultPassInput(e.target.value)}
                    className="w-full bg-[#D1D5DB] text-slate-900 px-3 py-2 rounded-md text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#D1D5DB] text-slate-900 px-3 py-2 rounded-md text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    className="w-full bg-[#D1D5DB] text-slate-900 px-3 py-2 rounded-md text-xs font-medium focus:outline-none"
                  />
                </div>

                {/* Password Strength Checklist (Screen 7) */}
                <div className="p-3 rounded-lg bg-[#22262E] border border-slate-700/60 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={strengthScore >= 3 ? 'text-emerald-400' : 'text-amber-400'}>
                      {strengthScore >= 4 ? 'Strong' : strengthScore >= 2 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-slate-300">
                    <span className={hasMinLength ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasMinLength ? '✓' : '•'} 8+ characters
                    </span>
                    <span className={hasUpper ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasUpper ? '✓' : '•'} Uppercase letter
                    </span>
                    <span className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasNumber ? '✓' : '•'} Number
                    </span>
                    <span className={hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>
                      {hasSpecial ? '✓' : '•'} Special character
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#8C8275] hover:bg-[#7D7366] text-white font-medium py-2.5 rounded-lg text-xs transition-colors shadow-md"
                >
                  Save Credentials
                </button>

                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="w-full text-center text-xs text-white underline hover:text-slate-200 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Welcome Hero Card */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-lg bg-[#22262E] rounded-[32px] p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl border border-white/5 space-y-6">
            <VeloceBigEmblem />

            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                WELCOME TO VELOCE SYSTEMS
              </h2>
              <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed max-w-sm mx-auto">
                At Veloce Systems, we build scalable, high-performance software solutions that power modern enterprises worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block text-[11px] text-slate-500 text-center">
        © 2026 Veloce Systems Inc. All rights reserved.
      </div>
    </div>
  );
};
