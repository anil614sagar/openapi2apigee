var fs = require('fs');
var path = require('path');
var quota = require('../../policy_templates/quota/quota.js');
var spike = require('../../policy_templates/spikeArrest/spikeArrest.js');
var cache = require('../../policy_templates/cache/responseCache.js');
var verifyApiKey = require('../../policy_templates/security/apikey.js');
var async = require("async");


module.exports = function generatePolicies(apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  async.each(Object.keys(api['x-a127-services']), function(service, callback) {
    // Perform operation on file here.
    var provider = api['x-a127-services'][service].provider;
    var xmlString = '';
    if (provider.indexOf('quota') > -1) {
      // Add Quota Policy
      xmlString = quota.quotaGenTemplate(api['x-a127-services'][service].options, service);
    }
    if (provider.indexOf('spike') > -1) {
      // Add spike Policy
      xmlString = spike.spikeArrestGenTemplate(api['x-a127-services'][service].options, service);
    }
    if (provider.indexOf('cache') > -1) {
      // Add cache Policies
      xmlString = cache.responseCacheGenTemplate(api['x-a127-services'][service].options, service);
    }
    if (provider.indexOf('oauth') > -1 && (service == "apiKeyQuery" || service == "apiKeyHeader")) {
      // Add cache Policies
      xmlString = verifyApiKey.apiKeyGenTemplate(api['x-a127-services'][service].options, service);
    }
    fs.writeFile(rootDirectory + "/policies/"+ service  +".xml", xmlString, function(err) {
      if(err) {
        callback(err, {});
      }
      callback(null, {});
    });
  }, function(err){
    // if any of the file processing produced an error, err would equal that error
    if( err ) {
      cb(err, {})
    } else {
      cb(null, {});
    }
  });
}
