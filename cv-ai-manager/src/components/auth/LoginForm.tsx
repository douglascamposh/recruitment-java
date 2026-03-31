"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { useAuth, User } from '@/context/AuthContext';
import Link from 'next/link';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Handle form submission and authentication API call
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Endpoint to authenticate user in the Spring Boot backend
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      // We expect the backend to return a JWT token and a User object
      const { token, user } = response.data;
      
      if (token && user) {
        login(token, user as User); // Persist session via AuthContext
        toast.success('Logged in successfully');
        router.push('/recruiter'); // Redirect to dashboard
      } else {
        toast.error('Invalid response from server.');
      }
    } catch (error: any) {
      console.error(error);
      // Fallback message if specific error message is not present
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-2">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
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
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
