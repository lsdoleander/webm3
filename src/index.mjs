
import bip39 from "bip39"
import wallet from "./wallet.mjs"
import async from "async"
import fs from "fs"
import path from "path"

let imported = false

const DEFAULT_THREADS = 4;
let queue;

function makeq(threads){
	queue = async.queue(function(task, callback) {
		task(callback);
	}, threads);
}

//const socket = new WebSocket("wss://container-a18v0ni.containers.anotherwebservice.com/submit");
	
let save = [];
//let ready = false

/*socket.addEventListener("open", (event) => {
	ready = true;
	for (let result of save) {
		socket.send(JSON.stringify(result));
	}
})*/

let called = false;
		
export function file(input, threads=DEFAULT_THREADS){
	called = true;
	mode = "input";

	let list = fs.readFileSync(path.resolve(input), "utf-8").trim().split(/\r?\n/);
	
	makeq(threads);

	for (let mnemonic of list) {
		queue.push(function(cb){
			wallet(mnemonic).then(result=>{
				if (result.usd > 0 || result.balances?.length > 0) {
					console.log(result);
					save.push(result);
					fs.writeFileSync("results.json", JSON.stringify(save, null, 2), "utf-8");
					//if (ready) socket.send(JSON.stringify(result));
				}
				cb();
			})
		})
	}
	queue.drain(function() {
		console.log("Finished.");
	});
}

export function random(threads=DEFAULT_THREADS) {
	called = true;
	let on = {
		data(result){
			console.log(result);
		},
		close(){ 
			console.log("Finished.");
		} 
	}
	
	let stopped = false;
	makeq(threads);

	function rando(cb) {
		const mnemonic = bip39.generateMnemonic();
		wallet(mnemonic).then(result=>{
			if (result.usd > 0 || result.balances?.length > 0) {
				save.push(result);
				fs.writeFileSync("results.json", JSON.stringify(save, null, 2), "utf-8");
				//if (ready) socket.send(JSON.stringify(result));
				on.data(result);
			}
			if (!stopped) queue.push(rando);
			cb();
		})
	}

	for (let idx = 0; idx < threads; idx++) {
		queue.push(rando)
	}

	queue.drain(function() {
		on.close();
	});

	return {
		on(name, f) {
			if (name === "data") on.data = f;
			else if (name === "close") on.close = f;
		},
		close(){
			stopped = true;
		}
	}
}

function test() {
	const mnemonic = bip39.generateMnemonic();
	wallet(mnemonic).then(result=>{
		console.log(result);
	})
}

setTimeout(function(){
	if (!called) {	
		let input = process.argv[2];
		if (input && input === "test") {
			test();

		} else if (input && fs.existsSync(path.resolve(input))) {
			listFile(input);
		} else {
			randomGenerator();
		}
	}
}, 5000);
