import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, Zap, Bot, Send, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Logo } from '../components/Logo';

function ChatBubble({ message, isBot, delay }: { message: string, isBot: boolean, delay: number, key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'} mb-4`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${isBot ? 'bg-coral-500 text-white' : 'bg-gray-800 text-white'}`}>
        {isBot ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${isBot
          ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
          : 'bg-gray-900 text-white rounded-tr-none shadow-md'
        }`}>
        {message}
      </div>
    </motion.div>
  );
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error.message);
      } else if (isLogin) {
        navigate('/dashboard');
      } else {
        setError('Account created! Check your email to confirm, then sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep(prev => (prev < 3 ? prev + 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const chatMessages = [
    { message: "Hi! I'm your AI assistant. Ready to build something amazing?", isBot: true },
    { message: "Definitely! Can you help me automate my customer support?", isBot: false },
    { message: "Absolutely. I can learn from your docs and reply instantly. 🚀", isBot: true },
    { message: "That sounds perfect. Let's get started!", isBot: false }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col lg:grid lg:grid-cols-2 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-coral-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px]" />
      </div>

      {/* Left Side: Animated Chatbot Interface (Desktop Only) */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative z-10 bg-white/30 backdrop-blur-sm border-r border-gray-100">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-50 border border-coral-200 text-coral-600 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Interactive Preview
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              Experience the power of <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-orange-500">Conversational AI</span>
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              Join thousands of teams using ChatLayer to automate their growth and delight customers.
            </p>
          </motion.div>

          {/* Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl overflow-hidden aspect-[4/5] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white shadow-md">
                    <Bot size={20} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">ChatLayer Bot</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Always Active</p>
                </div>
              </div>
              <Zap size={18} className="text-coral-500" />
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-hidden bg-gray-50/30">
              <AnimatePresence mode="wait">
                <div key={chatStep} className="h-full">
                  {chatMessages.slice(0, chatStep + 1).map((msg, i) => (
                    <ChatBubble key={i} message={msg.message} isBot={msg.isBot} delay={i * 0.2} />
                  ))}
                  {chatStep < 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 ml-11"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white/50 flex items-center gap-3">
              <div className="flex-1 h-10 bg-gray-50 rounded-full border border-gray-100 px-4 flex items-center">
                <span className="text-gray-400 text-xs">Type a message...</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-md">
                <Send size={16} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 p-10"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center mx-auto mb-6">
              <Logo className="w-16 h-16 rounded-2xl shadow-xl shadow-coral-200/50" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Sign in to continue building' : 'Create your free account today'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-sm font-medium border ${error.includes('Check your email')
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                  }`}
              >
                {error}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-coral-300 focus:ring-4 focus:ring-coral-100/50 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                  placeholder="John Doe"
                  required
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-coral-300 focus:ring-4 focus:ring-coral-100/50 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs font-bold text-coral-500 hover:text-coral-600">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-coral-300 focus:ring-4 focus:ring-coral-100/50 outline-none transition-all text-gray-900 placeholder:text-gray-400 pr-14 font-medium"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.01, boxShadow: "0 15px 35px -10px rgba(255, 115, 87, 0.4)" } : {}}
              whileTap={!isSubmitting ? { scale: 0.99 } : {}}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
              <span className="px-4 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <button className="w-full py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-coral-500 hover:text-coral-600 underline underline-offset-4"
            >
              {isLogin ? 'Sign up for free' : 'Sign in instead'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

