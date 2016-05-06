var builder = require('xmlbuilder');
var fs = require('fs');
var path = require('path');


module.exports = function generateProxy(apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  var root = builder.create('APIProxy');
  root.att('revison', 1);
  root.att('name', apiProxy);
  root.ele('CreatedAt', {}, Math.floor(Date.now()/1000));
  root.ele('Description', {}, api.info.title);
  var proxyEndPoints = root.ele('ProxyEndpoints', {});
  proxyEndPoints.ele('ProxyEndpoint' , {}, 'default');
  var targetEndPoints = root.ele('TargetEndpoints', {});
  targetEndPoints.ele('TargetEndpoint' , {}, 'default');
  if (api['x-a127-services'] && api['x-a127-services']['add-cors']) {
    root.ele('Policies')
        .ele('Policy', {}, 'add-cors');
  }
  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  fs.writeFile(rootDirectory + "/" + apiProxy + ".xml", xmlString, function(err) {
    if(err) {
      return cb(err, {});
    }
    cb(null, {});
  });
}
