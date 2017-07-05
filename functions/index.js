const functions = require('firebase-functions');
const fetch = require('node-fetch');

const cors = require('./src/cors');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send('Hello from Firebase!');
// });
//
// exports.optionChains = functions.https.onRequest((request, response) => {
//
//   const symbol = request.query.symbol;
//   const url = 'https://query2.finance.yahoo.com/v7/finance/options/' + symbol;
//
//   return fetch(url)
//     .then(res =>  cors(request, response, () => response.send(res.json())));
//
// });
