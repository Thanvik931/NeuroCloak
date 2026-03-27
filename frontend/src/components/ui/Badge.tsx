import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'APPROVED' | 'FLAGGED' | 'BLOCKED' | 'PENDING' | string;
}

export function Badge({ status, className, ...props }: BadgeProps) {
  const defaultStyles = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  const styles: Record<string, string> = {
    APPROVED: 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]',
    FLAGGED: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.15)]',
    BLOCKED: 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
    PENDING: defaultStyles
  };

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest', styles[status] || defaultStyles, className)} {...props}>
      {status}
    </span>
  );
}
