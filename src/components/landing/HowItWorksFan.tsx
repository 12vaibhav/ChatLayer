import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Settings, Code, BarChart } from 'lucide-react';

export const HowItWorksFan = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Left Card (Fan Out)
  const leftX = useTransform(scrollYProgress, [0, 1], [0, -340]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [0, -12]);

  // Right Card (Fan Out)
  const rightX = useTransform(scrollYProgress, [0, 1], [0, 340]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);

  // Center Card (Scale Up)
  const centerScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const cards = [
    {
      number: "01",
      title: "Customize Your Bot",
      description: "Pick a vibe, add your knowledge base, and style the widget to match your brand.",
      icon: Settings,
      style: { x: leftX, rotateZ: leftRotate, zIndex: 10 },
    },
    {
      number: "02",
      title: "Embed on Your Site",
      description: "Copy and paste a single line of code. Your bot is live in moments, ready to help.",
      icon: Code,
      style: { scale: centerScale, zIndex: 20 },
    },
    {
      number: "03",
      title: "Monitor & Improve",
      description: "Use the analytics dashboard to optimize responses and track customer satisfaction.",
      icon: BarChart,
      style: { x: rightX, rotateZ: rightRotate, zIndex: 10 },
    }
  ];

  return (
    <div ref={containerRef} className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden min-h-[600px]">
      {/* Desktop Fanning Cards */}
      <div className="hidden md:flex relative w-full max-w-5xl h-[450px] items-center justify-center">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            style={card.style}
            className="absolute w-[320px] h-[420px] rounded-[24px] p-8 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-t border-l border-white/60 bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl"
          >
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-50 to-orange-50 flex items-center justify-center text-coral-500 shadow-sm border border-coral-100">
                  <card.icon size={28} />
                </div>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-100">
                  {card.number}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{card.title}</h3>
              <p className="text-gray-600 leading-relaxed font-medium">{card.description}</p>
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-coral-400 to-orange-400 rounded-full opacity-50"></div>
          </motion.div>
        ))}
      </div>
      
      {/* Mobile Stacked Cards */}
      <div className="md:hidden flex flex-col gap-6 w-full max-w-md px-4 relative z-10">
        {cards.map((card, index) => (
          <div
            key={index}
            className="w-full rounded-[24px] p-8 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-t border-l border-white/60 bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 text-8xl font-black text-gray-50 opacity-50 pointer-events-none">
              {card.number}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral-50 to-orange-50 flex items-center justify-center text-coral-500 shadow-sm border border-coral-100 mb-6 relative z-10">
              <card.icon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight relative z-10">{card.title}</h3>
            <p className="text-gray-600 leading-relaxed font-medium relative z-10">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
