
    import HdAddGen from 'hdaddressgenerator'
    const BIP84 = {
        type: "BIP84 SegWit Bech32",
        generator: function (mnemonic, coin) {
            return HdAddGen.withMnemonic(mnemonic, false, coin, true, 84);
        }
    }
    const BIP49 = {
        type: "BIP49 SegWit (Compatible)",
        generator: function (mnemonic, coin) {
            return HdAddGen.withMnemonic(mnemonic, "test", coin, false, 49);
        }
    }
    const BIP44 = {
        type: "BIP44 (Legacy)",
        generator: function (mnemonic, coin) {
            return HdAddGen.withMnemonic(mnemonic, false, coin);
        }
    }

    function factory(mnemonic, coin, type) {
        return new Promise(resolve => {
            (async () => {
                let bip = (type || BIP44);
                let generator = bip.generator(mnemonic, coin);
                let addresses = await generator.generate(1);

                if (coin === "BCH") {
                    resolve (HdAddGen.convertAddress((addresses[0].address), "cashAddress").replace("bitcoincash:",""))
                } else {
                    resolve (addresses[0].address)
                }
            })();
        });
    }

    const API = {
        using(mnemonic){                        
            return {
                coin(symbol, addressVersion) {
                    const vers = addressVersion ? API.type[addressVersion] : API.type["BIP44"];
                    return factory(mnemonic, symbol, vers)
                }
            }
        },
        type: {
            BIP44,
            BIP49,
            BIP84,
            Legacy: BIP44,
            SegWit: BIP49,
            Bech32: BIP84
        }
    }

    export default API;
