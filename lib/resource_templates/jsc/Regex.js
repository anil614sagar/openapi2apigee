var checkRegex = function (value, pattern) {
  var result = true;
  // print('Original pattern: ' + pattern);

  // strip off any modifiers at the end of the regex, as JS doesn't understand those
  // we assume all strings are lowercase in the testing
  var flags = 'i';
  if(pattern[0] == '/') {
    // if the pattern doesn't end with /, we have flags
    if(pattern[pattern.length - 1] != '/') {
      flags = pattern.substring(pattern.lastIndexOf('/') + 1, pattern.length);
    }
    // strip the slashes of the regexp string
    pattern = pattern.substring(1, pattern.lastIndexOf('/'));
  }
  // print('Parsed pattern: ' + pattern);
  // print('Parsed flags: ' + flags);


  // try to parse
  try {
    pattern = new RegExp(pattern, flags);
    result = pattern.test(value);
    // print('Regexp test result: ' + result);
  } catch(e) {
    result = false;
  }
  return result;
};
