// Template InputValidation.js

// include api.js

var target;
var resource = context.getVariable("proxy.pathsuffix");
var verb = context.getVariable("request.verb").toLowerCase();
var ParameterException = {};
var parameters;

if(!('parameters' in api["paths"][resource][verb])) {
    parameters = []
} else {
    parameters = api["paths"][resource][verb]["parameters"];
}

try {
    // loop through all defined parameters, throw exception when something fails
    parameters.forEach(function(parameter){

        if(parameter["in"] !== "query") {
            // we only parse query params for now
            return false;
        }

        print("Going for parameter " + parameter["name"]);

        // check if the parameter is required
        if("required" in parameter && parameter['required'] === true && !(parameter['name'] in context.proxyRequest.queryParams)) {
            print("Parameter was required, but not found");
            throw ParameterException;
        }

        // check if the param is set
        if(!(parameter['name'] in context.proxyRequest.queryParams)) {
            print("Parameter was not required, and also not set, skipping");

            // no further processing needed, param was not set
            return false
        }

        // check if the param type is correct
        print("Value is: " + context.proxyRequest.queryParams[parameter.name]);
        print("Checking parameter type, should be: " + parameter.type + ", is: " + typeof(context.proxyRequest.queryParams[parameter.name]));
        switch(parameter.type) {
            case "integer":
                if(typeof(context.proxyRequest.queryParams[parameter.name]) !== "number") {
                    throw ParameterException;
                }
                break;

            case "null":
                // null is of type 'object':
                // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/typeof
                if(typeof(context.proxyRequest.queryParams[parameter.name]) !== 'object') {
                    throw ParameterException;
                }
                break;

            // is this even possible?
            case "array":
                if(!context.proxyRequest.queryParams[parameter.name].isArray()) {
                    throw ParameterException;
                }
                break;

            case "string":
                // apigee casts these into a list, see:
                if(typeof(context.proxyRequest.queryParams[parameter.name][0]) !== parameter.type) {
                    print("Expected " + parameter.type + ", got: " + typeof(context.proxyRequest.queryParams[parameter.name]))
                    throw ParameterException;
                }
                break;

            case "object":
            case "boolean":
            case "number":
                if(typeof(context.proxyRequest.queryParams[parameter.name]) !== parameter.type) {
                    print("Expected " + parameter.type + ", got: " + typeof(context.proxyRequest.queryParams[parameter.name]))
                    throw ParameterException;
                }
                break;

            case 'default':
                // this is not a valid json schema type and/or covered by this parser
                print(parameter.name + " is not a valid json schema type");
                throw ParameterException;
            }
        print("Parameter type is valid");


        // if a pattern regex was set, check the input
        if("pattern" in parameter && parameter[pattern] !== "") {
            var pattern = parameter['pattern'];

            print("Original pattern: " + pattern);

            // strip off any modifiers at the end of the regex, as JS doesn't understand those
            // we assume all strings are lowercase in the testing
            var flags = "";
            if(pattern[0] == '/') {
                // if the pattern doesn't end with /, we have flags
                if(pattern[pattern.length - 1] != "/") {
                    flags = pattern.substring(pattern.lastIndexOf('/') + 1, pattern.length);
                }
                // strip the slashes of the regexp string
                pattern = pattern.substring(1, pattern.lastIndexOf('/'));
            }
            print("Parsed pattern: " + pattern);
            print("Parsed flags: " + flags);


            // try to parse
            try {
                pattern = new RegExp(pattern, flags);
                var result = pattern.test(context.proxyRequest.queryParams[parameter.name]);
                print("Regexp test result: " + result);
            } catch(e) {
                throw e;
            }

            if(!result) {
                print("regex was invalid for " + parameter["name"]);
                throw ParameterException;
            }


        }
    });
} catch(e) {
    if(e !== ParameterException) {
        throw e;
    } else {
        // we got an error, let Apigee figure it out
        context.setVariable('INPUT.error', true);
    }
}
