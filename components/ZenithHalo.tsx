import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Mic, Search, Command } from 'lucide-react';

interface ZenithHaloProps {
  onIntent: (intent: HaloIntent) => void;
}

export type HaloIntent = 
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'WITHDRAW'; amount: 'MAX' | number }
  | { type: 'TRANSFER'; recipient: string; amount: number }
  | { type: 'SCROLL_YIELD' }
  | { type: 'NAVIGATE'; view: string };

const PLACEHOLDERS = [
  "Send $50 to Mom...",
  "Cash out to my bank...",
  "How much interest did I make?",
  "Optimize my yield...",
  "Analyze contract security..."
];

export const ZenithHalo: React.FC<ZenithHaloProps> = ({ onIntent }) => {
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter Effect
  useEffect(() => {
    if (isTyping) return; 

    const currentText = PLACEHOLDERS[placeholderIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setPlaceholder(currentText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholder(currentText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 3000); 
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }
    }, isDeleting ? 30 : 60);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const parseIntent = () => {
    const text = input.toLowerCase();
    
    // 1. Transfer Logic (Semantic Search)
    if (text.includes('send') || text.includes('pay') || text.includes('transfer')) {
        const amountMatch = text.match(/(\d+)/);
        const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
        
        // Naive recipient parsing for this interface
        let recipient = "unknown";
        if (text.includes('mom')) recipient = "0xAlice..."; // In prod, map to Contact List
        
        console.log(`[Intent Solver] Generated Intent: SEND ${amount} USDC -> ${recipient}`);
        onIntent({ type: 'TRANSFER', recipient, amount }); 
        reset();
        return;
    }

    // 2. Cash Out Logic (JIT Liquidity)
    if (text.includes('cash out') || text.includes('bank') || text.includes('offramp')) {
        console.log(`[Intent Solver] Generated Intent: WITHDRAW ALL -> RTP_RAIL`);
        onIntent({ type: 'WITHDRAW', amount: 'MAX' });
        reset();
        return;
    }

    // 3. Deposit Logic
    if (text.includes('deposit') || text.includes('save') || text.includes('put') || text.includes('invest')) {
        const amountMatch = text.match(/(\d+)/);
        const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
        onIntent({ type: 'DEPOSIT', amount });
        reset();
        return;
    }

    // 4. Yield/Stats Logic
    if (text.includes('profit') || text.includes('made') || text.includes('yield') || text.includes('interest')) {
        onIntent({ type: 'SCROLL_YIELD' }); 
        onIntent({ type: 'NAVIGATE', view: 'STATS' });
        reset();
        return;
    }
    
    // 5. Navigation Logic
    if (text.includes('contract') || text.includes('code')) {
        onIntent({ type: 'NAVIGATE', view: 'CONTRACTS' });
        reset();
        return;
    }
    
    if (text.includes('audit') || text.includes('security') || text.includes('help')) {
        onIntent({ type: 'NAVIGATE', view: 'AUDIT' });
        reset();
        return;
    }

    // Fallback
    console.warn("Intent not recognized:", text);
    // In prod, this would trigger an LLM query to interpret vague intent
  };

  const reset = () => {
    setInput('');
    setIsTyping(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        parseIntent();
    }
  };

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-50">
        <div className="relative group">
            {/* Soft Glow */}
            <div className={`absolute -inset-4 rounded-full opacity-0 group-hover:opacity-40 transition-all duration-700 bg-zenith-mint/20 blur-xl`}></div>

            {/* The Bar */}
            <div className="relative flex items-center bg-white/80 backdrop-blur-2xl rounded-full border border-white/60 p-2 shadow-2xl transition-all duration-300 focus-within:bg-white/90 focus-within:scale-[1.02] ring-1 ring-white/50">
                {/* Icon */}
                <div className={`p-3 rounded-full transition-colors duration-300 ${isTyping ? 'bg-zenith-navy text-white shadow-lg' : 'bg-zenith-bg text-zenith-navy'}`}>
                    {isTyping ? <Search size={18} /> : <Sparkles size={18} className="animate-pulse" />}
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-zenith-navy px-4 text-base font-medium placeholder-zenith-subtext/50 font-sans"
                    placeholder={!isTyping ? placeholder : ''}
                />

                {/* Action Button */}
                {input.length > 0 ? (
                    <button 
                        onClick={parseIntent}
                        className="p-3 rounded-full bg-zenith-navy text-white hover:scale-110 transition-all shadow-lg hover:shadow-glow"
                    >
                        <ArrowRight size={18} />
                    </button>
                ) : (
                    <div className="p-3 text-zenith-subtext/50 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Command</span>
                        <Command size={14} />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};