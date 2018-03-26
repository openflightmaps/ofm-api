'use strict';

var static_data = require('../static');
var Generic = require('./Generic');

function Node() {
  Generic.call(this);

  this._kind = "Node";
  this.config = {
    app_url: this.config.app_url,
    legacy_mode: this.config.legacy_mode,
    pk: 'ServiceEntityID',
    parent: "ParentServiceID",
    id: "ServiceEntityPropertiesTypeID",
    value: "ServiceEntityPropertiesTypeValue",
    db: require('../db/node'),
    dbs: static_data.service_dbs,
    blobembed: false,
    types: static_data.entity_types,
    tag_map: static_data.tag_map,
  };
};

Node.prototype = Object.create(Generic.prototype);
Node.prototype.constructor = Node;

module.exports = Node;
