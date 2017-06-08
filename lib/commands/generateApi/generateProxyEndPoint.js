var builder = require('xmlbuilder')
var fs = require('fs')
var path = require('path')
var serviceUtils = require('../../util/service.js')

module.exports = function generateProxyEndPoint (apiProxy, options, api, cb) {
  var useCors
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  var root = builder.create('ProxyEndpoint')
  root.att('name', 'default')
  root.ele('Description', {}, api.info.title)
  var preFlow = root.ele('PreFlow', {name: 'PreFlow'})

  // Add steps to preflow.
  var raiseFaultName
  var requestPipe = preFlow.ele('Request')
  var responsePipe = preFlow.ele('Response')
  var services = serviceUtils.servicesToArray(api)
  services.forEach(function (serviceItem) {
    if (serviceItem.provider === 'x-cors') {
      useCors = serviceItem.name
      var step = responsePipe.ele('Step', {})
      step.ele('Name', {}, serviceItem.name)
      step.ele('Condition', {}, 'request.verb != "OPTIONS"')
    }
    if (serviceItem.provider === 'x-input-validation' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('request') > -1 &&
          serviceItem['options'].displayName) {
        step = requestPipe.ele('Step', {})
        step.ele('Name', {}, 'Extract Path Parameters')
        step = requestPipe.ele('Step', {})
        step.ele('Name', {}, serviceItem['options'].displayName)
      }
    }
    if (serviceItem.provider === 'x-raiseInputValidationFault' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('request') > -1 &&
          serviceItem['options'].displayName) {
        raiseFaultName = serviceItem['options'].displayName
        step = requestPipe.ele('Step', {})
        step.ele('Condition', {}, '(INPUT.error equals true)')
        step.ele('Name', {}, raiseFaultName)
      }
    }
    if (serviceItem.provider === 'x-regex-protection' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('request') > -1 &&
          serviceItem['options'].displayName) {
        step = requestPipe.ele('Step', {})
        step.ele('Name', {}, serviceItem['options'].displayName)
      }
    }
    if (serviceItem.provider === 'x-raiseFault' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('request') > -1 &&
          serviceItem['options'].displayName) {
        raiseFaultName = serviceItem['options'].displayName
        step = requestPipe.ele('Step', {})
        step.ele('Condition', {}, '(FILTER.block equals true)')
        step.ele('Name', {}, raiseFaultName)
      }
    }
  })

  var flows = root.ele('Flows', {})

  if (useCors) {
    preFlow = flows.ele('Flow', { name: 'OptionsPreFlight' })
    preFlow.ele('Condition', {}, 'request.verb == "OPTIONS"')
    preFlow.ele('Request')
    var preFlowResponse = preFlow.ele('Response')
    var requestStep = preFlowResponse.ele('Step')
    requestStep.ele('Name', {}, useCors)
  }

  var allowedVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT', 'PATCH']
  for (var apiPath in api.paths) {
    for (var resource in api.paths[apiPath]) {
      if (allowedVerbs.indexOf(resource.toUpperCase()) >= 0) {
        var resourceItem = api.paths[apiPath][resource]
        resourceItem.operationId = resourceItem.operationId || resource.toUpperCase() + ' ' + apiPath
        var flow = flows.ele('Flow', {name: resourceItem.operationId})
        var flowCondition = '(proxy.pathsuffix MatchesPath &quot;' + apiPath + '&quot;) and (request.verb = &quot;' + resource.toUpperCase() + '&quot;)'
        flow.ele('Condition').raw(flowCondition)
        flow.ele('Description', {}, resourceItem.summary)
        requestPipe = flow.ele('Request')

        // Add conditions for parameters.
        if (raiseFaultName && resource.toUpperCase() === 'GET' && resourceItem.parameters) {
          var parameters = resourceItem.parameters
          var paramCondition = ''
          var cnt = 0
          parameters.forEach(function (param) {
            if (param.required && param.in === 'query') {
              var op = (cnt > 0) ? ' or ' : ''
              paramCondition += op + '(request.queryparam.' + param.name + ' Equals null)'
              cnt++
            }
            // if (param.required && param.in === 'path') {
            //   var op = (cnt > 0) ? ' or ' : '';
            //   paramCondition +=  op + '(request.queryparam.' + param.name + ' Equals null)';
            //   cnt++;
            // }
          })
          if (paramCondition.length > 0) {
            requestStep = requestPipe.ele('Step')
            requestStep.ele('Condition').raw(paramCondition)
            requestStep.ele('Name', {}, raiseFaultName)
          }
        }

        responsePipe = flow.ele('Response')
        if (resourceItem['x-a127-apply']) {
          for (var service in resourceItem['x-a127-apply']) {
            if (resourceItem['x-a127-apply'][service].endPoint.indexOf('proxy') > -1) {
              if (resourceItem['x-a127-apply'][service].pipe.indexOf('request') > -1) {
                var step = requestPipe.ele('Step', {})
                step.ele('Name', {}, service)
              }
              if (resourceItem['x-a127-apply'][service].pipe.indexOf('response') > -1) {
                step = responsePipe.ele('Step', {})
                step.ele('Name', {}, service)
              } // pipe request / response if ends here
            }  // proxy check ends here
          } // for loop ends here
        } // check for normal policies ends here
        // Check for Security Policies in a-127
        if (resourceItem['security']) {
          for (var security in resourceItem['security']) {
            for (var stepName in resourceItem['security'][security]) {
              if (stepName === 'oauth2' || stepName === 'apiKeyHeader' || stepName === 'apiKeyQuery') {
                // Attach verify access token policy..
                step = requestPipe.ele('Step', {})
                step.ele('Name', {}, 'verifyAccessToken')
              }
            }
          }
        }
      }  // methods check ends here
    }  // for loop for resources ends here
  }  // for loop for paths ends here

  var postFlow = root.ele('PostFlow', {name: 'PostFlow'})
  postFlow.ele('Request')
  var postFlowPipe = postFlow.ele('Response')

  for (var srv in api['x-a127-services']) {
    var serviceItem = api['x-a127-services'][srv]
    if (serviceItem.provider === 'x-output-validation' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('response') > -1 &&
          serviceItem['options'].displayName) {
        step = postFlowPipe.ele('Step', {})
        step.ele('Name', {}, serviceItem['options'].displayName)
      }
    }
    if (serviceItem.provider === 'x-raiseOutputValidationFault' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('response') > -1 &&
          serviceItem['options'].displayName) {
        raiseFaultName = serviceItem['options'].displayName
        step = postFlowPipe.ele('Step', {})
        step.ele('Condition', {}, '(SCHEMA.error equals true)')
        step.ele('Name', {}, raiseFaultName)
      }
    }
    if (serviceItem.provider === 'x-headers' &&
        serviceItem['apply'].endPoint.indexOf('proxy') > -1) {
      if (serviceItem['apply'].pipe.indexOf('response') > -1 &&
          serviceItem['options'].displayName) {
        raiseFaultName = serviceItem['options'].displayName
        step = postFlowPipe.ele('Step', {})
        // step.ele('Condition', {}, '(SCHEMA.error equals true)');
        step.ele('Name', {}, raiseFaultName)
      }
    }
  }

  var httpProxyConn = root.ele('HTTPProxyConnection')
  httpProxyConn.ele('BasePath', {}, '/' + api.basePath)
  var virtualhosts = (options.virtualhosts) ? options.virtualhosts.split(',') : ['default', 'secure']
  virtualhosts.forEach(function (virtualhost) {
    httpProxyConn.ele('VirtualHost', {}, virtualhost)
  })

  if (useCors) {
    var routeRule1 = root.ele('RouteRule', {name: 'noRoute'})
    routeRule1.ele('Condition', {}, 'request.verb == "OPTIONS"')
  }

  var routeRule2 = root.ele('RouteRule', {name: 'default'})
  routeRule2.ele('TargetEndpoint', {}, 'default')

  var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' })
  fs.writeFile(rootDirectory + '/proxies/default.xml', xmlString, function (err) {
    if (err) {
      return cb(err, {})
    }
    cb(null, {})
  })
}
