////////////////////////////////////////////////////////////////////
////////////////////////// IMPORTS /////////////////////////////////
////////////////////////////////////////////////////////////////////

require('../config/config');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const cryptoHandler = require('../utils/cryptoHandler')
const ccpPath = path.resolve('../', '../', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();
const jsrsa = require('jsrsasign');
const KEYUTIL = jsrsa.KEYUTIL;

////////////////////////////////////////////////////////////////////
////////////////////////// CREATE ORG //////////////////////////
////////////////////////////////////////////////////////////////////

app.post('/create-wallet', async (req, res) => {

    // body => {idOrg, code, walletBS, pubECDSA_hex, sign, msg, fatherWalletBS}
    let body = req.body

    //Parameters validation
    if ((!body.idOrg) || (!body.code) ||(!body.walletBS) || (!body.pubECDSA_hex) || (!body.sign)|| (!body.msg) || (!body.fatherWalletBS)) {
        console.error(`Failed to send transaction: Missing arguments\n`);
        return res.status(400).json({
            ok: false,
            response: {
                msg: 'Missing arguments in request body'
            }
        });
    }


    try {

        //Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(process.env.WALLETPATH);

        //Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity:'admin', discovery: { enabled: false } });

        //Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('prototipochannel');

        //Get the contract from the network.
        const contract = network.getContract('assets-chaincode', 'WalletsAndOrgsContract');

        //Send transaction to the smart contract
        let responseTx = (await contract.submitTransaction('createWallet', body.idOrg,body.code,  body.walletBS, body.pubECDSA_hex, body.sign, body.msg, body.fatherWalletBS)).toString();

        responseTx = JSON.parse(responseTx)

        if(!responseTx.ok){
          throw new Error(responseTx.responseTx);
        }

        console.log('Transaction has been submitted with result: ' + JSON.stringify(responseTx) +'\n');


        //Register the user, enroll the user, and import the new identity into the wallet.
        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const secret = await ca.register({ affiliation: `org1.department1`, enrollmentID: body.idOrg, role: 'client' }, gateway.getCurrentIdentity());
        const enrollment = await ca.enroll({ enrollmentID: body.idOrg, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(body.idOrg, userIdentity);
        console.log(`Successfully registered and enrolled user ${body.idOrg} \n`);

        let identity = {
            privateKey: enrollment.key.toBytes(),
            userContent: JSON.parse(fs.readFileSync(`${process.env.WALLETPATH}/${body.idOrg}/${body.idOrg}`).toString())
        }




        wallet.delete(body.idOrg);

        let response = {
            ok: true,
            response:{
                msg: `Wallet ${body.walletBS} created succesfully`,
                wallet: responseTx.responseTx,
                identity
            }
        }

        network.addBlockListener('my-block-listener', await ((err, block) => {
            if (err) {
                console.error(err);
                return;
            }

            let blockInfo ={
                blockNumber : block.header.number,
                data_hash : block.header.data_hash,
                //previous_hash : block.header.previous_hash,
                tx_id: block.data.data[0].payload.header.channel_header.tx_id
            }

            response.response.blockInfo = blockInfo
        }));

        //Disconnect from the gateway.
        await gateway.disconnect();

        wallet.delete(body.idOrg)

        setTimeout(()=>{
            res.status(201).json(response)
        },200)

        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}\n`);
        return res.status(500).json({
            ok:false,
            response:{
                msg: `Failed to submit create wallet transaction, ERROR: ${error}`
            }
        });
    }

});




module.exports = app;
