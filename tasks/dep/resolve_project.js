/* global phantom,document,Ext */

var system = require('system'),
page = require('webpage').create();

page.onError = function(msg, trace) {
  console.log('Error: ' + msg + " Trace: " + JSON.stringify(trace, undefined, 4));
  phantom.exit(-1);
};

if (system.args.length < 1) {
  console.log('Error: No URL specified !');
  phantom.exit(-1);
}

var url = system.args[1];

page.onConsoleMessage = function(msg) {
  // Uncomment this for debugging the target page.

  //console.log(msg);
};

page.onCallback = function(data) {
  // Note: this is a special way we allow the Ext page to tell Phantom
  // that it's ready and everything is loaded. We use phantom's
  // callback function, and add a call from within the target
  // page. This looks like:

  //  if (typeof window.callPhantom === 'function') {
  //    window.callPhantom({ loaded: true });
  //  }

  if (data && data.loaded === true) {
    // The target page is loaded, now add a short timeout and start
    // collecting the sources.
    setTimeout(function() {
      collectLoadedScripts();
      phantom.exit();
    },
    500);
  }
};

var collectScriptTags = function() {
  var scriptSources = page.evaluate(function() {
    var buffer = [];
    var scripts = document.getElementsByTagName('script');
    for (var idx in scripts) {
      if (scripts[idx].src) {
        buffer.push(scripts[idx].src);
      }
    }
    return buffer;
  });
  scriptSources.forEach(function(x) {
    console.log(x);
  });
};

var collectLoadedScripts = function() {
  var loaderSources = page.evaluate(function() {
    var buffer = [];
    for (var cls in Ext.Loader.history) {
      buffer.push(Ext.Loader.getPath(Ext.Loader.history[cls]));
    }
    return buffer;
  });
  loaderSources.forEach(function(x) {
    console.log(x);
  });
};

page.open(url, function(status) {
  if (status !== 'success') {
    console.log('FAIL to load the address');
    phantom.exit(-1);
  } else {
    collectScriptTags();
  }
});
