import React, { useState, useEffect } from 'react';
import { User, Settings, CreditCard, Bell, Shield, Trash2, Check, X, Camera, Mail, Lock, AlertTriangle, Download, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

type Tab = 'profile' | 'account' | 'billing';

const SettingsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [user, setUser] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    role: 'Admin',
    company: '',
    notifications: {
      email: true,
      push: false,
      marketing: false,
    }
  });

  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
      }));
      // Load profile from Supabase
      supabase.from('profiles').select('*').eq('id', authUser.id).single().then(({ data }) => {
        if (data) {
          setUser(prev => ({
            ...prev,
            name: data.full_name || prev.name,
            avatar: data.avatar_url || '',
            company: data.company || '',
            bio: data.bio || '',
          }));
        }
      });
    }
  }, [authUser]);

  const handleSave = async () => {
    if (!authUser) return;
    setIsLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: authUser.id,
      full_name: user.name,
      avatar_url: user.avatar,
      company: user.company,
      bio: user.bio,
      updated_at: new Date().toISOString(),
    });
    setIsLoading(false);
    if (!error) {
      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'account', label: 'Account Settings', icon: Settings },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Success Message Toast */}
            {successMessage && (
              <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 text-sm">
                <Check className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <div className="p-6 sm:p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Public Profile</h2>
                  <p className="mt-1 text-sm text-gray-500">This information will be displayed publicly.</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                    />
                    <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-indigo-600 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Change Avatar
                    </button>
                    <p className="mt-2 text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full-name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={user.role}
                      disabled
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm py-2 px-3 border cursor-not-allowed"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                    />
                    <p className="mt-2 text-sm text-gray-500">Brief description for your profile. URLs are hyperlinked.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab Content */}
            {activeTab === 'account' && (
              <div className="p-6 sm:p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">Manage your account security and preferences.</p>
                </div>

                {/* Email Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Your email address is verified.</p>
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Change
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {/* Password Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="col-span-2">
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {/* Notifications Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="email-notifications"
                          name="email-notifications"
                          type="checkbox"
                          checked={user.notifications.email}
                          onChange={(e) => setUser({ ...user, notifications: { ...user.notifications, email: e.target.checked } })}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</label>
                        <p className="text-gray-500">Get emails about your account activity and security.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="marketing-notifications"
                          name="marketing-notifications"
                          type="checkbox"
                          checked={user.notifications.marketing}
                          onChange={(e) => setUser({ ...user, notifications: { ...user.notifications, marketing: e.target.checked } })}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="marketing-notifications" className="font-medium text-gray-700">Marketing Emails</label>
                        <p className="text-gray-500">Receive news, updates, and special offers.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {/* Delete Account Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                  </h3>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Delete Account</p>
                      <p className="text-xs text-red-600 mt-1">Permanently delete your account and all of your content.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab Content */}
            {activeTab === 'billing' && (
              <div className="p-6 sm:p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Billing & Plans</h2>
                  <p className="mt-1 text-sm text-gray-500">Manage your subscription and payment methods.</p>
                </div>

                {/* Current Plan */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium mb-1">Current Plan</p>
                      <h3 className="text-2xl font-bold">Pro Plan</h3>
                      <p className="text-indigo-100 text-sm mt-2">$29/month • Billed monthly</p>
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30">
                      Active
                    </span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/20 flex gap-4">
                    <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                      Upgrade Plan
                    </button>
                    <button className="px-4 py-2 bg-transparent border border-white/40 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    Payment Method
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-6 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-500">VISA</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/2028</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      Edit
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-2">
                    <Plus className="w-4 h-4" />
                    Add Payment Method
                  </button>
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                {/* Billing History */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Billing History</h3>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Download</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          { date: 'Oct 1, 2023', desc: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                          { date: 'Sep 1, 2023', desc: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                          { date: 'Aug 1, 2023', desc: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                        ].map((invoice, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.desc}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-gray-400 hover:text-gray-600">
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
