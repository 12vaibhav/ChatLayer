import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Settings, LogOut, CreditCard, HelpCircle, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/AuthContext';
import { Logo } from './Logo';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const path = location.pathname;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0] || 'User';

  const isActive = (route: string) => {
    if (route === '/dashboard' && path === '/') return true;
    return path.startsWith(route);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-full z-50 bg-gradient-to-r from-coral-500/10 via-white/60 to-orange-400/10 backdrop-blur-xl border-b border-coral-500/10">
      <nav className="max-w-[1600px] mx-auto px-10 py-3 flex items-center justify-between transition-all duration-200">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <Logo className="group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">ChatLayer</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 bg-white/40 p-1.5 rounded-full border border-white/40 backdrop-blur-md shadow-sm">
          <Link
            to="/dashboard"
            className={cn(
              "px-5 py-2 rounded-full transition-all",
              isActive('/dashboard') ? "text-gray-900 bg-white shadow-sm" : "hover:text-gray-900 hover:bg-white/50"
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/bots"
            className={cn(
              "px-5 py-2 rounded-full transition-all",
              isActive('/bots') ? "text-gray-900 bg-white shadow-sm" : "hover:text-gray-900 hover:bg-white/50"
            )}
          >
            My Bots
          </Link>
          <Link
            to="/conversations"
            className={cn(
              "px-5 py-2 rounded-full transition-all",
              isActive('/conversations') ? "text-gray-900 bg-white shadow-sm" : "hover:text-gray-900 hover:bg-white/50"
            )}
          >
            Conversations
          </Link>
          <Link
            to="/analytics"
            className={cn(
              "px-5 py-2 rounded-full transition-all",
              isActive('/analytics') ? "text-gray-900 bg-white shadow-sm" : "hover:text-gray-900 hover:bg-white/50"
            )}
          >
            Analytics
          </Link>
        </div>

        <div className="flex items-center gap-4 pl-2">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={cn(
                "p-2 text-gray-400 hover:text-gray-600 transition-colors relative rounded-full",
                isNotificationsOpen ? "bg-white/40 text-gray-600" : "hover:bg-white/40"
              )}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-coral-500 rounded-full border-2 border-white"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <button className="text-xs text-coral-500 font-medium hover:text-coral-600">Mark all read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {[
                    { title: "New user signup", desc: "Sarah J. created an account", time: "2m ago", unread: true },
                    { title: "Bot limit reached", desc: "Upgrade to add more bots", time: "1h ago", unread: true },
                    { title: "System update", desc: "Maintenance scheduled for tonight", time: "5h ago", unread: false },
                  ].map((notif, i) => (
                    <div key={i} className={cn("p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer", notif.unread ? "bg-blue-50/30" : "")}>
                      <div className="flex justify-between items-start mb-1">
                        <p className={cn("text-sm font-medium", notif.unread ? "text-gray-900" : "text-gray-600")}>{notif.title}</p>
                        <span className="text-[10px] text-gray-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <button className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all duration-200 border border-transparent",
                isProfileOpen ? "bg-white/80 border-white/40 shadow-sm" : "hover:bg-white/40 hover:border-white/40"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center text-white text-sm font-bold border border-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-200", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>

                <div className="p-2 flex flex-col gap-0.5">
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors">
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors">
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors justify-between group">
                    <div className="flex items-center gap-3">
                      <CreditCard size={16} />
                      <span>Billing</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gradient-to-r from-coral-500 to-purple-600 text-white rounded-full flex items-center gap-1">
                      <Sparkles size={8} /> PRO
                    </span>
                  </Link>
                </div>

                <div className="h-px bg-gray-100 mx-2 my-1"></div>

                <div className="p-2">
                  <Link to="/help" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors">
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left mt-1"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Topbar;
