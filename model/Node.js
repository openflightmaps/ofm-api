'use strict';

var app_url = process.env.APP_URL || 'http://localhost:8080';
var static_data = require('../static');
var Generic = require('./Generic');

function Node() {
  Generic.call(this);

  this.name = "Node";
  this.config = {
    app_url: app_url,
    pk: 'ServiceEntityID',
    parent: "ParentServiceID",
    id: "ServiceEntityPropertiesTypeID",
    value: "ServiceEntityPropertiesTypeValue",
    db: require('../db/node'),
    dbs: static_data.service_dbs,
    types: static_data.entity_types,
  };
};

Node.prototype = Object.create(Generic.prototype);
Node.prototype.constructor = Node;

module.exports = Node;

