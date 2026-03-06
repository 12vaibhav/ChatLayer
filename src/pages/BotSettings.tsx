import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Sparkles,
  Database,
  Palette,
  MessageSquare,
  Save,
  Upload,
  FileText,
  Trash2,
  Send,
  X,
  Check,
  Monitor,
  Smartphone,
  ChevronDown,
  Search,
  AlertTriangle,
  Bell,
  Mail,
  Slack,
  Ticket,
  User,
  Bot,
  RefreshCw,
  Sliders,
  Sun,
  Moon,
  Zap,
  Globe,
  Link,
  Code,
  Copy,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const tabs = [
  { id: 'identity', label: 'Identity & Vibe', icon: Bot },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  { id: 'widget', label: 'Widget', icon: Palette },
  { id: 'handoff', label: 'Handoff', icon: MessageSquare },
  { id: 'embed', label: 'Embed on Site', icon: Code },
];

const vibes = [
  { id: 'friendly', name: 'Friendly 😊', description: 'Warm, approachable, and uses emojis.', sample: "Hi there! 👋 How can I help you today?" },
  { id: 'professional', name: 'Professional 👔', description: 'Concise, formal, and business-oriented.', sample: "Hello. How may I assist you with your inquiry?" },
  { id: 'sarcastic', name: 'Sarcastic 😂', description: 'Witty, dry, and a bit cheeky.', sample: "Oh, look who decided to show up. What do you want?" },
  { id: 'custom', name: 'Custom ✨', description: 'Define your own unique personality.', sample: "Greetings, traveler! Await your command." },
];

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Scooter",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Precious",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Botty"
];

