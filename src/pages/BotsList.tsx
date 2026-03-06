import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MoreHorizontal, MessageCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

interface Bot {
  id: number;
  name: string;
  vibe: string;
  last_active: string;
  total_chats: number;
  status: string;
}

const VIBE_COLORS: Record<string, string> = {
  friendly: 'bg-blue-50 text-blue-600',
  professional: 'bg-purple-50 text-purple-600',
  sarcastic: 'bg-orange-50 text-orange-600',
  custom: 'bg-green-50 text-green-600',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BotsList() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchBots();
  }, [user]);

  async function fetchBots() {
    setLoading(true);
    const { data, error } = await supabase
      .from('bots')
      .select('id, name, vibe, last_active, total_chats, status')
      .order('created_at', { ascending: false });

    if (!error && data) setBots(data);
    setLoading(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (!error) setBots(bots.filter(bot => bot.id !== id));
    setOpenDropdownId(null);
  };

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/bots/${id}`);
  };

  const toggleDropdown = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Bots</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your AI assistants.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create New Card (Dark Theme) */}
          <Link to="/bots/new" className="group">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="h-full min-h-[240px] bg-[#1F2937] rounded-[2rem] flex flex-col items-center justify-center p-8 shadow-2xl shadow-gray-900/20 relative overflow-hidden group-hover:shadow-coral-900/20 transition-all border border-white/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-coral-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-coral-500/20 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/20 relative z-10">
                <Plus className="w-8 h-8 text-coral-400 group-hover:text-coral-300 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10 tracking-tight">Create New Bot</h3>
              <p className="text-sm text-gray-400 text-center relative z-10 max-w-[200px]">Start from scratch or use a pre-built template</p>
            </motion.div>
          </Link>

          <AnimatePresence>
            {bots.map((bot, index) => (
              <motion.div
                key={bot.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Link to={`/bots/${bot.id}`} className="block h-full">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-white/70 backdrop-blur-md border border-gray-200/40 rounded-[2rem] p-8 shadow-lg shadow-gray-200/20 hover:shadow-xl hover:shadow-gray-200/30 transition-all relative group h-full flex flex-col hover:border-coral-200/50"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${VIBE_COLORS[bot.vibe] || 'bg-gray-50 text-gray-600'}`}>
                          {bot.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg tracking-tight group-hover:text-coral-600 transition-colors">{bot.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF7AF] text-yellow-800 border border-yellow-100/50 shadow-sm capitalize">
                              {bot.vibe}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100/50 border border-gray-200/50">
                              <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{bot.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative" ref={openDropdownId === bot.id ? dropdownRef : null}>
                        <button
                          onClick={(e) => toggleDropdown(e, bot.id)}
                          className={`p-2 rounded-xl transition-colors z-20 relative ${openDropdownId === bot.id ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100/80 text-gray-400 hover:text-gray-600'}`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                          {openDropdownId === bot.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 overflow-hidden"
                            >
                              <button
                                onClick={(e) => handleEdit(e, bot.id)}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-coral-600 transition-colors flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" /> Edit Bot
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, bot.id)}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-6 pt-6 border-t border-gray-100/50">
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                          <MessageCircle className="w-3.5 h-3.5" /> Total Chats
                        </p>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">{bot.total_chats.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" /> Last Active
                        </p>
                        <p className="text-sm font-bold text-gray-700 mt-1">{timeAgo(bot.last_active)}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
