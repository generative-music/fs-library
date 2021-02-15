'use strict';

const has = require('./has');
const request = require('./request');

const createLibrary = (opts = {}) => ({
  has: has.bind(null, opts),
  request: request.bind(null, opts),
});

module.exports = createLibrary;
