var builder = require('xmlbuilder');

module.exports = {
  raiseFaultTemplate: raiseFaultTemplate,
  raiseFaultGenTemplate: raiseFaultGenTemplate
};

function raiseFaultTemplate(options) {
  var aysnc = options.async || 'false';
  var continueOnError = options.continueOnError || 'false';
  var enabled = options.enabled || 'true';
  var name = options.name;
  var displayName = options.displayName || name;
  var headers = options.headers;
  var msg = builder.create('AssignMessage');
  msg.att('name', displayName);
  msg.ele('DisplayName', {}, displayName);
  msg.ele('AssignTo', {createNew: false, type: 'request'});
  var addHeaders =
    msg.ele('Set')
       .ele('Headers');
  Object.keys(headers).forEach(function (header) {
    addHeaders.ele('Header', {name: header}, headers[header].default);
  });
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

function raiseFaultGenTemplate(options, name) {
  var templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return raiseFaultTemplate(templateOptions);
}
