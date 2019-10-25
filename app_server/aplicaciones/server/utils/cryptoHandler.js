////////////////////////////////////////////////////////////////////
////////////////////////// IMPORTS /////////////////////////////////
////////////////////////////////////////////////////////////////////
const pem = require('pem');
const jsrsa = require('jsrsasign');
const fs = require('fs');
const KEYUTIL = jsrsa.KEYUTIL;


////////////////////////////////////////////////////////////////////
////////////////////////// UTILS METHODS  //////////////////////////
////////////////////////////////////////////////////////////////////

let getPublicKey = async function (identity) {
    
    let publicKey = await getPkCertificate(identity).then((producto => { return producto }))
    return JSON.stringify(publicKey);
}

let getPkCertificate = async function (identity) {

    var promise = new Promise((resolve, reject) => {

        const wallet = {
            pubkey: ""
        }

        pem.getPublicKey(identity.userContent.enrollment.identity.certificate, function (err, key) {

            if (err) console.log(err);

            wallet.pubkey = KEYUTIL.getKey(key.publicKey).pubKeyHex
            resolve(wallet);
        });

    });

    return promise;
}

let createIdentityFiles = async function (identity) {

    //Create directory for user idenity
    var userWalletPath = `${process.env.WALLETPATH}/${identity.userContent.name}`;
    if (!fs.existsSync(userWalletPath)) {

        fs.mkdirSync(userWalletPath);
    }

    //CREACIÓN DEL CERTIFICADO 
    let certName = identity.userContent.name;
    fs.writeFileSync(`${process.env.WALLETPATH}/${identity.userContent.name}/${certName}`, JSON.stringify(identity.userContent));

    //CREACIÓN DE LA LLAVE PRIVADA 
    let privateKeyName = `${identity.userContent.enrollment.signingIdentity}-priv`;
    fs.writeFileSync(`${process.env.WALLETPATH}/${identity.userContent.name}/${privateKeyName}`, identity.privateKey);


    //CREACIÓN DE LA LLAVE PÚBLICA
    pem.getPublicKey(identity.userContent.enrollment.identity.certificate, function (err, key) {


        if (err) return new Error(`${err}`);

        let publicKeyName = `${identity.userContent.enrollment.signingIdentity}-pub`;
        fs.writeFileSync(`${process.env.WALLETPATH}/${identity.userContent.name}/${publicKeyName}`, key.publicKey);
    })


}


module.exports = {
    createIdentityFiles,
    getPublicKey
}