'use strict';

////////////////////////////////////////////////////////////////////
////////////////////////// IMPORTS /////////////////////////////////
////////////////////////////////////////////////////////////////////

require('../config/config');
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve('../', '../', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');


const app = express();

////////////////////////////////////////////////////////////////////
////////////////////////// ENROLL ADMIN ////////////////////////////
////////////////////////////////////////////////////////////////////

app.get('/enroll-admin', async (req, res) => {
    try {

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.prototipo.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.


        const wallet = new FileSystemWallet(process.env.WALLETPATH);


        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            return res.status(400).json({
                ok: false,
                response: 'An identity for the admin already exists'
            });
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('admin', identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        res.status(200).json({
            ok: true,
            response: {
                msg: 'Successfully enrolled admin'
            }
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            response: {
                msg: `Failed to enroll admin user "admin": ${error}`
            }
        });

    }
});


module.exports = app;
