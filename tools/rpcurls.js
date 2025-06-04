
import currencies from '../src/currencies.js'
import async from 'async'
import fs from 'fs'

let queue = [];

const rpcsPromise = (function(){
	return fetch('https://chainlist.org/rpcs.json');
})()

let tested = (function(){
	if (!fs.existsSync(gen)) {
		fs.mkdirSync("gen");
		return {};
	} else if (fs.existsSync("gen/rpctimes.json")) {
		return JSON.parse(fs.readFileSync("gen/rpctimes.json"))
	} else {
		return {};
	}
})();

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection:');
    console.trace(reason);
    console.log("  \\\\---> at Promise:");
    console.trace(p);
}).on('uncaughtException', err => {
    console.log('Uncaught Exception');
    console.trace(err);
});

function https(uri) {
	return new Promise(async (resolve,reject)=>{
		let cancel = false;
		if (/https?/.test(uri)) {
			fetch(uri).then(r=>{
				if (!cancel) resolve(r);
			}).catch(ex=>{
				if (!cancel) reject(ex);
			});
		} else {
			const ws = new WebSocket(uri);
			ws.addEventListener('open', function open() {
				ws.close()
				if (!cancel) resolve();
			});
		}
		setTimeout(function(){
			cancel = true;
			reject("cancel");
		},60000);
	});
}

let locked = false;
let saverintv = setInterval(function(){
	if (!locked) {
		locked = true;
		fs.writeFileSync("gen/rpctimes.json", JSON.stringify(tested, null, 2));
		locked = false;
	}
},10000)

function qp(c,q) {
	queue.push(function(cbck){
		async.parallelLimit(q, 40, function(){
			cbck();
		})
	})
}

for (let chain of currencies({}).chains()) {
	rpcsPromise.then(rpcs=>{
		for (let r of rpcs) {
			if (chain.id === r.chainId) {
				
				let cq = [];
				for (let h of r.rpc) {
					for (let idx = 0; idx < 8; idx++) {
						cq.push(function(cb) {
							try {
								let start = new Date().getTime();
								https(h.url).then(function(){
									let time = (new Date().getTime() - start);
									if (!tested[chain.name]) tested[chain.name] = {};
									if (tested[chain.name][h.url]) {
										tested[chain.name][h.url].push(time);
									} else {
										tested[chain.name][h.url] = [time]
									}
									console.log(chain.name, "rpc", h.url, "[", time, "] ms");
									cb();
								}).catch(ex=>{
									//console.log(ex);
									console.log(chain.name, "rpc", h.url, "failure.")
									cb();
								})
							} catch(ex) {
								//console.log(ex);
								console.log(chain.name, "rpc", h.url, "failure.")
								cb();
							}
						})
					}
				}
				qp(chain,cq);
				break;
			}
		}
	})
}

async.series(queue, function(){
	clearInterval(saverintv);
	(function finalsave() {
		if (!locked) {
			fs.writeFileSync("gen/rpctimes.json", JSON.stringify(tested, null, 2));
		} else {
			setTimeout(finalsave,3000);
		}
	})()
})