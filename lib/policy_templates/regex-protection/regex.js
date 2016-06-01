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

function yml2array(elements) {
  var elementsArray = [];
  elements.forEach(function (element) {
    var x = new RegExp(element.rule);
    element.elements.forEach( function (e) {
      var data = elementsArray.find(function (ele) {
        return ele.element && ele.element === e.element;
      });
      if (data) {
        //console.log('update filters', data.filters);
        data.filters.push(element.rule);
      } else {
        //console.log('add', e.element);
        elementsArray.push({ element: e.element, name: e.name, filters: [element.rule]});
      }
    })
  });
  return elementsArray;
};

function regexTemplate(options) {

  var s = path.join(__dirname, '../../../regex-protection.yml');
  var elements = yaml.safeLoad(fs.readFileSync(s, 'utf8'), { schema: yaml.DEFAULT_FULL_SCHEMA });
  var regex = yml2array(elements);
  var continueOnError = options.continueOnError || 'true';
  var enabled = options.enabled || 'true';
  var name = options.name;
  var displayName = options.displayName || name;
  var msg = builder.create('Javascript');
  msg.att('continueOnError', continueOnError);
  msg.att('enabled', enabled);
  msg.att('timeLimit', '200');
  msg.att('name', displayName);
  msg.ele('DisplayName', {}, displayName);
  msg.ele('Properties', {});
  msg.ele('ResourceURL', 'jsc://JavaScriptFilter.js');
  msg.ele('IncludeURL', 'jsc://regex.js');
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

function regexGenTemplate(options, name) {
  var templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return regexTemplate(templateOptions);
}
