/*
 * grunt-git-deploy
 * https://github.com/iclanzan/grunt-git-deploy
 *
 * Copyright (c) 2013 Sorin Iclanzan
 * Licensed under the MIT license.
 */

'use strict';

var path = require("path");

module.exports = function(grunt) {
  var file = grunt.file;
  var spawn = grunt.util.spawn;

  grunt.registerMultiTask('git_deploy', 'Push files to a git remote.', function() {
    // Merge task options with these defaults.
    var options = this.options({
      message: 'autocommit',
      branch: 'gh-pages'
    });

    var pkg = grunt.file.readJSON('package.json');


    if (!options.url) {
      grunt.fail.warn('The URL to a remote git repository is required.');
      return false;
    }

    var src = this.filesSrc[0];
    var deployDir = 'tmp/' + pkg.name;

    if (!file.isDir(src)) {
      grunt.fail.warn('A source directory is needed.');
      return false;
    }

    function git(args) {
      return function(cb) {
        grunt.log.writeln('Running ' + args.join(' ').green + ' in ' + deployDir );
        spawn({
          cmd: 'git',
          args: args,
          opts: {cwd: deployDir}
        }, cb);
      };
    }

    function copyDirectory( src_dir, dest_dir ){

          return function(cb) {
              grunt.log.writeln('Copying ' + src_dir + ' to ' + dest_dir );
              //Ensure directory has trailingslash
              if ( src_dir.substr(-1) != '/' ) {
                  src_dir = src_dir + '/';
              }
              grunt.file.expand(  { 'expand': true, 'cwd' : src_dir }, '**/*' ).forEach( function( src ){

                  var dest;

                  if (process.platform === 'win32') {
                      dest = path.join( dest_dir, src).replace(/\\/g, '/');
                  } else {
                      dest = path.join( dest_dir, src);
                  }

                  if ( grunt.file.isDir( src_dir + src ) ) {
                      grunt.file.mkdir( dest);
                  } else {
                      grunt.file.copy( src_dir + src, dest );
                  }
              });

              cb();
          };
      }

    grunt.file.mkdir( deployDir );

    grunt.file.delete(path.join(src, '.git'));

    var done = this.async();

    grunt.util.async.series([
      git(['clone', options.url, '.' ]),
      git(['checkout', '-B', options.branch]),
      copyDirectory( src, deployDir ),
      git(['add', '--all']),
      git(['commit', '--message="' + options.message + '"']),
      git(['push', '--prune', '--force', '--quiet', options.url, options.branch])
    ], done);

  });
};

