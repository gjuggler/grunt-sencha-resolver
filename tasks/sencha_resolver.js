/*
 * grunt-sencha-resolver
 * https://github.com/revolunet/grunt-sencha-resolver
 *
 * Copyright (c) 2013 LaurentMox
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.registerMultiTask('sencha_resolver', 'Resolve JS dependencies of a ExtJS project.', function() {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      // URL to load
      url: 'http://127.0.0.1',
      configProperty: 'sencha_files'
    });

    // Determine which executable to run.
    var phantomPath;
    if (process.platform === 'linux') {
      phantomPath = __dirname+'/../phantomjs_linux64';
    } else if (process.platform === 'darwin') {
      phantomPath = __dirname+'/../phantomjs_osx';
    }

    var spawn_options = {
      cmd: phantomPath,
      grunt: false,
      args: [__dirname+'/dep/resolve_project.js', options.url]
    };

    function doneFunction(error, result, code) {
      if (!error && !code) {
        // Take the console-logged URLs and process them (if the
        // Gruntfile config has a processFn config param)
        var urls = String(result.stdout).split('\n');        
        var processedUrls = [];
        var tmpUrl;
        for (var i=0; i < urls.length; i++) { 
          if (options.processFn) {
            tmpUrl = options.processFn.apply(null, [urls[i], grunt]);
            if (tmpUrl !== null && tmpUrl !== undefined) {
              processedUrls.push(tmpUrl);
            }
          }
        }

        if (options.postProcessFn) {
          processedUrls = options.postProcessFn.apply(null, [processedUrls, grunt]);
        }

        // Set this list of URLs to the user-specified grunt config
        // property.
        grunt.config.set(options.configProperty, processedUrls);
        grunt.log.ok('Put '+processedUrls.length+' files into config "'+options.configProperty+'"');
      } else {
        grunt.log.errorlns("Code: " + code + " An error appened when calling phantomjs.");
      }
      done();
    }

    grunt.log.write("Spawning PhantomJS and capturing Ext.Loader info...\n");
    var t = grunt.util.spawn(spawn_options, doneFunction);
  });

};
