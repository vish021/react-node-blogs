jest.setTimeout(10000);//wait 30 seconds before ending any test

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient:  true});