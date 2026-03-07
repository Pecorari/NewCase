const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');

require('dotenv').config();

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true
}));

app.use(cookieParser());

app.use(router);

module.exports = app;
