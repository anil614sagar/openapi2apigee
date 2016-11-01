// Template SchemaValidation.js

// include api.js

var target;
var resource = context.getVariable("proxy.pathsuffix").replace(/\/$/, '');
var verb = context.getVariable("request.verb").toLowerCase();
var BreakException= {};

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
    try {
        target = context.proxyResponse.content.asJSON || [];
    } catch (e) {
        print(e);
    }

    // check if the endpoint config exists
    try {
        var check = api['paths'][resource][verb];
    } catch(e) {
        print("Could not find endpoint definition for " + resource + " [" + verb + "] ");
        context.setVariable('SCHEMA.error', true);
    }

    // find and parse the schema
    var schema = find_schema(api['paths'][resource][verb]['responses']["200"], api["definitions"]);

    if (!schema) {
        print("Could not find schema definition");
        context.setVariable('SCHEMA.error', true);
    } else if (!target) {
        print("Could not find target");
        context.setVariable('SCHEMA.error', true);
    } else {
        print("Keys in schema: " + Object.keys(schema["properties"]).toString());
        print("Keys in target: " + Object.keys(target).toString());
        print('target', JSON.stringify(target));
        print('schema', JSON.stringify(schema));
        var bundle = context.getVariable('bundle');
        var isValid = bundle.policify.validateSchema(target, schema);
        print('valid?', isValid);
        if (isValid) {
          print("Target is conform the schema defined for " + resource);
        } else {
          var err = bundle.policify.getLastError();
          print("Target does not validate with the schema defined for " + resource);
          print("Error " + JSON.stringify(err));
          context.setVariable('SCHEMA.error', true);
        }
    }
}
