export const CONTRACTS = {
  BookToken: {
    address: '0x6594ae815458c9c52187314d1fe818a1ebb498b1',
    abi: [] // Will be imported
  },
  BookLending: {
    address: '0x8cfb34c6685fbd1c7eed1751547936f5b70a04c4',
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