'use client';

import React, { useState } from 'react';
import { useEMS } from '../../context/EMSContext';

export const VeloceLogo = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M15 25L50 10L85 25V55L50 90L15 55V25Z"
      stroke="#5A6270"
      strokeWidth="6"
      strokeLinejoin="round"
      fill="#282D37"
    />
    <path
      d="M30 52L48 34L40 30L68 24L62 52L54 44L36 62L30 52Z"
      fill="#8892A0"
    />
    <path
      d="M50 13L82 26V53L50 85L50 13Z"
      fill="white"
      fillOpacity="0.08"
    />
  </svg>
);

export const VeloceBigEmblem = () => (
  <svg
    viewBox="0 0 320 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-64 h-64 md:w-72 md:h-72 drop-shadow-2xl"
  >
    {/* Outer Shield Backing */}
    <path
      d="M50 85L160 35L270 85V180C270 230 160 285 160 285C160 285 50 230 50 180V85Z"
      fill="#282D36"
      stroke="#454D5C"
      strokeWidth="10"
      strokeLinejoin="round"
    />
    {/* Inner 3D Facets - Dark Left */}
    <path
      d="M60 92L160 48V270C160 270 60 220 60 175V92Z"
      fill="#20242C"
    />
    {/* Inner 3D Facets - Light Right */}
    <path
      d="M160 48L260 92V175C260 220 160 270 160 270V48Z"
      fill="#3A404D"
    />
    {/* The Dynamic Arrow and Lightning Geometry */}
    <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.5))">
      {/* Arrow Shaft Lower */}
      <path
        d="M95 180L145 125L125 110L195 90L180 160L160 140L115 195L95 180Z"
        fill="#616A79"
      />
      {/* Arrow Highlight Facet */}
      <path
        d="M145 125L195 90L180 160L160 140L145 125Z"
        fill="#7D8797"
      />
      {/* Arrow Shadow Facet */}
      <path
        d="M95 180L145 125L160 140L115 195L95 180Z"
        fill="#4A5260"
      />
      {/* Lower Shield Crest Notch */}
      <path
        d="M160 215L195 180L210 195L160 245L110 195L125 180L160 215Z"
        fill="#555E6D"
      />
    </g>
  </svg>
);

export const LoginPage: React.FC = () => {
  const { login, setAuthView } = useEMS();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    setPasswordError(null);

    let hasError = false;

    if (!username.trim()) {
      setUsernameError('Please enter your username');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    }

    if (hasError) return;

    const res = login(username, password);
    if (!res.success) {
      if (res.message?.toLowerCase().includes('username') || username.toLowerCase() !== 'pgonzalez' && username.toLowerCase() !== 'mrivera') {
        setUsernameError('The username does not exist');
      }
      if (!password) {
        setPasswordError('Please enter your password');
      } else if (res.message?.toLowerCase().includes('password')) {
        setPasswordError('Incorrect password entered');
      }
    }
  };

  // Demo auto-fill helpers
  const handleFillPolo = () => {
    setUsername('pgonzalez');
    setPassword('password123');
    setUsernameError(null);
    setPasswordError(null);
  };

  const handleFillManager = () => {
    setUsername('mrivera');
    setPassword('manager123');
    setUsernameError(null);
    setPasswordError(null);
  };

  const handleTriggerValidationState = () => {
    setUsername('Jaden');
    setPassword('');
    setUsernameError('The username does not exist');
    setPasswordError('Please enter your password');
  };

  return (
    <div className="min-h-screen w-full bg-[#1E222B] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 font-sans">
      {/* Top Header Logo */}
      <div className="flex items-center gap-3">
        <VeloceLogo className="w-8 h-8 sm:w-10 sm:h-10" />
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Veloce Systems
        </span>
      </div>

      {/* Main Grid: Left Login Form & Right Welcome Hero Card */}
      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pt-6 pb-6">
        {/* Left Side: Login Form */}
        <div className="lg:col-span-5 max-w-md w-full mx-auto lg:mx-0 space-y-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white">
            WELCOME BACK!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError(null);
                  }}
                  placeholder="Johndoe"
                  className={`w-full bg-[#D1D5DB] text-slate-900 placeholder-slate-500 px-3.5 py-2.5 rounded-md text-sm font-medium focus:outline-none transition-all ${
                    usernameError
                      ? 'border-2 border-[#E04B4B] pr-10'
                      : 'border border-transparent focus:ring-2 focus:ring-slate-400'
                  }`}
                />
                {usernameError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-[#E04B4B]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.707 13.707a1 1 0 01-1.414 0L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 011.414-1.414L12 10.586l2.293-2.293a1 1 0 011.414 1.414L13.414 12l2.293 2.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {usernameError && (
                <p className="text-xs font-semibold text-[#E04B4B] pt-0.5">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="password"
                  className={`w-full bg-[#D1D5DB] text-slate-900 placeholder-slate-500 px-3.5 py-2.5 rounded-md text-sm font-medium focus:outline-none transition-all ${
                    passwordError
                      ? 'border-2 border-[#E04B4B] pr-10'
                      : 'border border-transparent focus:ring-2 focus:ring-slate-400'
                  }`}
                />
                {passwordError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-[#E04B4B]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.707 13.707a1 1 0 01-1.414 0L12 13.414l-2.293 2.293a1 1 0 01-1.414-1.414L10.586 12 8.293 9.707a1 1 0 011.414-1.414L12 10.586l2.293-2.293a1 1 0 011.414 1.414L13.414 12l2.293 2.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {passwordError && (
                <p className="text-xs font-semibold text-[#E04B4B] pt-0.5">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full bg-[#8C8275] hover:bg-[#7D7366] active:bg-[#6E6457] text-white font-medium py-3 rounded-lg text-sm transition-colors shadow-md"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => setAuthView('first-login')}
                className="w-full bg-[#8C8275] hover:bg-[#7D7366] active:bg-[#6E6457] text-white font-medium py-3 rounded-lg text-sm transition-colors shadow-md"
              >
                Forgot Password
              </button>
            </div>

            {/* Activate Account Link */}
            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => setAuthView('activate')}
                className="text-sm text-white underline hover:text-slate-200 transition-colors cursor-pointer"
              >
                Activate account?
              </button>
            </div>
          </form>

          {/* Quick Demo Toolbar for Validation State Demo */}
          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Demo states:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFillPolo}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Polo
              </button>
              <button
                type="button"
                onClick={handleFillManager}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={handleTriggerValidationState}
                className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800"
              >
                Validation State (Screen 2)
              </button>
            </div>
          </div>
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

      {/* Footer Bottom empty spacer for vertical centering balance */}
      <div className="hidden sm:block text-[11px] text-slate-500 text-center">
        © 2026 Veloce Systems Inc. All rights reserved.
      </div>
    </div>
  );
};
