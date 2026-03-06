import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const HowItWorksSticky = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Background Vignette Shift (20% - 50%)
  const vignetteOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0.4, 0.9]);

  // Step 1: opacity 0->1, scale 0.9->1 (5% - 20%)
  const step1Opacity = useTransform(scrollYProgress, [0.05, 0.2], [0, 1]);
  const step1Scale = useTransform(scrollYProgress, [0.05, 0.2], [0.9, 1]);
  const step1Rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  // Step 2: y 50px->0px, opacity 0->1 (35% - 55%)
  const step2Opacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const step2Y = useTransform(scrollYProgress, [0.35, 0.55], [50, 0]);
  const step2Rotate = useTransform(scrollYProgress, [0, 1], [2, -2]);

  // Step 3: opacity 0->1, scale 1.1->1 (65% - 85%)
  const step3Opacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1]);
  const step3Scale = useTransform(scrollYProgress, [0.65, 0.85], [1.1, 1]);
  const step3Rotate = useTransform(scrollYProgress, [0, 1], [-1, 3]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#FAFAFA] py-16">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">
        
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coral-100/50 via-[#FAFAFA] to-[#FAFAFA]"></div>
          <motion.div 
            style={{ opacity: vignetteOpacity }} 
            className="absolute inset-0 bg-[#FAFAFA] z-10"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-20 mix-blend-overlay"></div>
        </div>

        <div className="relative z-30 container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-50 border border-coral-200 text-coral-600 text-sm font-bold uppercase tracking-widest mb-6 shadow-sm">
              Simple Setup
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
              How ChatLayer <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-orange-500">Works</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Get set up in minutes. No tech skills required. We made it simple for everyone to automate support.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 01 */}
            <motion.div 
              style={{ opacity: step1Opacity, scale: step1Scale, rotateZ: step1Rotate }}
              className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col h-full relative overflow-hidden group hover:shadow-2xl hover:border-coral-200 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-coral-200 to-transparent"></div>
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Connect</h4>
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-coral-500 to-coral-100">01</span>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-gray-200 to-transparent mb-6 md:mb-8"></div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                Pick a vibe, add your knowledge base, and style the widget to match your brand perfectly.
              </p>
            </motion.div>

            {/* Step 02 */}
            <motion.div 
              style={{ opacity: step2Opacity, y: step2Y, rotateZ: step2Rotate }}
              className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col h-full relative overflow-hidden group hover:shadow-2xl hover:border-coral-200 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-coral-200 to-transparent"></div>
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Embed</h4>
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-coral-500 to-coral-100">02</span>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-gray-200 to-transparent mb-6 md:mb-8"></div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                Copy and paste a single line of code. Your bot is live on your website in moments, ready to help.
              </p>
            </motion.div>

            {/* Step 03 */}
            <motion.div 
              style={{ opacity: step3Opacity, scale: step3Scale, rotateZ: step3Rotate }}
              className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col h-full relative overflow-hidden group hover:shadow-2xl hover:border-coral-200 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-coral-200 to-transparent"></div>
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Monitor</h4>
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-coral-500 to-coral-100">03</span>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-gray-200 to-transparent mb-6 md:mb-8"></div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                Use the analytics dashboard to optimize responses, track customer satisfaction, and improve over time.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
