/*
import {
  Bip32PrivateKey,
  BaseAddress,
  NetworkInfo,
  StakeCredential
} from '@emurgo/cardano-serialization-lib-nodejs';

import { mnemonicToEntropy } from 'bip39';

export default function(mnemonic) {
  const entropy = mnemonicToEntropy(mnemonic);
  const rootKey = Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));

  // Derivation path for external addresses in Cardano (m/1852'/1815'/0'/0/0)
  const accountKey = rootKey
    .derive(1852 | 0x80000000) // purpose
    .derive(1815 | 0x80000000) // coin type
    .derive(0 | 0x80000000) // account
    .derive(0) // external chain
    .derive(0); // first address

  const stakeKey = rootKey
    .derive(1852 | 0x80000000) // purpose
    .derive(1815 | 0x80000000) // coin type
    .derive(0 | 0x80000000) // account
    .derive(2) // staking chain
    .derive(0); // first staking address

  const publicKey = accountKey.to_public();
  const stakePublicKey = stakeKey.to_public();
  const networkInfo = NetworkInfo.mainnet();

  const baseAddress = BaseAddress.new(
    networkInfo.network_id(),
    StakeCredential.from_keyhash(publicKey.to_raw_key().hash()),
    StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash())
  );

  const address = baseAddress.to_address().to_bech32();
  return address;
}*/
import { CardanoWeb3 } from "cardano-web3-js"


const promise = CardanoWeb3.init()

export default function(mnemonic){
promise.then(web3=>{
//
const account = web3.account.fromMnemonic(mnemonic)

console.log(account)
})
}