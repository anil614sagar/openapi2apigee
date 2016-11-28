var mkdirp = require('mkdirp')
var async = require('async')
var path = require('path')

module.exports = function generateSkeleton (apiProxy, options, cb) {
  var destination = options.destination || path.join(__dirname, '../../../api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  mkdirp.sync(rootDirectory)
  // Generate sub folders..
  var subFolders = ['proxies', 'targets', 'policies']

  async.map(subFolders, function (item, callback) {
    callback(null, this.rootDirectory + '/' + item)
  }.bind({ rootDirectory: rootDirectory }), function (err, results) {
    if (err) return cb(err)
    // Create sub folders
    async.map(results, mkdirp, function (err, results) {
      if (err) {
        cb(err, results)
      }
      cb(null, results)
    })
  })
}
