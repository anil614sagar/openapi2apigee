'use strict'

var should = require('should')
var path = require('path')
var generateApi = require('../../lib/commands/generateApi/generateApi')
var fs = require('fs')
var xml2js = require('xml2js')

describe('generateApi with headers', function () {
  var options = {
    source: path.join(__dirname, '/openapi_files/headers.yaml'),
    destination: path.join(__dirname, '../../api_bundles'),
    apiProxy: 'petStoreHeaders'
  }

  describe('generate', function (done) {
    it('Correct OpenApi file should generate proxy', function (done) {
      generateApi.generateApi(options.apiProxy, options, function (err, reply) {
        should.equal(err, null)
        done()
      })
    })
  })

  describe('Add header policy', function () {
    it('Headers token policy should be generated', function (done) {
      var filePath = path.join(options.destination, options.apiProxy + '/apiproxy/policies/add-headers-token.xml')
      var file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      var fileData = fs.readFileSync(filePath)
      var parser = new xml2js.Parser()
      parser.parseString(fileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Set')
        var headers = result.AssignMessage.Set[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'x-token', 'x-token not found: ')
        should.equal(headers.Header[0]._, 'random_token', 'x-token value not correct')
        done()
      })
    })

    it('Headers x-api-key policy should be generated', function (done) {
      var filePath = path.join(options.destination, options.apiProxy + '/apiproxy/policies/add-headers-x-api-key.xml')
      var file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      var fileData = fs.readFileSync(filePath)
      var parser = new xml2js.Parser()
      parser.parseString(fileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Set')
        var headers = result.AssignMessage.Set[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'x-api-key', 'x-api-key not found: ')
        should.equal(headers.Header[0]._, 'random_api_key', 'x-api-key value not correct')
        done()
      })
    })

    it('Headers securit headers policy should be generated', function (done) {
      var filePath = path.join(options.destination, options.apiProxy + '/apiproxy/policies/add-headers-security.xml')
      var file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      var fileData = fs.readFileSync(filePath)
      var parser = new xml2js.Parser()
      parser.parseString(fileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Set')
        var headers = result.AssignMessage.Set[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'Strict-Transport-Security', 'Strict-Transport-Security not found: ')
        should.equal(headers.Header[0]._, 'max-age=31536000; includeSubDomains; preload', 'value not correct')
        should.equal(headers.Header[1].$.name, 'X-XSS-Protection', 'X-XSS-Protection header not found: ')
        should.equal(headers.Header[1]._, '1; mode=block', 'value not correct')
        should.equal(headers.Header[2].$.name, 'X-Content-Type-Options', 'X-Content-Type-Options header not found: ')
        should.equal(headers.Header[2]._, 'nosniff', 'value not correct')
        should.equal(headers.Header[3].$.name, 'X-Frame-Options', 'X-Frame-Options header not found: ')
        should.equal(headers.Header[3]._, 'deny', 'value not correct')
        done()
      })
    })

    it('Target should contain header step in PreFlow', function (done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/targets/default.xml')
      var fileData = fs.readFileSync(filePath)
      var parser = new xml2js.Parser()
      parser.parseString(fileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('TargetEndpoint')
        result.should.have.property('TargetEndpoint').property('PreFlow')
        should.equal(result.TargetEndpoint.PreFlow[0].Request[0].Step[0].Name[0], 'Add AWS api key header', 'Add AWS api key header step in found in PreFlow')
        should.equal(result.TargetEndpoint.PreFlow[0].Request[0].Step[1].Name[0], 'Add token header', 'Add token header step in found in PreFlow')
        done()
      })
    })

    it('Proxy should contain header step in PostFlow', function (done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      var fileData = fs.readFileSync(filePath)
      var parser = new xml2js.Parser()
      parser.parseString(fileData, function (err, result) {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('PostFlow')
        should.equal(result.ProxyEndpoint.PostFlow[0].Response[0].Step[0].Name[0], 'Add security headers', 'Add security headers step in found in PostFlow')
        done()
      })
    })
  })
})
