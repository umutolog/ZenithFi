import { useState, useEffect, useCallback } from 'react';
import * as ethers from 'ethers';

// --- CONFIGURATION ---
// Deployed on Sepolia Testnet - LIVE ADDRESSES
const TOKEN_ADDRESS = "0x6bc373e3230d6A29C235BFEaF13fE052ad061DE2"; 
const VAULT_ADDRESS = "0x350091059C8507c8fC3D82201AB09Fe3b251c281"; 

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const ERC4626_ABI = [
  "function deposit(uint256 assets, address receiver) external returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) external returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function simulateYield(uint256 amount) external"
];

export type TxStatus = 'IDLE' | 'CHECKING' | 'APPROVING' | 'STAKING' | 'WITHDRAWING' | 'SIMULATING' | 'SUCCESS' | 'ERROR';

export const useZenith = (provider: ethers.BrowserProvider | null, account: string | null) => {
  const [status, setStatus] = useState<TxStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState({
    tokenBalance: '0.00',
    stakedBalance: '0.00',
    sharePrice: '1.000',
    tvl: '0.00'
  });

  const getStats = useCallback(async () => {
    if (!provider || !account) return;
    try {
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
          console.warn("Wrong network detected in hook");
          return;
      }

      const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
      const vault = new ethers.Contract(VAULT_ADDRESS, ERC4626_ABI, provider);

      const [bal, shares, assets, oneShareAssets] = await Promise.all([
        token.balanceOf(account),
        vault.balanceOf(account), // sZENITH Balance (Shares)
        vault.totalAssets(),
        vault.convertToAssets(ethers.parseEther("1"))
      ]);

      // Convert share balance to underlying asset value for display
      const stakedValue = await vault.convertToAssets(shares);

      setData({
        tokenBalance: ethers.formatUnits(bal, 18),
        stakedBalance: ethers.formatUnits(stakedValue, 18),
        sharePrice: ethers.formatUnits(oneShareAssets, 18),
        tvl: ethers.formatUnits(assets, 18)
      });
    } catch (e: any) {
      console.warn("Stats error:", e.message);
    }
  }, [provider, account]);

  useEffect(() => {
    getStats();
    const i = setInterval(getStats, 10000); 
    return () => clearInterval(i);
  }, [getStats]);

  // --- TWO-STEP STAKE ---
  const stake = async (amountStr: string) => {
    if (!provider || !account) return;
    setStatus('CHECKING');
    setError(null);

    try {
      const signer = await provider.getSigner();
      const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const vault = new ethers.Contract(VAULT_ADDRESS, ERC4626_ABI, signer);
      
      // Ensure we use 18 decimals as per ERC20 standard
      const amount = ethers.parseUnits(amountStr, 18);

      // STEP 1: APPROVE
      setStatus('APPROVING');
      const allowance = await token.allowance(account, VAULT_ADDRESS);
      
      if (allowance < amount) {
          const tx = await token.approve(VAULT_ADDRESS, ethers.MaxUint256);
          await tx.wait();
      }

      // STEP 2: DEPOSIT (ERC4626)
      setStatus('STAKING');
      const txDeposit = await vault.deposit(amount, account);
      await txDeposit.wait();

      setStatus('SUCCESS');
      await getStats();
      setTimeout(() => setStatus('IDLE'), 3000);

    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      if (err.code === 4001 || (err.info && err.info.error && err.info.error.code === 4001)) {
          setError("Transaction rejected by user");
      } else {
          setError(err.reason || "Transaction failed");
      }
    }
  };

  // --- REDEEM / UNSTAKE ---
  const withdraw = async () => {
    if (!provider || !account) return;
    setStatus('WITHDRAWING');
    setError(null);

    try {
      const signer = await provider.getSigner();
      const vault = new ethers.Contract(VAULT_ADDRESS, ERC4626_ABI, signer);

      // 1. Get current shares
      const shares = await vault.balanceOf(account);
      if (shares === 0n) throw new Error("No stake to withdraw");

      // 2. Redeem function: shares, receiver, owner
      const tx = await vault.redeem(shares, account, account);
      await tx.wait();

      setStatus('SUCCESS');
      await getStats();
      setTimeout(() => setStatus('IDLE'), 3000);
    } catch (err: any) {
      setStatus('ERROR');
      if (err.code === 4001) {
        setError("Transaction rejected");
      } else {
        console.error(err);
        setError(err.reason || "Withdrawal failed");
      }
    }
  };

  // --- ADMIN: SIMULATE YIELD ---
  const simulateYield = async () => {
     if (!provider || !account) return;
     setStatus('SIMULATING');
     try {
        const signer = await provider.getSigner();
        const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
        const vault = new ethers.Contract(VAULT_ADDRESS, ERC4626_ABI, signer);
        
        const yieldAmount = ethers.parseEther("1000");

        const allowance = await token.allowance(account, VAULT_ADDRESS);
        if (allowance < yieldAmount) {
            const txApprove = await token.approve(VAULT_ADDRESS, ethers.MaxUint256);
            await txApprove.wait();
        }

        const tx = await vault.simulateYield(yieldAmount);
        await tx.wait();

        setStatus('SUCCESS');
        await getStats();
        setTimeout(() => setStatus('IDLE'), 3000);
     } catch(err: any) {
         setStatus('ERROR');
         setError(err.reason || "Yield simulation failed");
     }
  }

  return { stake, withdraw, simulateYield, data, status, error };
};