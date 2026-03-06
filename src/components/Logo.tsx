import React from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export const Logo = ({ className, iconSize = 20 }: LogoProps) => {
  return (
    <div className={cn(
      "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden",
      className
    )}>
      <img 
        src="/logo.png" 
        alt="ChatLayer" 
        className="w-full h-full object-contain p-1"
        onError={(e) => {
           // Fallback to Icon if image doesn't exist yet
           e.currentTarget.style.display = 'none';
           e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-coral-400', 'to-coral-600', 'text-white');
           const icon = document.createElement('div');
           icon.innerHTML = '<span class="flex items-center justify-center w-full h-full">💬</span>';
           e.currentTarget.parentElement?.appendChild(icon);
        }}
      />
    </div>
  );
};
