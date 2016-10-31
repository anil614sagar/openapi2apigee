var ZSchema = require('z-schema');

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
  }
};

module.exports = policify;
