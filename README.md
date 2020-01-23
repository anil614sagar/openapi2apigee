openapi-apigee-node-utility
===========================

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

`openapi2apigee` module converts a standard Open API spec (previously known as Swagger) into an Apigee API Proxy bundle and deploys into an Apigee Edge Organization.

### Now supports OAS v3 as well

# Pre-requisite 
- node.js

# Installation
You can install `openapi2apigee` either through `npm` or by cloning the code from this GitHub repo.  This README covers the installation steps with `npm`.

## Installation from npm
### From a Terminal Window:
```bash
$ npm install -g openapi2apigee
```

# <a name="reference"></a>Command reference and examples

* [generateApi](#generateapi)

## <a name="generateapi"></a>generateApi

Generates Apigee API Proxy bundle from OpenAPI specification file and deploys to Apigee Edge Organization.

#### Example

```bash
$ openapi2apigee generateApi petStore -s http://petstore.swagger.io/v2/swagger.json -D -d /Users/me/Desktop/
```

#### Articles

<a href="https://community.apigee.com/articles/8796/openapi2apigee-a-nodejs-command-line-tool-to-generate.html">Getting Started with OpenAPI</a>

<a href="https://community.apigee.com/articles/9478/openapi2apigee-020-version-generating-apigee-policies.html">openapi2apigee Apigee-127 Extensions support</a>

<a href="https://community.apigee.com/articles/9741/openapi2apigee-021-version-securing-apis-using-oas.html"> Secure APIs using OAuth 2.0 & Verify API Key Policies in Apigee using OpenAPI 2.0</a>


[npm-badge]: https://badge.fury.io/js/openapi2apigee.svg
[npm-url]: https://badge.fury.io/js/openapi2apigee
[travis-badge]: https://travis-ci.org/anil614sagar/openapi2apigee.svg?branch=master
[travis-url]: https://travis-ci.org/anil614sagar/openapi2apigee
