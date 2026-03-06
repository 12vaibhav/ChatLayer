import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  CheckCircle2,
  Sparkles,
  Zap,
  Smile,
  Code,
  ArrowUpRight,
  MoreHorizontal,
  Calendar,
  ChevronRight,
  Palette,
  Globe,
  User,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- Mock Data ---
const chatData = [
  { day: 'Mon', chats: 24 },
  { day: 'Tue', chats: 45 },
  { day: 'Wed', chats: 32 },
  { day: 'Thu', chats: 65 },
  { day: 'Fri', chats: 48 },
  { day: 'Sat', chats: 15 },
  { day: 'Sun', chats: 10 },
];

const recentActivity = [
  { time: '10:00 am', title: 'New Bot Created', subtitle: 'Support Agent v1', icon: Bot, color: 'bg-blue-50 text-blue-600' },
  { time: '11:30 am', title: 'Integration Added', subtitle: 'Shopify Store', icon: Code, color: 'bg-purple-50 text-purple-600' },
  { time: '02:15 pm', title: 'High Traffic Alert', subtitle: '50+ concurrent chats', icon: Zap, color: 'bg-yellow-50 text-yellow-600' },
];

// --- Components ---

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalBots: 0, totalChats: 0, activeConvos: 0, satisfactionRate: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [botsRes, convosRes] = await Promise.all([
        supabase.from('bots').select('id, total_chats', { count: 'exact' }),
        supabase.from('conversations').select('id, satisfaction', { count: 'exact' }),
      ]);
      const totalBots = botsRes.count || 0;
      const totalChats = (botsRes.data || []).reduce((sum: number, b: any) => sum + (b.total_chats || 0), 0);
      const convos = convosRes.data || [];
      const activeConvos = convosRes.count || 0;
      const goodCount = convos.filter((c: any) => c.satisfaction === 'good').length;
      const satisfactionRate = convos.length > 0 ? Math.round((goodCount / convos.length) * 100) : 0;
      setStats({ totalBots, totalChats, activeConvos, satisfactionRate });
    })();
  }, [user]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-lg text-gray-500">Here's what's happening with your bots today.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bots/new')}
            className="flex items-center gap-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-coral-500/20 hover:shadow-coral-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            <span>Create New Bot</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-min">

        {/* 1. Setup Guide / Onboarding (Top Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 xl:col-span-4 bg-[#1F2937] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-gray-900/20 relative overflow-hidden"
        >
          {/* Dark Card Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
            <div>
              <h3 className="font-bold text-xl md:text-2xl mb-1">Setup Workflow Guide</h3>
              <p className="text-gray-400 text-sm">Complete these simple steps to launch your AI agent.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-xs text-gray-300 font-medium">Progress</span>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-coral-500 rounded-full shadow-[0_0_10px_rgba(255,115,87,0.5)]"></div>
              </div>
              <span className="text-xs font-bold text-coral-400">50%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {/* Step 1 */}
            <div
              onClick={() => navigate('/bots/new')}
              className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-coral-500"></div>
              <div className="w-10 h-10 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smile size={20} />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Pick a Personality</h4>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Choose friendly or professional vibe.</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-coral-500 text-white shadow-sm shadow-coral-500/20">Friendly</span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-400 border border-white/10">Professional</span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => navigate('/bots/new')}
              className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare size={20} />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Teach Your Bot</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Add FAQs or business info simply.</p>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => navigate('/bots/new')}
              className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette size={20} />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Style the Chat</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Match your brand colors effortlessly.</p>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => navigate('/bots/new')}
              className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code size={20} />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Add to Website</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Paste one code line — done!</p>
            </div>
          </div>
        </motion.div>

        {/* 2. Total Bots (Col 1) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/bots')}
          className="bg-white/70 backdrop-blur-md border border-gray-200/40 rounded-[2rem] p-6 shadow-lg shadow-gray-200/20 relative overflow-hidden group hover:border-coral-200 transition-colors flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
              <Bot size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100/50 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} /> +2
            </span>
          </div>
          <div>
            <p className="text-gray-500 font-medium text-sm">Total Bots</p>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight mt-1">{stats.totalBots}</h3>
          </div>
        </motion.div>

        {/* 3. Chats This Month (Col 2-3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/analytics')}
          className="bg-white/70 backdrop-blur-md border border-gray-200/40 rounded-[2rem] p-6 shadow-lg shadow-gray-200/20 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex flex-col xl:flex-row justify-between items-start mb-2 gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Chats This Month</h3>
              <p className="text-gray-500 text-sm">Total interactions across all bots</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalChats.toLocaleString()}</p>
              <p className="text-xs text-green-500 font-bold mt-1 flex items-center justify-end gap-1">
                <ArrowUpRight size={12} /> 12.5%
              </p>
            </div>
          </div>
          <div className="h-32 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatData}>
                <Tooltip
                  cursor={{ fill: 'rgba(255,115,87,0.05)' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', color: '#111827', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="chats" radius={[4, 4, 4, 4]}>
                  {chatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#FF7357' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. Satisfaction Rate (Col 1) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/analytics')}
          className="bg-white/70 backdrop-blur-md border border-gray-200/40 rounded-[2rem] p-6 shadow-lg shadow-gray-200/20 relative overflow-hidden flex flex-col items-center justify-center group cursor-pointer"
        >
          <div className="w-full flex justify-between items-center mb-4">
            <p className="text-gray-500 font-medium text-sm">Satisfaction Rate</p>
            <div className="p-2 bg-yellow-50 rounded-xl text-yellow-500">
              <Smile size={16} />
            </div>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-coral-400/20 blur-3xl rounded-full scale-75 animate-pulse"></div>

            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF7357" />
                  <stop offset="100%" stopColor="#FF4D4D" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="70" stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
              <circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,115,87,0.4)]" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">{stats.satisfactionRate}%</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-1">Positive</span>
            </div>
          </div>
        </motion.div>

        {/* 5. Active Now (Col 2-3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate('/conversations')}
          className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[2rem] p-6 shadow-lg shadow-gray-900/20 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <p className="text-gray-400 font-medium text-sm uppercase tracking-wider">Active Now</p>
              </div>
              <h3 className="text-5xl font-bold tracking-tight mt-2">{stats.activeConvos}</h3>
              <p className="text-gray-400 text-sm mt-2">Users interacting with your bots</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <Globe size={24} className="text-blue-400" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 relative z-10">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                  U{i + 1}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                +37
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/analytics'); }}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition-colors"
            >
              View Live Map
            </button>
          </div>
        </motion.div>

      </div>
    </>
  );
}
