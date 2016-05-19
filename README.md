# openapi-apigee-node-utility
OpenAPI (formerly known as Swagger) to Apigee API Proxy Bundle using Node.js Utility

# Installation

You can install `openapi2apigee` either through npm or by cloning and linking the code from GitHub.  This document covers the installation details for installing from npm.

## Installation from npm

The `openapi2apigee` module (and its dependencies) is designed for Node.js and is available through npm using the following command:

### From a Terminal Window:
```bash
$ sudo npm install -g openapi2apigee
```

# <a name="reference"></a>Command reference and examples

* [generateApi](#generateapi)

## <a name="generateapi"></a>generateApi

Generates Apigee API Bundles from OpenAPI files and help you deploy to Apigee Edge

#### Examples

```bash
$ openapi2apigee generateApi petStore -s http://petstore.openapi.io/v2/openapi.json -D -d /Users/Anil/Desktop/
```

#### Articles

<a href="https://community.apigee.com/articles/8796/openapi2apigee-a-nodejs-command-line-tool-to-generate.html">Getting Started with OpenAPI</a>

<a href="https://community.apigee.com/articles/9478/openapi2apigee-020-version-generating-apigee-policies.html">openapi2apigee Apigee-127 Extensions support</a>

<a href="https://community.apigee.com/articles/9741/openapi2apigee-021-version-securing-apis-using-oas.html"> Secure APIs using OAuth 2.0 & Verify API Key Policies in Apigee using OpenAPI 2.0</a>

#### Docker Image

<a href="https://hub.docker.com/r/murf/apigee-swagger2api/">Docker Image</a> By Mikael Mellgren
