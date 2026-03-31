"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand / Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              CV Optimizer AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/candidate" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Optimizer
            </Link>
            <Link href="/recruiter" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Recruiter
            </Link>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-medium">Welcome, {user?.name || user?.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all shadow-sm active:scale-95"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation (Simplified) */}
          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/recruiter" className="text-sm font-semibold text-indigo-600">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 text-red-600 bg-red-50 rounded-lg">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                Sign In &rarr;
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
