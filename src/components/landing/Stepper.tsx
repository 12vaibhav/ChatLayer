import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, Settings, Code, BarChart } from 'lucide-react';

export const Stepper = () => {
  const steps = [
    {
      number: "01",
      title: "Sign Up Free",
      description: "Create an account in seconds.",
      icon: UserPlus
    },
    {
      number: "02",
      title: "Customize Your Bot",
      description: "Pick vibe, add knowledge, style widget.",
      icon: Settings
    },
    {
      number: "03",
      title: "Embed on Your Site",
      description: "Copy-paste code — live in moments.",
      icon: Code
    },
    {
      number: "04",
      title: "Monitor & Improve",
      description: "Use analytics to optimize.",
      icon: BarChart
    }
  ];

  return (
    <div className="relative">
      {/* Connecting Line (Desktop) */}
      <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-coral-200 to-transparent -z-10 transform -translate-y-1/2"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-8 relative z-10 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(255,115,87,0.1)] group-hover:border-coral-200 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-50 to-orange-50 flex items-center justify-center text-coral-500 group-hover:from-coral-400 group-hover:to-coral-600 group-hover:text-white transition-all duration-500">
                <step.icon size={28} className="transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-black border-[3px] border-white shadow-sm group-hover:bg-coral-500 transition-colors duration-300">
                {step.number}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{step.title}</h3>
            <p className="text-gray-500 max-w-[220px] font-medium leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
