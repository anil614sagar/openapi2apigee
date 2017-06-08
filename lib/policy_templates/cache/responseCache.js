var builder = require('xmlbuilder')
var random = require('../../util/random.js')

module.exports = {
  responseCacheTemplate: responseCacheTemplate,
  responseCacheGenTemplate: responseCacheGenTemplate
}

function responseCacheTemplate (options) {
  var aysnc = options.async || 'false'
  var continueOnError = options.continueOnError || 'false'
  var enabled = options.enabled || 'true'
  var name = options.name || 'responseCache-' + random.randomText()
  var displayName = options.displayName || name

  var keyFragment = options.keyFragment || ''
  var keyFragmentRef = options.keyFragmentRef || 'request.uri'

  var scope = options.scope || 'Exclusive'

  var timeoutInSec = options.timeoutInSec || '300'

  var cache = builder.create('ResponseCache')
  cache.att('async', aysnc)
  cache.att('continueOnError', continueOnError)
  cache.att('enabled', enabled)
  cache.att('name', name)

  cache.ele('DisplayName', {}, displayName)
  cache.ele('Properties', {})

  var cacheKey = cache.ele('CacheKey', {})
  cacheKey.ele('Prefix', {})
  cacheKey.ele('KeyFragment', {ref: keyFragmentRef, type: 'string'}, keyFragment)

  cache.ele('Scope', {}, scope)
  var expirySettings = cache.ele('ExpirySettings', {})
  expirySettings.ele('ExpiryDate', {})
  expirySettings.ele('TimeOfDay', {})
  expirySettings.ele('TimeoutInSec', {}, timeoutInSec)

  cache.ele('SkipCacheLookup', {})
  cache.ele('SkipCachePopulation', {})
  var xmlString = cache.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

function responseCacheGenTemplate (options, name) {
  var templateOptions = options
  templateOptions.keyFragment = options.name
  templateOptions.name = name
  templateOptions.timeoutInSec = Math.round(options.ttl / 1000)
  return responseCacheTemplate(templateOptions)
}
