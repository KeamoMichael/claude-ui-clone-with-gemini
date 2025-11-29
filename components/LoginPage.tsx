import React, { useState } from 'react';
import NexaStar from '../Assets/Nexa-Star02.png';
import { supabase } from '../services/supabaseClient';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState<'email' | 'password'>('email');

    // Sign Up State
    const [signUpData, setSignUpData] = useState({
        username: '',
        surname: '',
        email: '',
        password: ''
    });

    // Consent State
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [subscribedToNewsletter, setSubscribedToNewsletter] = useState(true);

    // View State
    const [view, setView] = useState<'login' | 'signup' | 'consent'>('login');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setMessage(null);

        if (step === 'email') {
            setStep('password');
            return;
        }

        if (!password) {
            setMessage({ type: 'error', text: 'Please enter your password' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!signUpData.username || !signUpData.surname || !signUpData.email || !signUpData.password) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email: signUpData.email,
                password: signUpData.password,
                options: {
                    data: {
                        full_name: `${signUpData.username} ${signUpData.surname}`,
                        username: signUpData.username,
                        surname: signUpData.surname
                    }
                }
            });

            if (error) throw error;

            // Move to consent screen
            setView('consent');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleConsentSubmit = async () => {
        if (!agreedToTerms) {
            setMessage({ type: 'error', text: 'You must agree to the terms to continue.' });
            return;
        }

        // Here you might want to update the user's profile with consent data if needed
        // For now, we'll just reload to trigger the auth state change and let them in
        window.location.reload();
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' });
        }
    };

    // Consent View
    if (view === 'consent') {
        return (
            <div className="flex h-screen w-screen bg-[#1A1A1A] text-white overflow-hidden font-sans items-center justify-center">
                <div className="w-full max-w-[480px] flex flex-col items-center p-8">
                    <div className="flex items-center gap-2 mb-12">
                        <img src={NexaStar} alt="Nexa" className="w-6 h-6 invert" />
                        <span className="font-serif text-xl font-medium">Claude</span>
                    </div>

                    <h1 className="font-serif text-3xl text-center mb-2 text-[#F5F5F5]">
                        Let's create your account
                    </h1>
                    <p className="text-gray-400 mb-8 text-center text-sm">A few things for you to review</p>

                    <div className="w-full bg-[#252525] p-6 rounded-xl border border-gray-700/50 mb-8">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-500 bg-transparent transition-all checked:border-[#3B82F6] checked:bg-[#3B82F6]"
                                />
                                <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <label className="text-xs text-gray-300 leading-relaxed">
                                I agree to Anthropic's <a href="#" className="underline">Consumer Terms</a> and <a href="#" className="underline">Acceptable Use Policy</a> and confirm that I am at least 18 years of age.
                            </label>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={subscribedToNewsletter}
                                    onChange={(e) => setSubscribedToNewsletter(e.target.checked)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-500 bg-transparent transition-all checked:border-[#3B82F6] checked:bg-[#3B82F6]"
                                />
                                <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <label className="text-xs text-gray-300 leading-relaxed">
                                Subscribe to occasional product update and promotional emails. You can opt out at any time.
                            </label>
                        </div>

                        <button
                            onClick={handleConsentSubmit}
                            className="w-full bg-[#F5F5F5] hover:bg-white text-black font-medium py-2 rounded-lg transition-colors text-sm mt-6"
                        >
                            Continue
                        </button>
                    </div>

                    {message && (
                        <div className="mb-6 p-3 rounded-lg text-xs bg-red-900/30 text-red-200 border border-red-800/50 w-full text-center">
                            {message.text}
                        </div>
                    )}

                    <div className="mt-auto text-xs text-gray-500 text-center">
                        Email verified as <span className="text-gray-400">{signUpData.email}</span>
                        <br />
                        <button onClick={() => setView('signup')} className="underline hover:text-gray-300 mt-1">Use a different email</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-[#FDFCF8] text-[#333333] overflow-hidden font-sans">
            {/* Left Side - Login/Signup Form */}
            <div className="w-full lg:w-[45%] flex flex-col p-8 lg:p-12 relative z-10 bg-[#FDFCF8]">
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-auto">
                    <img src={NexaStar} alt="Nexa" className="w-7 h-7" />
                    <span className="font-serif text-2xl font-semibold text-[#333333]">Nexa</span>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center justify-center max-w-[400px] mx-auto w-full">
                    <h1 className="font-serif text-5xl lg:text-6xl text-center mb-3 tracking-tight text-[#333333]">
                        Superior
                        <br />
                        Standard
                    </h1>
                    <p className="text-gray-500 mb-12 text-center text-[15px]">The next generation of inventive problem solving.</p>

                    <div className="w-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        {view === 'login' ? (
                            <>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#333333] py-2.5 rounded-lg transition-colors mb-4 border border-gray-200 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="relative flex items-center py-2 mb-4">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase tracking-wider">OR</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                <form onSubmit={handleEmailLogin} className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading || step === 'password'}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all disabled:opacity-50"
                                    />

                                    {step === 'password' && (
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all disabled:opacity-50"
                                            autoFocus
                                        />
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB] font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            step === 'email' ? 'Continue with email' : 'Sign In'
                                        )}
                                    </button>
                                </form>

                                {!email && (
                                    <button
                                        onClick={() => setView('signup')}
                                        className="w-full bg-white hover:bg-gray-50 text-[#333333] font-medium py-2.5 rounded-lg transition-colors text-sm border border-gray-200 mt-3"
                                    >
                                        Sign Up
                                    </button>
                                )}
                            </>
                        ) : (
                            // Sign Up Form
                            <form onSubmit={handleSignUp} className="space-y-3">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={signUpData.username}
                                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                                        disabled={loading}
                                        className="w-1/2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Surname"
                                        value={signUpData.surname}
                                        onChange={(e) => setSignUpData({ ...signUpData, surname: e.target.value })}
                                        disabled={loading}
                                        className="w-1/2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={signUpData.email}
                                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                    disabled={loading}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                />
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={signUpData.password}
                                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                    disabled={loading}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#333333] placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB] font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Create account'
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setView('login')}
                                        className="text-sm text-gray-500 hover:text-[#333333] transition-colors"
                                    >
                                        Already have an account? Sign in
                                    </button>
                                </div>
                            </form>
                        )}

                        {message && (
                            <div className={`mt-4 p-3 rounded-lg text-xs ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        {view === 'login' && (
                            <p className="text-[10px] text-gray-400 text-center mt-4 leading-tight">
                                By continuing, you acknowledge Nexa's Privacy Policy.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-auto pt-8 flex flex-wrap gap-4 text-xs text-gray-500 justify-center lg:justify-start">
                    <a href="#" className="hover:text-[#333333] transition-colors">Meet Nexa</a>
                    <a href="#" className="hover:text-[#333333] transition-colors">Platform</a>
                    <a href="#" className="hover:text-[#333333] transition-colors">Solutions</a>
                    <a href="#" className="hover:text-[#333333] transition-colors">Pricing</a>
                    <a href="#" className="hover:text-[#333333] transition-colors">Learn</a>
                </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="hidden lg:block w-[55%] relative overflow-hidden bg-[#F0F0F0]">
                <img
                    src="/Login Wallpaper.jpeg"
                    alt="Superior Standard"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default LoginPage;
