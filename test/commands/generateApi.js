'use strict';

var should = require('should');
var path = require('path');
var generateApi = require('../../lib/commands/generateApi/generateApi');


describe('generateApi', function() {
  describe('generate', function() {
    it('Incorrect swagger file should generate error..', function(done) {
      var options = {
        source : path.join(__dirname, '/swagger_files/badswagger.yaml'),
        destination : path.join(__dirname, '../../api_bundles'),
      }
      generateApi.generateApi('petStore', options, function(err, reply) {
        should.notEqual(err, null);
        reply.error.should.eql('Swagger parsing failed..');
        done();
      })
    });
    it('Correct swagger file should not generate error..', function(done) {
      var options = {
        source : path.join(__dirname, '/swagger_files/goodswagger.yaml'),
        destination : path.join(__dirname, '../../api_bundles'),
      }
      generateApi.generateApi('petStore', options, function(err, reply) {
        should.equal(err, null);
        done();
      })
    });
  });

  describe('generateProxy', function() {
    it('....', function() {

    });
  });

  describe('generateProxyEndPoint', function() {
    it('....', function() {

    });
  });

  describe('generateSkeleton', function() {
    it('....', function() {

    });
  });

  describe('generateTargetEndPoint', function() {
    it('....', function() {

    });
  });

});