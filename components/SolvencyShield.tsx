import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Activity, ChevronDown } from 'lucide-react';
import * as ethers from 'ethers';

// Sepolia Vault Address - Verified
const VAULT_ADDRESS = "0x350091059C8507c8fC3D82201AB09Fe3b251c281";
const VAULT_ABI = [
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

// Public Sepolia RPC
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_CHAIN_ID = 11155111n;

interface SolvencyShieldProps {
    provider: ethers.BrowserProvider | null;
}

export const SolvencyShield: React.FC<SolvencyShieldProps> = ({ provider: walletProvider }) => {
    const [stats, setStats] = useState<{ratio: number, isSolvent: boolean, assets: string, usdValue: string} | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        const fetchSolvency = async () => {
            setLoading(true);
            try {
                // Use wallet provider if available, otherwise fallback to read-only RPC
                let activeProvider: ethers.Provider;
                
                if (walletProvider) {
                    activeProvider = walletProvider;
                } else {
                    // FIX: Pass network ID to constructor to prevent async detection failure on startup
                    activeProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL, SEPOLIA_CHAIN_ID);
                }

                // Safety: Check if contract exists first to avoid errors
                // Note: getCode might still fail if RPC is down, so we wrap in try/catch
                const code = await activeProvider.getCode(VAULT_ADDRESS);
                if (code === '0x') {
                    // This handles cases where we are connected to the wrong network
                    throw new Error("Contract not found on this network");
                }

                const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, activeProvider);
                
                const [assets, supply] = await Promise.all([
                    vault.totalAssets(),
                    vault.totalSupply()
                ]);

                // Assets = 18 Decimals (Zenith Token)
                const assetVal = Number(ethers.formatUnits(assets, 18));
                // Supply = Shares (18 Decimals)
                const supplyVal = Number(ethers.formatUnits(supply, 18));
                
                // Ratio calculation: Assets / Supply (essentially Share Price)
                const ratio = supplyVal === 0 ? 1.0 : assetVal / supplyVal;
                
                setStats({
                    ratio: ratio,
                    isSolvent: ratio >= 1.0,
                    assets: assetVal.toLocaleString(undefined, {maximumFractionDigits: 2}),
                    usdValue: assetVal.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2})
                });
                setLastUpdated(new Date());
                setError(false);
               
            } catch (err) {
                // Silent fail for UI polish, keeps the shield hidden or in error state
                console.warn("Solvency check skipped (Network issue or wrong chain)");
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSolvency();
        const interval = setInterval(fetchSolvency, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [walletProvider]);

    if (error) {
         return null; 
    }

    if (!stats && loading) {
        return (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel">
                <Activity size={12} className="text-zenith-navy animate-pulse" />
                <span className="text-[10px] font-bold text-zenith-navy uppercase tracking-widest">Verifying...</span>
            </div>
        )
    }

    return (
        <div className="relative group z-50">
            <button className="flex items-center gap-3 px-4 py-2 rounded-full glass-panel hover:bg-white transition-all shadow-sm hover:shadow-md cursor-help">
                <div className="flex flex-col items-end leading-none gap-0.5">
                    <span className="text-[9px] font-bold text-zenith-subtext uppercase tracking-widest">Reserves</span>
                    <span className="text-xs font-mono font-bold text-zenith-navy">{stats?.usdValue || "0.00"}</span>
                </div>
                <div className="w-[1px] h-4 bg-zenith-navy/10"></div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${stats?.isSolvent ? 'bg-zenith-mint shadow-glow' : 'bg-red-500 animate-pulse'}`}></div>
                    <ChevronDown size={12} className="text-zenith-subtext group-hover:rotate-180 transition-transform"/>
                </div>
            </button>

            {/* Dropdown Card */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 glass-panel rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none transform translate-y-2 group-hover:translate-y-0 shadow-2xl">
                 <div className="flex items-center justify-between mb-3 border-b border-zenith-navy/5 pb-2">
                    <span className="text-[10px] font-bold uppercase text-zenith-subtext">Live Audit</span>
                    <span className="text-[10px] font-mono text-zenith-mintdark">{lastUpdated?.toLocaleTimeString()}</span>
                 </div>
                 
                 <div className="space-y-3">
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-zenith-subtext font-medium">Collateral</span>
                         <span className="font-mono font-bold text-zenith-navy">{stats?.assets || '0.00'} ZEN</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                         <span className="text-zenith-subtext font-medium">Backing Ratio</span>
                         <span className={`font-mono font-bold ${stats?.isSolvent ? 'text-zenith-mintdark' : 'text-red-500'}`}>
                             {stats ? (stats.ratio * 100).toFixed(2) : '0.00'}%
                         </span>
                     </div>
                     <div className="mt-2 pt-2 border-t border-zenith-navy/5">
                         <div className="flex items-center gap-2 text-[10px] text-zenith-subtext">
                             <Lock size={10} className="text-zenith-navy" />
                             Verified on Sepolia
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};