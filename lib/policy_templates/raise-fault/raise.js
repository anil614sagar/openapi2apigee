var builder = require('xmlbuilder')

module.exports = {
  raiseFaultTemplate: raiseFaultTemplate,
  raiseFaultGenTemplate: raiseFaultGenTemplate
}

function raiseFaultTemplate (options) {
  var name = options.name
  var displayName = options.displayName || name
  var statusCode = options.statusCode || '500'
  var reasonPhrase = options.reasonPhrase || 'Ooops'
  var msg = builder.create('RaiseFault')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Properties', {})
  var FaultResponse = msg.ele('FaultResponse').ele('Set')
  FaultResponse.ele('Headers')
  FaultResponse.ele('Payload', { contentType: 'text/plain' })
  FaultResponse.ele('StatusCode', statusCode)
  FaultResponse.ele('ReasonPhrase', reasonPhrase)
  var xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function raiseFaultGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return raiseFaultTemplate(templateOptions)
}
