const fs = require('fs');

// ============================
//  Port
// ============================
process.env.PORT = process.env.PORT || 8085;


// ============================
//  WalletPath
// ============================
const path = require('path');
process.env.WALLETPATH =/* process.env.WALLETPATH || */path.join(__dirname,'../', '../','wallet');


// ============================
//  Server Keys
// ============================

// process.env.serverPublicKey = process.env.serverPublicKey  || fs.readFileSync('./keys/rsa_1024_pub.pem', 'utf8')

// process.env.serverPrivateKey = process.env.serverPrivateKey  || fs.readFileSync('./keys/rsa_1024_priv.pem', 'utf8')

process.env.serverSimetricKey = process.env.serverSimetricKey  || 'BlockSaaSKey'


// ============================
//  BlockSaas ECDSA keys
// ============================

process.env.blocksaasPubECDSA = process.env.blocksaasPubECDSA || '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEadfJj8Z7SF3gtlGMEo17bj7rkaRr\nVaFVz579rfOuIBPGgcw3wf43caI4qLtBokoyksjhiwc67c1Y+wxJrNTEXA==\n-----END PUBLIC KEY-----'

process.env.blocksaasPrivECDSA = process.env.blocksaasPrivECDSA || '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgIdlfTQEWjeIlwnXG\nR46Tp0HasW4XwhzAgFwgYdLvv5OhRANCAARp18mPxntIXeC2UYwSjXtuPuuRpGtV\noVXPnv2t864gE8aBzDfB/jdxojiou0GiSjKSyOGLBzrtzVj7DEms1MRc\n-----END PRIVATE KEY-----'

