var path = require('path')
var rimraf = require('rimraf')

console.log('Remove generated bundles...')
rimraf.sync(path.join(__dirname, '../../api_bundles'))
