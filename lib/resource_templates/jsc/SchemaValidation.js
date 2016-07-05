// Template SchemaValidation.js

var target;
var resource = context.getVariable("proxy.pathsuffix");
var verb = context.getVariable("request.verb").toLowerCase();

print("verb" + verb);

// check if the resource exists in the schema's, if not, we don't do anything
// if (!(resource in api)) {
//     // there is no schema defined, block it
//     context.setVariable('FILTER.schema_error', true);
//     print("No schema defined");
//     // return;
// }

// this is a request, parse the input
if (context.flow=="PROXY_REQ_FLOW") {
    //
}

// this is a proxy response, parse the response flow
if (context.flow=="PROXY_RESP_FLOW") {
    target = context.proxyResponse.content.asJSON;
}

function check_schema(target, schema) {
    var keys = Object.keys(schema);
    for(i=0;i<keys.length;i++) {
        // if the key does not exist, fail
        if(!(keys[i] in target)) {
            print("Key: " + keys[i] + " not found in target");
            return false;
        }

        // check the keytype
        print("Key: " + keys[i] + " should be " + schema[keys[i]]["type"] + " -> " + typeof(target[keys[i]]));
        switch(schema[keys[i]]["type"]) {
            case "integer":
                if(typeof(target[keys[i]]) !== "number") {
                    return false;
                }
                break;

            case "null":
                // null is of type 'object':
                // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/typeof
                if(typeof(target[keys[i]]) !== 'object') {
                    return false;
                }
                break;

            case "array":
                if(!target[keys[i]].isArray()) {
                    return false;
                }
                break;

            case "object":
            case "boolean":
            case "number":
            case "string":
                if(typeof(target[keys[i]]) !== schema[keys[i]]["type"]) {
                    return false;
                }
                break;

            case 'default':
                print(schema[keys[i]] + " is not a valid json schema type");
                // this is not a valid json schema type
                return false;
        }
    }

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
            return api["definitions"][schema_name]["properties"];
        }
    } else {
        return schema;
    }
    return false;
}


// only process if we have something to process
if(target !== null) {
    print("Got keys: " + Object.keys(target).toString());
    // @TODO: check for http response code?

    // find and parse the schema
    var schema = find_schema(api['paths'][resource][verb]['responses']["200"], api["definitions"]);

    if(!schema) {
        print("Could not find schema definition");
        context.setVariable('FILTER.schema_error', true);
    } else {
        print("Keys in schema: " + Object.keys(schema).toString());
        if(!check_schema(target, schema)) {
            context.setVariable('FILTER.schema_error', true);
            print("Target does not validate with the schema defined for " + resource);
            // return;
        }
    }
}
