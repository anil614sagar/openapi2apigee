var ZSchema = require('z-schema')
var openapiUtilPath = require('openapi-utils-path-for-uri')
var openapiUtilParam = require('openapi-utils-param-to-schema')
var openapiUtilSchema = require('openapi-utils-schema-from-api')

ZSchema = new ZSchema({
  breakOnFirstError: true,
  noExtraKeywords: true,
  ignoreUnknownFormats: false,
  reportPathAsArray: true
})

var policify = {
  validateSchema: function (injected, schema) {
    return ZSchema.validate(injected, schema)
  },
  getLastError: function () {
    return ZSchema.getLastError()
  },
  getResourceForPath: openapiUtilPath.pathForUri,
  paramToSchema: openapiUtilParam.paramToSchema,
  schemaFromApi: openapiUtilSchema.schemaFromApi
}

module.exports = policify
