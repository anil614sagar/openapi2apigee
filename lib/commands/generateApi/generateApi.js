var parser = require('swagger-parser')
var generateSkeleton = require('./generateSkeleton.js')
var generateProxy = require('./generateProxy.js')
var generatePolicies = require('./generatePolicies.js')
var generateProxyEndPoint = require('./generateProxyEndPoint.js')
var generateTargetEndPoint = require('./generateTargetEndPoint.js')
var async = require('async')
var EasyZip = require('easy-zip').EasyZip
var path = require('path')

module.exports = {
  generateApi: generateApi
}

function generateApi (apiProxy, options, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var srcDirectory = destination + '/' + apiProxy + '/apiproxy/'
  var destDirectory = destination + '/' + apiProxy + '/apiproxy.zip'
  parser.parse(options.source, function (err, api, metadata) {
    if (!err) {
      console.log('Source specification is via: %s %s', (api.openapi ? 'OAS' : 'Swagger'), (api.openapi ? api.openapi : api.swagger))
      console.log('API name: %s, Version: %s', api.info.title, api.info.version)

      generateSkeleton(apiProxy, options, function (err, reply) {
        if (err) return cb(err)
        async.parallel([
          function (callback) {
            generateProxy(apiProxy, options, api, function (err, reply) {
              if (err) return callback(err)
              callback(null, 'genProxy')
            })
          },
          function (callback) {
            generateProxyEndPoint(apiProxy, options, api, function (err, reply) {
              if (err) return callback(err)
              callback(null, 'genProxyEndPoint')
            })
          },
          function (callback) {
            generateTargetEndPoint(apiProxy, options, api, function (err, reply) {
              if (err) return callback(err)
              callback(null, 'genTargetPoint')
            })
          },
          function (callback) {
            if (api['x-a127-services']) {
              generatePolicies(apiProxy, options, api, function (err, reply) {
                if (err) return callback(err)
                callback(null, 'a127policies')
              })
            } else {
              callback(null, 'a127policies')
            }
          }
        ],
          function (err, results) {
            if (err) return cb(err)
            var zip5 = new EasyZip()
            zip5.zipFolder(srcDirectory, function (err) {
              if (err) {
                return cb(err, {})
              }
              zip5.writeToFile(destDirectory, function (err) {
                if (err) {
                  return cb(err, {})
                }
                return cb(null, results)
              })
            })
          }
        )
      })
    } else {
      return cb(err, { error: 'openapi parsing failed..' })
    }
  })
}
