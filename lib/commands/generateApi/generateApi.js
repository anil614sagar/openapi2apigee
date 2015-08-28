var parser = require("swagger-parser");
var generateSkeleton = require('./generateSkeleton.js');
var generateProxy = require('./generateProxy.js');
var generateProxyEndPoint = require('./generateProxyEndPoint.js');
var generateTargetEndPoint = require('./generateTargetEndPoint.js');
var async = require('async');
var EasyZip = require('easy-zip').EasyZip;
var path = require('path');


module.exports = {
  generateApi: generateApi
};

function generateApi(apiProxy, options, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var srcDirectory = destination + "/" + apiProxy + "/apiproxy/";
  var destDirectory = destination + "/" + apiProxy + "/apiproxy.zip";
  parser.parse(options.source, function(err, api, metadata) {
    console.log(api);
    if (!err) {
      console.log("API name: %s, Version: %s", api.info.title, api.info.version);
      generateSkeleton(apiProxy, options, function(err, reply) {
        async.parallel([
            function(callback){
              generateProxy(apiProxy, options, api, function(err, reply) {
                callback(null, 'genProxy');
              });
            },
            function(callback){
              generateProxyEndPoint(apiProxy, options, api, function(err, reply) {
                callback(null, 'genProxyEndPoint');
              });
            },
            function(callback){
              generateTargetEndPoint(apiProxy, options, api, function(err, reply) {
                callback(null, 'genTargetPoint');
              });
            }
          ],
          function(err, results){
            var zip5 = new EasyZip();
            zip5.zipFolder(srcDirectory,function(err){
              if(err) {
                return cb(err, {});
              }
              zip5.writeToFile(destDirectory , function(err) {
                if(err) {
                  return cb(err, {});
                }
                return cb(null, results);
              });
            });
          }
        );
      });
    }
    else {
      return cb(err, { error: 'Swagger parsing failed..'});
    }
  });
}
