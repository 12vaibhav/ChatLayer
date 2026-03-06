import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ArrowUp, ArrowDown, HelpCircle, Activity, Users, Clock, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

interface VolumeData {
  name: string;
  chats: number;
  satisfaction: number;
}

interface StatMetrics {
  totalChats: number;
  avgResponseTime: number;
  satisfactionRate: number;
  handoffRate: number;
  changes: {
    chats: string;
    response: string;
    satisfaction: string;
    handoff: string;
  };
}

interface ResolutionItem {
  name: string;
  value: number;
  color: string;
}

interface TopQuery {
  q: string;
  count: number;
  trend: string;
  color: string;
  bg: string;
}

const StatCard = ({ title, value, change, trend, suffix = "", icon: Icon }: { title: string, value: string, change: string, trend: 'up' | 'down', suffix?: string, icon: any }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-gray-200/40 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-coral-500/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-coral-500 group-hover:border-coral-100 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-gray-500">{title}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
        trend === 'up' ? 'bg-green-50 text-green-600 border border-green-200/50' : 'bg-red-50 text-red-600 border border-red-200/50'
      }`}>
        {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-4xl font-black text-gray-900 tracking-tight">
        {value}<span className="text-xl text-gray-400 font-bold ml-1">{suffix}</span>
      </h3>
    </div>
  </motion.div>
);

export default function Analytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [loading, setLoading] = useState(true);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [metrics, setMetrics] = useState<StatMetrics>({
    totalChats: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    handoffRate: 0,
    changes: { chats: "0%", response: "0s", satisfaction: "0%", handoff: "0%" }
  });
  const [resolutionData, setResolutionData] = useState<ResolutionItem[]>([]);
  const [topQueries, setTopQueries] = useState<TopQuery[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      if (dateRange === 'Last 7 Days') startDate.setDate(now.getDate() - 7);
      else if (dateRange === 'Last 30 Days') startDate.setDate(now.getDate() - 30);
      else startDate.setDate(now.getDate() - 90);

      // 1. Fetch Stats & Volume
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (convError) throw convError;

      if (convs) {
        const total = convs.length;
        const handoffs = convs.filter(c => c.status === 'handoff' || c.status === 'joined').length;
        const rates = convs.filter(c => c.satisfaction === 'good').length;
        const satRate = total > 0 ? Math.round((rates / total) * 100) : 0;
        const handoffRate = total > 0 ? Number(((handoffs / total) * 100).toFixed(1)) : 0;

        setMetrics(prev => ({
          ...prev,
          totalChats: total,
          satisfactionRate: satRate,
          handoffRate: handoffRate,
          avgResponseTime: 1.2,
        }));

        // Optimize grouping with memoization logic if needed, but here we update state directly.
        // However, we can calculate these once.
        const daysToMap = dateRange === 'Last 7 Days' ? 7 : dateRange === 'Last 30 Days' ? 10 : 12;
        const interval = dateRange === 'Last 7 Days' ? 1 : dateRange === 'Last 30 Days' ? 3 : 7;

        // Perform calculation once and set state
        const volume = [...Array(daysToMap)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (i * interval));
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          const filteredConvs = convs.filter(c => {
            const convDate = new Date(c.created_at);
            const diffDays = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 3600 * 24));
            return diffDays >= (i * interval) && diffDays < ((i + 1) * interval);
          });

          return { name: label, chats: filteredConvs.length, satisfaction: 90 };
        }).reverse();

        setVolumeData(volume);

        const resData = [
          { name: 'Resolved by AI', value: Math.max(0, 100 - handoffRate - 5), color: '#FF7357' },
          { name: 'Human Handoff', value: handoffRate, color: '#1F2937' },
          { name: 'In Progress', value: 5, color: '#E5E7EB' },
        ];
        setResolutionData(resData);
      }

      // 2. Fetch Top Queries
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('text, created_at')
        .eq('sender', 'user')
        .gte('created_at', startDate.toISOString())
        .limit(200);

      if (msgError) throw msgError;

      if (msgs) {
        const counts: Record<string, number> = {};
        msgs.forEach(m => {
          const cleanup = m.text.trim().toLowerCase();
          if (cleanup.length > 5) { // Avoid short "hi", "ok"
            counts[cleanup] = (counts[cleanup] || 0) + 1;
          }
        });

        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([text, count], i) => ({
            q: text.charAt(0).toUpperCase() + text.slice(1),
            count: count,
            trend: "+0%",
            color: ["text-blue-500", "text-purple-500", "text-red-500", "text-green-500", "text-orange-500", "text-gray-500"][i % 6],
            bg: ["bg-blue-50", "bg-purple-50", "bg-red-50", "bg-green-50", "bg-orange-50", "bg-gray-100"][i % 6]
          }));
        
        setTopQueries(sorted);
      }

    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Chats,Satisfaction\n" + 
      volumeData.map(row => `${row.name},${row.chats},${row.satisfaction}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && volumeData.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-coral-500 animate-spin" />
        <p className="text-gray-500 font-bold animate-pulse">Calculating insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Insights into your bot's performance and user engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/80 text-gray-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-coral-500/10 focus:border-coral-500 shadow-sm transition-all cursor-pointer"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
          </select>
          <button 
            onClick={handleExport}
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl px-5 py-2.5 shadow-lg shadow-gray-900/20 transition-all hover:scale-105 active:scale-95"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Conversations" value={metrics.totalChats.toLocaleString()} change={metrics.changes.chats} trend="up" icon={Activity} />
        <StatCard title="Avg. Response Time" value={metrics.avgResponseTime.toString()} suffix="s" change={metrics.changes.response} trend="down" icon={Clock} />
        <StatCard title="Satisfaction Rate" value={metrics.satisfactionRate.toString()} suffix="%" change={metrics.changes.satisfaction} trend="up" icon={Users} />
        <StatCard title="Handoff Rate" value={metrics.handoffRate.toString()} suffix="%" change={metrics.changes.handoff} trend="down" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (Dark Theme) */}
        <div className="lg:col-span-2 bg-gray-900 p-8 rounded-[2rem] border border-gray-800 shadow-2xl shadow-gray-900/20 relative overflow-hidden flex flex-col">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-white text-xl tracking-tight">Conversation Volume</h3>
              <p className="text-gray-400 text-sm mt-1 font-medium">Daily interaction metrics across all channels</p>
            </div>
            {loading && <Loader2 className="w-5 h-5 text-coral-500 animate-spin" />}
          </div>
          
          <div className="flex-1 w-full relative z-10 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7357" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF7357" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)', padding: '12px 16px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="chats" stroke="#FF7357" strokeWidth={4} fillOpacity={1} fill="url(#colorChats)" activeDot={{ r: 6, fill: '#FF7357', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Breakdown (Light Theme) */}
        <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-gray-200/40 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h3 className="font-bold text-gray-900 mb-2 text-xl tracking-tight relative z-10">Resolution Breakdown</h3>
          <p className="text-gray-500 text-sm font-medium mb-6 relative z-10">How conversations are handled</p>
          
          <div className="flex-1 relative min-h-[220px] z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', color: '#111827', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                   itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-4xl font-black text-gray-900 tracking-tight">
                  {resolutionData.find(r => r.name === 'Resolved by AI')?.value || 0}%
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Automated</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3 relative z-10">
            {resolutionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/50 border border-white hover:bg-white transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 font-bold">{item.name}</span>
                </div>
                <span className="font-black text-gray-900">{Math.round(item.value)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Queries (Light Theme) */}
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-gray-200/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="font-bold text-gray-900 text-xl tracking-tight">Top User Queries</h3>
            <p className="text-gray-500 text-sm font-medium mt-1">Most frequently asked questions</p>
          </div>
          <button className="text-sm font-bold text-coral-500 hover:text-coral-600 transition-colors">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {topQueries.length > 0 ? topQueries.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/80 rounded-2xl hover:bg-white transition-all group border border-gray-100/80 hover:border-coral-200 hover:shadow-md hover:shadow-coral-500/5 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700 group-hover:text-gray-900 text-sm">{item.q}</span>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-900 text-lg">{item.count}</p>
                <p className={`text-xs font-bold ${item.trend.startsWith('+') ? 'text-green-500' : item.trend.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                  {item.trend}
                </p>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 font-medium">No user queries recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
