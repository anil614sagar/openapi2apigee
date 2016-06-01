'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs');
var xml2js = require('xml2js');

describe('generateApi with regex-protection', function() {
  var options = {
    source : path.join(__dirname, '/swagger_files/regex-protection.yaml'),
    destination : path.join(__dirname, '../../api_bundles'),
    apiProxy :'petStoreRegexProtection'
  };

  describe('generate', function(done) {
    it('Correct swagger file should generate proxy', function(done) {
      generateApi.generateApi(options.apiProxy, options, function(err, reply) {
        should.equal(err, null);
        done();
      })
    });
  });

  describe('Add regex-protection policy', function() {
    // it('Headers token policy should be generated', function(done) {
    //   var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/add-headers-token.xml");
    //   var file = fs.lstatSync(filePath);
    //   should.equal(file.isFile(), true);
    //
    //   var fileData = fs.readFileSync(filePath);
    //   var parser = new xml2js.Parser();
    //   parser.parseString(fileData, function (err, result) {
    //     result.should.have.property('AssignMessage');
    //     result.should.have.property('AssignMessage').property('Set');
    //     var headers = result.AssignMessage.Set[0].Headers[0];
    //     // Check Header name and value
    //     should.equal(headers.Header[0].$.name, 'x-token', 'x-token not found: ');
    //     should.equal(headers.Header[0]._, 'random_token', 'x-token value not correct');
    //     done();
    //   });
    // });

    // it('Headers x-api-key policy should be generated', function(done) {
    //   var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/add-headers-x-api-key.xml");
    //   var file = fs.lstatSync(filePath);
    //   should.equal(file.isFile(), true);
    //
    //   var fileData = fs.readFileSync(filePath);
    //   var parser = new xml2js.Parser();
    //   parser.parseString(fileData, function (err, result) {
    //     result.should.have.property('AssignMessage');
    //     result.should.have.property('AssignMessage').property('Set');
    //     var headers = result.AssignMessage.Set[0].Headers[0];
    //     // Check Header name and value
    //     should.equal(headers.Header[0].$.name, 'x-api-key', 'x-api-key not found: ');
    //     should.equal(headers.Header[0]._, 'random_api_key', 'x-api-key value not correct');
    //     done();
    //   });
    // });

    it('Proxy should contain header step in PreFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[0].Name[0], 'Add Regex Protection', 'Add Reqex Protection step in found in PreFlow');
        done();
      });
    });


  });
});
