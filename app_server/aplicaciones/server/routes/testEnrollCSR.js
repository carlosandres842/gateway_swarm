require('../config/config');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve('../', '../','../', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

 async function main(){

  const wallet = new FileSystemWallet(process.env.WALLETPATH);
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity:'admin', discovery: { enabled: false } });
  const network = await gateway.getNetwork('prototipochannel');


  const csr = fs.readFileSync('/home/esteban-restrepo/blockchain/prototipo/aplicaciones/server/routes/test3.csr', 'utf8');

  const ca = gateway.getClient().getCertificateAuthority();
  const secret = await ca.register({ affiliation: `org1.department1`, enrollmentID: 'user6', role: 'client' }, gateway.getCurrentIdentity());

  const req = {
      enrollmentID: 'user6',
      enrollmentSecret: secret,
      csr: csr,
  };


  const enrollment = await ca.enroll(req);
}

main();
