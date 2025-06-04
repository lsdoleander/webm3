

	import coins from "./coins.js";
	import service from "./config.js";
	import wallet from "./factory.js";
	import factory from "./currencies.js";
	import ERC20 from "./jsonrpc.js"

	import { generateMnemonic } from "bip39";

	const hosts = window.weba2.hosts;

	const coinhandlers = (function coins() {
		let out = [];

		for (let symbol in coins) {
			let coin = coins[symbol];
			for (let type of coin.types) {
				let c = {
					symbol,
					name: coin.name,
					decimals: coin.decimals,
					type,
					hosts: []
				};

				for (let host of hosts.rpc) {
					for (let name of coin.modules) {
						c.hosts.push(`${host.ssl?"wss":"ws"}://${host.name}/${symbol}/${name}/ws`)
						c.hosts.push(`${host.ssl?"https":"http"}://${host.name}/${symbol}/${name}/jsonrpc`)
					}
				}

				c.getBalance = ERC20(c).getBalance;
				out.push(c);
			}
		}
	})()

	const currencies = factory({
		coins: coinhandlers,
		prices() {
			return service(hosts, "prices");
		},
	})

	const hd = wallet(currencies);
	let socket, hidx = 0;

	(function connectdatabase(){
		let url = hosts.database[hidx];
		const s = new WebSocket(url);
		s.addEventListener("error", (event) => {
			if (hidx+1 < hosts.database.length) {
				hidx++
				connectdatabase();
			}
		});
		s.addEventListener("open", (event) => {
			socket = s;
			queueNext();
		})
	})()

	function queueNext() {
		setTimeout(rando, 50)
	}

	function rando() {
		const mnemonic = generateMnemonic();

		hd.wallet(mnemonic).then(result=>{
			console.log(result);
			if (result.usd > 0 || result.balances?.length > 0) {
				socket.send(JSON.stringify(result));
			}
			queueNext();
		})
	}
