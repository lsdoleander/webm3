

import fs from 'fs'
import _currencies_ from '../src/currencies.js'

let currencies = _currencies_({}).chains();

let tested = (function(){
	return JSON.parse(fs.readFileSync("gen/rpctimes.json"))
})();

for (let name in tested) {
	let rpcs = tested[name];
	let urls = [];
	for (let url in rpcs) {
		let ms = rpcs[url];
		let score = ms.reduce((sum, i) => sum+i)/ms.length;
		let failures = 8 - ms.length;
		urls.push({  url, score, failures, })
	}

	let slug = name.replaceAll(" ", "_").replaceAll("-", "_");
	let fn = slug + "__RPC.js";
	urls.sort(function(a,b){
		if (a.score < b.score) return 1
		return -1;
	})
	urls.sort(function(a,b){
		if (a.failures < b.failures) return -1
		return 1;
	})
	
	console.log(`import ${slug} from './chain/${fn}'`)

	let list = []
	for (let u of urls) {
		list.push(u.url)
	}

	fs.writeFileSync("src/chain/"+fn, "export default "+JSON.stringify(list, null, 2));
	for (let x in currencies) {
		if (currencies[x].name === name) currencies[x].hosts = slug;
	}
}

for (let c of currencies) {
	console.log(`{ id: ${c.id}, symbol: "${c.symbol}", hosts: ${c.hosts}, name: "${c.name}" },`)
}