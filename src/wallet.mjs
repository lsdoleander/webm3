
	import coins from './coins.js'
	import { balance, prices } from "webm3-rpc"
	import factory from "./currencies.js"
	import wf from './factory.js'

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
					getBalance: balance(symbol).getBalance
				})
			}
		}

		return output;
	})()

	const currencies = factory({
		prices: prices,
		coins: coinhandlers
	})

	const hd = wf(currencies);

	export const wallet = hd.wallet;
	export default wallet;	