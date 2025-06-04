export default {
  BTC: { name: "Bitcoin", types: [ 44, 49, 84 ], decimals: 8,
    modules: [ "cryptoid", "3xpl", "trezor1", "trezor2", "bitinfo" ]},

  LTC: { name: "Litecoin", types: [ 44, 49, 84 ], decimals: 8, 
    modules: [ "cryptoid", "3xpl", "trezor", "bitinfo" ]},

  DASH: { name: "Dash", types: [ 44 ], decimals: 8, 
    modules: [ "cryptoid", "3xpl", "dash", "bitinfo" ]},

  DGB: { name: "Digibyte", types: [ 44 ], decimals: 8,
    modules: [ "cryptoid", "3xpl" ]},

  // ZEC: { name: "Zcash", types: [ 44 ], decimals: 8,
  //   modules: [ "3xpl", "scraper", "zelcore" ]},

  BCH: { name: "BitcoinCash", types: [ 84 ], decimals: 8,
    modules: [ "3xpl", "fullstack" ]},

  XRP: { name: "Ripple", types: [ 44 ], decimals: 6, 
    modules: [ "3xpl", "s2" ]},

  TRX: { name: "Tron", types: [ 44 ], decimals: 6,
    modules: [ "3xpl", "trongrid" ]},

  DOGE: { name: "Dogecoin", types: [ 44 ], decimals: 8,
    modules: [ "3xpl", "bitinfo" ]},

  SOL: { name: "Solana", types: [ 44 ], decimals: 9, 
    modules: [ "3xpl", "solana" ]},

  XLM: { name: "Stellar", types: [ 44 ], decimals: 7,
    modules: [ "3xpl", "horizon" ]}
}