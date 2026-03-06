import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Clock,
  Send,
  User,
  Bot,
  Info,
  Trash2,
  UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  status: string;
  satisfaction: string;
  last_message_at: string;
  lastMessage?: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  created_at: string;
}

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

export default function Conversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();

      // Subscribe to conversation updates (for sidebar status/timestamp updates)
      const convSubscription = supabase
        .channel('conversations-list')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations'
        }, (payload) => {
          fetchConversations();
          // Update activeChat if it's the one that changed, using functional update to avoid stale closure
          setActiveChat(prev => {
            if (prev && payload.new && (payload.new as any).id === prev.id) {
              return { ...prev, ...(payload.new as any) };
            }
            return prev;
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(convSubscription);
      };
    }
  }, [user, activeChat?.id]);

  useEffect(() => {
    if (!activeChat) return;

    // Load initial messages
    loadMessages(activeChat.id);

    // Subscribe to new messages for the current conversation
    const msgSubscription = supabase
      .channel(`chat-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeChat.id}`
      }, (payload) => {
        setMessages(prev => {
          // Prevent duplicates if the message was already added locally
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgSubscription);
    };
  }, [activeChat?.id]);

  async function fetchConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .in('status', ['handoff', 'joined'])
      .order('last_message_at', { ascending: false })
      .limit(50);
    if (data) {
      setConversations(data);
      // Auto-select first chat if none selected
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      }
    }
  }

  async function loadMessages(conversationId: string) {
    setLoadingMessages(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
    setLoadingMessages(false);
  }

  const handleSelectChat = (chat: Conversation) => {
    setActiveChat(chat);
  };

  const filteredConversations = conversations.filter(chat =>
    (chat.visitor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.visitor_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;
    const text = message.trim();
    setMessage('');

    // Insert as agent message
    const { data: newMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: activeChat.id, sender: 'agent', text })
      .select()
      .single();
    if (newMsg) setMessages(prev => [...prev, newMsg]);

    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeChat.id);
  };

  const handleTakeOver = async () => {
    if (!activeChat) return;
    console.log('Taking over conversation:', activeChat.id);
    const { error } = await supabase.from('conversations').update({ status: 'joined' }).eq('id', activeChat.id);

    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to accept request: ' + error.message);
      return;
    }

    console.log('Status updated to joined');
    // Insert system message for the chat interface
    const { data: systemMsg, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeChat.id,
        sender: 'system',
        text: '👤 A human agent has accepted the request and joined the chat.'
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error sending system message:', msgError);
    }

    if (systemMsg) {
      setMessages(prev => [...prev, systemMsg]);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setActiveChat(prev => prev ? { ...prev, status: 'joined' } : prev);
    setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, status: 'joined' } : c));
  };

  const handleDeleteConversation = async () => {
    if (!activeChat) return;

    if (!window.confirm('Are you sure you want to clear this conversation? All messages will be permanently deleted.')) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', activeChat.id);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== activeChat.id));
      setActiveChat(null);
      setMessages([]);
    } catch (err: any) {
      alert('Failed to delete conversation: ' + err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (conversations.length === 0) return;
    if (!window.confirm(`Are you sure you want to clear ALL ${conversations.length} handoff conversations? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('status', 'handoff');

      if (error) throw error;

      setConversations([]);
      setActiveChat(null);
      setMessages([]);
    } catch (err: any) {
      alert('Failed to delete conversations: ' + err.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 max-w-[1400px] mx-auto">
      {/* List Panel */}
      <div className="w-[380px] flex-shrink-0 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-gray-200/40 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-10"></div>

        <div className="p-6 pb-4 relative z-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inbox</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">{conversations.length} conversations</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAll}
                title="Clear All Conversations"
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-red-500 hover:shadow-md transition-all border border-gray-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-coral-500 hover:shadow-md hover:shadow-coral-500/10 transition-all border ${isFilterOpen ? 'border-coral-500 text-coral-500' : 'border-gray-100'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-coral-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-gray-200/60 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-coral-500/10 focus:border-coral-500 focus:bg-white transition-all outline-none shadow-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 relative z-0 scrollbar-hide">
          {filteredConversations.map((chat) => (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${activeChat?.id === chat.id
                ? 'bg-white border-coral-500/20 shadow-md shadow-coral-500/5 ring-1 ring-coral-500/10'
                : 'bg-transparent border-transparent hover:bg-white/50 hover:border-gray-200/50'
                }`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border-2 border-white shadow-sm">
                    {(chat.visitor_name || 'V').charAt(0)}
                  </div>
                  {chat.status === 'active' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  )}
                  {chat.status === 'handoff' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm truncate pr-2 ${activeChat?.id === chat.id ? 'text-gray-900' : 'text-gray-700'}`}>
                      {chat.visitor_name || chat.visitor_email || 'Visitor'}
                    </h3>
                    <span className={`text-[11px] font-semibold whitespace-nowrap ${activeChat?.id === chat.id ? 'text-coral-500' : 'text-gray-400'}`}>
                      {chat.last_message_at ? timeAgo(chat.last_message_at) : ''}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-1 mb-2 ${activeChat?.id === chat.id ? 'text-gray-600' : 'text-gray-500'}`}>
                    {chat.visitor_email || ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${chat.status === 'active' ? 'bg-green-50 text-green-600 border-green-200/50' :
                      chat.status === 'handoff' ? 'bg-orange-50 text-orange-600 border-orange-200/50' :
                        chat.status === 'joined' ? 'bg-green-50 text-green-700 border-green-300' :
                          'bg-gray-100/50 text-gray-500 border-gray-200/50'
                      }`}>
                      {chat.status === 'handoff' ? 'Request' : chat.status}
                    </span>
                    {chat.satisfaction === 'good' && <ThumbsUp className="w-3.5 h-3.5 text-green-500" />}
                    {chat.satisfaction === 'bad' && <ThumbsDown className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Detail Panel */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-gray-200/40 flex flex-col overflow-hidden relative">
        {/* Header */}
        {activeChat ? (
          <>
            <div className="px-8 py-6 border-b border-gray-100/50 bg-white/50 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border-2 border-white shadow-sm text-xl">
                    {(activeChat.visitor_name || 'V').charAt(0)}
                  </div>
                  {activeChat.status === 'active' && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg tracking-tight">{activeChat.visitor_name || 'Visitor'}</h3>
                  <p className="text-sm text-gray-500 font-medium">{activeChat.visitor_email || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeChat.status === 'handoff' && (
                  <button
                    onClick={handleTakeOver}
                    className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all mr-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Accept Request
                  </button>
                )}
                <button
                  onClick={handleDeleteConversation}
                  title="Delete Conversation"
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-red-500 hover:shadow-md transition-all border border-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-gray-600 hover:shadow-md transition-all border border-gray-100">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#FAFAFA]/30 p-8 overflow-y-auto space-y-8 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

              <div className="flex justify-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 bg-white/80 backdrop-blur-sm border border-gray-100 px-4 py-1.5 rounded-full shadow-sm">
                  Today, 10:23 AM
                </span>
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : msg.sender === 'system' ? 'justify-center w-full' : ''}`}>
                  {msg.sender !== 'system' && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md border-2 border-white ${msg.sender === 'user' ? 'bg-gray-900' :
                      msg.sender === 'agent' ? 'bg-coral-500' : 'bg-gradient-to-br from-coral-400 to-coral-600'
                      }`}>
                      {msg.sender === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : msg.sender === 'agent' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                  )}

                  <div className={`space-y-2 ${msg.sender === 'system' ? 'w-full flex justify-center' : 'max-w-[75%]'}`}>
                    <div className={`shadow-sm border leading-relaxed overflow-hidden transition-all ${msg.sender === 'system'
                      ? 'bg-white border-gray-200 rounded-2xl w-full max-w-[400px] shadow-lg'
                      : msg.sender === 'user'
                        ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm shadow-md p-5 text-[15px]'
                        : 'bg-white text-gray-700 rounded-2xl rounded-tl-sm border-gray-100/50 p-5 text-[15px]'
                      }`}>

                      {msg.sender === 'system' ? (
                        <div className="flex flex-col">
                          {msg.text.includes('requested') ? (
                            <>
                              <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <UserPlus className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">Human Handoff Requested</h4>
                                <p className="text-sm text-gray-500">{msg.text.replace('🔔 ', '')}</p>
                              </div>

                              {activeChat.status === 'handoff' && (
                                <button
                                  onClick={handleTakeOver}
                                  className="w-full py-4 border-t border-gray-100 text-coral-600 font-bold text-sm hover:bg-gray-50 transition-colors uppercase tracking-widest cursor-pointer active:bg-gray-100"
                                >
                                  Accept Request
                                </button>
                              )}

                              {activeChat.status === 'joined' && (
                                <div className="w-full py-4 border-t border-gray-100 text-green-600 font-bold text-xs text-center uppercase tracking-widest bg-green-50/50">
                                  <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                                  Accepted
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="py-2.5 px-5 text-center bg-gray-50">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                {msg.text.includes('joined') && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                {msg.text.replace('👤 ', '')}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {msg.sender !== 'user' && msg.sender !== 'system' && (
                      <p className="text-[10px] text-gray-400 font-medium ml-1">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 z-10">
              <div className="relative flex items-end gap-3 bg-white border border-gray-200/80 rounded-3xl p-2 shadow-sm focus-within:ring-4 focus-within:ring-coral-500/10 focus-within:border-coral-500 transition-all">
                <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50 flex-shrink-0">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full max-h-32 min-h-[44px] py-3 bg-transparent text-[15px] focus:outline-none resize-none placeholder:text-gray-400"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`p-3 rounded-full text-white transition-all shadow-md shadow-coral-500/20 flex-shrink-0 ${message.trim() ? 'bg-coral-500 hover:bg-coral-600 hover:scale-105 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-3 px-2">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full inline-block mr-1 ${activeChat.status === 'handoff' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                  {activeChat.status === 'handoff' ? 'Human agent needed' : 'Agent has joined the chat'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to view messages</p>
          </div>
        )}

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none"
            >
              <div className="bg-coral-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border-4 border-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold tracking-wide uppercase text-xs">Chat Joined</span>
                  <span className="text-white/90 text-[11px] font-medium">You are now talking to the visitor</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
