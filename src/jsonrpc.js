
import wei from "./wei.js";

const MAXTRIES = {
	ADDRESS: 5,
	HOST: 5
};

const API = (chain) => {
	let failures = {};
	let hidx = 0;

	function getHost() {
		let host = chain.hosts[hidx];
		if (failures[host] && failures[host] >= MAXTRIES.HOST) {
			return getHost();
		} else {
			return host;
		}
	}
	
	function sendMessage(host, json){
		return new Promise(async (resolve, reject) => {
			try {
				if (host.startsWith("wss")) {
					const socket = new WebSocket(host);
					const WAIT = 30;
					let handled = false;
					let timeout;
					// Connection opened
					socket.addEventListener("open", (event) => {
					  socket.send(json);
					  timeout = setTimeout(function(){
					  	if (!handled) {

					  		handled = true;
					  		reject(`WebSocket timeout after ${WAIT}`)
						}
					  }, WAIT*1000)
					});

					// Listen for messages
					socket.addEventListener("message", (event) => {
						if (!handled) {
						  handled = true;
						  clearTimeout(timeout);
						  let message = event.data;
						  socket.close();
						  resolve(JSON.parse(message));
						}
					});

				} else {
					const response = await fetch(host, {
						method: "POST",
						headers: {"content-type": "application/json"},
						body: json

					});
					if (!response.ok) {
						reject(`Response status: ${response.status}`);
					} else {
						const json = await response.json();
						resolve(json);
					}
				}
			} catch (ex) {
				reject(ex.message);
			}
		})
	}

	return { 
		getBalance(address, decimals){
			return new Promise(resolve=>{
				let tries = 0;

                (async function innar(){
					let url = getHost();
                	
                	tries++;  

                	function handleErrorCondition(message, econ){
						if (chain.showResponses) {
							console.log(`Failure: ${chain.symbol} address on "${chain.name}": ${address}`, econ); 
								console.log(message);
						}
						hidx++
						if (hidx === chain.hosts.length) hidx = 0;
						
						if (!failures[url]) {
							failures[url] = 1;
						} else {
							failures[url]++;
						}
						if (tries < MAXTRIES.ADDRESS) {
							innar();
						} else {
							resolve();
						}
                	}

                	const rpc_v = chain.jsonrpc || chain.ethereum ? "2.0" : "1.0";

					const message = JSON.stringify({
						jsonrpc: rpc_v,
						method: rpc_v === "2.0" ? (chain.ethereum ? "eth_getBalance": "getBalance") : "getaddressbalance", 
						params: [address],
						id: 1 
					});

					await sendMessage(url, message).then(json=>{
						if (json.result && !json.error){
							if (chain.showResponses) {
								console.log(`Success: ${chain.symbol} address on "${chain.name}": ${address}`); 
								console.log(message);
								console.log(json);
							}

	                        const balance = wei.decimals(decimals).fromWei(json.result);
	                        if (failures[url]) failures[url] = 0;
	                        resolve(balance);
	                    } else {
	                    	handleErrorCondition(message, json.error);
	                    }
					}).catch (ex=>handleErrorCondition(message, ex));
				})();
			});
		}
	}
}

export default function factory(chain, opts) {
	return API(chain, opts || {});
}
