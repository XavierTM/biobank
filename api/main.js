console.clear();

require('dotenv').config();
require('./env');

const express = require('express');
const cors = require('cors');
const users = require('./users');
const { init: initDB } = require('./db');
const { init: initAuth } = require('./auth');
const transactions = require('./transactions');
const morgan = require('morgan');
const constants = require('@xavisoft/auth/constants');
const sse = require('./sse');

const app = express();


// middlewares

app.use(morgan('dev'));
app.use(express.static('static'));

const authHeaders = [ constants.ACCESS_TOKEN_HEADER_NAME, constants.REFRESH_TOKEN_HEADER_NAME ];

app.use(cors({
   allowedHeaders: [ ...authHeaders, 'content-type' ],
   exposedHeaders: [ ...authHeaders, 'content-type' ],
}));

app.use(express.json());
initAuth(app);

// routes
app.use('/sse', sse.router);
app.use('/api/users', users);
app.use('/api/transactions', transactions);

// initialize
const PORT = process.env.PORT || 8080

app.listen(PORT, async () => {
   console.log('Server started @', PORT);
   await initDB();
   console.log('DB started!');
});