var builder = require('xmlbuilder');
var fs = require('fs');
var path = require('path');
var quota = require('../../policy_templates/quota/quota.js')


module.exports = function generatePolicies(apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";


  for (var service in api['x-a127-services']) {
    var provider = api['x-a127-services'][service].provider;
    if (provider.indexOf('quota') > -1) {
      // Add Quota Policy
      var xmlString = quota.quotaGenTemplate(api['x-a127-services'][service].options);
      fs.writeFile(rootDirectory + "/policies/"+ service  +".xml", xmlString, function(err) {
        if(err) {
          return cb(err, {});
        }

      });
    }
  }

  cb(null, {});


}
