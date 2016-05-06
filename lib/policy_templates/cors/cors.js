var builder = require('xmlbuilder');
var random = require('../../util/random.js');


module.exports = {
  corsTemplate: corsTemplate,
  corsGenTemplate: corsGenTemplate
};

function corsTemplate(options) {
  var aysnc = options.async || 'false';
  var continueOnError = options.continueOnError || 'false';
  var enabled = options.enabled || 'true';
  var name = options.name || 'Quota-' + random.randomText();
  var displayName = options.displayName || name;
  var faultRules;
  var properties;
  var headers = options.headers || {
   'Access-Control-Allow-Origin':
     { default: '*' },
    'Access-Control-Allow-Credentials':
     { default: false },
    'Access-Control-Allow-Headers':
     { default: 'Content-Type, X-Powered-By' },
    'Access-Control-Allow-Methods':
     {default: 'GET, HEAD' },
    'Access-Control-Max-Age':
     { default: 86400 }
  };
  var msg = builder.create('AssignMessage');
  msg.att("async", aysnc);
  msg.att("continueOnError", continueOnError);
  msg.att("enabled", enabled);
  msg.att("name", name);
  msg.ele("DisplayName", {}, displayName);
  msg.ele("FaultRules", {}, faultRules);
  msg.ele("Properties", {}, properties);
  var corsHeaders =
    msg.ele('Add')
       .ele("Headers");
  Object.keys(headers).forEach(function (header) {
    console.log(header);
    console.log(headers[header]);
    corsHeaders.ele('Header', {name: header}, headers[header].default);
  });
  msg.ele("IgnoreUnresolvedVariables", {}, true);
  msg.ele("AssignTo", {createNew: false, transport: 'http', type: 'response'});
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

function corsGenTemplate(options, name) {
  var templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return corsTemplate(templateOptions);
}
