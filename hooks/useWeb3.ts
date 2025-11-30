import { useState, useEffect, useCallback } from 'react';
import { web3Provider } from '../lib/web3/provider';

export function useWeb3() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const address = await web3Provider.connect();
      setWalletAddress(address);
      setIsConnected(true);
      
      // Get balances
      const ethBalance = await web3Provider.getBalance(address);
      const bookBalance = await web3Provider.getTokenBalance(address);
      
      setBalance(ethBalance);
      setTokenBalance(bookBalance);
      
      return address;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0');
    setTokenBalance('0');
  }, []);

  const switchNetwork = useCallback(async (network: 'mumbai' | 'localhost') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await web3Provider.switchNetwork(network);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      const ethBalance = await web3Provider.getBalance(walletAddress);
      const bookBalance = await web3Provider.getTokenBalance(walletAddress);
      
      setBalance(ethBalance);
      setTokenBalance(bookBalance);
    } catch (err: any) {
      console.error('Error refreshing balances:', err);
    }
  }, [walletAddress]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0]);
        refreshBalances();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [walletAddress, disconnectWallet, refreshBalances]);

  return {
    isConnected,
    walletAddress,
    balance,
    tokenBalance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalances
  };
}
