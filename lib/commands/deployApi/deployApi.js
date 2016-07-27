var inquirer = require('inquirer');
var apigeetool = require('apigeetool');
var path = require('path');

module.exports = {
  deployApi: deployApi
};

var questions = [
  { name: 'baseuri',      message: 'Base URI?', default: 'https://api.enterprise.apigee.com' },
  { name: 'organization', message: 'Organization?' },
  { name: 'username',     message: 'User Id?'  },
  { name: 'password',     message: 'Password?', type: 'password' },
  { name: 'environments',  message: 'Environments?'  },
  { name: 'virtualhosts', message: 'Virtual Hosts?', default: 'default,secure' }
];

function deployApi(apiProxy, options, cb) {
  console.log("Initiating Apigee Deployment..");
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  // check for options vs prompt , don't ask questions if options are supplied..
  if (options.baseuri && options.organization && options.username && options.password
      && options.environments && options.virtualhosts) {
    var deploymentOptions = {};
    deploymentOptions.directory = destination + "/" + apiProxy;
    deploymentOptions.api = apiProxy;
    deploymentOptions.baseuri = options.baseuri;
    deploymentOptions.organization = options.organization;
    deploymentOptions.username = options.username;
    deploymentOptions.password = options.password;
    deploymentOptions.environments = options.environments;
    deploymentOptions.virtualhosts = options.virtualhosts;
    // deploymentOptions.verbose = true;
    // deploymentOptions.debug = true;
    // deploymentOptions['import-only'] = true;
    apigeetool.deployProxy(deploymentOptions, function(err) {
      if (err) {
        return cb(err, {});
      }
      return cb(null, {});
    });
  }
  else {
    inquirer.prompt(questions).then(function (answers) {
      answers.directory = destination + "/" + apiProxy;
      answers.api = apiProxy;
      apigeetool.deployProxy(answers, function (err) {
        if (err) {
          return cb(err, {});
        }
        return cb(null, {});
      })
    });
  }
}
