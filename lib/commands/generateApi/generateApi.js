var parser = require("swagger-parser");
var generateSkeleton = require('./generateSkeleton.js')
var generateProxy = require('./generateProxy.js');
var generateProxyEndPoint = require('./generateProxyEndPoint.js');
var generateTargetEndPoint = require('./generateTargetEndPoint.js');


module.exports = {
  generateApi: generateApi
};

function generateApi(apiProxy, options, cb) {
  var response = {};
  response.folderGenerated = false;
  parser.parse(options.location, function(err, api, metadata) {
    if (!err) {
      console.log("API name: %s, Version: %s", api.info.title, api.info.version);
      generateSkeleton(apiProxy, options, function(err, reply) {
        generateProxy(apiProxy, options, api, response);
        generateProxyEndPoint(apiProxy, options, api, response);
        //generateTargetEndPoint(apiProxy, options, api, response);
      });
    }
    else {
      console.log(err);
    }
  });
  cb(null, response);
}
