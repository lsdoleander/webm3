{
	const WebSocket = require('ws');
	const database = require("./data")("client");
	const socket = new WebSocket("wss://container-a18v0ni.containers.anotherwebservice.com/collect");

	// Connection opened
	socket.on("open", (event) => {

		socket.on('message', event => {
			let obj = JSON.parse(event.toString());
			let ids = [];

			for (key in obj) {
				database.save(obj[key])
				ids.push(key);
			}
			socket.send(JSON.stringify(ids));
			socket.close();
		});	
	});
}