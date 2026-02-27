// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI CV Optimizer & Interview Prep",
  description: "Elevate your career with AI-driven resume optimization and interview strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* 1. Added min-h-screen and flex-col to ensure the footer always stays at the bottom.
        2. Changed bg-gray-50 to bg-slate-50 to perfectly match the CandidatePage palette.
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        {/* Styled the Toaster slightly to match the modern font */}
        <Toaster 
          position="top-right" 
          toastOptions={{ className: 'text-sm font-medium font-sans' }} 
        />
        
        {/* --- GLOBAL HEADER --- */}
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
                {/* Global Call to Action Button */}
                <Link 
                  href="/candidate" 
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Navigation (Simplified) */}
              <div className="md:hidden flex items-center">
                 <Link href="/candidate" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  Optimize CV &rarr;
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* --- MAIN CONTENT --- */}
        {/* flex-grow pushes the footer to the bottom if the content is short */}
        <main className="flex-grow w-full">
          {children}
        </main>

        {/* --- GLOBAL FOOTER --- */}
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 text-center md:text-left">
              © {new Date().getFullYear()} CV Optimizer AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm font-medium text-slate-400">
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}