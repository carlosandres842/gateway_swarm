
////////////////////////////////////////////////////////////////////
////////////////////////// IMPORTS /////////////////////////////////
////////////////////////////////////////////////////////////////////

require('../config/config');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const cryptoHandler = require('../utils/cryptoHandler')
const ccpPath = path.resolve('../', '../', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();


////////////////////////////////////////////////////////////////////
////////////////////////// GET PRODUCT  ////////////////////////////
////////////////////////////////////////////////////////////////////

app.post('/get-product', async (req, res) => {

    //req.body = {id, identity:{privateKey , userContent}}
    let body = req.body;

    //Parameters validation
    if ((!body.idAsset) ||(!body.identity.privateKey) || (!body.identity.userContent)) {
        console.error(`Failed to send transaction: Missing arguments`);
        return res.status(400).json({
            ok: false,
            response:{
                msg: 'Missing arguments in request body'
            }
        });
    }


    try {

        //Create a new file system based wallet for managing identities.
        const wallet = new FileSystemWallet(process.env.WALLETPATH);

        //Create identityFiles
        await cryptoHandler.createIdentityFiles(body.identity);

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
        const contract = network.getContract('assets-chaincode', 'ProductsContract');

        let responseTx = (await contract.evaluateTransaction('getProductDetail', body.idAsset)).toString();

        responseTx = JSON.parse(responseTx)

        if(!responseTx.ok){
          throw new Error(responseTx.responseTx);
        }

        console.log('Transaction has been submitted with result: ' + JSON.stringify(responseTx));

        //Disconnect from the gateway.
        await gateway.disconnect();

        //Delete user-temp
        wallet.delete(body.identity.userContent.name);


        let response = {
            ok: true,
            response: {
                msg: 'successfull get product',
                product: responseTx.responseTx.product,
                history: responseTx.responseTx.history            }
        }

        res.json(response)


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({
            ok:false,
            response: {
                msg : `Failed to submit get product transaction, ERROR: ${error}`
            }
        });
    }

});


module.exports = app;
