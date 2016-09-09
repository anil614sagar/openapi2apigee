var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var streamFromArray = require('stream-from-array');
var assign = require('lodash.assign');
var quota = require('../../policy_templates/quota/quota.js');
var spike = require('../../policy_templates/spikeArrest/spikeArrest.js');
var cache = require('../../policy_templates/cache/responseCache.js');
var cors = require('../../policy_templates/cors/cors.js');
var headers = require('../../policy_templates/headers/headers.js');
var regex = require('../../policy_templates/regex-protection/regex.js');
var validations = require('../../policy_templates/validations/valid.js');
var raiseFault = require('../../policy_templates/raise-fault/raise.js');
var verifyApiKey = require('../../policy_templates/security/apikey.js');
var oauth2 = require('../../policy_templates/security/verifyAccessToken.js');
var async = require('async');

module.exports = function generatePolicies(apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  var validationCount = 0;
  async.each(Object.keys(api['x-a127-services']), function(service, callback) {
    // Perform operation on file here.
    var provider = api['x-a127-services'][service].provider;
    var serviceOptions = api['x-a127-services'][service].options;
    var xmlString = '';
    if (provider.indexOf('quota') > -1) {
      // Add Quota Policy
      xmlString = quota.quotaGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('spike') > -1) {
      // Add spike Policy
      xmlString = spike.spikeArrestGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('cache') > -1) {
      // Add cache Policies
      xmlString = cache.responseCacheGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('cors') > -1) {
      // Add cors Policies
      xmlString = cors.corsGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('headers') > -1) {
      // Add header Policies
      xmlString = headers.headersGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('regex') > -1) {
      // Add regex Policies
      xmlString = regex.regexGenTemplate(serviceOptions, service);
      // filter
      mkdirp.sync(rootDirectory + '/resources/jsc');
      var js = path.join(__dirname, '../../resource_templates/jsc/JavaScriptFilter.js');
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/'+ service + '.js'));
      // regex
      var qs = path.join(__dirname, '../../resource_templates/jsc/querystringDecode.js');
      fs.createReadStream(qs).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/'+ service + '-querystring.js'));
      var x = regex.regularExpressions();
      var wstream = fs.createWriteStream(rootDirectory + '/resources/jsc/regex.js');
      wstream.write(new Buffer('var elements = ' + JSON.stringify(x) + ';'));
      wstream.end();
    }
    if (provider.indexOf('raiseFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('input-validation') > -1) {
      assign(serviceOptions, { resourceUrl: 'jsc://input-validation.js' });
      xmlString = validations.validationsGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('output-validation') > -1) {
      assign(api['x-a127-services'][service].options, { resourceUrl: 'jsc://schema-validation.js' });
      xmlString = validations.validationsGenTemplate(serviceOptions, service);
    }
    if (validationCount === 0 && (provider.indexOf('input-validation') > -1 || provider.indexOf('output-validation') > -1)) {
      validationCount++; // Only do this once.
      mkdirp.sync(rootDirectory + '/resources/jsc');
      // output validation
      var js = path.join(__dirname, '../../resource_templates/jsc/SchemaValidation.js');
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/schema-validation.js'));
      var ru = path.join(__dirname, '../../resource_templates/jsc/Regex.js');
      fs.createReadStream(ru).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/regex-utils.js'));
      // input validation
      var js = path.join(__dirname, '../../resource_templates/jsc/InputValidation.js');
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/input-validation.js'));
      // api
      var x = validations.validationsSchemas(api);
      var wstream = fs.createWriteStream(rootDirectory + '/resources/jsc/api.js');
      wstream.write(new Buffer('var api = ' + JSON.stringify(x) + ';'));
      wstream.end();

    }

    if (provider.indexOf('raiseInputValidationFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('raiseOutputValidationFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('oauth') > -1 && (service == "apiKeyQuery" || service == "apiKeyHeader")) {
      // Add cache Policies
      xmlString = verifyApiKey.apiKeyGenTemplate(serviceOptions, service);
    }
    if (provider.indexOf('oauth') > -1 && (service == "oauth2")) {
      // Add cache Policies
      xmlString = oauth2.verifyAccessTokenGenTemplate(serviceOptions, "verifyAccessToken");
    }
    fs.writeFile(rootDirectory + '/policies/'+ service  + '.xml', xmlString, function(err) {
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
