
	import Arbitrum_One from "./chain/Arbitrum_One_RPC_URL_List.js";
	import Avalanche_C_Chain from "./chain/Avalanche_C-Chain_RPC_URL_List.js";
	import BNB_Smart_Chain_Mainnet from "./chain/BNB_Smart_Chain_Mainnet_RPC_URL_List.js";
	import Base from "./chain/Base_RPC_URL_List.js";
	import Bitlayer_Mainnet from "./chain/Bitlayer_Mainnet_RPC_URL_List.js";
	import Blast from "./chain/Blast_RPC_URL_List.js";
	import Core_Blockchain_Mainnet from "./chain/Core_Blockchain_Mainnet_RPC_URL_List.js";
	import Cronos_Mainnet from "./chain/Cronos_Mainnet_RPC_URL_List.js";
	import Ethereum_Classic from "./chain/Ethereum_Classic_RPC_URL_List.js";
	import Ethereum_Mainnet from "./chain/Ethereum_Mainnet_RPC_URL_List.js";
	import Fantom_Opera from "./chain/Fantom_Opera_RPC_URL_List.js";
	import Gnosis from "./chain/Gnosis_RPC_URL_List.js";
	import Linea from "./chain/Linea_RPC_URL_List.js";
	import Mantle from "./chain/Mantle_RPC_URL_List.js";
	import OP_Mainnet from "./chain/OP_Mainnet_RPC_URL_List.js";
	import Polygon_Mainnet from "./chain/Polygon_Mainnet_RPC_URL_List.js";
	import PulseChain from "./chain/PulseChain_RPC_URL_List.js";
	import Sonic_Mainnet from "./chain/Sonic_Mainnet_RPC_URL_List.js";
	import Zircuit_Mainnet from "./chain/Zircuit_Mainnet_RPC_URL_List.js";


	import chains from "./defi.js"
	import ERC20 from "./jsonrpc.js"

	
	const HOSTS = {
	  Arbitrum_One,
	  "Avalanche_C-Chain": Avalanche_C_Chain,
	  BNB_Smart_Chain_Mainnet,
	  Base,
	  Bitlayer_Mainnet,
	  Blast,
	  Core_Blockchain_Mainnet,
	  Cronos_Mainnet,
	  Ethereum_Classic,
	  Ethereum_Mainnet,
	  Fantom_Opera,
	  Gnosis,
	  Linea,
	  Mantle,
	  OP_Mainnet,
	  Polygon_Mainnet,
	  PulseChain,
	  Sonic_Mainnet,
	  Zircuit_Mainnet
	};

	export default function({ coins, prices }) {
		return {
			coins(){
				return coins;
			},

			chains() {
				let out = [];
				
				for (let label in chains) {
					let ch = chains[label];
					ch.name = label;
					ch.hosts = HOSTS[label]
					ch.ERC20 = ERC20(ch);
					out.push (ch);
				}
				return out;
			},

			prices() {
				return prices(hosts, "prices")
			}
		}
	}
