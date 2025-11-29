import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings } from '../types';
import { supabase } from '../services/supabaseClient';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { name: string; email: string };
    settings: AppSettings;
    onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

type Tab = 'general' | 'account';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, settings, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [copiedOrgId, setCopiedOrgId] = useState(false);

    const orgId = "ada72896-0913-448d-8781-9b67374c4759";

    const handleCopyOrgId = () => {
        navigator.clipboard.writeText(orgId);
        setCopiedOrgId(true);
        setTimeout(() => setCopiedOrgId(false), 2000);
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            onClose();
            // Force a reload to ensure all states and cache are cleared
            window.location.reload();
        } catch (error) {
            console.error('Error logging out:', error);
            // Fallback: try to force reload anyway if it's just a network glitch
            window.location.reload();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-[800px] h-[600px] rounded-2xl shadow-2xl flex overflow-hidden relative z-10"
            >
                {/* Sidebar */}
                <div className="w-[200px] bg-[#F5F5F5] p-4 flex flex-col gap-1 shrink-0">
                    <h2 className="font-serif text-xl font-medium text-[#333333] mb-6 px-2">Settings</h2>

                    <button
                        onClick={() => setActiveTab('general')}
                        className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === 'general' ? 'bg-[#E5E7EB] text-[#333333]' : 'text-gray-500 hover:bg-[#E5E7EB]/50'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === 'account' ? 'bg-[#E5E7EB] text-[#333333]' : 'text-gray-500 hover:bg-[#E5E7EB]/50'}`}
                    >
                        Account
                    </button>

                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-12 bg-white">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>

                    {activeTab === 'general' && (
                        <div className="space-y-12 max-w-[600px]">
                            {/* Profile Section */}
                            <section>
                                <h3 className="text-[15px] font-semibold text-[#333333] mb-6">Profile</h3>

                                <div className="flex gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-[#333333] text-white flex items-center justify-center font-medium text-sm shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Full name</label>
                                            <input
                                                type="text"
                                                value={settings.userName}
                                                onChange={(e) => onUpdateSettings({ userName: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#333333] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">What should Claude call you?</label>
                                            <input
                                                type="text"
                                                value={settings.displayName}
                                                onChange={(e) => onUpdateSettings({ displayName: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#333333] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[11px] font-medium text-gray-500 mb-1.5">What best describes your work?</label>
                                    <select
                                        value={settings.workFunction}
                                        onChange={(e) => onUpdateSettings({ workFunction: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#333333] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select your work function</option>
                                        <option value="developer">Software Developer</option>
                                        <option value="designer">Designer</option>
                                        <option value="product">Product Manager</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">What <span className="underline decoration-gray-300 decoration-dotted cursor-help">personal preferences</span> should Claude consider in responses?</label>
                                    <p className="text-[11px] text-gray-400 mb-2">Your preferences will apply to all conversations, within Anthropic's guidelines.</p>
                                    <textarea
                                        value={settings.preferences}
                                        onChange={(e) => onUpdateSettings({ preferences: e.target.value })}
                                        placeholder="e.g. I primarily code in Python (not a coding beginner)"
                                        className="w-full h-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#333333] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all resize-none"
                                    />
                                </div>
                            </section>

                            {/* Notifications Section */}
                            <section>
                                <h3 className="text-[15px] font-semibold text-[#333333] mb-4">Notifications</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[13px] font-medium text-[#333333]">Response completions</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">Get notified when Claude has finished a response. Most useful for long running tasks like tool calls and Research.</div>
                                    </div>
                                    <button
                                        onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
                                        className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${settings.notifications ? 'bg-[#3B82F6]' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${settings.notifications ? 'left-[18px]' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </section>

                            {/* Appearance Section */}
                            <section>
                                <h3 className="text-[15px] font-semibold text-[#333333] mb-6">Appearance</h3>

                                <div className="mb-6">
                                    <label className="block text-[11px] font-medium text-gray-500 mb-3">Color mode</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => onUpdateSettings({ theme: 'light' })}
                                            className={`group relative p-1 rounded-xl border transition-all ${settings.theme === 'light' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="bg-[#F5F5F5] rounded-lg p-3 h-20 flex flex-col justify-center items-center gap-2">
                                                <div className="w-full h-2 bg-white rounded-full opacity-60" />
                                                <div className="w-2/3 h-2 bg-white rounded-full opacity-60" />
                                            </div>
                                            <span className="block text-center text-[11px] font-medium text-gray-600 mt-2 mb-1">Light</span>
                                        </button>

                                        <button
                                            onClick={() => onUpdateSettings({ theme: 'match' })}
                                            className={`group relative p-1 rounded-xl border transition-all ${settings.theme === 'match' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex h-20 rounded-lg overflow-hidden">
                                                <div className="w-1/2 bg-[#F5F5F5] flex flex-col justify-center items-center gap-2 p-2">
                                                    <div className="w-full h-2 bg-white rounded-full opacity-60" />
                                                    <div className="w-2/3 h-2 bg-white rounded-full opacity-60" />
                                                </div>
                                                <div className="w-1/2 bg-[#1A1A1A] flex flex-col justify-center items-center gap-2 p-2">
                                                    <div className="w-full h-2 bg-white/20 rounded-full" />
                                                    <div className="w-2/3 h-2 bg-white/20 rounded-full" />
                                                </div>
                                            </div>
                                            <span className="block text-center text-[11px] font-medium text-gray-600 mt-2 mb-1">Match system</span>
                                        </button>

                                        <button
                                            onClick={() => onUpdateSettings({ theme: 'dark' })}
                                            className={`group relative p-1 rounded-xl border transition-all ${settings.theme === 'dark' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="bg-[#1A1A1A] rounded-lg p-3 h-20 flex flex-col justify-center items-center gap-2">
                                                <div className="w-full h-2 bg-white/20 rounded-full" />
                                                <div className="w-2/3 h-2 bg-white/20 rounded-full" />
                                            </div>
                                            <span className="block text-center text-[11px] font-medium text-gray-600 mt-2 mb-1">Dark</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-gray-500 mb-3">Chat font</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => onUpdateSettings({ font: 'default' })}
                                            className={`group relative p-1 rounded-xl border transition-all ${settings.font === 'default' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="bg-white rounded-lg h-16 flex items-center justify-center">
                                                <span className="text-xl font-serif text-[#333333]">Aa</span>
                                            </div>
                                            <span className="block text-center text-[11px] font-medium text-gray-600 mt-2 mb-1">Default</span>
                                        </button>

                                        <button
                                            onClick={() => onUpdateSettings({ font: 'manrope' })}
                                            className={`group relative p-1 rounded-xl border transition-all ${settings.font === 'manrope' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="bg-white rounded-lg h-16 flex items-center justify-center">
                                                <span className="text-xl font-manrope text-[#333333]">Aa</span>
                                            </div>
                                            <span className="block text-center text-[11px] font-medium text-gray-600 mt-2 mb-1">Manrope</span>
                                        </button>

                                        <button
                                            onClick={() => onUpdateSettings({ font: 'dyslexic' })}
                                            className={`group relative p-1 rounded-xl border transition-all ${settings.font === 'dyslexic' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="bg-white rounded-lg h-16 flex items-center justify-center">
                                                <span className="text-xl font-mono text-[#333333]">Aa</span>
                                            </div>
                                            <span className="block text-center text-[11px] font-medium text-gray-600 mt-2 mb-1">Dyslexic friendly</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-12 max-w-[600px]">
                            <section>
                                <h3 className="text-[15px] font-semibold text-[#333333] mb-6">Account</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[13px] text-[#333333]">Log out of all devices</div>
                                        <button
                                            onClick={handleLogout}
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-[#333333] hover:bg-gray-50 transition-colors"
                                        >
                                            Log out
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-[13px] text-[#333333]">Delete your account</div>
                                        <button className="px-3 py-1.5 bg-black text-white rounded-lg text-[13px] font-medium hover:bg-gray-800 transition-colors">
                                            Delete account
                                        </button>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[13px] text-[#333333]">Organization ID</div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-1 bg-gray-100 rounded text-[11px] font-mono text-gray-500 select-all">
                                                    {orgId}
                                                </div>
                                                <button
                                                    onClick={handleCopyOrgId}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    {copiedOrgId ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
