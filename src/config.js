
	export default function(hosts, name) {
		let cache;

		return new Promise(resolve=>{
			if (cache) return resolve(cache);
			
			let index = 0;

			(function _call_service(){
				function err(){
					index++
					if (index === hosts.length) {
						resolve();
					} else {
						_call_service();
					}
				}

				try {
					fetch(`http://${hosts[index]}/${name}`).then(response=>{
						if (response.status === 200) {
							response.json().then(data=>{
								cache = data;
								resolve(data);
							})
						} else {
							err();
						}
					})
				} catch (ex) {
					err();
				}
			})()
		})
	}