var builder = require('xmlbuilder');
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');

// Get document, or throw exception on error
try {
} catch (e) {
  console.log(e);
}

module.exports = {
  regexTemplate: regexTemplate,
  regexGenTemplate: regexGenTemplate
};

function regexTemplate(options) {

  var s = path.join(__dirname, '../../../regex-protection-single-file.yml');
  var doc = yaml.safeLoad(fs.readFileSync(s, 'utf8'));
  console.log(doc);

  var aysnc = options.async || 'false';
  var continueOnError = options.continueOnError || 'false';
  var enabled = options.enabled || 'true';
  var name = options.name;
  var displayName = options.displayName || name;
  var headers = options.headers;
  var msg = builder.create('RegularExpressionProtection');
  msg.att('async', aysnc);
  msg.att('continueOnError', continueOnError);
  msg.att('enabled', enabled);
  msg.att('name', displayName);
  msg.ele('DisplayName', {}, displayName);
  msg.ele('Properties', {});
  msg.ele('IgnoreUnresolvedVariables', {}, 'false');
  // msg.ele('AssignTo', {createNew: false, type: 'request'});
  // var addHeaders =
  //   msg.ele('Set')
  //      .ele('Headers');
  // Object.keys(headers).forEach(function (header) {
  //   addHeaders.ele('Header', {name: header}, headers[header].default);
  // });
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

function regexGenTemplate(options, name) {
  var templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return regexTemplate(templateOptions);
}


// <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <RegularExpressionProtection async="false" continueOnError="false" enabled="true" name="Regular-Expression-Protection-1">
//     <DisplayName>Regular Expression Protection-1</DisplayName>
//     <Properties/>
//     <IgnoreUnresolvedVariables>false</IgnoreUnresolvedVariables>
//     <JSONPayload>
//         <JSONPath>
//             <Pattern ignoreCase="false">pattern</Pattern>
//             <Expression>expression</Expression>
//         </JSONPath>
//     </JSONPayload>
//     <URIPath>
//         <Pattern ignoreCase="false">pattern</Pattern>
//     </URIPath>
//     <QueryParam name="qparam">
//         <Pattern/>
//     </QueryParam>
//     <Header name="header">
//         <Pattern/>
//     </Header>
//     <FormParam name="fparam">
//         <Pattern/>
//     </FormParam>
//     <Variable name="myVariable">
//         <Pattern/>
//     </Variable>
//     <Source>request</Source>
//     <XMLPayload>
//         <Namespaces/>
//         <XPath>
//             <Pattern ignoreCase="false">pattern</Pattern>
//             <Expression>expression</Expression>
//             <Type>string</Type>
//         </XPath>
//     </XMLPayload>
// </RegularExpressionProtection>
