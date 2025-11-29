import React, { useState } from 'react';
import NexaStar from '../Assets/Nexa-Star02.png';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            onLogin();
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#1A1A1A] text-white overflow-hidden font-sans">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-[45%] flex flex-col p-8 lg:p-12 relative z-10">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-auto">
                    <img src={NexaStar} alt="Nexa" className="w-6 h-6" />
                    <span className="font-serif text-xl font-semibold">Nexa</span>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center justify-center max-w-[400px] mx-auto w-full">
                    <h1 className="font-serif text-5xl lg:text-6xl text-center mb-2 tracking-tight">
                        Impossible?
                        <br />
                        Possible.
                    </h1>
                    <p className="text-gray-400 mb-12 text-center text-sm">The AI for problem solvers</p>

                    <div className="w-full bg-[#252525] p-6 rounded-2xl border border-[#333]">
                        <button
                            onClick={onLogin}
                            className="w-full flex items-center justify-center gap-3 bg-[#333] hover:bg-[#3d3d3d] text-white py-2.5 rounded-lg transition-colors mb-4 border border-[#444] text-sm font-medium"
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
                            <div className="flex-grow border-t border-[#444]"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] uppercase tracking-wider">OR</span>
                            <div className="flex-grow border-t border-[#444]"></div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-[#444] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-300 transition-colors"
                            />
                            <button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-gray-200 font-medium py-2.5 rounded-lg transition-colors text-sm"
                            >
                                Continue with email
                            </button>
                        </form>

                        <p className="text-[10px] text-gray-500 text-center mt-4 leading-tight">
                            By continuing, you acknowledge Anthropic's Privacy Policy.
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-auto pt-8 flex flex-wrap gap-4 text-xs text-gray-500 justify-center lg:justify-start">
                    <a href="#" className="hover:text-gray-300">Meet Claude</a>
                    <a href="#" className="hover:text-gray-300">Platform</a>
                    <a href="#" className="hover:text-gray-300">Solutions</a>
                    <a href="#" className="hover:text-gray-300">Pricing</a>
                    <a href="#" className="hover:text-gray-300">Learn</a>
                </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="hidden lg:block w-[55%] bg-[#C25E3E] relative overflow-hidden">
                {/* Abstract Doodles (CSS/SVG) */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <svg className="absolute top-20 left-20 w-32 h-32 text-green-300/40" viewBox="0 0 100 100">
                        <path d="M10,50 Q25,25 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute bottom-40 right-40 w-48 h-48 text-purple-300/40" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>
                </div>

                {/* Placeholder for Hero Image - Centered Text if image fails or is missing */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/20 font-serif text-4xl">
                        (Hero Image Placeholder)
                    </div>
                </div>

                {/* If we had the image, it would go here: */}
                {/* <img src={HeroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover" /> */}
            </div>
        </div>
    );
};

export default LoginPage;
