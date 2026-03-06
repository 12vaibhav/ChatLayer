import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const Navbar = ({ onLogin, onSignup }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <nav
        className={cn(
          "pointer-events-auto transition-all duration-500 rounded-full border",
          isScrolled 
            ? "bg-gradient-to-r from-white via-coral-50 to-orange-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-coral-200/50 py-3 px-6 w-full max-w-4xl" 
            : "bg-gradient-to-r from-white via-coral-50/50 to-orange-50/50 shadow-sm border-white/50 py-4 px-8 w-full max-w-6xl"
        )}
      >
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white shadow-md shadow-coral-400/30 group-hover:scale-105 transition-transform">
              <MessageSquare size={20} className="fill-current" />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">ChatLayer</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-full transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin} 
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Log In
            </button>
            <button 
              onClick={onSignup} 
              className="px-7 py-3 bg-gray-900 text-white text-sm font-bold rounded-full shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 bg-white/60 rounded-full border border-white/60 shadow-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-2xl border border-coral-100 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-6 space-y-3 flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-lg font-bold text-gray-800 hover:text-coral-500 px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <hr className="border-gray-100 my-2" />
                <button onClick={() => { onLogin(); setIsMobileMenuOpen(false); }} className="w-full py-3.5 text-gray-900 font-bold border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                  Log In
                </button>
                <button onClick={() => { onSignup(); setIsMobileMenuOpen(false); }} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl shadow-md hover:bg-gray-800 transition-colors">
                  Get Started Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};
