
import { generateMnemonic } from 'bip39'
import { KAS } from './@dist.mjs'

async function test(){
	const mnemonic = generateMnemonic();
	console.log(mnemonic);
	const address = await wallet(mnemonic);
	console.log(address);
}

test();