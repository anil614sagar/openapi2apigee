'use strict'

describe('cli', function () {
  var cli = require('../../lib/util/cli')

  describe('version', function () {
    it('should return the version', function () {
      var version = require('../../package.json').version
      cli.version().should.eql(version)
    })
  })
})
