import React, { useState, useRef, useEffect } from 'react';
import { analyzeContracts } from '../services/geminiService';
import { Send, Bot, User, Loader2, ShieldCheck, Activity, Lock, AlertTriangle, CheckCircle2, Siren } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

export const AISecurityAudit: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: "Identity verified. I am the Zenith Protocol Architect. I am actively monitoring the mempool and settlement layers. How can I assist you with security verification?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const response = await analyzeContracts(input);
        
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response };
        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6 pt-8 pb-12 animate-in slide-in-from-bottom-8 duration-700">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                     <h2 className="text-4xl font-display font-[800] text-zenith-navy tracking-tight">Trust & Safety</h2>
                     <p className="text-zenith-subtext font-medium mt-2">Autonomous risk modeling and insurance.</p>
                 </div>
                 <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 px-4 py-2 rounded-full shadow-sm backdrop-blur-md">
                     <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </div>
                     <span className="text-xs font-bold text-green-700 uppercase tracking-widest">System Nominal</span>
                 </div>
             </div>

             {/* 1. Risk Scoring Matrix */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <RiskCard 
                    protocol="Ondo Finance" 
                    score={92} 
                    metrics={['US Treasury Backing', 'Legal Structure', 'Audit: 2 weeks ago']}
                    status="SECURE"
                 />
                 <RiskCard 
                    protocol="Aave V3" 
                    score={96} 
                    metrics={['Over-Collateralized', 'DAO Governance', 'Gauntlet Risk: Low']}
                    status="SECURE"
                 />
                 <RiskCard 
                    protocol="Lido" 
                    score={98} 
                    metrics={['Validator Diversity', 'Slashing Ins.', 'Open Source']}
                    status="SECURE"
                 />
             </div>

             {/* 2. Chat Terminal */}
             <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col min-h-[500px] shadow-2xl relative">
                 <div className="bg-white/40 border-b border-white/50 px-6 py-4 flex items-center justify-between backdrop-blur-md">
                     <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-zenith-navy animate-pulse"></div>
                         <span className="text-xs font-bold text-zenith-navy uppercase tracking-widest">Secure Uplink</span>
                     </div>
                     <span className="text-[10px] font-mono text-zenith-subtext">V 2.4.0</span>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-6">
                     {messages.map((msg) => (
                         <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border-2 border-white ${msg.role === 'ai' ? 'bg-gradient-to-br from-zenith-navy to-slate-800 text-white' : 'bg-white text-zenith-navy'}`}>
                                 {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                             </div>
                             <div className={`max-w-[80%] rounded-2xl px-6 py-4 text-[15px] leading-7 shadow-sm ${msg.role === 'ai' ? 'bg-white/80 border border-white/60 text-zenith-navy rounded-tl-none' : 'bg-zenith-navy text-white shadow-lg rounded-tr-none'}`}>
                                 <ReactMarkdown components={{
                                     code({node, className, children, ...props}) {
                                         return <code className={`${className} bg-black/10 px-1 py-0.5 rounded font-mono text-xs`} {...props}>{children}</code>
                                     }
                                 }}>
                                    {msg.content}
                                 </ReactMarkdown>
                             </div>
                         </div>
                     ))}
                     {loading && (
                         <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-zenith-navy text-white flex items-center justify-center shrink-0 shadow-lg border-2 border-white">
                                 <Bot size={18} />
                             </div>
                             <div className="flex items-center gap-3 text-xs text-zenith-subtext bg-white/50 px-4 py-2 rounded-full border border-white/60">
                                 <Loader2 size={14} className="animate-spin text-zenith-navy" />
                                 <span className="font-medium tracking-wide">Analyzing smart contract state...</span>
                             </div>
                         </div>
                     )}
                     <div ref={messagesEndRef} />
                 </div>

                 <div className="p-6 bg-white/40 border-t border-white/50 backdrop-blur-md">
                     <div className="relative shadow-lg rounded-full group focus-within:shadow-2xl transition-all duration-300">
                         <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Query the protocol architect..."
                            className="w-full bg-white/90 border-transparent rounded-full py-4 pl-6 pr-14 text-sm text-zenith-navy focus:outline-none ring-1 ring-transparent focus:ring-zenith-navy/10 transition-all placeholder:text-zenith-subtext/60"
                         />
                         <button 
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-zenith-navy text-white rounded-full hover:bg-zenith-navy/90 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-md"
                         >
                             <Send size={16} />
                         </button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

const RiskCard = ({ protocol, score, metrics, status }: { protocol: string, score: number, metrics: string[], status: string }) => (
    <div className="glass-panel p-6 rounded-[28px] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-default">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h4 className="font-bold text-zenith-navy text-xl font-display">{protocol}</h4>
                <div className="text-[10px] font-bold text-zenith-subtext uppercase tracking-widest mt-1 group-hover:text-zenith-mintdark transition-colors">Risk Score</div>
            </div>
            <div className={`text-3xl font-mono font-bold ${score >= 90 ? 'text-zenith-mintdark' : 'text-orange-500'}`}>
                {score}
            </div>
        </div>
        <div className="space-y-3 mb-6">
            {metrics.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-zenith-subtext">
                    <CheckCircle2 size={14} className="text-zenith-navy/60" />
                    {m}
                </div>
            ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-zenith-navy/5">
            <span className="text-[10px] font-bold text-zenith-subtext uppercase tracking-wider">Live</span>
            <span className="text-[10px] font-bold text-zenith-mintdark bg-green-500/10 px-2 py-1 rounded-md flex items-center gap-1 border border-green-500/10">
                <Lock size={10} /> {status}
            </span>
        </div>
    </div>
);