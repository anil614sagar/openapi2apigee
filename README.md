# swagger-apigee-node-utility
Swagger to Apigee API Proxy using Node.js Utility

# Installation

You can install `swagger2api` either through npm or by cloning and linking the code from GitHub.  This document covers the installation details for installing from npm.

## Installation from npm

The `swagger2api` module and its dependencies are designed for Node.js and is available through npm using the following command:

### From a Terminal Window:
```bash
$ sudo npm install -g swagger2api
```

# <a name="reference"></a>Command reference and examples

* [generateApi](#generateapi)

## <a name="generateapi"></a>generateApi

Generates Apigee API Bundles from Swagger files and help you deploy to Apigee Edge

#### Examples

```bash
$ swagger2api generateApi petStore -s http://petstore.swagger.io/v2/swagger.json -D -d /Users/Anil/Desktop/
```

#### Articles

<a href="https://community.apigee.com/articles/8796/swagger2api-a-nodejs-command-line-tool-to-generate.html">Getting Started with Swagger2API</a>

<a href="https://community.apigee.com/articles/9478/swagger2api-020-version-generating-apigee-policies.html">Swagger2API Apigee-127 Extensions support</a>

<a href="https://community.apigee.com/articles/9741/swagger2api-021-version-securing-apis-using-swagge.html"> Secure APIs using OAuth2.0 & Verify API Key Policies in Apigee using Swagger 2.0</a>

#### Docker Image

<a href="https://hub.docker.com/r/murf/apigee-swagger2api/">Docker Image</a> By Mikael Mellgren


