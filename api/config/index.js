const dotenv = require('dotenv');

const result = dotenv.load();

module.exports = result.parsed;
