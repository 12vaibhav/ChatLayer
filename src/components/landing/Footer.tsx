import React, { useState, useEffect } from 'react';
import { Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../Logo';

export const Footer = ({ onSignup }: { onSignup?: () => void }) => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero (approx 600px)
      setShowStickyCTA(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <footer className="bg-[#FAFAFA] pt-20 pb-10 border-t border-gray-200 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-coral-100/50 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Logo className="h-7 w-auto" />
                <span className="font-black text-xl text-gray-900 tracking-tight">ChatLayer</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                Empowering small businesses with AI-driven customer support. Build better relationships, 24/7.
              </p>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white hover:bg-coral-500 hover:border-coral-500 transition-all duration-300">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6 tracking-wide">Product</h4>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'Integrations', 'Changelog', 'Docs'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 font-medium hover:text-coral-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 tracking-wide">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact', 'Privacy Policy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 font-medium hover:text-coral-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6 tracking-wide">Stay Updated</h4>
              <p className="text-gray-600 mb-4 text-sm font-medium">Get the latest updates and tips for your business.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500 transition-all shadow-sm"
                />
                <button className="bg-coral-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-coral-600 transition-colors shadow-lg shadow-coral-500/20">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm font-medium">© 2026 ChatLayer. All rights reserved.</p>
            <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
              Made with <span className="text-coral-500">♥</span> for small businesses
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/10 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="font-bold text-white tracking-wide">Ready to grow your business?</p>
                <p className="text-sm text-gray-400 font-medium">Start your 14-day free trial today.</p>
              </div>
              <button onClick={onSignup} className="w-full md:w-auto px-8 py-3 bg-coral-500 text-white font-bold rounded-xl shadow-lg shadow-coral-500/20 hover:bg-coral-400 transition-all flex items-center justify-center gap-2 group">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
