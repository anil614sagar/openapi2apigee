// Template InputValidation.js

// include api.js


var bundle = context.getVariable('bundle');
var target;
var path = context.getVariable("proxy.pathsuffix").replace(/\/$/, '');
var resource = bundle.policify.getResourceForPath(api, path);
print('path', path, 'resource', resource);
var verb = context.getVariable("request.verb").toLowerCase();
var ParameterException = {};
var parameters;

if (resource) {

  if(!('parameters' in api["paths"][resource][verb])) {
      parameters = [];
  } else {
      parameters = api["paths"][resource][verb]["parameters"];
  }

  try {
      // loop through all defined parameters, throw exception when something fails
      parameters.forEach(function(parameter) {

          // Get values of dynamic parameters
          var pSchema = bundle.policify.paramToSchema(parameter);

          var pathParamValue = context.getVariable('pathParam.' + parameter.name);
          print(parameter.name, pathParamValue, JSON.stringify(pSchema));

          if (!(parameter["in"] === "query" || parameter["in"] === "path")) {
              // we only parse query and path params for now
              return false;
          }
          print("Going for parameter " + parameter.name);

          var wrappedParamValue = {};
          wrappedParamValue[parameter.name] =
            (pathParamValue)
            ?
            pathParamValue
            :
            context.proxyRequest.queryParams[parameter.name];

          var isValid = bundle.policify.validateSchema(wrappedParamValue, pSchema);
          print('valid?', isValid, JSON.stringify(wrappedParamValue));
          if (isValid) {
            print("Parameter value is conform the schema");
          } else {
            var err = bundle.policify.getLastError();
            print("Parameter does not validate with the parameter schema");
            print("Error " + JSON.stringify(err));
            throw ParameterException;
          }


          // check if the parameter is required
          // if("required" in parameter && parameter['required'] === true && !(parameter['name'] in context.proxyRequest.queryParams)) {
          //     print("Parameter was required, but not found");
          //     throw ParameterException;
          // }
          //
          // // check if the param is set
          // if(!(parameter['name'] in context.proxyRequest.queryParams)) {
          //     print("Parameter was not required, and also not set, skipping");
          //
          //     // no further processing needed, param was not set
          //     return false
          // }
          //
          // // check if the param type is correct
          // print("Value is: " + context.proxyRequest.queryParams[parameter.name]);
          // print("Checking parameter type, should be: " + parameter.type + ", is: " + typeof(context.proxyRequest.queryParams[parameter.name]));
          // switch(parameter.type) {
          //     case "integer":
          //         if(typeof(context.proxyRequest.queryParams[parameter.name]) !== "number") {
          //             throw ParameterException;
          //         }
          //         break;
          //
          //     case "null":
          //         // null is of type 'object':
          //         // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/typeof
          //         if(typeof(context.proxyRequest.queryParams[parameter.name]) !== 'object') {
          //             throw ParameterException;
          //         }
          //         break;
          //
          //     // is this even possible?
          //     case "array":
          //         if(!context.proxyRequest.queryParams[parameter.name].isArray()) {
          //             throw ParameterException;
          //         }
          //         break;
          //
          //     case "string":
          //         // apigee casts these into a list, see:
          //         if(typeof(context.proxyRequest.queryParams[parameter.name][0]) !== parameter.type) {
          //             print("Expected " + parameter.type + ", got: " + typeof(context.proxyRequest.queryParams[parameter.name]))
          //             throw ParameterException;
          //         }
          //         break;
          //
          //     case "object":
          //     case "boolean":
          //     case "number":
          //         if(typeof(context.proxyRequest.queryParams[parameter.name]) !== parameter.type) {
          //             print("Expected " + parameter.type + ", got: " + typeof(context.proxyRequest.queryParams[parameter.name]))
          //             throw ParameterException;
          //         }
          //         break;
          //
          //     case 'default':
          //         // this is not a valid json schema type and/or covered by this parser
          //         print(parameter.name + " is not a valid json schema type");
          //         throw ParameterException;
          //     }
          // print("Parameter type is valid");
          //
          //
          // // if a pattern regex was set, check the input
          // if("pattern" in parameter && parameter["pattern"] !== "") {
          //     print("VALIDATE REGEX", context.proxyRequest.queryParams[parameter.name]);
          //     if (!checkRegex(context.proxyRequest.queryParams[parameter.name], parameter["pattern"])) {
          //         print("Regex check failed", parameter["pattern"]);
          //         throw ParameterException;
          //     }
          // }

      });
  } catch(e) {
      if(e !== ParameterException) {
          throw e;
      } else {
          // we got an error, let Apigee figure it out
          context.setVariable('INPUT.error', true);
      }
  }
} else {
  print('resource could not be found');
  context.setVariable('INPUT.error', true);
}
