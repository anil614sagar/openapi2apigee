// Template SchemaValidation.js

// include api.js

var target;
var resource = context.getVariable("proxy.pathsuffix").replace(/\/$/, '');
var verb = context.getVariable("request.verb").toLowerCase();
var BreakException= {};

function check_schema(target, schema) {

    // check if the required fields are set, if not, fail
    var required = schema["required"] || [];
    required.forEach(function(i, fieldname) {
        if(Object.keys(target).indexOf(fieldname) === -1) {
            return false;
        }
    });

    var properties = Object.keys(schema["properties"]) || [];

    // loop through the properties
    properties.forEach(function(property) {

        // if the property does not exist, fail
        if(Object.keys(target).indexOf(property) === -1) {
            print("Key: " + property + " not found in: " + Object.keys(target).toString());
            throw BreakException;
        }

        // check the keytype of the target property
        print("Key: " + property + " should be " + schema["properties"][property]["type"] + " -> " + typeof(target[property]));

        switch(schema["properties"][property]["type"]) {
            case "integer":
                if(typeof(target[property]) !== "number") {
                    throw BreakException;
                }
                break;

            case "null":
                // null is of type 'object':
                // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/typeof
                if(typeof(target[property]) !== 'object') {
                    throw BreakException;
                }
                break;

            case "array":
                if(!target[property].isArray()) {
                    throw BreakException;
                }
                break;

            case "object":
            case "boolean":
            case "number":
            case "string":
                if(typeof(target[property]) !== schema["properties"][property]["type"]) {
                    throw BreakException;
                }
                break;

            case 'default':
                // this is not a valid json schema type and/or covered by this parser
                print(schema["properties"][property]["type"] + " is not a valid json schema type");
                throw BreakException;
        }

        // Do we need to validate the output against a Regex?
        if (schema["properties"][property]["pattern"]) {
            print("VALIDATE REGEX", property, target[property]);
            if (!checkRegex(target[property], schema["properties"][property]["pattern"])) {
                print('Regex check failed', schema["properties"][property]["pattern"]);
                throw BreakException;
            }
        }


    });

    // if we got here, we're good
    return true;
}

function find_schema(schema, definitions) {
    if(!("schema" in schema)) {
        print("Desired schema not found in schema definition");
        return false;
    }
    schema = schema["schema"];
    if("$ref" in schema) {
        var splitup = schema["$ref"].split('/');
        var schema_name = splitup[splitup.length - 1];
        print("Found schema's for " + Object.keys(api["definitions"]).toString());
        print("Going for schema: " + schema_name);
        if((schema_name in api["definitions"])) {
            return api["definitions"][schema_name];
        }
    } else {
        return schema;
    }
    return false;
}

// only process if we are in the proxy response flow
if (context.flow === "PROXY_RESP_FLOW") {
    // @TODO: check for http response code?
    target = context.proxyResponse.content.asJSON || [];

    // check if the endpoint config exists
    try {
        var check = api['paths'][resource][verb];
    } catch(e) {
        print("Could not find endpoint definition for " + resource + " [" + verb + "] ");
        context.setVariable('SCHEMA.error', true);
    }

    // find and parse the schema
    var schema = find_schema(api['paths'][resource][verb]['responses']["200"], api["definitions"]);

    if(!schema) {
        print("Could not find schema definition");
        context.setVariable('SCHEMA.error', true);
    } else {
        print("Keys in schema: " + Object.keys(schema["properties"]).toString());
        print("Keys in target: " + Object.keys(target).toString());
        try {
            check_schema(target, schema);
        } catch(e) {
            if (e!==BreakException) {
                throw e;
            } else {
                print("Target does not validate with the schema defined for " + resource);
                context.setVariable('SCHEMA.error', true);
            }
        }
    }
}
