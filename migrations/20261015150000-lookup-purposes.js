'use strict';
var dbm;var type;var seed;var fs=require('fs');var path=require('path');var Promise;
exports.setup=function(options,seedLink){dbm=options.dbmigrate;type=dbm.dataType;seed=seedLink;Promise=options.Promise;};
exports.up=function(db){var fp=path.join(__dirname,'sqls','20261015150000-lookup-purposes-up.sql');return new Promise(function(r,j){fs.readFile(fp,{encoding:'utf-8'},function(e,d){if(e)return j(e);r(d);});}).then(function(d){return db.runSql(d);});};
exports.down=function(db){var fp=path.join(__dirname,'sqls','20261015150000-lookup-purposes-down.sql');return new Promise(function(r,j){fs.readFile(fp,{encoding:'utf-8'},function(e,d){if(e)return j(e);r(d);});}).then(function(d){return db.runSql(d);});};
exports._meta={"version":1};
