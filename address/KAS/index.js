
import { Wallet, initKaspaFramework } from '@kaspa/wallet'
import { RPC } from '@kaspa/grpc-node'

const network = "kaspa";
const mainnet = "https://api.kaspa.org/"

const k_promise = (()=>{ 
  return new Promise(async resolve => {
    await initKaspaFramework();
    const config = Wallet.networkTypes[network];
    const { port } = config.port;
    const host = mainnet+":"+port;
    const rpc = new RPC({ clientConfig:{ host }});
    resolve(rpc);
  })
})();

export function KAS (mnemonic){
  return new Promise(async resolve => {
    const rpc = await k_promise;
    const wallet = Wallet.fromMnemonic(mnemonic, { network, rpc }, {disableAddressDerivation:true});
    resolve(wallet.addressManager.receiveAddress.current.address);
  })
}

export default KAS