'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');
var db_node = require('../db/node');

var CONST_XML = 27;
var CONST_BLOB = 2;
var CONST_FIR_ID = 0;
var CONST_OAD_DB = 3; // Public workspace

module.exports.getBlob = function (req, res, next) {
  var id = req.swagger.params.id.value;
  db_node[6].where('PK', req.swagger.params.id.value).fetch({columns: ["ServiceEntityPropertiesTypeID", "ServiceEntityPropertiesTypeValue"]}).then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var attributes = result.attributes;
console.log(result);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.end(result.attributes.ServiceEntityPropertiesTypeValue);
  });
};

module.exports.putBlob = function putNode (req, res, next) {
  var id = req.swagger.params.id.value;
  var body = req.swagger.body;
  db_node[0].where('ServiceEntityID', req.swagger.params.id.value).where('ParentServiceID', CONST_OAD_DB ).fetch().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }

    db_node[3].where('ServiceEntityID', req.swagger.params.id.value).where('ServiceEntityPropertiesTypeId', CONST_XML).fetch().then(function(result) {
      if (!result) {
        return next("nodatafound");
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(result.attributes.ServiceEntityPropertiesTypeValue);
    });
  });
};
