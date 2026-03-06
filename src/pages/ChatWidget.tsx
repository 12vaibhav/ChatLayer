import React, { useState, useRef, useEffect } from 'react';
import { Send, X, User, Bot, Frown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Parse query params from URL
function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        botId: params.get('bot_id') || '',
        color: params.get('color') || '#FF7357',
        theme: params.get('theme') || 'light',
        welcome: params.get('welcome') || 'Hi there! 👋 How can I help you today?',
        name: params.get('name') || 'ChatLayer Bot',
        avatar: params.get('avatar') || '',
        template: params.get('template') || 'classic',
    };
}

interface Message {
    id: number;
    sender: 'user' | 'bot' | 'system' | 'agent';
    text: string;
    timestamp: Date;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function ChatWidget() {
    const config = getParams();
    const isDark = config.theme === 'dark';
    const [messages, setMessages] = useState<Message[]>([
        { id: 0, sender: 'bot', text: config.welcome, timestamp: new Date() },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isHandoff, setIsHandoff] = useState(false);
    const [isAgentJoined, setIsAgentJoined] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const hasNotifiedHandoff = useRef(false);
    const hasNotifiedAgentJoin = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversationId) return;

        // 1. Listen for new messages (Agent replies)
        const msgSubscription = supabase
            .channel(`widget-chat-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload: any) => {
                // Only add if it's from an agent or bot (user messages are added optimistically)
                if (payload.new.sender !== 'user') {
                    const text = payload.new.text;
                    const sender = payload.new.sender;

                    // Detect agent join from agent message OR system message
                    if ((sender === 'agent' || (sender === 'system' && text.includes('accepted'))) && !hasNotifiedAgentJoin.current) {
                        hasNotifiedAgentJoin.current = true;
                        setIsAgentJoined(true);
                        setIsHandoff(true);
                    }

                    // Detect handoff from system message
                    if (sender === 'system' && text.includes('requested') && !hasNotifiedHandoff.current) {
                        hasNotifiedHandoff.current = true;
                        setIsHandoff(true);
                    }

                    setMessages(prev => {
                        if (prev.some(m => m.id === payload.new.id)) return prev;

                        // Prevent duplicating system notification messages if we already generated them locally
                        if (sender === 'system') {
                            if (text.includes('accepted') && prev.some(m => m.text.includes('accepted'))) return prev;
                            if (text.includes('requested') && prev.some(m => m.text.includes('notified'))) return prev;
                        }

                        return [...prev, {
                            id: payload.new.id,
                            sender: sender as any,
                            text: text,
                            timestamp: new Date(payload.new.created_at)
                        }];
                    });
                }
            })
            .subscribe();

        // 2. Listen for conversation status changes (Handoff trigger)
        const convSubscription = supabase
            .channel(`widget-conv-${conversationId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'conversations',
                filter: `id=eq.${conversationId}`
            }, (payload: any) => {
                const isNowHandoff = payload.new.status === 'handoff';
                const wasNotHandoff = payload.old?.status ? payload.old.status !== 'handoff' : !isHandoff; // Fallback if payload.old is missing

                if (isNowHandoff && wasNotHandoff && !hasNotifiedHandoff.current) {
                    setIsHandoff(true);
                    hasNotifiedHandoff.current = true;
                    setMessages(prev => {
                        // Avoid duplicates if the DB already sent it
                        if (prev.some(m => m.sender === 'system' && m.text.includes('notified'))) return prev;
                        return [...prev, { id: Date.now(), sender: 'system', text: '🔔 A human agent has been notified and will join shortly.', timestamp: new Date() }];
                    });
                } else if (isNowHandoff) {
                    setIsHandoff(true);
                }

                const isNowJoined = payload.new.status === 'joined';
                const wasNotJoined = payload.old?.status ? payload.old.status !== 'joined' : !isAgentJoined;

                if (isNowJoined && wasNotJoined && !hasNotifiedAgentJoin.current) {
                    setIsAgentJoined(true);
                    setIsHandoff(true);
                    hasNotifiedAgentJoin.current = true;
                    // Push local notification so the user sees it immediately without waiting for messages REALTIME
                    setMessages(prev => {
                        if (prev.some(m => m.sender === 'system' && m.text.includes('accepted'))) return prev;
                        return [...prev, { id: Date.now(), sender: 'system', text: '👤 A human agent has accepted the request and joined the chat.', timestamp: new Date() }];
                    });
                } else if (isNowJoined) {
                    setIsAgentJoined(true);
                    setIsHandoff(true);
                }
            })
            .subscribe();

        // 3. Load initial state for this conversation
        const loadChatHistory = async () => {
            const { data: conv } = await supabase
                .from('conversations')
                .select('status')
                .eq('id', conversationId)
                .single();

            if (conv) {
                if (conv.status === 'handoff' || conv.status === 'joined') {
                    setIsHandoff(true);
                    if (conv.status === 'joined') setIsAgentJoined(true);
                }
            }

            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (msgs) {
                const formattedMsgs: Message[] = msgs.map(m => ({
                    id: m.id,
                    sender: m.sender as any,
                    text: m.text,
                    timestamp: new Date(m.created_at)
                }));

                setMessages(prev => {
                    // Combine with welcome message and any local messages
                    const welcome = prev.filter(m => m.id === 0);
                    const existingIds = new Set(formattedMsgs.map(m => m.id));
                    const localOnly = prev.filter(m => m.sender === 'user' && !existingIds.has(m.id));
                    return [...welcome, ...formattedMsgs, ...localOnly];
                });

                // Set notification flags if messages already exist
                if (formattedMsgs.some(m => m.sender === 'system' && m.text.includes('requested'))) {
                    hasNotifiedHandoff.current = true;
                }
                if (formattedMsgs.some(m => (m.sender === 'agent' || (m.sender === 'system' && m.text.includes('accepted'))))) {
                    hasNotifiedAgentJoin.current = true;
                }
            }
        };

        loadChatHistory();

        return () => {
            supabase.removeChannel(msgSubscription);
            supabase.removeChannel(convSubscription);
        };
    }, [conversationId]);

    // Notify parent iframe to close
    const handleClose = () => {
        window.parent.postMessage({ type: 'chatlayer-close' }, '*');
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setInput('');

        const newMsg: Message = {
            id: Date.now(),
            sender: 'user',
            text: userMsg,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMsg]);
        setIsLoading(true);

        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bot_id: parseInt(config.botId),
                    conversation_id: conversationId,
                    message: userMsg,
                }),
            });

            const data = await res.json();

            if (data.conversation_id && !conversationId) {
                setConversationId(data.conversation_id);
            }

            if (data.handoff) {
                setIsHandoff(true);
                // We don't add the system message locally here anymore 
                // because the Edge Function inserts it into the DB, 
                // and we'll receive it via the Realtime subscription.
                if (data.reply) {
                    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot' as const, text: data.reply, timestamp: new Date() }]);
                }
            } else if (data.reply) {
                if (data.handoff) setIsHandoff(true);
                setMessages(prev => [
                    ...prev,
                    { id: Date.now() + 1, sender: 'bot', text: data.reply, timestamp: new Date() },
                ]);
            } else if (data.handoff) {
                setIsHandoff(true);
            }
        } catch {
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, sender: 'bot', text: "I'm having trouble connecting. Please try again.", timestamp: new Date() },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTalkToHuman = async () => {
        setInput('');
        const msg: Message = {
            id: Date.now(),
            sender: 'user',
            text: 'I would like to talk to a human agent please.',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, msg]);
        setIsLoading(true);

        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bot_id: parseInt(config.botId),
                    conversation_id: conversationId,
                    message: 'I would like to talk to a human agent please.',
                }),
            });
            const data = await res.json();
            if (data.conversation_id && !conversationId) setConversationId(data.conversation_id);
            setIsHandoff(true);
            hasNotifiedHandoff.current = true;
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, sender: 'bot', text: data.reply, timestamp: new Date() },
                { id: Date.now() + 2, sender: 'system', text: '🔔 A human agent has been notified and will join shortly.', timestamp: new Date() },
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, sender: 'system', text: 'Unable to connect. Please try again.', timestamp: new Date() },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 shrink-0"
                style={{ backgroundColor: config.color }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {config.avatar ? (
                            <img src={config.avatar} alt="Bot" className="w-full h-full object-cover" />
                        ) : (
                            <Bot size={18} className="text-white" />
                        )}
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm">{config.name}</p>
                        <p className="text-white/70 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                            {isAgentJoined ? 'Agent joined' : isHandoff ? 'Connecting to agent...' : 'Online'}
                        </p>
                    </div>
                </div>
                <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors p-1">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {msg.sender !== 'system' && (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${msg.sender === 'user' ? 'bg-gray-700' : ''
                                }`} style={msg.sender === 'bot' ? { backgroundColor: config.color } : undefined}>
                                {msg.sender === 'user' ? <User size={14} /> : (
                                    config.avatar ? <img src={config.avatar} className="w-full h-full rounded-full object-cover" /> : <Bot size={14} />
                                )}
                            </div>
                        )}
                        <div className={`px-3 py-2 text-sm leading-relaxed ${msg.sender === 'system'
                            ? `text-center w-full text-xs font-medium px-4 py-2 rounded-lg ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`
                            : `max-w-[80%] ${msg.sender === 'user'
                                ? `rounded-2xl rounded-tr-sm text-white ${isDark ? 'bg-gray-700' : ''}`
                                : `rounded-2xl rounded-tl-sm ${isDark ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-white text-gray-700 border border-gray-100 shadow-sm'}`
                            }`}`} style={msg.sender === 'user' && !isDark ? { backgroundColor: config.color } : undefined}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: config.color }}>
                            <Bot size={14} />
                        </div>
                        <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100 shadow-sm'}`}>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Talk to Human button */}
            {!isHandoff && (
                <div className={`px-4 py-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button
                        onClick={handleTalkToHuman}
                        className={`w-full py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                    >
                        <Frown size={12} /> Talk to a Human
                    </button>
                </div>
            )}

            {/* Input */}
            <div className={`px-3 py-3 border-t shrink-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isHandoff ? 'Type message to agent...' : 'Type a message...'}
                        className={`flex-1 px-3 py-2 text-sm rounded-xl outline-none transition-all ${isDark
                            ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-1'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-gray-300'
                            }`}
                        style={{ focusRingColor: config.color } as any}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-2 rounded-xl text-white transition-all disabled:opacity-40"
                        style={{ backgroundColor: config.color }}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className={`text-center text-[9px] mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    Powered by <span className="font-semibold">ChatLayer</span>
                </p>
            </div>
        </div>
    );
}
