var mkdirp = require('mkdirp');
var async = require('async');

module.exports = function generateSkeleton(apiProxy, options, cb) {
  var destination = options.destination || 'apiBundles';
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  var rootDirectory = destination + "/" + apiProxy + "/apiproxy";
  mkdirp.sync(rootDirectory);
  // Generate sub folders..
  var subFolders = ["proxies", "targets"];
  async.map(subFolders, function(item, callback) {
    callback(null, this.rootDirectory + "/" + item);
  }.bind({ rootDirectory: rootDirectory }), function(err, results) {
    // Create sub folders
    async.map(results, mkdirp,  function (err, results) {
      cb(null, results);
    });
  });
}
