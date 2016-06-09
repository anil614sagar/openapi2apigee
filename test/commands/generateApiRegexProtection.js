'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs');
var xml2js = require('xml2js');

describe('generateApi with regex-protection', function() {
  var options = {
    source : path.join(__dirname, '/openapi_files/regex-protection.yaml'),
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

    it('Regexp protection policy should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/regex-protection.xml");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);

      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('Javascript');
        result.should.have.property('Javascript').property('ResourceURL');
        // Check Header name and value
        should.equal(result.Javascript.ResourceURL[0], 'jsc://regex-protection.js', 'regex protection script not found');
        should.equal(result.Javascript.IncludeURL[0], 'jsc://regex.js', 'regex js script not found');
        done();
      });
    });

    it('Js files should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/regex-protection.js");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/regex.js");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);
      done();
    });

    it('Raise fault policy should be generated', function(done) {
      var filePath = path.join(options.destination, options.apiProxy + "/apiproxy/policies/raiseFault.xml");
      var file = fs.lstatSync(filePath);
      should.equal(file.isFile(), true);

      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('RaiseFault');
        result.should.have.property('RaiseFault').property('FaultResponse');
        // Check Header name and value
        console.log('RaiseFault.FaultResponse[0]', result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0]);
        should.equal(result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0], 'Bad Request', 'ReasonPhrase not found');
        should.equal(result.RaiseFault.FaultResponse[0].Set[0].StatusCode[0], '400', '400 not found');
        done();
      });
    });

    it('Proxy should contain Add Regex Protection step in PreFlow', function(done) {
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

    it('Proxy should contain Raise Regex Error step in PreFlow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        result.should.have.property('ProxyEndpoint');
        result.should.have.property('ProxyEndpoint').property('PreFlow');
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[1].Name[0], 'Raise Regex Error', 'Raise Regex Error step in found in PreFlow');
        done();
      });
    });

    it('Proxy should contain parameter check in listPets flow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        if (result.ProxyEndpoint.Flows[0].Flow[0].$.name === 'listPets') {
          should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Request[0].Step[0].Condition[0], '(request.queryparam.param1 Equals null) or (request.queryparam.param2 Equals null)', 'Param check found in listPets flow');
          should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Request[0].Step[0].Name[0], 'Raise Regex Error', 'Param check raise found in listPets flow');
        }
        done();
      });
    });

    it('Proxy should contain quotaAnil in listPets flow', function(done) {
      var filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
      var fileData = fs.readFileSync(filePath);
      var parser = new xml2js.Parser();
      parser.parseString(fileData, function (err, result) {
        if (result.ProxyEndpoint.Flows[0].Flow[0].$.name === 'listPets') {
          should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Request[0].Step[1].Name[0], 'quotaAnil', 'quotaAnil found in listPets flow');
        }
        done();
      });
    });


  });
});
