import React, { useState } from 'react';
import { Shield, Zap, AlertTriangle, X, BrainCircuit } from 'lucide-react';

export const GuardianMonitor = () => {
    // In a full production build, this state would be driven by a global store or websocket connection.
    // For now, it defaults to null (No active alerts) to avoid simulating fake danger.
    const [notification, setNotification] = useState<{type: 'YIELD' | 'RISK', message: string} | null>(null);

    if (notification) {
        return (
            <div className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
                <div className="bg-white border border-zenith-navy/5 p-4 rounded-2xl shadow-card w-[320px] flex items-start gap-3 relative overflow-hidden backdrop-blur-xl">
                    <div className={`absolute top-0 left-0 w-1 h-full ${notification.type === 'YIELD' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                    
                    <div className={`p-2 rounded-full shrink-0 ${notification.type === 'YIELD' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                        {notification.type === 'YIELD' ? <Zap size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <BrainCircuit size={12} className={notification.type === 'YIELD' ? 'text-blue-600' : 'text-red-500'} />
                            <h4 className="text-zenith-navy font-bold text-xs uppercase tracking-wider">
                                {notification.type === 'YIELD' ? 'Yield Opportunity' : 'Security Alert'}
                            </h4>
                        </div>
                        <p className="text-xs text-zenith-subtext leading-relaxed font-medium">
                            {notification.message}
                        </p>
                        <div className="flex gap-2 mt-3">
                             <button 
                                onClick={() => setNotification(null)}
                                className="bg-zenith-navy text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-zenith-navy/90 transition-colors shadow-lg"
                             >
                                Execute
                             </button>
                             <button 
                                onClick={() => setNotification(null)}
                                className="text-zenith-subtext text-xs font-medium px-2 py-1.5 hover:text-zenith-navy transition-colors"
                             >
                                Dismiss
                             </button>
                        </div>
                    </div>
                    
                    <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-zenith-navy absolute top-3 right-3 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50 pointer-events-none transition-opacity duration-1000">
            <div className="bg-white border border-zenith-navy/5 rounded-full px-4 py-2 flex items-center gap-3 shadow-card">
                 <div className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zenith-mintdark"></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-zenith-subtext font-bold">
                        Guardian Active
                    </span>
                </div>
                <Shield size={12} className="text-zenith-subtext" />
            </div>
        </div>
    );
}