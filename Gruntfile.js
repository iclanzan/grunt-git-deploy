/*
 * grunt-git-deploy
 * https://github.com/iclanzan/grunt-git-deploy
 *
 * Copyright (c) 2013 Sorin Iclanzan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('init_repo', 'Initialize a git repository in a directory.', function() {
    var dest = this.files[0].dest;

    if (!grunt.file.exists(dest)) {
      grunt.file.mkdir(dest);
    }

    else if (!grunt.file.isDir(dest)) {
      grunt.fail.warn('A source directory is needed.');
      return false;
    }

    function git(args) {
      return function(cb) {
        grunt.log.writeln('Running ' + args.join(' ').green + ' in ' + dest );
        grunt.util.spawn({
          cmd: 'git',
          args: args,
          opts: {cwd: dest}
        }, cb);
      };
    }

    function touch(args) {
      return function(cb) {
        grunt.util.spawn({
          cmd: 'touch',
          args: args,
          opts: {cwd: dest}
        }, cb);
      };
    }
    var done = this.async();

    grunt.util.async.series([
      git(['init']),
      git(['checkout', '-b', 'gh-pages']),
      touch(['readme.md']),
      git(['add', '--all']),
      git(['commit', '--message=Initial commit']),
      git(['checkout', '-b', 'master'])
    ], done);

  });

  // Project configuration.
  grunt.initConfig({

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
      test_build: ['tmp/src'],
      deploy: ['tmp/grunt-git-deploy']
    },

    init_repo: {
      main: {
        dest: 'tmp/repo'
      }
    },

    copy: {
      first: {
        expand: true,
        cwd: 'test/fixtures/first',
        src: '**/**',
        dest: 'tmp/src/',
        dot: true
      },
      second: {
        expand: true,
        cwd: 'test/fixtures/second',
        src: '**/**',
        dest: 'tmp/src/',
        dot: true
      }
    },

    // Configuration to be run (and then tested).
    git_deploy: {
      first: {
        options: {
          url: '../repo',
          tag: 'v1',
          message: 'first deploy'
        },
        src: 'tmp/src'
      },
      second: {
        options: {
          url: '../repo',
          tag: 'v2',
          message: 'second deploy'
        },
        src: 'tmp/src'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'init_repo', 'copy:first', 'git_deploy:first', 'clean:deploy', 'clean:test_build', 'copy:second', 'git_deploy:second', 'nodeunit']);

  // By default, run all tests.
  grunt.registerTask('default', ['test']);

};
