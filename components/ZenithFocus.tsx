import React, { useState, useEffect } from 'react';
import { Zap, Shield, ArrowRight, Info } from 'lucide-react';

type FocusStatus = 'HARMONY' | 'OPPORTUNITY' | 'GUARDIAN';

export const ZenithFocus = () => {
  const [status, setStatus] = useState<FocusStatus>('HARMONY');
  
  // Cycle states for demo purposes every 10 seconds to simulate live market data
  useEffect(() => {
    const states: FocusStatus[] = ['HARMONY', 'OPPORTUNITY', 'GUARDIAN'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % 3;
      setStatus(states[index]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getContainerStyles = () => {
    switch(status) {
      case 'HARMONY': 
        return 'w-[280px] bg-[#1A1A1D]/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]';
      case 'OPPORTUNITY': 
        return 'w-[360px] bg-blue-900/40 border-blue-500/30 shadow-[0_8px_32px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20';
      case 'GUARDIAN': 
        return 'w-[360px] bg-orange-900/40 border-orange-500/30 shadow-[0_8px_32px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/20';
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none md:pointer-events-auto">
        {/* The Island */}
        <div 
            className={`
                relative flex items-center justify-between px-2 py-2.5 rounded-full transition-all duration-[800ms] cubic-bezier(0.2, 0.8, 0.2, 1)
                backdrop-blur-[20px] border cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                ${getContainerStyles()}
            `}
        >
            {/* State A: Harmony */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${status === 'HARMONY' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="flex items-center gap-3 w-full px-5">
                    <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[13px] font-[700] text-white tracking-tight">Wealth Active</span>
                        <span className="text-[11px] text-zenith-subtext font-medium">5.2% APY • Stable</span>
                    </div>
                </div>
            </div>

            {/* State B: Opportunity */}
            <div className={`absolute inset-0 flex items-center justify-between px-3 transition-opacity duration-500 ${status === 'OPPORTUNITY' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-sm shadow-blue-500/20">
                        <Zap size={14} fill="currentColor" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[13px] font-[800] text-blue-200">Optimize Yield</span>
                        <span className="text-[11px] text-blue-400 font-semibold">+0.8% Available</span>
                    </div>
                </div>
                <button 
                    onClick={() => alert("Optimizing your portfolio...")}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                >
                    Switch <ArrowRight size={10} strokeWidth={3} />
                </button>
            </div>

            {/* State C: Guardian */}
            <div className={`absolute inset-0 flex items-center justify-between px-3 transition-opacity duration-500 ${status === 'GUARDIAN' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <div className="flex items-center gap-3">
                     <div className="bg-orange-500 text-white p-1.5 rounded-full animate-pulse shadow-sm shadow-orange-500/20">
                        <Shield size={14} fill="currentColor" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[13px] font-[800] text-orange-200">Volatility Detected</span>
                        <span className="text-[11px] text-orange-400 font-semibold">Funds Protected</span>
                    </div>
                </div>
                 <button className="bg-white/10 hover:bg-white/20 text-orange-400 p-1.5 rounded-full transition-colors border border-orange-500/30">
                    <Info size={16} />
                </button>
            </div>
        </div>
    </div>
  );
};