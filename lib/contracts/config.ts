export const CONTRACTS = {
  BookToken: {
    address: '0x3D4fcaeABdb780A7b9cF3CfEfb1F1F7d7C3F4d2E',
    abi: [] // Will be imported
  },
  BookLending: {
    address: '0xb3f05be3199539e47ddd425abbb94e45d1a2dbe8',
    abi: [] // Will be imported
  }
};

export const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/556a787db5724253b7117094d1ad79b9'], // Or use public RPC
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
  },
  localhost: {
    chainId: '0x539', // 1337 in hex
    chainName: 'Localhost 8545',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545/'],
    blockExplorerUrls: []
  }
};