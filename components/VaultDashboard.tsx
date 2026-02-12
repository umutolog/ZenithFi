import React, { useState } from 'react';
import { Loader2, ArrowRight, Wallet, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import * as ethers from 'ethers';
import { useZenith } from '../hooks/useZenith';

interface VaultDashboardProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  onConnect: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({ account, provider, onConnect }) => {
  const { stake, withdraw, simulateYield, data, status, error } = useZenith(provider, account);
  const [amount, setAmount] = useState('');

  const handleStake = () => {
    if (amount) stake(amount);
  };

  const hasStakedBalance = parseFloat(data.stakedBalance) > 0;

  return (
    <div className="flex flex-col items-center text-center w-full">
      
      {/* Header */}
      <h1 className="text-6xl md:text-8xl font-display font-[800] tracking-tighter mb-4 bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
        Zenith Yield
      </h1>
      <p className="text-gray-400 text-xl max-w-xl mb-12">
        ERC-4626 Standard Vault. <br />
        Stake <span className="text-white font-bold">ZENITH</span>. Receive <span className="text-white font-bold">sZENITH</span>.
      </p>

      {/* Main Card */}
      <div className="w-full max-w-[480px] bg-[#111] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
         {/* Yield Flash */}
         <div className="absolute top-0 right-0 p-4 bg-green-500/10 rounded-bl-3xl border-b border-l border-green-500/20">
             <div className="text-green-400 font-mono text-xs font-bold flex items-center gap-1">
                 <TrendingUp size={12} />
                 Share Price: {parseFloat(data.sharePrice).toFixed(6)}
             </div>
         </div>

         {/* Balance Input */}
         <div className="mt-8 mb-8">
             <input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-center text-5xl font-display font-[200] text-white placeholder:text-gray-800 outline-none"
             />
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2 flex justify-center gap-2">
                 <span>Available:</span>
                 <span className="text-white font-mono">{parseFloat(data.tokenBalance).toFixed(4)} ZEN</span>
             </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-white/5 p-4 rounded-2xl">
                 <div className="text-xs text-gray-500 font-bold uppercase mb-1">Staked Assets</div>
                 <div className="text-lg font-mono text-white break-all leading-tight">
                    {parseFloat(data.stakedBalance).toFixed(6)}
                 </div>
                 <div className="text-[10px] text-gray-600 mt-1">sZENITH</div>
             </div>
             <div className="bg-white/5 p-4 rounded-2xl">
                 <div className="text-xs text-gray-500 font-bold uppercase mb-1">Protocol TVL</div>
                 <div className="text-lg font-mono text-white leading-tight">
                    {parseFloat(data.tvl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                 </div>
                 <div className="text-[10px] text-gray-600 mt-1">Total ZEN</div>
             </div>
         </div>

         {/* Actions */}
         <div className="space-y-3">
             {/* Main Stake Button */}
             <button
                onClick={handleStake}
                disabled={status !== 'IDLE' && status !== 'ERROR'}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                    ${status === 'SUCCESS' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
             >
                 {status === 'IDLE' && <>Stake Assets <ArrowRight size={18} /></>}
                 {status === 'CHECKING' && <><Loader2 className="animate-spin" /> Verifying...</>}
                 {status === 'APPROVING' && <><Loader2 className="animate-spin" /> Approving Token...</>}
                 {status === 'STAKING' && <><Loader2 className="animate-spin" /> Staking to Vault...</>}
                 {status === 'SIMULATING' && <><Loader2 className="animate-spin" /> Simulating...</>}
                 {status === 'WITHDRAWING' && <><Loader2 className="animate-spin" /> Processing...</>}
                 {status === 'SUCCESS' && <><CheckCircle /> Transaction Confirmed</>}
                 {status === 'ERROR' && "Failed - Try Again"}
             </button>

             {/* Withdraw Button - Always visible but disabled if 0 balance */}
             <button 
                onClick={withdraw}
                disabled={status !== 'IDLE' || !hasStakedBalance}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-white/10
                    ${hasStakedBalance ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-700 opacity-50 cursor-not-allowed'}
                `}
             >
                {status === 'WITHDRAWING' ? <Loader2 className="animate-spin" size={16}/> : <Wallet size={16} />}
                Unstake & Withdraw All
             </button>
         </div>

         {/* Error Message */}
         {status === 'ERROR' && (
             <div className="mt-4 p-3 bg-red-900/20 text-red-400 text-xs rounded-xl border border-red-500/20">
                 {error}
             </div>
         )}
      </div>

      {/* Admin Zone: Yield Simulation */}
      <div className="mt-12">
          <button 
            onClick={simulateYield}
            disabled={status !== 'IDLE'}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-green-400 transition-colors uppercase tracking-widest group"
          >
              <Zap size={12} className="group-hover:text-green-400" />
              {status === 'SIMULATING' ? 'Injecting Yield...' : 'Simulate Protocol Yield (+1000 ZEN)'}
          </button>
          <p className="text-[10px] text-gray-700 mt-2 max-w-xs mx-auto">
              (Admin Only) Increases Vault Assets without minting shares, boosting Share Price.
          </p>
      </div>

    </div>
  );
};