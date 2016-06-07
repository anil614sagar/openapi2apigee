'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');
var generateSkeleton = require('../../lib/commands/generateApi/generateSkeleton.js')
var fs = require('fs');
var xml2js = require('xml2js');

describe('generateApi with CORS proxy', function() {
  var options = {
    source : path.join(__dirname, '/openapi_files/cors.yaml'),
    destination : path.join(__dirname, '../../api_bundles'),
    apiProxy :'petStoreCors'
  };

  describe('generate', function() {
    it('Correct openapi file should generate proxy', function(done) {
      var options = {
        source : path.join(__dirname, '/openapi_files/cors.yaml'),
        destination : path.join(__dirname, '../../api_bundles'),
        apiProxy :'petStoreCors'
      }
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

    describe('virtualhosts option', function(done) {
      it("missing -v flag should generate both default and secure", function(done) {
        options.apiProxy = 'petStoreVirtualBoth';
        generateApi.generateApi(options.apiProxy, options, function(err, reply) {
          should.equal(err, null);
          var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
          var proxiesFileData = fs.readFileSync(proxiesFilePath);
          var parser = new xml2js.Parser();
          parser.parseString(proxiesFileData, function (err, result) {
            result.should.have.property('ProxyEndpoint').property('HTTPProxyConnection');
            var vhost = result.ProxyEndpoint.HTTPProxyConnection[0].VirtualHost;
            vhost.should.eql(['default','secure'], 'secure virtual host found');
            done();
          });
        })
      });
      it("-v 'secure' should generate secure virtual host", function(done) {
        options.apiProxy = 'petStoreVirtualVirtual';
        options.virtualhosts = 'secure';
        generateApi.generateApi(options.apiProxy, options, function(err, reply) {
          should.equal(err, null);
          var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
          var proxiesFileData = fs.readFileSync(proxiesFilePath);
          var parser = new xml2js.Parser();
          parser.parseString(proxiesFileData, function (err, result) {
            result.should.have.property('ProxyEndpoint').property('HTTPProxyConnection');
            var vhost = result.ProxyEndpoint.HTTPProxyConnection[0].VirtualHost;
            vhost.should.eql(['secure'], 'secure virtual host found');
            done();
          });
        })
      });
      it("-v 'default' should generate default virtual host", function(done) {
        options.apiProxy = 'petStoreVirtualDefault';
        options.virtualhosts = 'default';
        generateApi.generateApi(options.apiProxy, options, function(err, reply) {
          should.equal(err, null);
          var proxiesFilePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml');
          var proxiesFileData = fs.readFileSync(proxiesFilePath);
          var parser = new xml2js.Parser();
          parser.parseString(proxiesFileData, function (err, result) {
            result.should.have.property('ProxyEndpoint').property('HTTPProxyConnection');
            var vhost = result.ProxyEndpoint.HTTPProxyConnection[0].VirtualHost;
            vhost.should.eql(['default'], 'secure virtual host found');
            done();
          });
        })
      });
    });

  });
});
