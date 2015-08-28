var builder = require('xmlbuilder');
var fs = require('fs');
var path = require('path');


module.exports = function generateTargetEndPoint(apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  var root = builder.create('TargetEndpoint');
  root.att('name', 'default');
  root.ele('Description', {}, api.info.title);
  var preFlow = root.ele('PreFlow', {name: "PreFlow"});
  preFlow.ele('Request');
  preFlow.ele('Response');

  var flows = root.ele('Flows', {});

  var postFlow = root.ele('PostFlow', {name: "PostFlow"});
  postFlow.ele('Request');
  postFlow.ele('Response');

  var httpTargetConn = root.ele('HTTPTargetConnection');
  httpTargetConn.ele('URL', {}, api.schemes[0] + "://" + api.host + api.basePath);


  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  fs.writeFile(rootDirectory + "/targets/default.xml", xmlString, function(err) {
    if(err) {
      return cb(err, {});
    }
    cb(null, {});
  });
}
