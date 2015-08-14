# swagger-apigee-node-utility
Swagger to Apigee API Proxy using Node.js Utility

# Installation

You can install `swagger2api` either through npm or by cloning and linking the code from GitHub.  This document covers the installation details for installing from npm.

## Installation from npm

The `swagger2api` module and its dependencies are designed for Node.js and is available through npm using the following command:

### From a Terminal Window:
```bash
$ sudo npm install -g swagger2api

# <a name="reference"></a>Command reference and examples

* [generateApi](#generateapi)

## <a name="generateapi"></a>generateApi

Generates Apigee API Bundles from Swagger files and help you deploy to Apigee Edge

#### Examples

```bash
$ swagger2api generateApi petStore -l http://petstore.swagger.io/v2/swagger.json -D -d /Users/Anil/Desktop/
