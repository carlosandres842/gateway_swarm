 var elliptic = require('elliptic');
 const jsrsa = require('jsrsasign');
 const KEYUTIL = jsrsa.KEYUTIL;
 var EC = elliptic.ec
 var ec = new EC('secp256k1');//new EC(elliptic.curves['p256']);

 let key = {
   _key:
    {
      type: 'EC',
      isPrivate: true,
      isPublic: false,
      getBigRandom: [Function],
      setNamedCurve: [Function],
      setPrivateKeyHex: [Function],
      setPublicKeyHex: [Function],
      getPublicKeyXYHex: [Function],
      getShortNISTPCurveName: [Function],
      generateKeyPairHex: [Function],
      signWithMessageHash: [Function],
      signHex: [Function],
      sign: [Function],
      verifyWithMessageHash: [Function],
      verifyHex: [Function],
      verify: [Function],
      verifyRaw: [Function],
      serializeSig: [Function],
      parseSig: [Function],
      parseSigCompact: [Function],
      readPKCS5PrvKeyHex: [Function],
      readPKCS8PrvKeyHex: [Function],
      readPKCS8PubKeyHex: [Function],
      readCertPubKeyHex: [Function],
      curveName: 'secp256r1',
      ecparams:
      {
        name: 'secp256r1',
        keylen: 256,
        curve: [Object],
        G: [Object],
        n: [Object],
        h: [Object],
        oid: undefined,
        info: undefined
      },
      prvKeyHex: '881abdf35ac2d621355ea1c006fde1c00cf940e70c63cc9b0363663952ae9ed7',
      pubKeyHex: '04936ce5dfa3915543da4bacc95deceab43e2433bb243966533a532d3e136aff286a3b660e0f3484f5168988c668e18e34a45b0dafa3c74a19df97c34e3a583e06'
    }
  }




  let privateKey = ec.keyFromPrivate(key._key.prvKeyHex, 'hex')
console.log('LLave privada ECDSA: ' );

console.log( privateKey);

  let publicKey = ec.keyFromPublic(key._key.pubKeyHex, 'hex')
  console.log('LLave pública ECDSA: ' );
  let cert = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgDksU8dZn+0ouxd5X\nexVZNCpiqktaROrl856E5Rpz/kmhRANCAATEziVrI8wMpbJGfPswzhIM8/az0cV2\nt484J3T4LBDxOgqQ2WoUSys7iYPEKPVxXHGO6xjJ5nSwENNfvQBTD0ri\n-----END PRIVATE KEY-----\n'

  let pvKey = (KEYUTIL.getKey(cert)).prvKeyHex
  console.log(pvKey)



  let sign = ec.sign('Hola', privateKey)

console.log('Firma con llave privada: ' );
console.log(sign );

  console.log('Verificar firma: '+ publicKey.verify('Hola', sign))
