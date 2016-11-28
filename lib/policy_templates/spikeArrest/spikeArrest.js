var builder = require('xmlbuilder')
var random = require('../../util/random.js')

module.exports = {
  spikeArrestTemplate: spikeArrestTemplate,
  spikeArrestGenTemplate: spikeArrestGenTemplate
}

function spikeArrestTemplate (options) {
  var aysnc = options.async || 'false'
  var continueOnError = options.continueOnError || 'false'
  var enabled = options.enabled || 'true'
  var name = options.name || 'SpikeArrest-' + random.randomText()
  var displayName = options.displayName || name
  var identifierRef = options.identifierRef || 'request.header.some-header-name'
  var messageWeightRef = options.intervalRef || 'request.header.weight'
  var rate = options.rate || '30ps'

  var spike = builder.create('SpikeArrest')
  spike.att('async', aysnc)
  spike.att('continueOnError', continueOnError)
  spike.att('enabled', enabled)
  spike.att('name', name)

  spike.ele('DisplayName', {}, displayName)
  spike.ele('Properties', {})
  spike.ele('Identifier', {ref: identifierRef})
  spike.ele('MessageWeight', {ref: messageWeightRef})
  spike.ele('Rate', {}, rate)
  var xmlString = spike.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function spikeArrestGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.name = name
  if (options.timeUnit === 'minute') {
    templateOptions.rate = options.allow + 'pm'
  } else {
    templateOptions.rate = options.allow + 'ps'
  }
  return spikeArrestTemplate(templateOptions)
}
