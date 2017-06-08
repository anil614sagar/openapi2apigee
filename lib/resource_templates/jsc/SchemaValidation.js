/* global context, print, api */

// Template SchemaValidation.js

// include api.js

var bundle = context.getVariable('bundle')
var target
var path = context.getVariable('proxy.pathsuffix').replace(/\/$/, '')
var resource = bundle.policify.getResourceForPath(api, path)
print('path', path, 'resource', resource)
var verb = context.getVariable('request.verb').toLowerCase()

function responseBody () {
  var body
  try {
    body = context.proxyResponse.content.asJSON
  } catch (e) {
    print('error getting json content', e)
    body = ''
  }
  if (!body) {
        // Get content...
    try {
      body = JSON.stringify(context.proxyResponse.content)
    } catch (e) {
      print(e)
    }
  }
  return body
}

// only process if we are in the proxy response flow
if (context.flow === 'PROXY_RESP_FLOW') {
    // @TODO: check for http response code?
  target = responseBody()

  // check if the endpoint config exists
  try {
    var check = api['paths'][resource][verb]
    print(check, 'endpoint config exists')
  } catch (e) {
    print('Could not find endpoint definition for ' + resource + ' [' + verb + '] ')
    context.setVariable('SCHEMA.error', true)
  }

    // find and parse the schema
  var schema = bundle.policify.schemaFromApi(api, api['paths'][resource][verb]['responses']['200'])

  if (!schema) {
    print('Could not find schema definition')
    context.setVariable('SCHEMA.error', true)
  } else if (!target) {
    print('Could not find target')
    context.setVariable('SCHEMA.error', true)
  } else {
    // print("Keys in schema: " + Object.keys(schema["properties"]).toString());
    // print("Keys in target: " + Object.keys(target).toString());
    // print('target', JSON.stringify(target));
    print('schema', JSON.stringify(schema))

    var isValid = bundle.policify.validateSchema(target, schema)
    print('valid?', isValid)
    if (isValid) {
      print('Target is conform the schema defined for ' + resource)
    } else {
      var err = bundle.policify.getLastError()
      print('Target does not validate with the schema defined for ' + resource)
      print('Error ' + JSON.stringify(err))
      context.setVariable('SCHEMA.error', true)
    }
  }
}
