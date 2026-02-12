import React, { useState, useEffect } from 'react';
import * as ethers from 'ethers';
import { Wifi, AlertCircle, Wallet, ChevronRight, Loader2 } from 'lucide-react';

interface ConnectWalletProps {
  setSigner?: (signer: any) => void;
  setProvider?: (provider: any) => void;
  setAddress?: (address: string | null) => void;
}

const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'; // 11155111
const SEPOLIA_CHAIN_ID_DEC = 11155111;

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ setSigner, setProvider, setAddress }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Safe accessor for window.ethereum
  const getEthereum = () => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const eth = (window as any).ethereum;
      // Handle EIP-6963 (Multiple Injected Providers)
      if (eth.providers) {
        return eth.providers.find((p: any) => p.isMetaMask) || eth.providers[0];
      }
      return eth;
    }
    return null;
  };

  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = getEthereum();
      if (!ethereum) return;

      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          handleAccountsChanged(accounts);
        }

        // Setup Listeners
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', () => window.location.reload());
      } catch (err) {
        console.error("Auto-connect failed", err);
      }
    };

    checkConnection();

    return () => {
      const ethereum = getEthereum();
      if (ethereum && ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: any[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      if (setAddress) setAddress(accounts[0]);
      
      const ethereum = getEthereum();
      if (ethereum) {
        try {
            const provider = new ethers.BrowserProvider(ethereum);
            if (setProvider) setProvider(provider);
            
            const signer = await provider.getSigner();
            if (setSigner) setSigner(signer);
            
            const network = await provider.getNetwork();
            if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DEC) {
                setNetworkError(true);
            } else {
                setNetworkError(false);
            }
        } catch (e) {
            console.error("Provider setup error", e);
        }
      }
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setNetworkError(false);
    if (setAddress) setAddress(null);
    if (setProvider) setProvider(null);
    if (setSigner) setSigner(null);
  }

  const connectWalletHandler = async () => {
    setIsConnecting(true);
    const ethereum = getEthereum();

    if (!ethereum) {
      alert("MetaMask not found. Please install a crypto wallet extension.");
      setIsConnecting(false);
      return;
    }

    try {
      // Direct call to requestAccounts - essential for popup blockers
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
    } catch (error: any) {
      console.error(error);
      if (error.code === 4001) {
          // User rejected
      } else {
          alert("Failed to connect. Please open your wallet extension manually.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
        });
        setNetworkError(false);
    } catch (error: any) {
        // Chain not added code
        if (error.code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: SEPOLIA_CHAIN_ID_HEX,
                        chainName: 'Sepolia Testnet',
                        rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                        nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }],
                });
            } catch (addError) {
                console.error(addError);
            }
        }
    }
  };

  if (networkError && isConnected) {
     return (
        <button 
          onClick={switchNetwork}
          className="bg-zenith-coral text-white font-bold text-xs py-2 px-4 rounded-full shadow-lg hover:scale-[1.02] flex items-center gap-2 transition-transform"
        >
          <AlertCircle size={14} />
          Switch to Sepolia
        </button>
     );
  }

  return (
    <div className="flex flex-col items-center">
      {!isConnected ? (
        <button 
          onClick={connectWalletHandler}
          disabled={isConnecting}
          className="bg-zenith-navy hover:bg-slate-800 text-white font-bold text-xs py-3 px-6 rounded-full shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 group ring-1 ring-white/20 disabled:opacity-70 disabled:cursor-wait"
        >
          {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
          {isConnecting ? "Connecting..." : "Connect Wallet"}
          {!isConnecting && <ChevronRight size={14} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      ) : (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md pl-3 pr-4 py-2 rounded-full border border-white/60 shadow-sm transition-all hover:bg-white cursor-pointer group">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-zenith-mint to-teal-600 shadow-glow flex items-center justify-center`}>
                    <Wifi size={12} className="text-white" />
                </div>
                <span className="text-zenith-navy font-mono text-xs font-bold">
                    {walletAddress.substring(0, 5)}...{walletAddress.substring(38)}
                </span>
            </div>
        </div>
      )}
    </div>
  );
};