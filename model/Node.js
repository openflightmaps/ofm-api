'use strict';

var app_url = process.env.APP_URL || 'http://localhost:8080';
var static_data = require('../static');

module.exports = require('../model/Generic')({
  app_url: app_url,
  pk: 'ServiceEntityID',
  parent: "ParentServiceID",
  id: "ServiceEntityPropertiesTypeID",
  value: "ServiceEntityPropertiesTypeValue",
  db: require('../db/node'),
  dbs: static_data.service_dbs,
  types: static_data.entity_types,
});

