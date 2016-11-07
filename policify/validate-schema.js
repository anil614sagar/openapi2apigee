var ZSchema = require('z-schema');
var openapiUtil = require('openapi-utils-path-for-uri');

ZSchema = new ZSchema({
  breakOnFirstError: true,
  noExtraKeywords: true,
  ignoreUnknownFormats: false,
  reportPathAsArray: true
});


var policify = {
  validateSchema: function (injected, schema) {
    return ZSchema.validate(injected, schema);
  },
  getLastError: function () {
    return ZSchema.getLastError();
  },
  getResourceForPath: openapiUtil.pathForUri 
};

module.exports = policify;
