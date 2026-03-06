import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(255,115,87,0.1)] hover:border-coral-200/60 transition-all duration-300 group overflow-hidden"
    >
      {/* Subtle inner gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral-500/0 via-transparent to-orange-500/0 group-hover:from-coral-500/5 group-hover:to-orange-500/5 transition-colors duration-500 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center text-coral-500 mb-6 group-hover:from-coral-400 group-hover:to-coral-600 group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100 group-hover:border-coral-400 group-hover:shadow-coral-500/30">
          <Icon size={26} className="transition-transform duration-500 group-hover:scale-110" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-8 font-medium">{description}</p>
        
        <a href="#" className="inline-flex items-center gap-2 text-gray-900 font-bold text-sm group-hover:text-coral-500 transition-colors">
          <span className="relative">
            Learn More
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral-500 group-hover:w-full transition-all duration-300"></span>
          </span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>
    </motion.div>
  );
};
