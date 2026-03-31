"use client";

import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <RegisterForm />
    </div>
  );
}
