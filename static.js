'use strict';

var Promise = require("bluebird");

// DB: knex
var db = require('./db');

// service table
var s3t = db('S3T');
var s1t = db('S1T');

// FIRs
var db_regions = db('AMMNT_FIR');

var s3 = s3t.select();
var s1 = s1t.select();
var regions = db_regions.select();

module.exports.entity_types = new Promise(function(resolve, reject) {
  s3.then(function(s3) {
    var entity_types_by_id = {};
    var entity_types_by_name = {};
    s3.map(function(obj) {
        var entity_type = {id: obj.ServiceEntityTypeID, name: obj.ServiceEntityTypeDescription, description: obj.ServiceEntityTypeDescription, type_format: obj.ServiceEntityTypeFormat, multiuse: obj.multipleUse, hidden: obj.hidden};
        entity_types_by_id[obj.ServiceEntityTypeID] = entity_type;
        entity_types_by_name[obj.ServiceEntityTypeDescription] = entity_type;
    });
    resolve({by_name: entity_types_by_name, by_id: entity_types_by_id});
  });
});

module.exports.up_types = new Promise(function(resolve, reject) {
  db('U2T').then(function(s3) {
    var by_id = {};
    var by_name = {};
    s3.map(function(obj) {
        var up_type = {id: obj.UserPropertiesTypeID, name: obj.UserPropertiesTypeDescription, description: obj.UserPropertiesTypeDescription, type_format: obj.UserPropertiesTypeFormat, multiuse: obj.multipleUse};
        by_id[obj.UserPropertiesTypeID] = up_type;
        by_name[obj.UserPropertiesTypeDescription] = up_type;
    });
    resolve({by_name: by_name, by_id: by_id});
  });
});

module.exports.perm_types = new Promise(function(resolve, reject) {
  db('P1T').then(function(s) {
    var by_id = {};
    var by_name = {};
    s.map(function(obj) {
        var t = {id: obj.PermissionsTypeID, name: obj.PermissionsTypeDescription, description: obj.PermissionsTypeDescription, type_format: 2};
        by_id[obj.PermissionsTypeID] = t;
        by_name[obj.PermissionsTypeDescription] = t;
    });
    resolve({by_name: by_name, by_id: by_id});
  });
});

module.exports.service_dbs = new Promise(function(resolve, reject) {
  s1.then(function(s1) {
    var by_id = {};
    var by_name = {};
    s1.map(function(obj) {
        var sv_type = {id: obj.ServiceID, description: obj.ServiceName};
        by_id[obj.ServiceID] = sv_type;
        by_name[obj.ServiceName] = sv_type;
    });
    resolve({by_name: by_name, by_id: by_id});
  });
});

module.exports.user_dbs = new Promise(function(resolve, reject) {
  var un = {id: 0, value: 'users'};
  resolve({by_id: {0: un}, by_name: {'users': un}});
});

module.exports.org_dbs = new Promise(function(resolve, reject) {
  var un = {id: 0, value: 'orgs'};
  resolve({by_id: {0: un}, by_name: {'orgs': un}});
});

module.exports.regions = new Promise(function(resolve, reject) {
  regions.then(function(result) {
    if (!result) {
      reject();
      return;
    }
    var regions = {by_name:{}, by_id:{}};
    result.map(function(v) {
      regions.by_id[v.PK] = {id: v.IcaoCode, name: v.Name, region_id: v.PK};
      regions.by_name[v.IcaoCode] = {id: v.IcaoCode, name: v.Name, region_id: v.PK};
    });
    resolve(regions);
  });
});

module.exports.dbs =
{
  'ion': { id: 1, description: 'ION originative suite', name: 'ion' }, // blobs: update files
  'oad_private': { id: 2, description: 'OAD Private Workspace', name: 'oad_private' },
  'oad': { id: 3, description: 'OAD Pending Changes' , name: 'oad' }, // value: xml
  'oad_static': { id: 4, description: 'OAD Static Data', name: 'oad_static' },     // value: dataentity
  'documents': { id: 5, description: 'Documents Libary', name: 'documents' },    // blob: pdf or geoReferencedImage
  'map_design': { id: 6, description: 'AIS map design', name: 'map_design' },      // blob: binary (aisMapDesignSet xml file)
  'cfe': { id: 7, description: 'CFE definition file', name: 'cfe' }, // blob: binary (ofm_CommmonFormatExport xml file) named VFR Design Set???
  'map_regions': { id: 8, description: 'Map Regions', name: 'map_regions' }
}

module.exports.tag_map = {
//  'FIR composition': module.exports.regions,
//  'AIS contributor : Last FIR viewed': module.exports.regions,
//  'Flight Information Region':  module.exports.regions,

//  'region':  module.exports.regions,

//  'User Category': module.exports.user_categories,
};

// bugs: record 416 3181 3216 3217
