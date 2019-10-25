const express = require('express');
const app = express();
var os = require("os");
var hostname = os.hostname()

app.get('/test', async(req,res)=>{

    try {
        console.log(`server is up and running on machine: ${hostname}`)
        res.json({
            ok: true,
            msg: `server is up and running on machine: ${hostname}`
        })
    } catch (error) {

        console.log(`server is down on machine ${hostname} \n ERROR: ${error} ${__dirname}`)

        res.json({
            ok: false,
            msg: `server is down on machine ${hostname} \n ERROR: ${error} ${__dirname}`
        })
        
    }
});

module.exports = app;