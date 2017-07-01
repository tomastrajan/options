const cors = require('cors');

const WHITELIST = ['http://localhost', 'https://options-54580.firebaseapp.com'];

const  corsOptions = {
  origin(origin, callback) {
    console.log(origin);
    WHITELIST.indexOf(origin) > -1
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS', origin));
  }
};

module.exports = cors(corsOptions);
