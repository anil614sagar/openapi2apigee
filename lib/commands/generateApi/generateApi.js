var parser = require("swagger-parser");
var mkdirp = require('mkdirp');
var async = require('async');


module.exports = {
  generateApi: generateApi
};

function generateApi(apiProxy, options, cb) {
  var response = {};
  parser.parse(options.location, function(err, api, metadata) {
    if (!err) {
      console.log("API name: %s, Version: %s", api.info.title, api.info.version);
      generateSkeleton(apiProxy, options, response);
    }
    else {
      console.log(err);
    }
  });
  cb(null, response);
}

function generateSkeleton(apiProxy, options, response) {
  var destination = options.destination || 'apiBundles';
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  mkdirp(rootDirectory, function(err) {
       if (err) {
         console.log("Error generating root folder...");
       }
  });
  // Generate sub folders..
  var subFolders = ["policies", "proxies", "targets"];
  async.map(subFolders, function(item, callback) {
    callback(null, this.rootDirectory + "/" + item);
  }.bind({ rootDirectory: rootDirectory }), function(err, results) {
    // Create sub folders
    async.map(results, mkdirp,  function (err, results) {});
  });
}
