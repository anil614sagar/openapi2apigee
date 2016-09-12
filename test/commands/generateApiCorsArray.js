'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs');
var xml2js = require('xml2js');

describe('generateApi with CORS proxy (array)', function() {
  var options = {
    source : path.join(__dirname, '/openapi_files/cors-array.yaml'),
    destination : path.join(__dirname, '../../api_bundles'),
    apiProxy :'petStoreCorsArray'
  };

  describe('generate', function() {
    it('Correct openapi file should generate proxy', function(done) {
      generateApi.generateApi(options.apiProxy, options, function(err, reply) {
        should.equal(err, null);
        done();
      })
    });
  });

  describe('Add cors policy', function() {
    it('Cors policy should be generated', function(done) {
      var corsFilePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/add-cors.xml");
      var corsFile = fs.lstatSync(corsFilePath);
      should.equal(corsFile.isFile(), true);

      var corsFileData = fs.readFileSync(corsFilePath);
      var parser = new xml2js.Parser();
      parser.parseString(corsFileData, function (err, result) {
        result.should.have.property('AssignMessage');
        result.should.have.property('AssignMessage').property('Add');
        var headers = result.AssignMessage.Add[0].Headers[0];
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'Access-Control-Allow-Origin', 'Access-Control-Allow-Origin not found: ');
        should.equal(headers.Header[0]._, '*', 'Access-Control-Allow-Origin not correct');
        done();
      });
    });

    it('Proxies should contain add-cors step in PreFlow', function(done) {
      var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var proxiesFileData = fs.readFileSync(proxiesFilePath);
      var parser = new xml2js.Parser();
      parser.parseString(proxiesFileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Response[0].Step[0].Name[0], 'add-cors', 'add-cors step in found in PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Response[0].Step[0].Condition[0], 'request.verb != "OPTIONS"', 'add-cors condition in found in PreFlow');
        done();
      });
    });

    it('Proxies should contain noRoute for options request', function(done) {
      var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var proxiesFileData = fs.readFileSync(proxiesFilePath);
      var parser = new xml2js.Parser();
      parser.parseString(proxiesFileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('RouteRule');
        should.equal(result.ProxyEndpoint.RouteRule[0].$.name, 'noRoute', 'noRoute found');
        should.equal(result.ProxyEndpoint.RouteRule[0].Condition[0], 'request.verb == "OPTIONS"', 'condition is not correct');
        done();
      });
    });

    it('Proxies should contain OptionsPreFlight step in Flow', function(done) {
      var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var proxiesFileData = fs.readFileSync(proxiesFilePath);
      var parser = new xml2js.Parser();
      parser.parseString(proxiesFileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('Flows');
        should.equal(result.ProxyEndpoint.Flows[0].Flow[0].$.name, 'OptionsPreFlight', 'OptionsPreFlight step in found in Flows');
        should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Response[0].Step[0].Name[0], 'add-cors', 'Response step found');
        done();
      });
    });

    it('Target should not contain header step in PreFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/targets/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('TargetEndpoint');
        result.should.have.property('TargetEndpoint').property('PreFlow');
        should.exist(result.TargetEndpoint.PreFlow[0].Request[0], 'Request found in PreFlow');
        should.equal(result.TargetEndpoint.PreFlow[0].Request[0].length, 0, 'Request step not found in PreFlow');
        done();
      });
    });

  });
});
