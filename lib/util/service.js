exports.servicesToArray = function (api) {
  var services = []
  if (Array.isArray(api['x-a127-services'])) {
    services = api['x-a127-services']
  } else {
    if (api['x-a127-services']) {
      Object.keys(api['x-a127-services']).forEach(function (key) {
        var service = api['x-a127-services'][key]
        service['name'] = key
        services.push(service)
      })
    }
  }
  return services
}
