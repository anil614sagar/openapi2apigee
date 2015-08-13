var builder = require('xmlbuilder');
var fs = require('fs');


module.exports = function generateProxy(apiProxy, options, api, cb) {
  var destination = options.destination || 'apiBundles';
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
  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  fs.writeFile(rootDirectory + "/" + apiProxy + ".xml", xmlString, function(err) {
    if(err) {
      return cb(err, {});
    }
    console.log(xmlString);
    console.log("Proxy File Generated..!");
    cb(null, {});
  });
}
