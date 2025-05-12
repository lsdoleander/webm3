
import { generateMnemonic } from 'bip39'
import wallet from './index.js'
import { CardanoWeb3 } from "cardano-web3-js"

async function test(){

const web3 = await CardanoWeb3.init()
	const mnemonic = web3.utils.keys.mnemonicGenerate()
	console.log(mnemonic);
	const address = await wallet(mnemonic);
	console.log(address);
}