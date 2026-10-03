import React from 'react';
import { Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading risk intelligence...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-purple-900 border-t-purple-500 animate-spin" />
        <Activity className="w-5 h-5 text-purple-400 absolute inset-0 m-auto" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 tracking-wide">{message}</p>
    </div>
  );
};
