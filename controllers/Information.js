'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('../db');
var cached = require('../static');

// main index
var db_regions = db.Model.extend({
  tableName: 'AMMNT_FIR',
});

module.exports.getRegions = function(req, res, next) {
  db_regions.fetchAll().then(function(result) {
    console.log(result);
    if (!result) {
      res.statusCode = 404;
      return res.end();
    }
    var result = result.toJSON();
    var regions = {};
    result.map(function(v) {
      regions[v.IcaoCode] = {name: v.Name};
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(regions || {}, null, 2));
  });
};
