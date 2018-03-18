'use strict';

var Promise = require("bluebird");

// DB: knex
var db = require('../../db');
var cached = require('../../static');
var db_node = require('../../db/node');

module.exports.getBlob = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_node(6).where('PK', req.swagger.params.id.value).first("ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue").then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader('Content-Type', 'application/octet-stream');
    res.end(result.ServiceEntityPropertiesTypeValue, 'binary');
  });
};
