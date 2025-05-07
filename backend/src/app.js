const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');

require('dotenv').config();

const app = express();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());
app.use(router);

module.exports = app;
