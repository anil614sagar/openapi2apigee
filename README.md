openapi-apigee-node-utility
===========================

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

`openapi2apigee` module converts a standard Open API spec 2.0 (previously known as Swagger) into an Apigee API Proxy bundle and deploys into an Apigee Edge Organization.

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


# Running in a Docker Container to Generate & Deploy a Proxy

### Overview

Project's Dockerfile enables running `openapi2apigee` as a Docker
container, eliminating the need to have Node.js installed on the system
where it runs. Having Docker installed is required instead.

Please note thta since Docker images are immutable, generating Proxy
Bundle and storing it within the Contaienr for later use makes no sense.
Therefore, `openapi2apigee` Docker container always runs the tool

### Building the Image

To build the image, run
```bash
docker build --rm -t openapi2apigee .
```

### Preparing to Run

Following Environment variable could be set to pass command line arguments
to the container, when container is run:
* **APIGEE_ORG** (required): Apigee organization name
* **APIGEE_USER_ID** (required): Apigee user, typically your email address
* **APIGEE_USER_PASSWORD** (required): Apigee user password
* **APIGEE_PROXY_NAME** (required): The name of the Apigee proxy to be
  created
* **OPEN_API** (required): URL or content of the OpenAPI/Swagger
  spec used to generate Apigee Proxy from.
* **SERVICE_ENDPOINT_URL** (optional): Service URL. If not provided, the
  one specified in the OpenAPI spec will be used.
* **APIGEE_ENVIRONMENTS** (optional): Default is 'test'. Apigee environment(s) to which Proxy will be deployed. Multiple environments
could be specified by comma, like `test,prod`.
* **APIGEE_VIRTUAL_HOSTS** (optional): Defauls it 'default,secure'. Allows
  specifying Apigee virtual hosts for the target endpoint.
* **APIGEE_BASE_URL** (optional): Default is 'https://api.enterprise.apigee.com'. Apigee Edge API base URL.

### Running the Container

An example of how to run `openapi2apigee` as a Docker container:
```bash
docker run \
    -e APIGEE_ORG=you-org-name \
    -e APIGEE_USER_ID=user@domain.com \
    -e APIGEE_USER_PASSWORD=verySecureP@ssw0rd \
    -e APIGEE_PROXY_NAME=my-super-proxy \
    -e OPEN_API=https://raw.githubusercontent.com/Azure/api-management-samples/master/apis/httpbin.swagger.json \
    openapi2apigee
```
