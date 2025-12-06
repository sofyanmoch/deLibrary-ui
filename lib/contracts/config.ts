export const CONTRACTS = {
  BookToken: {
    address: '0xFAEe134784cb181514B2B2fBbCd400B10C1c682F', // Arbitrum Sepolia
    abi: [] // Will be imported
  },
  BookLending: {
    address: '0x5995bF3f069F143f835438FCC74918143Fa10157', // Arbitrum Sepolia
    abi: [] // Will be imported
  }
};

export const NETWORKS = {
  arbitrumSepolia: {
    chainId: '0x66eee', // 421614 in hex
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io/']
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/556a787db5724253b7117094d1ad79b9'],
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