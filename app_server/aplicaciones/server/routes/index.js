const express = require('express');
const app = express();


app.use(require('./enroll-admin'));
app.use(require('./get-balance'));
app.use(require('./get-product'));
app.use(require('./transfer'));
app.use(require('./transfer-org'));
app.use(require('./create-org'));
app.use(require('./create-wallet'));
app.use(require('./create-product'));
app.use(require('./test'));

module.exports = app;
