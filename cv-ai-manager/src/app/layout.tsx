// src/app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CV AI Manager",
  description: "Sistema de reclutamiento inteligente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <Toaster position="top-right" />
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  CV-AI
                </Link>
              </div>
              <div className="hidden md:flex md:space-x-8">
                <Link href="/candidate" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Candidato
                </Link>
                <Link href="/recruiter" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Reclutador
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
