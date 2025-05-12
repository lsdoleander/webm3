
	import coins from './coins'
	import localized from "webm3-rpc/localized.js"
	import factory from "./currencies"
	import wallet from './factory'

	const coinhandlers = (function(){
		let output = [];

		for (let symbol in coins) {
			let conf = coins[symbol];
			for (let type of conf.types) {
				output.push({
					name: conf.name,
					type,
					symbol,
					decimals: conf.decimals,
					getBalance: localized.RPC(symbol).getBalance
				})
			}
		}

		return output;
	})()

	const currencies = factory({
		prices: localized.getPrices,
		coins: coinhandlers
	})

	const hd = wallet(currencies);

	export default hd.wallet
	