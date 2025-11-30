import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '../../lib/contracts/config';
import BookTokenABI from '../contracts/abis/BookToken.json';
import BookLendingABI from '../contracts/abis/BookLending.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Sepolia Chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in decimal

export class Web3Provider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Check network
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
      
      // ⚠️ IMPORTANT: Check if connected to Sepolia
      if (network.chainId !== 11155111n) { // Note: BigInt comparison
        console.warn('⚠️ Not connected to Sepolia! Switching...');
        await this.switchNetwork('sepolia');
        // Reconnect after switching
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      }
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchNetwork(networkKey: 'sepolia' | 'localhost'): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    const network = NETWORKS[networkKey];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      
      // Wait a bit for network switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  async getCurrentChainId(): Promise<bigint> {
    if (!this.provider) throw new Error('Provider not initialized');
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async isCorrectNetwork(): Promise<boolean> {
    try {
      const chainId = await this.getCurrentChainId();
      return chainId === 11155111n; // Sepolia
    } catch {
      return false;
    }
  }

  getBookTokenContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    
    // Add address validation
    if (!ethers.isAddress(CONTRACTS.BookToken.address)) {
      throw new Error('Invalid BookToken contract address');
    }
    
    return new ethers.Contract(
      CONTRACTS.BookToken.address,
      BookTokenABI,
      this.signer
    );
  }

  getBookLendingContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    
    // Add address validation
    if (!ethers.isAddress(CONTRACTS.BookLending.address)) {
      throw new Error('Invalid BookLending contract address');
    }
    
    return new ethers.Contract(
      CONTRACTS.BookLending.address,
      BookLendingABI,
      this.signer
    );
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(address: string): Promise<string> {
    const tokenContract = this.getBookTokenContract();
    const balance = await tokenContract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  // Add method to check if contract exists
  async isContractDeployed(address: string): Promise<boolean> {
    if (!this.provider) throw new Error('Provider not initialized');
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x'; // If code is not empty, contract exists
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const web3Provider = new Web3Provider();