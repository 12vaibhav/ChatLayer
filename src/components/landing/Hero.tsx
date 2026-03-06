import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Play, CheckCircle2, MessageSquare, Zap, ArrowRight, Sparkles, Database, Users } from 'lucide-react';

export const Hero = ({ onSignup }: { onSignup: () => void }) => {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ['0%', '25%']);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative flex items-center pt-40 pb-12 overflow-hidden bg-[#FAFAFA]">
      {/* Background Gradient Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coral-100/40 via-[#FAFAFA] to-[#FAFAFA] pointer-events-none"></div>

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left relative"
        >
          {/* Floating Sparkle Decor */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -left-12 text-coral-300/50 hidden lg:block"
          >
            <Sparkles size={48} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-coral-200/50 text-coral-600 text-sm font-bold uppercase tracking-widest mb-8 shadow-sm"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral-500"></span>
            </span>
            Meet ChatLayer 2.0
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-gray-900 tracking-tighter leading-[1.05] mb-8">
            Create <br className="hidden lg:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-coral-500 via-orange-500 to-coral-600">
                Customizable
              </span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                className="absolute bottom-2 left-0 h-4 bg-coral-200/40 -z-10 -rotate-2"
              ></motion.span>
            </span>
            <br />
            AI chatbot in minutes
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Train a custom AI chatbot on your own data. Match your brand's unique voice, automate customer support, and embed it anywhere—zero coding required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 mb-16">
            <button onClick={onSignup} className="group relative w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-coral-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                Start Building Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="group w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-md text-gray-900 font-bold text-lg rounded-2xl border border-gray-200 shadow-sm hover:border-coral-300 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-coral-50 flex items-center justify-center group-hover:bg-coral-500 group-hover:scale-110 transition-all duration-300">
                <Play size={16} className="fill-coral-500 text-coral-500 ml-1 group-hover:fill-white group-hover:text-white transition-colors" />
              </div>
              See it in action
            </button>
          </div>

          <div className="flex flex-col items-center lg:items-start gap-6">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Trusted by innovative teams</p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-10 gap-y-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex items-center gap-2 group/logo">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center group-hover/logo:bg-blue-500 transition-colors">
                  <Zap size={18} className="text-gray-500 group-hover/logo:text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900">VELOCITY</span>
              </div>
              <div className="flex items-center gap-2 group/logo">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center group-hover/logo:bg-emerald-500 transition-colors">
                  <Database size={18} className="text-gray-500 group-hover/logo:text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900">DATACORE</span>
              </div>
              <div className="flex items-center gap-2 group/logo">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center group-hover/logo:bg-purple-500 transition-colors">
                  <Users size={18} className="text-gray-500 group-hover/logo:text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900">SYNERGY</span>
              </div>
              <div className="flex items-center gap-2 group/logo">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center group-hover/logo:bg-orange-500 transition-colors">
                  <Sparkles size={18} className="text-gray-500 group-hover/logo:text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900">LUMINA</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Visual Mockup */}
        <motion.div
          style={{ 
            y: y2,
            rotateX: mousePosition.y,
            rotateY: -mousePosition.x,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 50 }}
          className="relative hidden lg:block perspective-1000"
        >
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotateZ: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 z-30 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Resolution Rate</p>
              <p className="text-xl font-black text-gray-900">98.5%</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], rotateZ: [0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 z-30 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-coral-500/30">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Response Time</p>
              <p className="text-xl font-black text-gray-900">&lt; 1s</p>
            </div>
          </motion.div>

          {/* Main Interface Mockup - Glassmorphism */}
          <div className="relative bg-white/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden aspect-[4/3] group transform-style-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/10"></div>
            
            {/* Mock Chat UI */}
            <div className="absolute inset-6 bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-inner flex flex-col overflow-hidden transform translate-z-10">
              {/* Header */}
              <div className="h-16 border-b border-gray-100/50 flex items-center px-6 justify-between bg-white/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white shadow-md">
                      <MessageSquare size={18} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">AI Assistant</p>
                    <p className="text-xs text-gray-500 font-medium">Typically replies instantly</p>
                  </div>
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 p-6 space-y-6 overflow-hidden bg-gray-50/30">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">AI</div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none p-4 text-sm text-gray-700 max-w-[80%] leading-relaxed">
                    Hi there! 👋 I'm your new AI assistant. How can I help you scale your business today?
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                  className="flex gap-4 flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">U</div>
                  <div className="bg-gray-900 text-white shadow-md rounded-2xl rounded-tr-none p-4 text-sm max-w-[80%] leading-relaxed">
                    Can you integrate with our existing CRM and handle refund requests automatically?
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">AI</div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none p-4 text-sm text-gray-700 max-w-[80%] leading-relaxed">
                    Absolutely! I can connect to Salesforce, HubSpot, and Zendesk. I'll process refunds instantly based on your custom rules. 🚀
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="h-20 border-t border-gray-100/50 p-4 flex items-center gap-3 bg-white/50">
                <div className="flex-1 h-12 bg-white rounded-full border border-gray-200 shadow-inner flex items-center px-4">
                  <span className="text-gray-400 text-sm">Type your message...</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-900 hover:bg-coral-500 transition-colors cursor-pointer flex items-center justify-center text-white shadow-md">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
