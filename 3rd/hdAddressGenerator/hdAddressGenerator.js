import fs from 'fs';

// BIP libs
import bip32 from 'bip32';

import bip39 from 'bip39';
import bip38 from 'bip38';

// Formatting libs
import edHd from 'ed25519-hd-key';

import basex from 'base-x';
import bs58 from 'bs58';
import bs58check from 'bs58check';
import createHash from 'create-hash';

// Coin specific libs
import bitcoin from 'bitcoinjs-lib';

import ethreumUtil from 'ethereumjs-util';
import stellarUtil from '@stellar/stellar-base';

// const nebulasUtil = require('nebulas') // This library has some security issues. Disabled until resolved.
import nanoUtil from 'nanocurrency-web';

import nacl from 'tweetnacl';

import bchSlpUtil from "bchaddrjs-slp";
import bchaddr from "bchaddrjs";

import coinList from 'coinnetworklist';

class AddressGenerator {
  coin = {};

  coinName = "";

  index = 0;

  hardened = false;

  bip = 0;

  account = 0;

  change = 0;

  bip32Seed = "";

  bip32RootKeyRaw = "";

  bip32RootKey = "";

  bip32Path = "";

  accountPath = "";

  accountXprivKey = "";

  accountXpubKey = "";

  bip32XprivKey = "";

  bip32XpubKey = "";

  hashAlgo = "";

  hashAlgos = {
    32: "p2pkh",
    44: "p2pkh",
    49: "p2wpkhInP2sh",
    84: "p2wpkh",
  };

  bip38Password = false;

  unsupported = ["GRS", "ELA", "NAS"]; // Coins there is network info for but that are currently not supported.

  showEncryptProgress = false;

  xpub = false;

  extPub = "";

  unsupportedXpub = ["stellar", "nebulas", "nano"];

  /**
   * Options may be set directly on initialization but some are incompatible. It is recommended that you use an initialization function.
   * @param {string} mnemonic BIP39 mnemonic with spaces between words.
   * @param {string} passphrase Additional BIP39 passphrase custom passphrase to further secure mnemonic.
   * @param {string} seed BIP39 seed used instead of a mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {int} bip What BIP style addresses are you trying to create. Default: 44 Options: 32,44,49,84,141
   * @param {int} account Account used in HD address path.
   * @param {int} change Used in HD address path to signify if address is for change.
   * @param {string} customPath Custom path overwriting the path generated using bip/account/change.
   * @param {string} hashAlgo Algorithm used to hash the address. Coin must have supporting network information. Options: p2pkh,p2wpkhInP2sh,p2wpkh
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  constructor(
    mnemonic,
    passphrase,
    seed,
    extPub,
    coin,
    hardened = false,
    bip = 44,
    account = 0,
    change = 0,
    customPath = false,
    hashAlgo = false,
    bip38Password = false
  ) {
    if (coinList[coin] === undefined) {
      throw new Error(`Coin ${coin} does not exist.`);
    } else {
      this.coin = coinList[coin];
      this.coinName = this.coin.shortName;
      this.coinNumber = this.coin.coinNumber;
    }

    if (this.coin.network === undefined) {
      throw new Error(`Coin ${coin} exists but has no network details.`);
    }

/*    if (!AddressGenerator.coinHasTest(coin)) {
      console.warn(
        `${coin} has no test and results may not be accurate. Please see ReadMe.md about how to add a test for this coin.`
      );
    }*/

    // If a BIP 49 'y' or BIP 141 'z' xpub is submitted it is converted to an 'x' pub it can be processed.
    this.extPub = extPub;
    this.xpub = extPub === false ? false : AddressGenerator.pubToXpub(extPub);

    if (seed !== false) {
      this.seed = Buffer.from(seed, "hex");
    } else if (mnemonic !== false && passphrase === false) {
      this.seed = bip39.mnemonicToSeedSync(mnemonic);
    } else if (this.xpub === false) {
      this.seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    }

    if (this.xpub === false) {
      this.root = bip32.fromSeed(this.seed);
      this.bip32Seed = this.seed.toString("hex");
      this.bip32RootKey = bip32.fromSeed(this.seed).toBase58();
    } else {
      this.root = bip32.fromBase58(this.xpub);
    }

