var parser = require("swagger-parser");
var generateSkeleton = require('./generateSkeleton.js')
var generateProxy = require('./generateProxy.js');
var generateProxyEndPoint = require('./generateProxyEndPoint.js');
var generateTargetEndPoint = require('./generateTargetEndPoint.js');
var async = require('async');
var fs = require('fs');
var archiver = require('archiver');


module.exports = {
  generateApi: generateApi
};

function generateApi(apiProxy, options, cb) {
  var destination = options.destination || 'apiBundles';
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var srcDirectory = destination + "/" + apiProxy + "/apiproxy";
  var destDirectory = destination + "/" + apiProxy + "/apiproxy.zip";
  parser.parse(options.location, function(err, api, metadata) {
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
            // Generate zip file
            var output = fs.createWriteStream(destDirectory);
            var zipArchive = archiver('zip');

            output.on('close', function() {
              cb(null, results);
              console.log('done with the zip', destDirectory);
            });

            zipArchive.pipe(output);

            zipArchive.bulk([
              { src: [ '**/*' ], cwd: srcDirectory, expand: true }
            ]);

            zipArchive.finalize(function(err, bytes) {
              if(err) {
                throw err;
              }
              console.log('done:', base, bytes);
            });
          }
        );
      });
    }
    else {
      cb(err, {});
      console.log(err);
    }
  });
}
