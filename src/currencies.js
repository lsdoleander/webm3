
import Ethereum_Mainnet from './chain/Ethereum_Mainnet__RPC.js'
import Optimism from './chain/Optimism__RPC.js'
import Cronos from './chain/Cronos__RPC.js'
import BNB_Smart_Chain from './chain/BNB_Smart_Chain__RPC.js'
import Ethereum_Classic from './chain/Ethereum_Classic__RPC.js'
import Gnosis from './chain/Gnosis__RPC.js'
import Unichain from './chain/Unichain__RPC.js'
import Polygon from './chain/Polygon__RPC.js'
import Sonic from './chain/Sonic__RPC.js'
import Fantom_Opera from './chain/Fantom_Opera__RPC.js'
import PulseChain from './chain/PulseChain__RPC.js'
import Core from './chain/Core__RPC.js'
import Sei_Network from './chain/Sei_Network__RPC.js'
import Mantle from './chain/Mantle__RPC.js'
import Base from './chain/Base__RPC.js'
import Arbitrum_One from './chain/Arbitrum_One__RPC.js'
import Avalanche_C_Chain from './chain/Avalanche_C_Chain__RPC.js'
import Zircuit from './chain/Zircuit__RPC.js'
import Linea from './chain/Linea__RPC.js'
import Bera from './chain/Bera__RPC.js'
import Blast from './chain/Blast__RPC.js'
import Bitlayer from './chain/Bitlayer__RPC.js'

import ERC20 from "./jsonrpc.js"

const chains = (function(){ 
	let CONFIGS = [
		{ id: 1, symbol: "ETH", hosts: Ethereum_Mainnet, name: "Ethereum Mainnet" },
		{ id: 10, symbol: "ETH", hosts: Optimism, name: "Optimism" },
		{ id: 25, symbol: "CRO", hosts: Cronos, name: "Cronos" },
		{ id: 56, symbol: "BNB", hosts: BNB_Smart_Chain, name: "BNB Smart Chain" },
		{ id: 61, symbol: "ETC", hosts: Ethereum_Classic, name: "Ethereum Classic" },
		{ id: 100, symbol: "XDAI", hosts: Gnosis, name: "Gnosis" },
		{ id: 130, symbol: "ETH", hosts: Unichain, name: "Unichain" },
		{ id: 137, symbol: "POL", hosts: Polygon, name: "Polygon" },
		{ id: 146, symbol: "S", hosts: Sonic, name: "Sonic" },
		{ id: 250, symbol: "FTM", hosts: Fantom_Opera, name: "Fantom Opera" },
		{ id: 369, symbol: "PLS", hosts: PulseChain, name: "PulseChain" },
		{ id: 1116, symbol: "CORE", hosts: Core, name: "Core" },
		{ id: 1329, symbol: "SEI", hosts: Sei_Network, name: "Sei Network" },
		{ id: 5000, symbol: "MNT", hosts: Mantle, name: "Mantle" },
		{ id: 8453, symbol: "ETH", hosts: Base, name: "Base" },
		{ id: 42161, symbol: "ETH", hosts: Arbitrum_One, name: "Arbitrum One" },
		{ id: 43114, symbol: "AVAX", hosts: Avalanche_C_Chain, name: "Avalanche C-Chain" },
		{ id: 48900, symbol: "ETH", hosts: Zircuit, name: "Zircuit" },
		{ id: 59144, symbol: "ETH", hosts: Linea, name: "Linea" },
		{ id: 80094, symbol: "BERA", hosts: Bera, name: "Bera" },
		{ id: 81457, symbol: "ETH", hosts: Blast, name: "Blast" },
		{ id: 200901, symbol: "BTC", hosts: Bitlayer, name: "Bitlayer" }
	];
	for (let ch in CONFIGS) {
		CONFIGS[ch].ERC20 = ERC20(CONFIGS[ch]);
	}
	return CONFIGS;
})();

export default function({ coins, prices }) {
	return {
		coins(){
			return coins;
		},

		chains() {
			return chains;
		},

		prices() {
			return prices()
		}
	}
}
