'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs');
var xml2js = require('xml2js');

describe('generateApi with schema validation', function() {
  var options = {
    source : path.join(__dirname, '/openapi_files/schema-validation.yaml'),
    destination : path.join(__dirname, '../../api_bundles'),
    apiProxy :'petStoreSchemaValidation'
  };

  describe('generate', function(done) {
    it('Correct swagger file should generate proxy', function(done) {
      generateApi.generateApi(options.apiProxy, options, function(err, reply) {
        should.equal(err, null);
        done();
      })
    });
  });

  describe('Add schema validation policy', function() {

    it('Output validation protection policy should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/output-validation.xml");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);

      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('Javascript');
        result.should.have.property('Javascript').property('ResourceURL');
        // Check Header name and value
        should.equal(result.Javascript.ResourceURL[0], 'jsc://schema-validation.js', 'schema validation script not found');
        should.equal(result.Javascript.IncludeURL[0], 'jsc://api.js', 'api.js script not found');
        // should.equal(result.Javascript.IncludeURL[1], 'jsc://regex-utils.js', 'regex-utils.js script not found');
        should.equal(result.Javascript.IncludeURL[1], 'jsc://bundle-policify.js', 'bundle-policify.js script not found');
        done();
      });
    });

    it('Input validation protection policy should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/input-validation.xml");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);

      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('Javascript');
        result.should.have.property('Javascript').property('ResourceURL');
        // Check Header name and value
        should.equal(result.Javascript.ResourceURL[0], 'jsc://input-validation.js', 'input validation script not found');
        should.equal(result.Javascript.IncludeURL[0], 'jsc://api.js', 'api.js script not found');
        done();
      });
    });

    it('Js files should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/schema-validation.js");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);
      filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/input-validation.js");
      file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);
      filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/api.js");
      file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);
      // filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/regex-utils.js");
      // file = fs.lstatSync(filePath);
      // should.equal(file.isFile(), true);
      done();
    });

    it('Raise fault policy should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/raiseOutputValidationFault.xml");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);

      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('RaiseFault');
        result.should.have.property('RaiseFault').property('FaultResponse');
        // Check Header name and value
        console.log('RaiseFault.FaultResponse[0]', result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0]);
        should.equal(result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0], 'Server Error', 'ReasonPhrase not found');
        should.equal(result.RaiseFault.FaultResponse[0].Set[0].StatusCode[0], '500', '500 not found');
        done();
      });
    });

    it('Proxy should contain Add Validation step in PostFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PostFlow');
        should.equal(result.ProxyEndpoint.PostFlow[0].Response[0].Step[0].Name[0], 'Add Output Validation', 'Output Validation step in found in PostFlow');
        done();
      });
    });

    it('Proxy should contain Raise Validation Error step in PostFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PostFlow');
        should.equal(result.ProxyEndpoint.PostFlow[0].Response[0].Step[1].Name[0], 'Raise Output Validation Error', 'Raise Validation Error step in found in PostFlow');
        done();
      });
    });


    it('Proxy should contain Extract Path Parameters step in PreFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[0].Name[0], 'Extract Path Parameters', 'Extract Path Parameters step in found in PostFlow');
        done();
      });
    });

    it('Proxy should contain Add Validation step in PreFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[1].Name[0], 'Add Input Validation', 'Input Validation step in found in PostFlow');
        done();
      });
    });

    it('Proxy should contain Raise Input Validation Error step in PreFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[2].Name[0], 'Raise Input Validation Error', 'Raise Input Validation Error step in found in PreFlow');
        done();
      });
    });


  });
});
