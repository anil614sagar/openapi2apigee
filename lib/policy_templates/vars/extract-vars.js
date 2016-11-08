var builder = require('xmlbuilder');
var fs = require('fs');
var path = require('path');

module.exports = {
  extractVarsTemplate: extractVarsTemplate,
  extractVarsGenTemplate: extractVarsGenTemplate
};

function extractVarsTemplate(options) {
  var continueOnError = options.continueOnError || 'true';
  var enabled = options.enabled || 'true';
  var name = options.name;
  var displayName = options.displayName || name;
  var msg = builder.create('ExtractVariables');
  msg.att('continueOnError', continueOnError);
  msg.att('enabled', enabled);
  msg.att('name', displayName);
  msg.ele('DisplayName', {}, displayName);
  msg.ele('Source', { clearPayload: 'false' }, 'request');

  var uri = msg.ele('URIPath', {});
  Object.keys(options.api.paths).forEach(function (path) {
    // Only add pattern if there is a parameter.
    if (path.indexOf('{') > -1 ) {
      uri.ele('Pattern', { ignoreCase: "true" }, path);
    }
  });
  msg.ele('VariablePrefix', {}, 'pathParam');
  msg.ele('IgnoreUnresolvedVariables', {}, 'false');
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

function extractVarsGenTemplate(options, name) {
  var templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return extractVarsTemplate(templateOptions);
}
