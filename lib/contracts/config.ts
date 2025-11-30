export const CONTRACTS = {
  BookToken: {
    address: '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8', // ⚠️ REPLACE!
    abi: [] // Will be imported
  },
  BookLending: {
    address: '0xf8e81D47203A594245E36C48e151709F0C19fBe8', // ⚠️ REPLACE!
    abi: [] // Will be imported
  }
};

export const NETWORKS = {
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
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