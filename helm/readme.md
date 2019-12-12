Using Openapi2Apigee Tool Within Kubernetes CI/CD Piplene
================

### Overview

[Helm](https://github.com/helm/helm) chart 
([Kubernetes](https://kubernetes.io/docs/concepts/overview/what-is-kubernetes/) 
Installer) example here combines two items that have different lifecycles:

* A [Secret](./openapi2apigee/templates/apigee-credentials-secret.yaml),
  which should be created once
* A [Job](./openapi2apigee/templates/apigee-proxy-gen-job.yaml) running
  the openapi2apigee tool as a Docker container. The job, which should be
  created (which means run) *every time* after an application meant to be
  accessible via Apigee is deployed using Helm.

Since this Helm chart conbines definitions of two K8s resources that
have different lifecycles, in real life one will need to split this
chart: OPs would create a Secret with Apigee username and password once,
and application's Helm chart would incorporate the Job template similar
to one presented here, and run it on every application deployment.

### How to Test-Run The Tool in Kubernetes

This part assumes you have `kubectl` and `helm` installed locally, and
that current Kubernentes context is configured to point at K8s Ckuster
with the Tiller installed. 

Please note that Chart's [values](./openapi2apigee/values.yaml) document
all required and optional parameters for this tool in the `apigee`
section. The example below shows how to provide required values when
running `helm install`, which in turn provides a blueprint for doing
the same when this Job template is used a part of the CI/CD pipeline.

* Do `cd helm`
* Then run actual comand that will create Secret and create & execute
  the job:
  ```bash
  helm install openapi2apigee \
    --set apigee.username=your@email.com \
    --set apigee.password=s0m3VeryStrongP@sswordd \
    --set apigee.organization=your-apigee-org-name \
    --set apigee.proxyName=httpbin-k8s-generated \
    --set apigee.openApiLocation=https://raw.githubusercontent.com/Azure/api-management-samples/master/apis/httpbin.swagger.json \
    --set apigee.proxyTargetEndpointUrl=https://httpbin.davecheney.com/
  ```
