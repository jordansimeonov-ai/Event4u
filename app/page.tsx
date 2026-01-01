'use client';

import { Calendar, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Event<span className="text-yellow-400">4u</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-200 font-light">
            Professional Event Quote Calculator
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 shadow-2xl border border-white/20 max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <Calendar className="w-10 h-10 text-slate-900" />
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Coming Soon
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            We're launching a revolutionary event planning platform.
            <br />
            Multi-venue quote generation made simple.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-gray-200">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span>Weddings</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Briefcase className="w-5 h-5 text-yellow-400" />
              <span>Business Events</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Users className="w-5 h-5 text-yellow-400" />
              <span>Team Building</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-400">
          <p>For venue-specific calculators, use your subdomain:</p>
          <p className="mt-2 font-mono text-yellow-400">
            venue-name.event4u.bg
          </p>
        </div>
      </div>
    </div>
  );
}
