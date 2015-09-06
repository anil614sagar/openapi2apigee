var builder = require('xmlbuilder');
var random = require('../../util/random.js');


module.exports = {
  apiKeyTemplate: apiKeyTemplate,
  apiKeyGenTemplate: apiKeyGenTemplate
};

function apiKeyTemplate(options) {
  var aysnc = options.async || 'false';
  var continueOnError = options.continueOnError || 'false';
  var enabled = options.enabled || 'true';
  var name = options.name || 'apiKey-' + random.randomText();
  var keyRef = options.keyRef || 'request.queryparam.apikey';

  var apiKey = builder.create('VerifyAPIKey');
  apiKey.att("async", aysnc);
  apiKey.att("continueOnError", continueOnError);
  apiKey.att("enabled", enabled);
  apiKey.att("name", name);

  apiKey.ele("Properties", {});
  apiKey.ele("APIKey", {ref: keyRef});

  var xmlString = apiKey.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

function apiKeyGenTemplate(options, name) {
  var templateOptions = options;
  templateOptions.name = name;
  if (name == "apiKeyHeader") {
    templateOptions.keyRef = "request.header.apikey";
  }
  return apiKeyTemplate(templateOptions);
}
