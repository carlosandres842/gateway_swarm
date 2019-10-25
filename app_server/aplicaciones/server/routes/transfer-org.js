////////////////////////////////////////////////////////////////////
////////////////////////// IMPORTS /////////////////////////////////
////////////////////////////////////////////////////////////////////

require('../config/config');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const cryptoHandler = require('./../utils/cryptoHandler')
const ccpPath = path.resolve('../', '../', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();


////////////////////////////////////////////////////////////////////
////////////////////////// TRANSFER  ORG ///////////////////////////
////////////////////////////////////////////////////////////////////



app.post('/transfer-org', async (req, res) => {

    //Parameters validation
    let body = req.body;
    if ((!body.idOrg) || (!body.walletBS) || (!body.pubECDSA_hex) || (!body.sign) || (!body.msg) || (!body.walletBS_newOwner) || (!body.identity.privateKey) || (!body.identity.userContent)) {
        console.error(`Failed to send transaction: Missing arguments`);
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

                //Create identityFiles
                await cryptoHandler.createIdentityFiles(body.identity, process.env.WALLETPATH);

                //Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(body.identity.userContent.name);
                if (!userExists) {
                    console.error(`An identity for the user ${body.identity.userContent.name} does not exist in the wallet`);
                    return res.status(400).json({
                        ok: false,
                        response: {
                            msg: `User does not exist`
                        }
                    });
                }

                //Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: body.identity.userContent.name, discovery: { enabled: false } });

                //Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('prototipochannel');

                //Get the contract from the network.
                const contract = network.getContract('assets-chaincode', 'WalletsAndOrgsContract');

                //Submit Transaction

                let responseTx = await contract.submitTransaction('transferOrg', body.idOrg, body.walletBS, body.pubECDSA_hex, body.sign, body.msg, body.walletBS_newOwner)

                responseTx = JSON.parse(responseTx)


                if(!responseTx.ok){
                    throw new Error(responseTx.responseTx);
                  }

                  console.log('Transaction has been submitted with result: ' + JSON.stringify(responseTx));


                let response = {
                    ok: true,
                    response: {
                        msg: 'Succesful Org transfer',
                        org: responseTx
                    }
                }

                console.log('Transaction has been submitted with result: ' + responseTx);

                network.addBlockListener('my-block-listener', await ((err, block) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    let blockInfo = {
                        blockNumber: block.header.number,
                        data_hash: block.header.data_hash,
                        //previous_hash : block.header.previous_hash,
                        tx_id: block.data.data[0].payload.header.channel_header.tx_id
                    }

                    response.response.blockInfo = blockInfo
                }));

                //Disconnect from the gateway.
                await gateway.disconnect();

                //Delete user-temp
                wallet.delete(body.identity.userContent.name);

                //let response = cryptoHelper.encrypt(JSON.stringify(identity),clientPublicKey)

                setTimeout(() => {
                    res.json(response)
                }, 200)

    } catch (error) {

        console.error(`Failed to submit transaction: ${error}\n`);
        return res.status(500).json({
            ok:false,
            response:{
                msg: `Failed to submit transfer org transaction, ERROR: ${error}`
            }
        });


    }

})

module.exports = app;
