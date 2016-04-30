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
{ '0': { description: 'Flight Information Region', type_format: 2, name: 'region' },
  '1': { description: 'Last Pending Submission', type_format: 5, name: '' },
  '2': { description: 'Data Entity', type_format: 6, name: 'entity' },
  '3': { description: 'PDF Attachment', type_format: 6, name: 'pdf' },
  '4': { description: 'Executable File Client', type_format: 6, name: 'exe_client' },
  '5': { description: 'Executable File Updater', type_format: 6, name: 'exe_updater' },
  '6': { description: 'Version', type_format: 2, name: 'version' },
  '7': { description: 'Effective', type_format: 5, name: 'effective' },
  '8': { description: 'valid', type_format: 5, name: 'valid' },
  '9': { description: 'Built', type_format: 2, name: 'build' },
  '10': { description: 'Comment File', type_format: 6, name: 'comment' },
  '11': { description: 'User', type_format: 3, name: 'user' },
  '12': { description: 'Designator', type_format: 3, name: 'name' },
  '13': { description: 'Datestamp', type_format: 5, name:  'datestamp'},
  '14': { description: 'Appproval Date', type_format: 5, name: 'approval_date' },
  '15': { description: 'Approved', type_format: 7, name: 'approved' },
  '16': { description: 'Approved By User', type_format: 3, name: 'approved_by_user' },
  '17': { description: 'Type', type_format: 3, name: 'type' , name: 'type'},
  '18': { description: 'Coordinate Notation', type_format: 3, name: 'coordinate' },
  '19': { description: 'Data Log Entry', type_format: 3, name: 'commit_msg' },
  '20': { description: 'ICAO', type_format: 4, name: 'icao' },
  '21': { description: 'Document Reference', type_format: 4, name: 'document_reference' },
  '22': { description: 'AIPSection_1AD_2ENR_3GEN_4OTHER', type_format: 2, name: 'aip_section' },
  '23': { description: 'Revision', type_format: 2, name: 'revision' },
  '24': { description: 'CurrentVersion', type_format: 7, name: 'current_version' },
  '25': { description: 'locked', type_format: 2, name: 'locked' },
  '26': { description: 'Page Nbr', type_format: 2, name: 'page_nr' },
  '27': { description: 'xml', type_format: 3, name: 'xml' }, // merge with value field
  '28': { description: 'rtf', type_format: 3, name: 'rtf' },
  '29': { description: 'geoReferencedImage', type_format: 6, name: 'georef_image' },
  '30': { description: 'geoReferenceMapping', type_format: 3, name: 'georef_mapping' },
  '31': { description: 'typeOfDocument_0pdf_1gri', type_format: 2, name: 'type_of_document' }, // might make sense to have one attachment type field and one attachment field.
  '32': { description: 'binary', type_format: 6, name: 'binary' },
  '33': { description: 'file storage location', type_format: 3, name: 'file_storage_location' },
  '34': { description: 'geo frame', type_format: 3, name: 'geo_frame' },
  '35': { description: 'sectionFrameXml', type_format: 3, name: 'section_frame_xml' }, // merge with value field
  '36': { description: 'lastCommitMsg', type_format: 3, name: 'last_commit_msg' },
  '37': { description: 'Executable File Client x64', type_format: 6, name: 'exe_client64' },
  '38': { description: 'Executable File Client Beta', type_format: 6, name: 'exe_client_beta' },
  '39': { description: 'Executable File Client Beta x64', type_format: 6, name: 'exe_client64_beta' },
  '40': { description: 'Built Beta', type_format: 2, name: 'build_beta' },
  '41': { description: 'beta tester msg', type_format: 3, name: 'msg_beta_tester' }
 }

var services =
{ '1': { description: 'ION originative suite', name: 'ion' },// 	blobs: update files
  '2': { description: 'OAD Private Workspace', name: 'oad_private' },
  '3': { description: 'OAD Pending Changes' , name: 'oad' }, // value: xml
  '4': { description: 'OAD Static Data', name: 'oad_static' },     // value: dataentity
  '5': { description: 'Documents Libary', name: 'documents' },    // blob: pdf or geoReferencedImage
  '6': { description: 'AIS map design', name: 'map_design' },      // blob: binary (aisMapDesignSet xml file)
  '7': { description: 'CFE definition file', name: 'cfe' }, // blob: binary (ofm_CommmonFormatExport xml file) named VFR Design Set???
  '8': { description: 'Map Regions', name: 'map_regions' }
}        // value: sectionFrameXml ?


// bugs: record 416 3181 3216 3217
