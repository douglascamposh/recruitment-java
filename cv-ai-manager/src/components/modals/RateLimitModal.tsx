import React from 'react';
import { Zap } from 'lucide-react';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
        
        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5 mx-auto ring-4 ring-indigo-50">
          <Zap className="w-7 h-7" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 text-center mb-3">
          Daily Limit Reached!
        </h3>
        
        <p className="text-slate-600 text-center text-sm mb-8 leading-relaxed">
          You've used your 3 free optimizations for today. Please try again tomorrow.
        </p>
        {/* Sign up or log in to get unlimited access to our AI tools and save your progress. */}
        <div className="flex flex-col gap-3">
          {/* <button 
            onClick={onLogin}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg active:scale-95"
          >
            Create Account / Log In
          </button> */}
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
                Close
            {/* Maybe Later */}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RateLimitModal;