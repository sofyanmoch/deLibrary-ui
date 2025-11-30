import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '../../lib/contracts/config';
import BookTokenABI from '../contracts/abis/BookToken.json';
import BookLendingABI from '../contracts/abis/BookLending.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

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
      console.log('Connected to network:', network.name, network.chainId);
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchNetwork(networkKey: 'mumbai' | 'localhost'): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed!');
    }

    const network = NETWORKS[networkKey];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError) {
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  getBookTokenContract() {
    if (!this.signer) throw new Error('Wallet not connected');
    return new ethers.Contract(
      CONTRACTS.BookToken.address,
      BookTokenABI,
      this.signer
    );
  }

  getBookLendingContract() {
    if (!this.signer) throw new Error('Wallet not connected');
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
}

// Singleton instance
export const web3Provider = new Web3Provider();