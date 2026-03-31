// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/layout/Header';

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
        <AuthProvider>
        {/* Styled the Toaster slightly to match the modern font */}
        <Toaster 
          position="top-right" 
          toastOptions={{ className: 'text-sm font-medium font-sans' }} 
        />
        
        {/* --- GLOBAL HEADER --- */}
        <Header />

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
        </AuthProvider>

      </body>
    </html>
  );
}