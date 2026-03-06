import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  name, 
  price, 
  description, 
  features, 
  isPopular = false,
  ctaText = "Choose Plan",
  onCtaClick,
  className
}) => {
  return (
    <div className={cn(
      "relative p-8 rounded-3xl border flex flex-col h-full transition-all duration-500",
      isPopular 
        ? "bg-white border-coral-200 shadow-2xl shadow-coral-500/10 scale-105 z-10" 
        : "bg-white border-gray-200 shadow-xl hover:border-coral-200 hover:shadow-2xl",
      className
    )}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-coral-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-coral-500/30">
          Best Value
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-5xl font-black text-gray-900 tracking-tight">{price}</span>
          {price !== 'Custom' && <span className="text-gray-500 font-medium">/mo</span>}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-coral-50 flex items-center justify-center shrink-0 mt-0.5 border border-coral-100">
                <Check size={12} className="text-coral-500 stroke-[3]" />
              </div>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={onCtaClick}
        className={cn(
        "w-full py-3.5 rounded-xl font-bold transition-all duration-300",
        isPopular
          ? "bg-coral-500 text-white hover:bg-coral-600 shadow-lg shadow-coral-500/25"
          : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
      )}>
        {ctaText}
      </button>
    </div>
  );
};
