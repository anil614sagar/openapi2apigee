var builder = require('xmlbuilder');
var fs = require('fs');
var path = require('path');


module.exports = function generateProxyEndPoint(apiProxy, options, api, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  var root = builder.create('ProxyEndpoint');
  root.att('name', 'default');
  root.ele('Description', {}, api.info.title);
  var preFlow = root.ele('PreFlow', {name: "PreFlow"});
  preFlow.ele('Request');
  preFlow.ele('Response');

  var flows = root.ele('Flows', {});
  for (var apiPath in api.paths) {
    for (var resource in api.paths[apiPath]) {
      var resourceItem = api.paths[apiPath][resource];
      var flow = flows.ele('Flow', {name: resourceItem.operationId});
      var flowCondition = '(proxy.pathsuffix MatchesPath &quot;'+ apiPath +'&quot;) and (request.verb = &quot;'+ resource.toUpperCase() +'&quot;)';
      flow.ele('Condition').raw(flowCondition);
      flow.ele('Description', {}, resourceItem.summary);
      flow.ele('Request');
      flow.ele('Response');
    }
  }

  var postFlow = root.ele('PostFlow', {name: "PostFlow"});
  postFlow.ele('Request');
  postFlow.ele('Response');

  var httpProxyConn = root.ele('HTTPProxyConnection');
  httpProxyConn.ele('BasePath', {}, "/" + apiProxy);
  httpProxyConn.ele('VirtualHost', {}, 'default');
  httpProxyConn.ele('VirtualHost', {}, 'secure');

  var routeRule = root.ele('RouteRule', {name: "default"});
  routeRule.ele('TargetEndpoint', {}, 'default');


  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  fs.writeFile(rootDirectory + "/proxies/default.xml", xmlString, function(err) {
    if(err) {
      return cb(err, {});
    }
    cb(null, {});
  });
}
