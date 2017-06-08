var path = require('path')
var childProcess = require('child_process')
var should = require('should')

describe('openapi2apigee', function () {
  it('without arguments should return correct exit code', function (done) {
    childProcess.exec([
      path.join(process.cwd(), 'bin/openapi2apigee')
    ].join(' '), function (err) {
      should.equal(err.code, 1)
      done()
    })
  })
  it('with wrong api file should return correct exit code', function (done) {
    childProcess.exec([
      path.join(process.cwd(), 'bin/openapi2apigee generateApi apiname -s wrong.json -d ./apigee')
    ].join(' '), function (err) {
      should.equal(err.code, 1)
      done()
    })
  })
})
