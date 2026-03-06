import React from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn(
      "flex items-center justify-center overflow-hidden",
      className
    )}>
      <img 
        src="/logo.png" 
        alt="ChatLayer" 
        className="h-8 w-auto object-contain"
        onError={(e) => {
           // Fallback to text if image doesn't exist
           e.currentTarget.style.display = 'none';
           const text = document.createElement('span');
           text.innerText = '💬';
           e.currentTarget.parentElement?.appendChild(text);
        }}
      />
    </div>
  );
};
