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
      tag: false,
      tagMessage: 'autocommit',
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

    function copyIntoRepo( srcDir, destDir ){

          return function(cb) {
              grunt.log.writeln('Copying ' + srcDir + ' to ' + destDir );
              //Ensure directory has trailingslash
              if ( srcDir.substr(-1) != '/' ) {
                  srcDir = srcDir + '/';
              }

              grunt.file.expand(  { 'expand': true, 'cwd' : destDir, dot: true }, ['**/*', '!.git/**'] ).forEach( function( dest ){

                if (process.platform === 'win32') {
                  dest = path.join(destDir, dest).replace(/\\/g, '/');
                } else {
                  dest = path.join(destDir, dest);
                }

                grunt.file.delete(dest);
              });

              grunt.file.expand(  { 'expand': true, 'cwd' : srcDir, dot: true }, ['**/*', '!.git/**'] ).forEach( function( src ){

                  var dest;

                  if (process.platform === 'win32') {
                      dest = path.join(destDir, src).replace(/\\/g, '/');
                  } else {
                      dest = path.join(destDir, src);
                  }

                  if ( grunt.file.isDir(srcDir + src) ) {
                      grunt.file.mkdir(dest);
                  } else {
                      grunt.file.copy(srcDir + src, dest);
                  }
              });

              cb();
          };
      }

    grunt.file.mkdir( deployDir );

    grunt.file.delete(path.join(src, '.git'));

    var done = this.async();

    var commands = [
      git(['clone', '-b', options.branch, options.url, '.' ]),
      git(['checkout', '-B', options.branch]),
      copyIntoRepo( src, deployDir ),
      git(['add', '--all']),
      git(['commit', '--message=' + options.message ])
    ];

    if ( options.tag ) {
      commands.push( git(['tag', '-a', options.tag, '-m', options.tagMessage]) );
    }

    commands.push( git(['push', '--prune', '--force', '--quiet', '--follow-tags', options.url, options.branch]) );

    grunt.util.async.series(commands, done);

  });
};

