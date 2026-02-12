import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileCode, Activity } from 'lucide-react';
import { VaultDashboard } from './components/VaultDashboard';
import { ContractViewer } from './components/ContractViewer';
import { ProtocolStats } from './components/ProtocolStats';
import { ConnectWallet } from './components/ConnectWallet';
import { SolvencyShield } from './components/SolvencyShield';
import { GuardianMonitor } from './components/GuardianMonitor';
import * as ethers from 'ethers';

enum NavView {
  DASHBOARD = 'DASHBOARD',
  CONTRACTS = 'CONTRACTS',
  STATS = 'STATS'
}

declare global {
  interface Window {
    ethereum: any;
  }
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavView>(NavView.DASHBOARD);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    // OLED DARK MODE: bg-black, text-white
    <div className="min-h-screen w-full bg-black text-white selection:bg-zenith-mint/30 overflow-hidden font-sans">
      
      {/* Subtle Ambient Light (Reduced for OLED Look) */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-zenith-mint/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => setCurrentView(NavView.DASHBOARD)}>
              <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-display font-bold text-lg">Z</div>
              <div>
                  <span className="text-lg font-[800] tracking-tight font-display block leading-none">ZenithFi</span>
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Protocol Core</span>
              </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-4">
             <SolvencyShield provider={provider} />
             <ConnectWallet setAddress={setAccount} setProvider={setProvider} />
          </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center pt-32 pb-48 px-4">
          <div className="w-full max-w-[960px] mx-auto">
            {currentView === NavView.DASHBOARD && <VaultDashboard account={account} provider={provider} onConnect={() => {}} />}
            {currentView === NavView.CONTRACTS && <ContractViewer />}
            {currentView === NavView.STATS && <ProtocolStats />}
          </div>
      </main>
      
      {/* Navigation Dock */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
           <div className="flex items-center gap-1 bg-[#111] border border-white/10 rounded-full p-1.5 shadow-2xl">
                <NavIcon active={currentView === NavView.DASHBOARD} onClick={() => setCurrentView(NavView.DASHBOARD)} icon={<LayoutDashboard size={18} />} label="Vault" />
                <NavIcon active={currentView === NavView.STATS} onClick={() => setCurrentView(NavView.STATS)} icon={<Activity size={18} />} label="Stats" />
                <NavIcon active={currentView === NavView.CONTRACTS} onClick={() => setCurrentView(NavView.CONTRACTS)} icon={<FileCode size={18} />} label="Code" />
           </div>
      </div>

      <GuardianMonitor />
    </div>
  );
};

const NavIcon = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`px-5 py-3 rounded-full transition-all flex items-center gap-2 ${active ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}>
        {icon}
        {active && <span className="text-xs font-bold">{label}</span>}
    </button>
);

export default App;