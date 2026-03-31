"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import Link from 'next/link';

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must be alphanumeric and at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Registration endpoint on the Spring Boot backend
      await api.post('/api/v1/auth/register', { name, email, password });
      toast.success('Registration successful. You can now log in.');
      router.push('/login'); // Redirect to login so they can authenticate
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Registration failed. Try using a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-2">Join us to manage and analyze candidates</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="you@company.com"
              required
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Lock className="h-5 w-5 text-slate-400" />
             </div>
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
               placeholder="••••••••"
               required
             />
           </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              Sign Up
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