export default function BotSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewBot = !id || id === 'new';
  const [botId, setBotId] = useState<number | null>(isNewBot ? null : Number(id));

  const [activeTab, setActiveTab] = useState('identity');
  const [primaryColor, setPrimaryColor] = useState('#FF7357');
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! 👋 How can I help you today?");
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // General State
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [botAvatar, setBotAvatar] = useState('https://api.dicebear.com/9.x/avataaars/svg?seed=Felix');

  // Vibe State
  const [selectedVibe, setSelectedVibe] = useState(vibes[0]);
  const [customVibePrompt, setCustomVibePrompt] = useState('');

  // Knowledge State
  const [chunkSize, setChunkSize] = useState(500);
  const [showAdvancedChunking, setShowAdvancedChunking] = useState(false);

  // Handoff State
  const [angerThreshold, setAngerThreshold] = useState(70);
  const [handoffAction, setHandoffAction] = useState('email');
  const [handoffEmail, setHandoffEmail] = useState('');
  const [collectEmail, setCollectEmail] = useState(true);
  const [realTimeAlerts, setRealTimeAlerts] = useState(false);

  // Mobile Optimization
  const [mobileOptimized, setMobileOptimized] = useState(true);
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [widgetPosition, setWidgetPosition] = useState<'left' | 'right'>('right');
  const [launcherText, setLauncherText] = useState('Chat with us');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [hasCustomizedWidget, setHasCustomizedWidget] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingBot, setLoadingBot] = useState(!isNewBot);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // --- Optimization: Debounce Preview Data ---
  const [previewData, setPreviewData] = useState({
    name: botName,
    avatar: botAvatar,
    color: primaryColor,
    theme: widgetTheme,
    template: selectedTemplate,
    welcome: welcomeMessage,
    position: widgetPosition,
    launcher: launcherText
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewData({
        name: botName,
        avatar: botAvatar,
        color: primaryColor,
        theme: widgetTheme,
        template: selectedTemplate,
        welcome: welcomeMessage,
        position: widgetPosition,
        launcher: launcherText
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [botName, botAvatar, primaryColor, widgetTheme, selectedTemplate, welcomeMessage, widgetPosition, launcherText]);

  // Load existing bot data when editing
  useEffect(() => {
    if (!isNewBot && botId && user) {
      loadBotData();
    }
  }, [isNewBot, botId, user]);

  const loadBotData = async () => {
    setLoadingBot(true);
    try {
      // Load Bot Settings
      const { data: bot, error: botError } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

      if (botError) throw botError;

      if (bot) {
        setBotName(bot.name || '');
        setBotDescription(bot.description || '');
        setBotAvatar(bot.avatar_url || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix');
        const matchedVibe = vibes.find(v => v.id === bot.vibe) || vibes[0];
        setSelectedVibe(matchedVibe);
        setCustomVibePrompt(bot.custom_prompt || '');
        setPrimaryColor(bot.widget_primary_color || '#FF7357');
        setWidgetTheme(bot.widget_theme || 'light');
        setWelcomeMessage(bot.widget_welcome_message || "Hi there! 👋 How can I help you today?");
        setSelectedTemplate(bot.widget_template || 'classic');
        setAngerThreshold(bot.handoff_anger_threshold ?? 70);
        setHandoffAction(bot.handoff_action || 'email');
        setHandoffEmail(bot.handoff_target_email || '');
        setCollectEmail(bot.handoff_collect_email ?? true);
        setRealTimeAlerts(bot.handoff_alerts_enabled ?? false);
        setWidgetPosition(bot.widget_position || 'right');
        setMobileOptimized(bot.widget_mobile_optimized ?? true);
        setLauncherText(bot.widget_launcher_text || 'Chat with us');

        // Mark UI-driven states as complete since the bot exists
        setHasCustomizedWidget(true);
        setHasCopiedCode(true);
      }

      // Load Knowledge Sources
      const { data: sources, error: sourcesError } = await supabase
        .from('knowledge_sources')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false });

      if (sourcesError) throw sourcesError;

      if (sources) {
        setKnowledgeSources(sources.map(s => ({
          id: s.id,
          name: s.source_name,
          type: s.type,
          size: s.metadata?.size || 'N/A',
          date: new Date(s.created_at).toLocaleDateString()
        })));
      }
    } catch (err: any) {
      console.error('Error loading bot data:', err);
    } finally {
      setLoadingBot(false);
    }
  };

  const templates = [
    { id: 'classic', name: 'Classic', description: 'Timeless and reliable.', icon: MessageSquare },
    { id: 'modern', name: 'Modern', description: 'Sleek, rounded, and fresh.', icon: Sparkles },
    { id: 'minimal', name: 'Minimal', description: 'Clean and distraction-free.', icon: FileText },
    { id: 'bold', name: 'Bold', description: 'High contrast and confident.', icon: Zap },
  ];

  const handleVibeSelect = (vibe: typeof vibes[0]) => {
    setSelectedVibe(vibe);
    if (vibe.id !== 'custom') {
      // Update preview message based on vibe
      setWelcomeMessage(vibe.sample);
    }
  };

  const steps = [
    { id: 'identity', label: 'Identity', description: 'Name & Personality', isComplete: botName.length > 3 && botDescription.length > 5 },
    { id: 'knowledge', label: 'Knowledge', description: 'Training Data', isComplete: knowledgeSources.length > 0 },
    { id: 'widget', label: 'Widget', description: 'Look & Feel', isComplete: hasCustomizedWidget },
    { id: 'handoff', label: 'Handoff', description: 'Human Support', isComplete: handoffEmail.length > 0 || realTimeAlerts },
    { id: 'embed', label: 'Integration', description: 'Go Live', isComplete: hasCopiedCode },
  ];

  const completedStepsCount = steps.filter(s => s.isComplete).length;
  const progressPercentage = (completedStepsCount / steps.length) * 100;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bot-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bot-assets')
        .getPublicUrl(filePath);

      setBotAvatar(publicUrl);
      setHasCustomizedWidget(true);
      alert("Avatar uploaded successfully!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleNextTab = async () => {
    // Proactively save when moving between steps
    await handleSave();

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleSave = async () => {
    if (!user) return false;
    setIsSaving(true);
    setIsSaved(false);

    const botData = {
      user_id: user.id,
      name: botName || 'Untitled Bot',
      description: botDescription,
      vibe: selectedVibe.id,
      custom_prompt: customVibePrompt,
      avatar_url: botAvatar,
      widget_primary_color: primaryColor,
      widget_theme: widgetTheme,
      widget_welcome_message: welcomeMessage,
      widget_template: selectedTemplate,
      handoff_anger_threshold: angerThreshold,
      handoff_action: handoffAction,
      handoff_target_email: handoffEmail,
      handoff_collect_email: collectEmail,
      handoff_alerts_enabled: realTimeAlerts,
      widget_position: widgetPosition,
      widget_mobile_optimized: mobileOptimized,
      widget_launcher_text: launcherText,
      updated_at: new Date().toISOString(),
    };

    try {
      if (botId) {
        // Update existing bot
        const { error } = await supabase
          .from('bots')
          .update(botData)
          .eq('id', botId);
        if (error) throw error;

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        return botId;
      } else {
        // Create new bot
        const { data, error } = await supabase
          .from('bots')
          .insert(botData)
          .select('id')
          .single();
        if (error) throw error;
        if (data) {
          setBotId(data.id);
          // Update URL without full refresh to preserve state but reflect existence
          window.history.replaceState(null, '', `/bots/${data.id}`);

          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
          return data.id;
        }
      }
      return null;
    } catch (err: any) {
      console.error('Failed to save bot:', err);
      alert(`Failed to save bot: ${err?.message || JSON.stringify(err)}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB allowed.");
      return;
    }

    setIsExtracting(true);
    try {
      let currentBotId = botId;
      if (!currentBotId) {
        const savedBotId = await handleSave();
        if (!savedBotId) throw new Error("Please save bot identity first");
        currentBotId = savedBotId as number;
      }

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const content = await base64Promise;

      const { data, error } = await supabase.functions.invoke('embed-knowledge', {
        body: {
          bot_id: currentBotId,
          user_id: user.id,
          source_type: 'file',
          source_name: file.name,
          file_content: content,
          file_type: file.type
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.source) {
        const newSource = {
          id: data.source.id,
          name: data.source.source_name,
          size: data.source.metadata?.size || 'N/A',
          date: 'Just now',
          type: 'file'
        };
        setKnowledgeSources([newSource, ...knowledgeSources]);
        alert("File uploaded and processed successfully!");
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasteText = async () => {
    if (!pastedText.trim() || !user) return;

    setIsExtracting(true);
    try {
      let currentBotId = botId;
      if (!currentBotId) {
        const savedBotId = await handleSave();
        if (!savedBotId) throw new Error("Please save bot identity first");
        currentBotId = savedBotId as number;
      }

      const { data, error } = await supabase.functions.invoke('embed-knowledge', {
        body: {
          bot_id: currentBotId,
          user_id: user.id,
          source_type: 'text',
          source_name: `Pasted Content (${new Date().toLocaleTimeString()})`,
          text_content: pastedText
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.source) {
        const newSource = {
          id: data.source.id,
          name: data.source.source_name,
          size: data.source.metadata?.size || 'N/A',
          date: 'Just now',
          type: 'text'
        };
        setKnowledgeSources([newSource, ...knowledgeSources]);
        setPastedText('');
        alert("Text processed successfully!");
      }
    } catch (err: any) {
      console.error("Processing failed:", err);
      alert(`Processing failed: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bot Configuration & Training</h1>
          <p className="text-gray-500 mt-1">Configure your AI assistant's behavior and appearance.</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            whileHover={!isSaving ? { scale: 1.05 } : {}}
            whileTap={!isSaving ? { scale: 0.95 } : {}}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all ${isSaved
              ? 'bg-green-500 text-white shadow-green-500/20'
              : 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200'
              }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Settings Area */}
      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* Main Settings Area (Left Pane) */}
        <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-md rounded-[2rem] border border-gray-200/40 shadow-lg shadow-gray-200/20 overflow-hidden">
          {/* Integrated Progress Stepper Tab Bar */}
          <div className="px-8 py-6 bg-white/50 border-b border-gray-100/50 relative">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
              {/* Progress Line Background */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[3px] bg-gray-100 rounded-full"></div>

              {/* Active Progress Line */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] bg-gradient-to-r from-[#FF7357] to-orange-400 rounded-full shadow-[0_0_20px_rgba(255,115,87,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${((tabs.findIndex(t => t.id === activeTab)) / (tabs.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />

              {tabs.map((tab, index) => {
                const step = steps.find(s => s.id === tab.id);
                const isComplete = step?.isComplete;
                const isActive = activeTab === tab.id;
                const isPast = tabs.findIndex(t => t.id === activeTab) > index;

                return (
                  <div key={tab.id} className="relative z-10 flex items-center gap-6 group">
                    {/* Modern Editorial Step Number */}
                    <div className="relative flex items-center z-20">
                      <motion.span
                        animate={isActive ? { scale: 1.1, x: -2 } : { scale: 1, x: 0 }}
                        className={`text-2xl font-black italic transition-all duration-500 select-none tracking-tighter pr-1 ${isActive
                          ? 'text-transparent bg-clip-text bg-gradient-to-br from-coral-500 to-orange-600 opacity-100 drop-shadow-sm'
                          : isPast
                            ? 'text-gray-900 opacity-10'
                            : 'text-gray-200 opacity-30'
                          }`}
                      >
                        0{index + 1}
                      </motion.span>

                      {/* Subtle vertical line accent for active step */}
                      {isActive && (
                        <motion.div
                          layoutId="activeStepAccent"
                          className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-coral-500 rounded-full shadow-[0_0_10px_rgba(255,115,87,0.5)]"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 20 }}
                        />
                      )}
                    </div>

                    {/* Icon Container */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 relative z-10 ${isActive
                        ? 'bg-white border-coral-500 text-coral-500 ring-4 ring-coral-50/50'
                        : isComplete || isPast
                          ? 'bg-coral-500 border-coral-500 text-white'
                          : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'
                        }`}
                    >
                      <motion.div
                        animate={isActive ? { y: [0, -2, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-20"
                      >
                        <tab.icon className="w-5 h-5" />
                      </motion.div>

                      {/* Modern Sharp Expanding Ring Effect (No Glow) */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                          className="absolute inset-0 border border-coral-500 rounded-2xl -z-10"
                        />
                      )}

                      {/* Completion Badge */}
                      {isComplete && !isActive && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                        >
                          <Check className="w-3 h-3 text-white stroke-[3px]" />
                        </motion.div>
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]/30 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <AnimatePresence mode="wait">

              {/* IDENTITY & VIBE TAB */}
              {activeTab === 'identity' && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-2">Bot Identity & Personality</h2>
                    <p className="text-gray-500 text-lg">Define who your bot is and how it speaks to your customers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bot Name</label>
                        <input
                          type="text"
                          value={botName}
                          onChange={(e) => setBotName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all"
                          placeholder="e.g. Support Bot"
                        />
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Description</label>
                        <textarea
                          value={botDescription}
                          onChange={(e) => setBotDescription(e.target.value)}
                          className="w-full h-[148px] px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all resize-none"
                          placeholder="What is this bot's purpose?"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-4">Personality Preset</label>
                        <div className="grid grid-cols-2 gap-3">
                          {vibes.map((vibe) => (
                            <button
                              key={vibe.id}
                              onClick={() => handleVibeSelect(vibe)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedVibe.id === vibe.id
                                ? 'border-[#FF7357] bg-[#FF7357]/5 ring-1 ring-[#FF7357]/20'
                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${selectedVibe.id === vibe.id ? 'bg-[#FF7357] text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {vibe.id === 'friendly' && '😊'}
                                {vibe.id === 'professional' && '👔'}
                                {vibe.id === 'sarcastic' && '😂'}
                                {vibe.id === 'custom' && '✨'}
                              </div>
                              <span className={`text-xs font-bold ${selectedVibe.id === vibe.id ? 'text-[#FF7357]' : 'text-gray-600'}`}>
                                {vibe.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-[#FF7357]/5 border border-[#FF7357]/10 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF7357]"></div>
                          <p className="text-[10px] font-bold text-[#FF7357] uppercase tracking-wider mb-1">Sample Response</p>
                          <p className="text-gray-700 text-sm italic">"{selectedVibe.sample}"</p>
                        </div>
                      </div>

                      {selectedVibe.id === 'custom' ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Custom System Prompt</label>
                          <textarea
                            value={customVibePrompt}
                            onChange={(e) => setCustomVibePrompt(e.target.value)}
                            className="w-full h-24 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all text-sm mb-3"
                            placeholder="Describe the bot's tone..."
                          />
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FF7357]/10 text-[#FF7357] rounded-lg hover:bg-[#FF7357]/20 transition-colors text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Refine
                          </button>
                        </motion.div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                          <Bot className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400">Select "Custom" to define a unique system prompt for your AI.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={handleNextTab}
                      className="flex-1 py-4 bg-[#FF7357] hover:bg-[#FF5833] text-white rounded-xl font-bold shadow-lg shadow-[#FF7357]/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      Next: Knowledge Base
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-6 py-4 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSaved
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <Check className="w-5 h-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* KNOWLEDGE BASE TAB */}
              {activeTab === 'knowledge' && (
                <motion.div
                  key="knowledge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-2">Teach Your Bot</h2>
                    <p className="text-gray-500 text-lg">Upload files or paste text so your bot knows your business inside out.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Upload */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                        isExtracting 
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                        : 'bg-white/50 border-gray-200 hover:bg-[#FF7357]/5 hover:border-[#FF7357]/30'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        disabled={isExtracting}
                      />
                      <div className="w-16 h-16 bg-[#FF7357]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {isExtracting ? (
                          <RefreshCw className="w-8 h-8 text-[#FF7357] animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-[#FF7357]" />
                        )}
                      </div>
                      <p className="text-gray-900 font-semibold mb-1 text-lg text-center">
                        {isExtracting ? 'Processing File...' : 'Drag files here or click to upload'}
                      </p>
                      <p className="text-sm text-gray-500">PDF, DOCX, TXT (Max 10MB)</p>
                    </div>

                    {/* Website URL Extractor */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Globe className="w-5 h-5 text-[#FF7357]" />
                          <label className="block text-sm font-semibold text-gray-700">Extract from Website</label>
                        </div>
                        <div className="relative mb-4">
                          <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all text-sm"
                            placeholder="https://example.com/faq"
                          />
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!websiteUrl || !user) return;
                          setIsExtracting(true);

                          try {
                            // 1. Ensure bot exists first
                            let currentBotId = botId;
                            if (!currentBotId) {
                              const savedBotId = await handleSave();
                              if (!savedBotId) throw new Error("Please save bot identity first");
                              currentBotId = savedBotId as number;
                            }

                            // 2. Trigger Edge Function which will scrape and insert
                            const { data, error: fnError } = await supabase.functions.invoke('embed-knowledge', {
                              body: {
                                bot_id: currentBotId,
                                user_id: user.id,
                                source_type: 'url',
                                source_name: websiteUrl.replace('https://', '').replace('http://', '').split('/')[0],
                                url: websiteUrl
                              }
                            });

                            if (fnError) throw fnError;
                            if (data?.error) throw new Error(data.error);

                            if (data?.source) {
                              // 3. Update UI
                              const newSource = {
                                id: data.source.id,
                                name: data.source.source_name + ' (Web)',
                                size: data.source.metadata?.size || 'N/A',
                                date: 'Just now',
                                type: data.source.type || 'url'
                              };
                              setKnowledgeSources([newSource, ...knowledgeSources]);
                              setWebsiteUrl('');
                              alert("Website extracted and knowledge stored successfully!");
                            }
                          } catch (err: any) {
                            console.error("Extraction failed:", err);
                            alert(`Extraction failed: ${err.message}`);
                          } finally {
                            setIsExtracting(false);
                          }
                        }}
                        disabled={isExtracting || !websiteUrl}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isExtracting || !websiteUrl
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#FF7357] text-white shadow-lg shadow-coral-500/20 hover:scale-[1.02]'
                          }`}
                      >
                        {isExtracting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            Extract
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-400 mt-3 text-center">We'll crawl the page and extract text content for your bot.</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Text Content</label>
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all text-sm mb-3 resize-none"
                      placeholder="Paste FAQs, policies, or other text here..."
                      disabled={isExtracting}
                    />
                    <button 
                      onClick={handlePasteText}
                      disabled={isExtracting || !pastedText.trim()}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                        isExtracting || !pastedText.trim()
                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'border-[#FF7357] text-[#FF7357] hover:bg-[#FF7357]/5'
                      }`}
                    >
                      {isExtracting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      Split into Chunks
                    </button>
                  </div>



                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Knowledge Sources</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF7357]" />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#FF7357] transition-colors" title="Re-index">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {knowledgeSources.map((source) => (
                        <div key={source.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source.type === 'url' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                              }`}>
                              {source.type === 'url' ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{source.name}</p>
                              <p className="text-xs text-gray-400">{source.size === 'N/A' ? '' : `${source.size} • `}Uploaded {source.date}</p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('knowledge_sources')
                                  .delete()
                                  .eq('id', source.id);
                                if (error) throw error;
                                setKnowledgeSources(knowledgeSources.filter(s => s.id !== source.id));
                              } catch (err: any) {
                                alert(`Failed to delete: ${err.message}`);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => setShowAdvancedChunking(!showAdvancedChunking)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      <Sliders className="w-4 h-4" />
                      {showAdvancedChunking ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    </button>

                    {showAdvancedChunking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 bg-gray-50 p-6 rounded-xl"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Chunk Size ({chunkSize} tokens)
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="100"
                          value={chunkSize}
                          onChange={(e) => setChunkSize(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF7357]"
                        />
                        <p className="text-xs text-gray-500 mt-2">Smaller chunks allow for more precise retrieval but may lack context.</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      onClick={handleNextTab}
                      className="flex-1 py-4 bg-[#FF7357] hover:bg-[#FF5833] text-white rounded-xl font-bold shadow-lg shadow-[#FF7357]/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      Next: Widget Appearance
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-6 py-4 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSaved
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <Check className="w-5 h-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* WIDGET APPEARANCE TAB */}
              {activeTab === 'widget' && (
                <motion.div
                  key="widget"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-2">Customize Your Widget</h2>
                    <p className="text-gray-500 text-lg">Make the chat bubble fit your website perfectly.</p>
                  </div>

                  {/* Template Selection */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-900 mb-4">Design Template</label>
                    <div className="grid grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setHasCustomizedWidget(true);
                          }}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedTemplate === template.id
                            ? 'border-[#FF7357] bg-[#FF7357]/5 ring-1 ring-[#FF7357]/20'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${selectedTemplate === template.id ? 'bg-[#FF7357] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <template.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`font-semibold ${selectedTemplate === template.id ? 'text-[#FF7357]' : 'text-gray-900'}`}>{template.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme Selection Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <label className="block text-sm font-semibold text-gray-900 mb-4">Widget Theme</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setWidgetTheme('light');
                            setHasCustomizedWidget(true);
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${widgetTheme === 'light'
                            ? 'border-[#FF7357] bg-[#FF7357]/5 text-[#FF7357]'
                            : 'border-gray-100 hover:border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          <Sun className="w-6 h-6" />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                        <button
                          onClick={() => {
                            setWidgetTheme('dark');
                            setHasCustomizedWidget(true);
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${widgetTheme === 'dark'
                            ? 'border-[#FF7357] bg-gray-900 text-white'
                            : 'border-gray-100 hover:border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          <Moon className="w-6 h-6" />
                          <span className="text-sm font-medium">Dark</span>
                        </button>
                      </div>
                    </div>

                    {/* Brand Color Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-gray-900">Brand Color</label>
                        <div className="w-6 h-6 rounded-full border border-gray-200 shadow-inner ring-2 ring-white" style={{ backgroundColor: primaryColor }}></div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          {['#FF7357', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'].map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setPrimaryColor(color);
                                setHasCustomizedWidget(true);
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === color ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-110 hover:shadow-sm'}`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                          <div className="relative group/picker">
                            <input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => {
                                setPrimaryColor(e.target.value);
                                setHasCustomizedWidget(true);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors group-hover/picker:border-[#FF7357] group-hover/picker:text-[#FF7357]">
                              <Sliders className="w-3.5 h-3.5 text-gray-400 group-hover/picker:text-[#FF7357] transition-colors" />
                            </button>
                          </div>
                        </div>

                        <div className="relative group/input">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-mono text-sm">#</span>
                          </div>
                          <input
                            type="text"
                            value={primaryColor.replace('#', '')}
                            onChange={(e) => {
                              setPrimaryColor(`#${e.target.value}`);
                              setHasCustomizedWidget(true);
                            }}
                            className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-medium text-gray-700 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all group-hover/input:bg-white"
                            placeholder="HEX Code"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Bot Avatar Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <label className="block text-sm font-semibold text-gray-900 mb-4">Bot Avatar</label>
                      <div className="flex items-start gap-5">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                          <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-[#FF7357] transition-colors relative">
                            <img src={botAvatar} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all" />
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full ring-2 ring-white"></div>
                          </div>
                        </div>

                        <div className="flex-1 space-y-3">
                          <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => document.getElementById('avatar-upload')?.click()}
                              className="flex-1 px-4 py-2 bg-white border border-gray-200 hover:border-[#FF7357] hover:text-[#FF7357] text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                              Upload Image
                            </button>
                            <button
                              onClick={() => {
                                setBotAvatar(DEFAULT_AVATARS[0]);
                                setHasCustomizedWidget(true);
                              }}
                              className="px-3 py-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg border border-transparent hover:border-red-100 transition-colors active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Default Avatars</p>
                            <div className="flex gap-2">
                              {DEFAULT_AVATARS.map((avatar, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setBotAvatar(avatar);
                                    setHasCustomizedWidget(true);
                                  }}
                                  className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all ${botAvatar === avatar ? 'border-[#FF7357] ring-2 ring-[#FF7357]/20 scale-110' : 'border-gray-100 hover:border-gray-300 hover:scale-105'}`}
                                  title={`Select Avatar ${index + 1}`}
                                >
                                  <img src={avatar} className="w-full h-full object-cover bg-gray-50" alt={`Avatar ${index + 1}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 leading-relaxed mt-1">
                            Recommended size: 200x200px. <br />
                            Supports PNG, JPG, GIF.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Welcome Message</label>
                    <textarea
                      value={welcomeMessage}
                      onChange={(e) => {
                        setWelcomeMessage(e.target.value);
                        setHasCustomizedWidget(true);
                      }}
                      className="w-full h-24 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Launcher Button Text</label>
                    <input
                      type="text"
                      value={launcherText}
                      onChange={(e) => {
                        setLauncherText(e.target.value);
                        setHasCustomizedWidget(true);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none transition-all text-sm"
                      placeholder="e.g. Chat with us"
                    />
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Position on Screen</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setWidgetPosition('right');
                          setHasCustomizedWidget(true);
                        }}
                        className={`flex-1 py-3 border-2 font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                          widgetPosition === 'right'
                          ? 'border-[#FF7357] bg-[#FF7357]/5 text-[#FF7357]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="w-4 h-3 border-r-2 border-b-2 border-current rounded-br-sm"></div>
                        Bottom Right
                      </button>
                      <button
                        onClick={() => {
                          setWidgetPosition('left');
                          setHasCustomizedWidget(true);
                        }}
                        className={`flex-1 py-3 border-2 font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
                          widgetPosition === 'left'
                          ? 'border-[#FF7357] bg-[#FF7357]/5 text-[#FF7357]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="w-4 h-3 border-l-2 border-b-2 border-current rounded-bl-sm"></div>
                        Bottom Left
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Optimize for Mobile</p>
                        <p className="text-xs text-gray-500">Auto-adjusts layout for phones</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileOptimized(!mobileOptimized)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${mobileOptimized ? 'bg-[#FF7357]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${mobileOptimized ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      onClick={handleNextTab}
                      className="flex-1 py-4 bg-[#FF7357] hover:bg-[#FF5833] text-white rounded-xl font-bold shadow-lg shadow-[#FF7357]/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      Next: Human Handoff
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-6 py-4 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSaved
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <Check className="w-5 h-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* HUMAN HANDOFF TAB */}
              {activeTab === 'handoff' && (
                <motion.div
                  key="handoff"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-2">Set Up Human Handoff</h2>
                    <p className="text-gray-500 text-lg">Let your bot detect when to pass chats to you or your team.</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-700">Anger Threshold</label>
                      <span className="text-[#FF7357] font-bold">{angerThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={angerThreshold}
                      onChange={(e) => setAngerThreshold(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF7357]"
                    />
                    <p className="text-xs text-gray-500 mt-2">Flag if user sentiment score drops below this level.</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Handoff Action</label>
                    <div className="relative mb-4">
                      <select
                        value={handoffAction}
                        onChange={(e) => setHandoffAction(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none appearance-none"
                      >
                        <option value="email">Send Email Alert</option>
                        <option value="slack">Notify Slack Channel</option>
                        <option value="ticket">Create Support Ticket</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                    </div>

                    {handoffAction === 'email' && (
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={handoffEmail}
                          onChange={(e) => setHandoffEmail(e.target.value)}
                          placeholder="support@yourcompany.com"
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#FF7357] focus:ring-4 focus:ring-[#FF7357]/10 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Real-time Dashboard Alerts</p>
                          <p className="text-xs text-gray-500">Show popup when handoff is requested</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setRealTimeAlerts(!realTimeAlerts)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${realTimeAlerts ? 'bg-[#FF7357]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${realTimeAlerts ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Collect User Contact</p>
                          <p className="text-xs text-gray-500">Ask for email before connecting to human</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCollectEmail(!collectEmail)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${collectEmail ? 'bg-[#FF7357]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${collectEmail ? 'left-7' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      onClick={handleNextTab}
                      className="flex-1 py-4 bg-[#FF7357] hover:bg-[#FF5833] text-white rounded-xl font-bold shadow-lg shadow-[#FF7357]/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      Next: Embed on Site
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-6 py-4 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSaved
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <Check className="w-5 h-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* EMBED ON SITE TAB */}
              {activeTab === 'embed' && (
                <motion.div
                  key="embed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-2">Embed on Your Site</h2>
                    <p className="text-gray-500 text-lg">Copy the code below and paste it into your website's HTML to start chatting.</p>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Integration Script</p>
                          <p className="text-xs text-gray-500">Paste this before the &lt;/body&gt; tag</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const widgetUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget?id=${botId || 'YOUR_BOT_ID'}`;
                          const code = `<script src="${widgetUrl}"></script>`;
                          navigator.clipboard.writeText(code);
                          setIsCopied(true);
                          setHasCopiedCode(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'
                          }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative group">
                      <pre className="bg-gray-900 text-gray-300 p-6 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed border border-gray-800 shadow-inner">
                        <code>{`<script 
  src="${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget?id=${botId || 'YOUR_BOT_ID'}"
></script>`}</code>
                      </pre>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-2 py-1 bg-gray-800 text-gray-400 text-[10px] rounded border border-gray-700">HTML Script Tag</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">1</div>
                          Copy the Code
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Click the copy button above to get your unique integration script.</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">2</div>
                          Paste in HTML
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Insert the script tag just before the closing &lt;/body&gt; tag of your website.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-bold">Need help with integration?</h3>
                        <p className="text-indigo-100 text-sm">Our technical team can help you set up the widget on any platform.</p>
                      </div>
                      <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                        <ExternalLink className="w-4 h-4" />
                        View Documentation
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live Preview Panel (Right Pane) */}
        <div className="w-[450px] flex flex-col gap-4 h-full">
          <div className="flex justify-between items-center px-2 shrink-0">
            <p className="font-manrope font-medium text-lg text-gray-900">Live Preview</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 bg-white'}`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 bg-white'}`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-[#1F2937] rounded-[2rem] border border-white/10 p-8 flex-1 relative overflow-hidden flex flex-col items-center justify-end shadow-2xl shadow-gray-900/20 transition-all min-h-0">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7357]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className={`flex flex-col gap-4 relative z-10 transition-all duration-300 ${previewMode === 'mobile' ? 'w-[300px]' : 'w-full max-w-[380px]'} max-h-full justify-end`}>
              {/* Chat Window */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex flex-col h-[450px] max-h-[calc(100%-5rem)] w-full transition-all duration-300 overflow-hidden ${selectedTemplate === 'classic' ? 'rounded-2xl shadow-2xl shadow-black/20 border' :
                  selectedTemplate === 'modern' ? 'rounded-[2rem] shadow-xl border-0' :
                    selectedTemplate === 'minimal' ? 'rounded-lg border shadow-sm' :
                      selectedTemplate === 'bold' ? 'rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' :
                        'rounded-2xl shadow-2xl shadow-black/20 border'
                  } ${previewData.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                  }`}
              >
                {/* Header */}
                <div className={`p-4 flex items-center justify-between transition-colors ${previewData.template === 'minimal'
                  ? (previewData.theme === 'dark' ? 'bg-gray-900 border-b border-gray-800 text-white' : 'bg-white border-b border-gray-100 text-gray-900')
                  : 'text-white'
                  } ${previewData.template === 'bold' ? 'border-b-4 border-black' : ''
                  }`}
                  style={previewData.template !== 'minimal' ? {
                    backgroundColor: previewData.template === 'modern' ? undefined : previewData.color,
                    backgroundImage: previewData.template === 'modern' ? `linear-gradient(135deg, ${previewData.color}, #8B5CF6)` : undefined
                  } : undefined}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black bg-white' :
                      previewData.template === 'minimal' ? 'rounded-md bg-gray-100' :
                        'rounded-full bg-white/20 backdrop-blur-sm'
                      }`}>
                      <img src={previewData.avatar} alt="Bot" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{previewData.name || 'Your Bot'}</p>
                      <p className={`text-[10px] flex items-center gap-1 ${previewData.template === 'minimal' ? 'opacity-60' : 'opacity-80'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${previewData.template === 'bold' ? 'bg-green-500 border border-black' : 'bg-green-400 border border-white/20'}`}></span>
                        Online
                      </p>
                    </div>
                  </div>
                  <button className={`${previewData.template === 'minimal' ? 'text-gray-400 hover:text-gray-600' : 'text-white/80 hover:text-white'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages Area - Dynamic Content */}
                <div className={`flex-1 p-4 space-y-4 overflow-y-auto transition-colors duration-300 ${previewData.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
                  }`}>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 flex-shrink-0 overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black' :
                      previewData.template === 'minimal' ? 'rounded-md' :
                        'rounded-full border border-white'
                      } bg-gray-200`}>
                      <img src={previewData.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className={`p-3 shadow-sm text-sm max-w-[85%] transition-colors duration-300 ${previewData.template === 'classic' ? 'rounded-2xl rounded-tl-none border' :
                      previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none border-0 shadow-md' :
                        previewData.template === 'minimal' ? 'rounded-lg border' :
                          previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                            'rounded-2xl rounded-tl-none border'
                      } ${previewData.theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-100 text-gray-700'
                      }`}>
                      {previewData.welcome}
                    </div>
                  </div>

                  {activeTab === 'knowledge' && (
                    <>
                      <div className="flex gap-3 flex-row-reverse">
                        <div className={`text-white p-3 shadow-sm text-sm max-w-[85%] ${previewData.template === 'classic' ? 'rounded-2xl rounded-tr-none' :
                          previewData.template === 'modern' ? 'rounded-3xl rounded-br-none shadow-md' :
                            previewData.template === 'minimal' ? 'rounded-lg' :
                              previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black bg-white' :
                                'rounded-2xl rounded-tr-none'
                          } ${previewData.template === 'bold' ? '' : 'bg-gray-900'}`}
                          style={previewData.template === 'bold' ? undefined : { backgroundColor: previewData.color }}>
                          What is your return policy?
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 flex-shrink-0 overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black' :
                          previewData.template === 'minimal' ? 'rounded-md' :
                            'rounded-full border border-white'
                          } bg-gray-200`}>
                          <img src={previewData.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div className={`p-3 shadow-sm text-sm max-w-[85%] transition-colors duration-300 ${previewData.template === 'classic' ? 'rounded-2xl rounded-tl-none border' :
                          previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none border-0 shadow-md' :
                            previewData.template === 'minimal' ? 'rounded-lg border' :
                              previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                                'rounded-2xl rounded-tl-none border'
                          } ${previewData.theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-200'
                            : 'bg-white border-gray-100 text-gray-700'
                          }`}>
                          Based on our policy, you can return items within 30 days of purchase.
                          <div className={`mt-2 text-xs border-t pt-1 flex items-center gap-1 ${previewData.theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-100'}`}>
                            <FileText className="w-3 h-3" /> Source: Company_Policy_v1.pdf
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'embed' && (
                    <>
                      <div className="flex gap-3 flex-row-reverse">
                        <div className={`text-white p-3 shadow-sm text-sm max-w-[85%] ${previewData.template === 'classic' ? 'rounded-2xl rounded-tr-none' :
                          previewData.template === 'modern' ? 'rounded-3xl rounded-br-none shadow-md' :
                            previewData.template === 'minimal' ? 'rounded-lg' :
                              previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black bg-white' :
                                'rounded-2xl rounded-tr-none'
                          } ${previewData.template === 'bold' ? '' : 'bg-gray-900'}`}
                          style={previewData.template === 'bold' ? undefined : { backgroundColor: previewData.color }}>
                          Hi! I'm testing the widget integration.
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 flex-shrink-0 overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black' :
                          previewData.template === 'minimal' ? 'rounded-md' :
                            'rounded-full border border-white'
                          } bg-gray-200`}>
                          <img src={previewData.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div className={`p-3 shadow-sm text-sm max-w-[85%] transition-colors duration-300 ${previewData.template === 'classic' ? 'rounded-2xl rounded-tl-none border' :
                          previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none border-0 shadow-md' :
                            previewData.template === 'minimal' ? 'rounded-lg border' :
                              previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                                'rounded-2xl rounded-tl-none border'
                          } ${previewData.theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-200'
                            : 'bg-white border-gray-100 text-gray-700'
                          }`}>
                          Looks great! Your widget is fully configured and ready to be embedded on your site.
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'handoff' && (
                    <>
                      <div className="flex gap-3 flex-row-reverse">
                        <div className={`text-white p-3 shadow-sm text-sm max-w-[85%] ${previewData.template === 'classic' ? 'rounded-2xl rounded-tr-none' :
                          previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none shadow-md' :
                            previewData.template === 'minimal' ? 'rounded-lg' :
                              previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black bg-white' :
                                'rounded-2xl rounded-tr-none'
                          } ${previewData.template === 'bold' ? '' : 'bg-gray-900'}`}
                          style={previewData.template === 'bold' ? undefined : { backgroundColor: previewData.color }}>
                          I am very frustrated! I need help now!
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 flex-shrink-0 overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black' :
                          previewData.template === 'minimal' ? 'rounded-md' :
                            'rounded-full border border-white'
                          } bg-gray-200`}>
                          <img src={previewData.avatar} className="w-full h-full object-cover" />
                        </div>
                        <div className={`p-3 shadow-sm text-sm max-w-[85%] transition-colors duration-300 ${previewData.template === 'classic' ? 'rounded-2xl rounded-tl-none border' :
                          previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none border-0 shadow-md' :
                            previewData.template === 'minimal' ? 'rounded-lg border' :
                              previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                                'rounded-2xl rounded-tl-none border'
                          } ${previewData.theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-gray-200'
                            : 'bg-white border-gray-100 text-gray-700'
                          }`}>
                          I understand you're upset. I'm connecting you with a human agent immediately.
                          <div className="mt-2 flex items-center gap-2 text-xs text-[#FF7357] font-medium bg-[#FF7357]/5 p-1.5 rounded-lg">
                            <AlertTriangle className="w-3 h-3" /> Sentiment: Angry ({angerThreshold + 15}%)
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'identity' && (
                    <div className="flex gap-3 flex-row-reverse">
                      <div className={`text-white p-3 shadow-sm text-sm max-w-[85%] ${previewData.template === 'classic' ? 'rounded-2xl rounded-tr-none' :
                        previewData.template === 'modern' ? 'rounded-3xl rounded-br-none shadow-md' :
                          previewData.template === 'minimal' ? 'rounded-lg' :
                            previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black bg-white' :
                              'rounded-2xl rounded-tr-none'
                        } ${previewData.template === 'bold' ? '' : 'bg-gray-900'}`}
                        style={previewData.template === 'bold' ? undefined : { backgroundColor: previewData.color }}>
                        Tell me a joke.
                      </div>
                    </div>
                  )}

                  {activeTab === 'identity' && selectedVibe.id === 'sarcastic' && (
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 flex-shrink-0 overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black' :
                        previewData.template === 'minimal' ? 'rounded-md' :
                          'rounded-full border border-white'
                        } bg-gray-200`}>
                        <img src={previewData.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div className={`p-3 shadow-sm text-sm max-w-[85%] transition-colors duration-300 ${previewData.template === 'classic' ? 'rounded-2xl rounded-tl-none border' :
                        previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none border-0 shadow-md' :
                          previewData.template === 'minimal' ? 'rounded-lg border' :
                            previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                              'rounded-2xl rounded-tl-none border'
                        } ${previewData.theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-gray-200'
                          : 'bg-white border-gray-100 text-gray-700'
                        }`}>
                        I'm an AI, not a clown. But sure, why did the chicken cross the road? To get away from you.
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 flex-shrink-0 overflow-hidden ${previewData.template === 'bold' ? 'rounded-none border-2 border-black' :
                      previewData.template === 'minimal' ? 'rounded-md' :
                        'rounded-full border border-white'
                      } bg-gray-200`}>
                      <img src={previewData.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className={`p-3 shadow-sm text-sm max-w-[85%] transition-colors duration-300 ${previewData.template === 'classic' ? 'rounded-2xl rounded-tl-none border' :
                      previewData.template === 'modern' ? 'rounded-3xl rounded-bl-none border-0 shadow-md' :
                        previewData.template === 'minimal' ? 'rounded-lg border' :
                          previewData.template === 'bold' ? 'rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                            'rounded-2xl rounded-tl-none border'
                      } ${previewData.theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-100 text-gray-700'
                      }`}>
                      <div className="flex gap-1 mb-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className={`p-3 border-t transition-colors duration-300 ${previewData.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                  } ${previewData.template === 'bold' ? 'border-t-4 border-black' : ''}`}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className={`w-full pl-4 pr-10 py-2.5 text-sm focus:outline-none transition-all ${previewData.template === 'classic' ? 'rounded-xl focus:ring-2 focus:ring-[#FF7357]/20' :
                        previewData.template === 'modern' ? 'rounded-full bg-gray-100 focus:bg-white shadow-inner focus:ring-2 focus:ring-[#FF7357]/20' :
                          previewData.template === 'minimal' ? 'rounded-md border-gray-200 focus:border-gray-400 border bg-transparent' :
                            previewData.template === 'bold' ? 'rounded-none border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                              'rounded-xl focus:ring-2 focus:ring-[#FF7357]/20'
                        } ${previewData.theme === 'dark'
                          ? 'bg-gray-800 text-white placeholder-gray-500'
                          : previewData.template === 'minimal' ? '' : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                        }`}
                    />
                    <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 transition-colors ${previewData.template === 'bold' ? 'rounded-none hover:bg-black hover:text-white border-2 border-transparent hover:border-black' : 'rounded-lg'
                      } ${previewData.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-white'
                      }`}>
                      <Send className="w-4 h-4" style={{ color: previewData.template === 'bold' ? undefined : previewData.color }} />
                    </button>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <p className={`text-[10px] flex items-center gap-1 ${previewData.theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                      Powered by <span className={`font-bold ${previewData.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>ChatLayer</span>
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Button */}
              <motion.button
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-4 py-3 text-white self-end mt-4 transition-all duration-300 ${
                  previewData.template === 'bold' ? 'rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' :
                  previewData.template === 'modern' ? 'rounded-2xl shadow-xl shadow-purple-500/30' :
                  previewData.template === 'minimal' ? 'rounded-lg shadow-md' :
                  'rounded-full shadow-lg shadow-[#FF7357]/30'
                }`}
                style={{
                  backgroundColor: previewData.template === 'modern' ? undefined : previewData.color,
                  backgroundImage: previewData.template === 'modern' ? `linear-gradient(135deg, ${previewData.color}, #8B5CF6)` : undefined,
                  flexDirection: previewData.position === 'left' ? 'row-reverse' : 'row'
                }}
              >
                {previewData.launcher && (
                  <span className="text-sm font-bold whitespace-nowrap px-1">{previewData.launcher}</span>
                )}
                <MessageSquare className="w-6 h-6 fill-current" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
