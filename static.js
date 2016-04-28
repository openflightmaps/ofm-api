'use strict';

var Promise = require("bluebird");

// DB: bookshelf
var db = require('./db');

// service table
var s3t = db.Model.extend({
  tableName: 'S3T',
});

var s1t = db.Model.extend({
  tableName: 'S1T',
});

// FIRs
var db_regions = db.Model.extend({
  tableName: 'AMMNT_FIR',
});


var s3 = s3t.fetchAll();
var s1 = s1t.fetchAll();
var regions = db_regions.fetchAll();

module.exports.entity_types = new Promise(function(resolve, reject) {
  s3.then(function(s3) {
    var entity_types = {};
    s3.toJSON().map(function(obj) {entity_types[obj.ServiceEntityTypeID] = {description: obj.ServiceEntityTypeDescription, type_format: obj.ServiceEntityTypeFormat}});
    resolve(entity_types);
  });
});

module.exports.services = new Promise(function(resolve, reject) {
  s1.then(function(s1) {
    var services = {};
    s1.toJSON().map(function(obj) {services[obj.ServiceID] = {description: obj.ServiceName}});
    resolve(services);
  });
});

module.exports.regions = new Promise(function(resolve, reject) {
  regions.then(function(result) {
    if (!result) {
      reject();
      return;
    }
    var result = result.toJSON();
    var regions = {by_name:{}, by_id:{}};
    result.map(function(v) {
      regions.by_id[v.PK] = {id: v.IcaoCode, name: v.Name, region_id: v.PK};
      regions.by_name[v.IcaoCode] = {id: v.IcaoCode, name: v.Name, region_id: v.PK};
    });
    resolve(regions);
  });
});

module.exports.whitelist_entity_types =
{ '0': { description: 'Flight Information Region', type_format: 2, name: 'fir' },
  '1': { description: 'Last Pending Submission', type_format: 5 },
  '2': { description: 'Data Entity', type_format: 6 },
//  '3': { description: 'PDF Attachment', type_format: 6 },
//  '4': { description: 'Executable File Client', type_format: 6 },
//  '5': { description: 'Executable File Updater', type_format: 6 },
  '6': { description: 'Version', type_format: 2 },
  '7': { description: 'Effective', type_format: 5 },
  '8': { description: 'valid', type_format: 5 },
  '9': { description: 'Built', type_format: 2 },
  '10': { description: 'Comment File', type_format: 6 },
  '11': { description: 'User', type_format: 3 },
  '12': { description: 'Designator', type_format: 3, name: 'name' },
  '13': { description: 'Datestamp', type_format: 5 },
  '14': { description: 'Appproval Date', type_format: 5 },
  '15': { description: 'Approved', type_format: 7 },
  '16': { description: 'Approved By User', type_format: 3 },
  '17': { description: 'Type', type_format: 3, name: 'type' },
  '18': { description: 'Coordinate Notation', type_format: 3 },
  '19': { description: 'Data Log Entry', type_format: 3 },
  '20': { description: 'ICAO', type_format: 4 },
  '21': { description: 'Document Reference', type_format: 4, name: 'document_reference' },
  '22': { description: 'AIPSection_1AD_2ENR_3GEN_4OTHER', type_format: 2 },
  '23': { description: 'Revision', type_format: 2, name: 'revision' },
  '24': { description: 'CurrentVersion', type_format: 7 },
  '25': { description: 'locked', type_format: 2, name: 'locked' },
  '26': { description: 'Page Nbr', type_format: 2, name: 'page_nr' },
//  '27': { description: 'xml', type_format: 3 },
//  '28': { description: 'rtf', type_format: 3 },
  '29': { description: 'geoReferencedImage', type_format: 6 },
  '30': { description: 'geoReferenceMapping', type_format: 3 },
  '31': { description: 'typeOfDocument_0pdf_1gri', type_format: 2 },
  '32': { description: 'binary', type_format: 6 },
  '33': { description: 'file storage location', type_format: 3 },
  '34': { description: 'geo frame', type_format: 3 },
  '35': { description: 'sectionFrameXml', type_format: 3 },
  '36': { description: 'lastCommitMsg', type_format: 3 },
  '37': { description: 'Executable File Client x64', type_format: 6 },
  '38': { description: 'Executable File Client Beta', type_format: 6 },
  '39': { description: 'Executable File Client Beta x64', type_format: 6 },
  '40': { description: 'Built Beta', type_format: 2 },
  '41': { description: 'beta tester msg', type_format: 3 } }