    this.bip = bip;
    this.account = account;
    this.change = change;
    this.hardened = hardened;
    this.bip32Path = customPath !== false ? customPath : "";
    this.bip38Password = bip38Password;
    this.hashAlgo = hashAlgo === false ? this.hashAlgos[bip] : hashAlgo;

    if (
      [49, 84, 141].includes(bip) &&
      this.coin.network[this.hashAlgo] === undefined
    ) {
      throw new Error(`${this.coinName} does not support ${this.hashAlgo}.`);
    }

    if (this.unsupported.includes(this.coinName)) {
      throw new Error(`${this.coinName} is not supported at this time.`);
    }

    if (this.coin.addressType !== undefined && bip38Password !== false) {
      throw new Error(
        `BIP 38 private key encryption only supported for bitcoin like address generation.`
      );
    }

    if (
      this.unsupportedXpub.includes(this.coin.addressType) &&
      this.xpub !== false
    ) {
      throw new Error(`ExtPub key generation not supported for ${this.coin}.`);
    }

    if ([32, 141].includes(bip) && this.xpub !== false) {
      throw new Error(`${this.bip} does not support extPub key generation.`);
    }

    this.initKeys();
  }

  /**
   * Generate addresses with a Seed directly not with a mnemonic.
   * @param {string} seed BIP39 seed used instead of a mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {int} bip What BIP style addresses are you trying to create. Default: 44 Options: 32,44,49,84,141
   * @param {int} account Account used in HD address path.
   * @param {int} change Used in HD address path to signify if address is for change.
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  static withSeed(
    seed,
    coin,
    hardened = false,
    bip = 44,
    account = 0,
    change = 0,
    bip38Password = false
  ) {
    return new AddressGenerator(
      false,
      false,
      seed,
      false,
      coin,
      hardened,
      bip,
      account,
      change,
      false,
      false,
      bip38Password
    );
  }

  /**
   * Generate addresses with a BIP 39 mnemonic.
   * @param {string} mnemonic BIP39 mnemonic with spaces between words.
   * @param {string} passphrase Additional BIP39 passphrase custom passphrase to further secure mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {int} bip What BIP style addresses are you trying to create. Default: 44 Options: 32,44,49,84,141
   * @param {int} account Account used in HD address path.
   * @param {int} change Used in HD address path to signify if address is for change.
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  static withMnemonic(
    mnemonic,
    passphrase,
    coin,
    hardened = false,
    bip = 44,
    account = 0,
    change = 0,
    bip38Password = false
  ) {
    return new AddressGenerator(
      mnemonic,
      passphrase,
      false,
      false,
      coin,
      hardened,
      bip,
      account,
      change,
      false,
      false,
      bip38Password
    );
  }

  /**
   * Generate BIP 32 addresses with a custom path and mnemonic.
   * @param {string} mnemonic BIP39 mnemonic with spaces between words.
   * @param {string} passphrase Additional BIP39 passphrase custom passphrase to further secure mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {string} customPath Custom path overwriting the path generated using bip/account/change.
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  static withMnemonicBIP32(
    mnemonic,
    passphrase,
    coin,
    customPath,
    hardened = false,
    bip38Password = false
  ) {
    return new AddressGenerator(
      mnemonic,
      passphrase,
      false,
      false,
      coin,
      hardened,
      32,
      0,
      0,
      customPath,
      false,
      bip38Password
    );
  }

  /**
   * Generate BIP 32 addresses with a custom path and a seed instead of mnemonic.
   * @param {string} seed BIP39 seed used instead of a mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {string} customPath Custom path overwriting the path generated using bip/account/change.
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  static withSeedBIP32(
    seed,
    coin,
    customPath,
    hardened = false,
    bip38Password = false
  ) {
    return new AddressGenerator(
      false,
      false,
      seed,
      false,
      coin,
      hardened,
      32,
      0,
      0,
      customPath,
      false,
      bip38Password
    );
  }

  /**
   * Generate BIP 141 style addresses with mnemonic, custom path, and custom hash algo.
   * @param {string} mnemonic BIP39 mnemonic with spaces between words.
   * @param {string} passphrase Additional BIP39 passphrase custom passphrase to further secure mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {string} customPath Custom path overwriting the path generated using bip/account/change.
   * @param {string} hashAlgo Algorithm used to hash the address. Coin must have supporting network information. Options: p2pkh,p2wpkhInP2sh,p2wpkh
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  static withMnemonicBIP141(
    mnemonic,
    passphrase,
    coin,
    customPath,
    hashAlgo,
    hardened = false,
    bip38Password = false
  ) {
    return new AddressGenerator(
      mnemonic,
      passphrase,
      false,
      false,
      coin,
      hardened,
      141,
      0,
      0,
      customPath,
      hashAlgo,
      bip38Password
    );
  }

  /**
   * Generate BIP 141 style addresses with seed instead of mnemonic, custom path, and custom hash algo.
   * @param {string} seed BIP39 seed used instead of a mnemonic.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {string} customPath Custom path overwriting the path generated using bip/account/change.
   * @param {string} hashAlgo Algorithm used to hash the address. Coin must have supporting network information. Options: p2pkh,p2wpkhInP2sh,p2wpkh
   * @param {bool} hardened Should the resulting addresses be hardened?
   * @param {string} bip38Password Additional password used to encrypt private keys.
   */
  static withSeedBIP141(
    seed,
    coin,
    customPath,
    hashAlgo,
    hardened = false,
    bip38Password = false
  ) {
    return new AddressGenerator(
      false,
      false,
      seed,
      false,
      coin,
      hardened,
      141,
      0,
      0,
      customPath,
      hashAlgo,
      bip38Password
    );
  }

  /**
   *
   * @param {string} xpub Account extended public key.
   * @param {string} coin Coin short name ( BTC, ETH, XRP, ect.).
   * @param {int} bip What BIP style addresses are you trying to create. Default: 44 Options: 32,44,49,84,141
   * @param {int} account Account used in HD address path.
   * @param {int} change Used in HD address path to signify if address is for change.
   * @returns
   */
  static withExtPub(extPub, coin, bip = 44, account = 0, change = 0) {
    return new AddressGenerator(
      false,
      false,
      false,
      extPub,
      coin,
      false,
      bip,
      account,
      change,
      false
    );
  }

  initKeys() {
    if (this.bip === 32) {
      this.bip32RootKeyRaw = bip32.fromSeed(this.seed);
    } else if (this.xpub === false) {
      this.bip32RootKeyRaw = bip32.fromSeed(
        this.seed,
        this.coin.network[this.hashAlgo]
      );
    } else {
      this.bip32RootKeyRaw = bip32.fromBase58(this.xpub);
    }

    this.bip32RootKey =
      this.xpub === false ? this.bip32RootKeyRaw.toBase58() : "";

    if (this.bip !== 32 && this.bip !== 141) {
      this.accountPath = `m/${this.bip}'/${this.coinNumber}'/${this.account}'`;
      this.accountXprivKey =
        this.xpub === false
          ? this.bip32RootKeyRaw.derivePath(this.accountPath).toBase58()
          : "";
      this.accountXpubKey =
        this.xpub === false
          ? this.bip32RootKeyRaw
              .derivePath(this.accountPath)
              .neutered()
              .toBase58()
          : this.extPub;

      this.bip32Path = `m/${this.bip}'/${this.coinNumber}'/${this.account}'/${this.change}`;
    }

    this.bip32XprivKey =
      this.xpub === false
        ? this.bip32RootKeyRaw.derivePath(this.bip32Path).toBase58()
        : "";
    this.bip32XpubKey =
      this.xpub === false
        ? this.bip32RootKeyRaw.derivePath(this.bip32Path).neutered().toBase58()
        : "";
  }

  /**
   * Generate a cryptographically random bip39 mnemonic. This is a pass through for the Bip39 libraries generateMnemomic function.
   * Please review the bip39 implementation to make sure you are comfortable with the implementation before using this for anything critical.
   * @param {string} wordlist Name of wordlist to generate mnemonic from. Use this getSupportedWordLists function to see complete lists.
   * @param {int} strength Must be divisible by 32. 128=12words, 256=24words
   * @returns
   */
  static async generateMnemonic(wordlist = "english", strength = 128) {
    const result = {};

    if (bip39.wordlists[wordlist] === undefined) {
      throw new Error(
        `Worldlist Not Supported. Supported Worlists: ${AddressGenerator.getSupportedWordLists().join(
          ", "
        )} Default: english`
      );
    }

    result.mnemonic = bip39.generateMnemonic(
      strength,
      undefined,
      bip39.wordlists[wordlist]
    );

    result.seed = await bip39.mnemonicToSeed(result.mnemonic);

    return result;
  }

  /**
   * Generates address as well as address pub/priv keys.
   * @param {int} totalToGenerate Number of addresses you would like to generate starting from the index.
   * @param {int} startIndex Index to start generating addresses from.
   */
  async generate(totalToGenerate, startIndex = 0) {
    const addresses = [];
    let index = startIndex;

    while (addresses.length < totalToGenerate) {
      let keyPair = {};

      if (this.coin.addressType === undefined)
        keyPair = this.generateBitcoinAddress(index);
      if (this.coin.addressType === "ethereum")
        keyPair = this.generateEthereumAddress(index);
      if (this.coin.addressType === "tron")
        keyPair = this.generateTronAddress(index);
      if (this.coin.addressType === "RSK")
        keyPair = this.generateRSKAddress(index);
      if (this.coin.addressType === "stellar")
        keyPair = this.generateStellarAddress(index);
      if (this.coin.addressType === "solana")
        keyPair = this.generateSolanaAddress(index);
      if (this.coin.addressType === "nebulas")
        keyPair = this.generateNebulasAddress(index);
      if (this.coin.addressType === "ripple")
        keyPair = this.generateRippleAddress(index);
      if (this.coin.addressType === "nano")
        keyPair = this.generateNanoAddress(index);
      if (this.coin.addressType === "jingtum")
        keyPair = this.generateJingtumAddress(index);
      if (this.coin.addressType === "casinoCoin")
        keyPair = this.generateCasinoCoinAddress(index);
      if (this.coin.addressType === "crown")
        keyPair = this.generateCrownAddress(index);
      if (this.coin.addressType === "eosio")
        keyPair = this.generateEOSAddress(index);
      if (this.coin.addressType === "fio")
        keyPair = this.generateFIOAddress(index);

      keyPair.index = index;

      addresses.push(keyPair);

      index += 1;
    }

    return addresses;
  }

  /**
   * Convert an address into a new format.
   * @param {string} address Coin specific address.
   * @param {string} format Address format you would like to convert the address to.
   */
  static convertAddress(address, format) {
    if (format === "cashAddress") return bchaddr.toCashAddress(address);
    if (format === "bitpayAddress") return bchaddr.toBitpayAddress(address);
    if (format === "bchSlp") return bchSlpUtil.toSlpAddress(address);

    throw new Error(`Address format ${format} does not exist.`);
  } 

  generateBitcoinAddress(index) {
    const keyPair = {};
    const compressedKeys = this.bip38Password === false;
    const { showEncryptProgress } = this;

    keyPair.network = this.coin.network[this.hashAlgo];
    keyPair.path = this.path(index);

    if (this.xpub === false) {
      keyPair.pairBuffers = this.root.derivePath(keyPair.path);
      keyPair.rawAddress = bitcoin.ECPair.fromPrivateKey(
        keyPair.pairBuffers.privateKey,
        { network: keyPair.network, compressed: compressedKeys }
      );
      keyPair.pairBuffers.network = keyPair.network;

      if (this.bip38Password === false) {
        keyPair.privKey = keyPair.pairBuffers.toWIF();
      } else {
        keyPair.privKey = bip38.encrypt(
          keyPair.pairBuffers.privateKey,
          false,
          this.bip38Password,
          (p) => {
            if (showEncryptProgress)
              console.log(
                `Priv key encryption progress ${p.percent.toFixed(
                  1
                )}% for index ${index}`
              );
          }
        );
      }
    } else {
      keyPair.pairBuffers = {};
      keyPair.rawAddress = {};
      keyPair.pairBuffers.publicKey = bip32
        .fromBase58(this.xpub)
        .derive(this.change)
        .derive(index).publicKey;
      keyPair.rawAddress.publicKey = bip32
        .fromBase58(this.xpub)
        .derive(this.change)
        .derive(index).publicKey;
      keyPair.privKey = "";
    }

    keyPair.pubKey = keyPair.rawAddress.publicKey.toString("hex");

    if (this.bip === 49 || this.hashAlgo === "p2wpkhInP2sh") {
      keyPair.address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: keyPair.pairBuffers.publicKey,
          network: keyPair.network,
        }),
        network: keyPair.network,
      }).address;
    } else {
      keyPair.address = bitcoin.payments[this.hashAlgo]({
        pubkey: keyPair.rawAddress.publicKey,
        network: this.coin.network[this.hashAlgo],
      }).address;
    }

    return keyPair;
  }

  generateEthereumAddress(index) {
    const addressPrefix =
      this.coin.addressPrefix === undefined ? "0x" : this.coin.addressPrefix;

    const keyPair = {};
    keyPair.path = this.path(index);

    if (this.xpub === false) {
      keyPair.rawPair = this.root.derivePath(keyPair.path);
    } else {
      keyPair.rawPair = {};
      keyPair.rawPair.publicKey = bip32
        .fromBase58(this.xpub)
        .derive(this.change)
        .derive(index).publicKey;
    }

    const ethPubkey = ethreumUtil.importPublic(keyPair.rawPair.publicKey);
    const addressBuffer = ethreumUtil.publicToAddress(ethPubkey);
    const hexAddress = addressBuffer.toString("hex");
    const checksumAddress = ethreumUtil.toChecksumAddress(
      addressPrefix + hexAddress
    );

    keyPair.address = ethreumUtil.addHexPrefix(checksumAddress);
    keyPair.privKey =
      this.xpub === false
        ? addressPrefix + keyPair.rawPair.privateKey.toString("hex")
        : "";
    keyPair.pubKey = addressPrefix + keyPair.rawPair.publicKey.toString("hex");

    return keyPair;
  }

  generateTronAddress(index) {
    const { addressPrefix } = this.coin;

    const keyPair = {};
    keyPair.path = this.path(index);

    if (this.xpub === false) {
      keyPair.rawPair = this.root.derivePath(keyPair.path);
      keyPair.ECPair = bitcoin.ECPair.fromPrivateKey(
        keyPair.rawPair.privateKey,
        { network: this.coin.network.p2pkh, compressed: false }
      );
    } else {
      keyPair.rawPair = {};
      keyPair.rawPair.publicKey = bip32
        .fromBase58(this.xpub)
        .derive(this.change)
        .derive(index).publicKey;
    }

    const ethPubkey = ethreumUtil.importPublic(keyPair.rawPair.publicKey);
    const addressBuffer = ethreumUtil.publicToAddress(ethPubkey);

    keyPair.address = bitcoin.address.toBase58Check(
      addressBuffer,
      addressPrefix
    );
    keyPair.privKey =
      this.xpub === false ? keyPair.ECPair.privateKey.toString("hex") : "";
    keyPair.pubKey = keyPair.rawPair.publicKey.toString("hex");

    return keyPair;
  }

  generateRSKAddress(index) {
    const { addressPrefix } = this.coin;
    const chainId = this.coin.chainId !== undefined ? this.coin.chainId : null;

    const keyPair = {};
    keyPair.path = this.path(index);

    if (this.xpub === false) {
      keyPair.rawPair = this.root.derivePath(keyPair.path);
    } else {
      keyPair.rawPair = {};
      keyPair.rawPair.publicKey = bip32
        .fromBase58(this.xpub)
        .derive(this.change)
        .derive(index).publicKey;
    }

    const ethPubkey = ethreumUtil.importPublic(keyPair.rawPair.publicKey);
    const addressBuffer = ethreumUtil.publicToAddress(ethPubkey);
    const hexAddress = addressBuffer.toString("hex");
    const checksumAddress = ethreumUtil.toChecksumAddress(
      addressPrefix + hexAddress,
      chainId
    );

    keyPair.address = ethreumUtil.addHexPrefix(checksumAddress);
    keyPair.privKey =
      this.xpub === false
        ? addressPrefix + keyPair.rawPair.privateKey.toString("hex")
        : "";
    keyPair.pubKey = addressPrefix + keyPair.rawPair.publicKey.toString("hex");

    return keyPair;
  }

  generateStellarAddress(index) {
    const keyPair = {};
    keyPair.path = `m/${this.bip}'/${this.coin.coinNumber}'/${index}'`;

    const Ed25519Seed = edHd.derivePath(keyPair.path, this.seed);
    keyPair.rawPair = stellarUtil.Keypair.fromRawEd25519Seed(Ed25519Seed.key);

    keyPair.address = keyPair.rawPair.publicKey();
    keyPair.privKey = keyPair.rawPair.secret();
    keyPair.pubKey = keyPair.rawPair.publicKey();

    return keyPair;
  }

  generateSolanaAddress(index) {
    const keyPair = {};
    keyPair.path = `m/${this.bip}'/${this.coin.coinNumber}'/${index}'/0'`;

    const Ed25519Seed = edHd.derivePath(keyPair.path, this.seed);
    keyPair.rawPair = nacl.sign.keyPair.fromSeed(Ed25519Seed.key)

    keyPair.address = bs58.encode(keyPair.rawPair.publicKey);
    keyPair.privKey = keyPair.rawPair.privateKey;
    keyPair.pubKey = keyPair.rawPair.publicKey;

    return keyPair;
  }

  //  Disabled due to insecure supporting library
  //   generateNebulasAddress(index) {
  //     const keyPair = {};
  //     keyPair.path = this.path(index);
  //     keyPair.rawPair = this.root.derivePath(keyPair.path);
  //
  //     const privKeyBuffer = keyPair.rawPair.privateKey;
  //     const nebulasAccount = nebulasUtil.Account.NewAccount();
  //
  //     nebulasAccount.setPrivateKey(privKeyBuffer);
  //     keyPair.address = nebulasAccount.getAddressString();
  //     keyPair.privKey = nebulasAccount.getPrivateKeyString();
  //     keyPair.pubKey = nebulasAccount.getPublicKeyString();
  //
  //     return keyPair;
  //   }

  generateRippleAddress(index) {
    const keyPair = this.generateBitcoinAddress(index);

    keyPair.address = basex(
      "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"
    ).encode(
      basex(
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
      ).decode(keyPair.address)
    );
    keyPair.privKey =
      this.xpub === false
        ? basex("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
            .decode(keyPair.privKey)
            .toString("hex")
            .slice(2, 66)
        : "";

    return keyPair;
  }

  generateNanoAddress(index) {
    const keyPair = {};
    keyPair.path = this.path(index);

    keyPair.rawPair = nanoUtil.wallet.accounts(
      this.seed.toString("hex"),
      index,
      index
    );

    keyPair.address = keyPair.rawPair[0].address;
    keyPair.privKey = keyPair.rawPair[0].privateKey;
    keyPair.pubKey = keyPair.rawPair[0].publicKey;

    return keyPair;
  }

  generateJingtumAddress(index) {
    const keyPair = this.generateBitcoinAddress(index);

    keyPair.address = basex(
      "jpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65rkm8oFqi1tuvAxyz"
    ).encode(
      basex(
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
      ).decode(keyPair.address)
    );
    keyPair.privKey =
      this.xpub === false
        ? basex("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
            .decode(keyPair.privKey)
            .toString("hex")
            .slice(2, 66)
        : "";

    return keyPair;
  }

  generateCasinoCoinAddress(index) {
    const keyPair = this.generateBitcoinAddress(index);

    keyPair.address = basex(
      "cpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2brdeCg65jkm8oFqi1tuvAxyz"
    ).encode(
      basex(
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
      ).decode(keyPair.address)
    );
    keyPair.privKey =
      this.xpub === false
        ? basex("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
            .decode(keyPair.privKey)
            .toString("hex")
            .slice(2, 66)
        : "";

    return keyPair;
  }

  generateCrownAddress(index) {
    const keyPair = this.generateBitcoinAddress(index);
    keyPair.address = AddressGenerator.crownAddressConvert(keyPair.address);

    return keyPair;
  }

  generateEOSAddress(index) {
    const keyPair = this.generateBitcoinAddress(index);
    keyPair.address = "";
    keyPair.privKey =
      this.xpub === false
        ? AddressGenerator.EOSbufferToPrivate(keyPair.pairBuffers.privateKey)
        : "";
    keyPair.pubKey = AddressGenerator.EOSbufferToPublic(
      keyPair.pairBuffers.publicKey,
      "EOS"
    );

    return keyPair;
  }

  generateFIOAddress(index) {
    const keyPair = this.generateBitcoinAddress(index);
    keyPair.address = "";
    keyPair.privKey =
      this.xpub === false
        ? AddressGenerator.EOSbufferToPrivate(keyPair.pairBuffers.privateKey)
        : "";
    keyPair.pubKey = AddressGenerator.EOSbufferToPublic(
      keyPair.pairBuffers.publicKey,
      "FIO"
    );

    return keyPair;
  }

  static crownAddressConvert(oldAddress) {
    const ALPHABET =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const b58 = basex(ALPHABET);

    const addrBytes = b58.decode(oldAddress);

    const hash160 = Buffer.from(new Uint16Array(23));
    hash160[0] = 0x01; // C
    hash160[1] = 0x75; // R
    hash160[2] = 0x07; // W
    addrBytes.copy(hash160, 3, 1, 21);

    const checksum = bitcoin.crypto.hash256(hash160).subarray(0, 4);
    const binaryAddr = Buffer.from(new Uint16Array(27));

    binaryAddr.set(hash160, 0);
    checksum.copy(binaryAddr, 23, 0, 4);

    const newAddress = b58.encode(binaryAddr);
    return newAddress;
  }

  static EOSbufferToPublic(buffer, prefix) {
    const EOS_PUBLIC_PREFIX = prefix;
    const checksum = createHash("rmd160")
      .update(buffer)
      .digest("hex")
      .slice(0, 8);
    const pubBuf = Buffer.concat([buffer, Buffer.from(checksum, "hex")]);
    return EOS_PUBLIC_PREFIX.concat(bs58.encode(pubBuf));
  }

  static EOSbufferToPrivate(buffer) {
    const EOS_PRIVATE_PREFIX = "80";
    let privBuf = Buffer.concat([
      Buffer.from(EOS_PRIVATE_PREFIX, "hex"),
      buffer,
    ]);
    const tmp = createHash("sha256").update(privBuf).digest();
    const checksum = createHash("sha256").update(tmp).digest("hex").slice(0, 8);
    privBuf = Buffer.concat([privBuf, Buffer.from(checksum, "hex")]);
    return bs58.encode(privBuf);
  }

  path(index) {
    if (this.bip === 32 || this.bip === 141)
      return `${this.bip32Path}/${index}${this.hardened ? "'" : ""}`;
    return `m/${this.bip}'/${this.coin.coinNumber}'/${this.account}'/${
      this.change
    }/${index}${this.hardened ? "'" : ""}`;
  }

  static pubToXpub(pub) {
    let data = bs58check.decode(pub);
    data = data.slice(4);
    data = Buffer.concat([Buffer.from("0488b21e", "hex"), data]);
    return bs58check.encode(data);
  }

  /**
   * Checks if a coin has a test in the 'coins' folder.
   * @param {string} coinName Short name of the coin.
   */
  static coinHasTest(coinName) {
    const coinTestList = [];
    const coins = fs.readdirSync(`${__dirname}/tests/coins/`);
    coins.forEach((coin) => {
      coinTestList.push(coin.split(".")[0]);
    });

    return coinTestList.includes(coinName);
  }

  /**
   * Returns list of supported Bip39 mnemonic wordlists.
   * @returns
   */
  static getSupportedWordLists() {
    const supportedLists = [];

    Object.keys(bip39.wordlists).forEach((list) => {
      supportedLists.push(list);
    });

    return supportedLists;
  }
}

export default AddressGenerator;
