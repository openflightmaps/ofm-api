'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');

// main index
var db_regions = db('AMMNT_FIR');

module.exports.getRegions = function(req, res, next) {
  db_regions.select().then(function(result) {
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var regions = {};
    result.map(function(v) {
      regions[v.IcaoCode] = {name: v.Name, id: v.PK};
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(regions || {}, null, 2));
  });
};
