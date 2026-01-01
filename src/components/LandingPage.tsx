import React from 'react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505] text-white selection:bg-yellow-500 selection:text-black font-sans">
        
        {/* --- Background Elements --- */}
        
        {/* 1. High-quality abstract background image */}
        <div 
            className="absolute inset-0 z-0 opacity-40"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px) grayscale(50%)' // Blurs image to focus on text
            }}
        />

        {/* 2. Gradient Overlay for readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-black/40"></div>

        {/* --- Main Content --- */}
        <div className="relative z-20 container mx-auto px-6 text-center">
            
            {/* Animated Logo Container */}
            <div className="mb-10 inline-block relative group cursor-default">
                <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rounded-full"></div>
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-full flex items-center justify-center shadow-2xl ring-1 ring-white/5 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-5xl md:text-6xl filter drop-shadow-lg">💒</span>
                </div>
            </div>
            
            {/* Headlines with Fade In Animation */}
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-100 tracking-tight drop-shadow-sm">
                    Event4u
                </h1>
                
                <p className="text-lg md:text-2xl text-gray-300 font-light tracking-[0.2em] uppercase">
                    Intelligent Event Proposals
                </p>
            </div>

            {/* Divider */}
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mx-auto my-10"></div>

            {/* Status Box */}
            <div className="inline-flex flex-col items-center justify-center p-8 md:p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-2xl mx-auto transform transition-all hover:border-yellow-500/30">
                <h3 className="text-2xl font-serif text-white mb-2">Something extraordinary is coming</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    We are building the next generation of event management software. 
                    Automated calculations, AI-driven proposals, and seamless client management.
                </p>
                
                <div className="mt-8 flex items-center gap-3 bg-yellow-500/10 px-5 py-2 rounded-full border border-yellow-500/20">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                    <span className="text-yellow-500 font-bold text-xs uppercase tracking-wider">Coming Soon</span>
                </div>
            </div>

            {/* Footer / Contact */}
            <div className="mt-16 text-sm text-gray-500">
                <p className="mb-4">Are you a venue owner?</p>
                <a 
                    href="mailto:contact@event4u.bg" 
                    className="inline-block px-8 py-3 rounded-lg border border-white/10 hover:bg-white hover:text-black transition-all duration-300 font-bold uppercase tracking-wider text-xs"
                >
                    Contact Sales
                </a>
                <div className="mt-8 text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Event4u. All rights reserved.
                </div>
            </div>
        </div>
    </div>
  );
};