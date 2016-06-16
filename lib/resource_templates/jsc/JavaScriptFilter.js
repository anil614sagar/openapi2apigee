// Template: JavaScriptFilter.js
var block = function (haystack, filters) {
  filters.some(function (jsonRegex) {
    // Create a regex from the json string.
    var f = new RegExp(jsonRegex.rule, jsonRegex.flags);
    print('regex',f);
    var hit = f.exec(haystack);
    if (hit) {
      print('found', hit[0]);
      context.setVariable('FILTER.block', true);
      return true;
    }
  });
};

elements.forEach(function (element) {
  var filters = element.filters;
  if (element.element === 'QueryParam') {
    if (block(decodeURIComponent(context.proxyRequest.url), filters)) {
      return;
    }
  }
});


// print('context.proxyRequest.headers', context.proxyRequest.headers);
// print('context.proxyRequest.query', context.proxyRequest.query);
// print('context.proxyRequest.parameters', context.proxyRequest.parameters);
// print('context.proxyRequest.method', context.proxyRequest.method);
// print('context.proxyRequest.body', context.proxyRequest.body);
// print('context.proxyRequest.url', context.proxyRequest.url);
