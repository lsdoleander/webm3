"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var cardano_serialization_lib_nodejs_1 = require("@emurgo/cardano-serialization-lib-nodejs");
var bip39_1 = require("bip39");
// Replace with your own database model or setup
// You need to define and connect your own WalletModel to store the wallet data in a database
// import WalletModel from '../models/Wallet';
function default_1(mnemonic) {
    return __awaiter(this, void 0, void 0, function () {
        var entropy, rootKey, accountKey, stakeKey, publicKey, stakePublicKey, networkInfo, baseAddress, address, privateKey, walletData;
        return __generator(this, function (_a) {
            entropy = (0, bip39_1.mnemonicToEntropy)(mnemonic);
            rootKey = cardano_serialization_lib_nodejs_1.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));
            accountKey = rootKey
                .derive(1852 | 0x80000000) // purpose
                .derive(1815 | 0x80000000) // coin type
                .derive(0 | 0x80000000) // account
                .derive(0) // external chain
                .derive(0);
            stakeKey = rootKey
                .derive(1852 | 0x80000000) // purpose
                .derive(1815 | 0x80000000) // coin type
                .derive(0 | 0x80000000) // account
                .derive(2) // staking chain
                .derive(0);
            publicKey = accountKey.to_public();
            stakePublicKey = stakeKey.to_public();
            networkInfo = cardano_serialization_lib_nodejs_1.NetworkInfo.mainnet();
            baseAddress = cardano_serialization_lib_nodejs_1.BaseAddress.new(networkInfo.network_id(), cardano_serialization_lib_nodejs_1.StakeCredential.from_keyhash(publicKey.to_raw_key().hash()), cardano_serialization_lib_nodejs_1.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()));
            address = baseAddress.to_address().to_bech32();
            privateKey = accountKey.to_bech32();
            walletData = {
                ticker: 'ADA',
                address: address,
                privateKey: privateKey,
                mnemonic: mnemonic,
            };
            // Save wallet data to your own database
            // Uncomment and replace this with your actual database save operation
            // const wallet = new WalletModel(walletData);
            // await wallet.save();
            return [2 /*return*/, walletData];
        });
    });
}
