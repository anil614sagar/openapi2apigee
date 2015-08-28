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
  { name: 'environment',  message: 'Environment?'  },
  { name: 'virtualhosts', message: 'Virtual Hosts?', default: 'default,secure' }
];

function deployApi(apiProxy, options, cb) {
  console.log("Initiating Apigee Deployment..");
  var destination = options.destination || path.join(__dirname, '../../../api_bundles');
  if(destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1);
  }
  inquirer.prompt( questions, function( answers ) {
    answers.directory = destination + "/" + apiProxy;
    answers.api = apiProxy;
    apigeetool.deployProxy(answers, function(err) {
      if (err) {
        return cb(err, {});
      }
      return cb(null, {});
    })
  });
}