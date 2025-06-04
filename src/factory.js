
    import async from "async";
    import address from "./address.js";

    let cache = {}; 

    export default function (currencies) {
        const coins = currencies.coins();
        const chains = currencies.chains();
        const pricePromise = currencies.prices();

        return {
            wallet(mnemonic) {
                return new Promise(async (resolve, reject) => {
                    try {
                        if (cache[mnemonic]) {
                            resolve(cache[mnemonic]);
                        } else {
                          
                            const prices = await pricePromise;
                            const addressGenerator = address.using(mnemonic);
                            let coin = [];
                            let promises = [];
                            let usdtotal = 0;
                            let calls = 0;
                            let returns = 0;

                            for (let idx in coins) {
                                promises.push(function (cb) {
                                    const coinimpl = coins[idx];
                                    const symbol = coinimpl.symbol;
                                    const start = new Date().getTime();
                                    function addressPromise() {
                                        return addressGenerator.coin(symbol, coinimpl.type)
                                    }
                                    addressPromise().then(address => {
                                        coinimpl.getBalance(address, coinimpl.decimals).then(result => {
                                            returns++;
                                                 
                                            console.log(returns, "of", calls, ";", symbol, coinimpl.name, address, new Date().getTime()-start + "ms", result)
                                            if (result > 0) {
                                                const usd = parseFloat((prices[symbol] * result > 0.01 ? prices[symbol] * result : 0).toFixed(2));
                                                const name = coinimpl.name;
                                                coin.push({currency: symbol, name, amount: result, usd });
                                                usdtotal += usd;
                                            }
                                            cb()
                                        }).catch(ex=>{
                                            // console.log(ex)
                                        })
                                    });
                                });
                                calls++;
                            }

                            addressGenerator.coin("ETH").then(address => {
                                for (let chain of chains) {
                                    const { name, ERC20, symbol } = chain;

                                    promises.push(function (cb) {
                                        const start = new Date().getTime();
                                        ERC20.getBalance(address, 18).then(result => {
                                            returns++;
                                            console.log(returns, "of", calls, ";", symbol, name, address, new Date().getTime()-start + "ms", result);
                                            if (result > 0) {
                                                const usd = parseFloat((prices[symbol] * result > 0.01 ? prices[symbol] * result : 0).toFixed(2));
                                                coin.push({ currency: symbol, name, amount: result, usd });
                                                usdtotal += usd;
                                            }
                                            cb()
                                        }).catch(ex=>{
                                            //console.log(ex)
                                        })
                                    });
                                    calls++;
                                }

                                async.parallelLimit(promises, 5).then(() => {
                                    const out = {mnemonic, usd: usdtotal, balances: coin};
                                    cache[mnemonic] = out;
                                    resolve(out);
                                });
                            })
                        }
                    } catch(ex) {
                        console.log(ex)
                    }
                })
            }
        }
    }
