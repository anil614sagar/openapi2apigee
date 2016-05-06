var builder = require('xmlbuilder');
var fs = require('fs');
var path = require('path');
var quota = require('../../policy_templates/quota/quota.js');


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
  if (api['x-a127-services'] && api['x-a127-services']['add-cors']) {
    preFlow
      .ele('Response')
      .ele('Step')
      .ele('Name', {}, 'add-cors');
  } else {
    preFlow.ele('Response');
  }
  var flows = root.ele('Flows', {});
  var allowedVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT', 'PATCH'];
  for (var apiPath in api.paths) {
    for (var resource in api.paths[apiPath]) {
      if (allowedVerbs.indexOf(resource.toUpperCase()) >= 0) {
        var resourceItem = api.paths[apiPath][resource];
        resourceItem.operationId = resourceItem.operationId || resource.toUpperCase() + ' ' + apiPath;
        var flow = flows.ele('Flow', {name: resourceItem.operationId});
        var flowCondition = '(proxy.pathsuffix MatchesPath &quot;' + apiPath + '&quot;) and (request.verb = &quot;' + resource.toUpperCase() + '&quot;)';
        flow.ele('Condition').raw(flowCondition);
        flow.ele('Description', {}, resourceItem.summary);
        var requestPipe = flow.ele('Request');
        var responsePipe = flow.ele('Response');
        if (resourceItem['x-a127-apply']) {
          for (var service in resourceItem['x-a127-apply']) {
            if(resourceItem['x-a127-apply'][service].endPoint.indexOf("proxy") > -1) {
              if (resourceItem['x-a127-apply'][service].pipe.indexOf("request") > -1) {
                var step = requestPipe.ele('Step', {});
                step.ele("Name", {}, service);
              }
              if (resourceItem['x-a127-apply'][service].pipe.indexOf("response") > -1) {
                var step = responsePipe.ele('Step', {});
                step.ele("Name", {}, service);
              } // pipe request / response if ends here
            }  // proxy check ends here
          } // for loop ends here
        } // check for normal policies ends here
        // Check for Security Policies in a-127
        if (resourceItem['security']) {
          for (var security in resourceItem['security']) {
            for (var stepName in resourceItem['security'][security]) {
              if (stepName == "oauth2" || stepName == "apiKeyHeader" || stepName == "apiKeyQuery") {
                // Attach verify access token policy..
                var step = requestPipe.ele('Step', {});
                step.ele("Name", {}, "verifyAccessToken");
              }
            }
          }
        }
      }  // methods check ends here
    }  // for loop for resources ends here
  }  // for loop for paths ends here

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
