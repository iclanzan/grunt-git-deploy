# grunt-git-deploy

> Deploy files to any branch of any remote git repository.

## Getting Started
This plugin requires Grunt `~0.4.1` and must be used with Git `1.8.3` or better (see [Git changelog](https://github.com/git/git/blob/master/Documentation/RelNotes/1.8.3.txt#L155-L156)).

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-git-deploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-git-deploy');
```

## The "git_deploy" task

### Overview
The way this task works is it creates an empty git repository in the `src` directory you specify, creates an orphan branch and commits all files from that directory to it. Then it pushes the branch to the configured remote repository. **Be careful as this destroys the history of the remote branch.**

In your project's Gruntfile, add a section named `git_deploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  git_deploy: {
    your_target: {
      options: {
        url: 'git@github.com:example/repo.git'
      },
      src: 'directory/to/deploy'
    },
  },
})
```

### Options

#### options.url
Type: `String`

The URL to a remote git repository. This option is required.

#### options.branch
Type: `String`
Default value: `'gh-pages'`

The branch to push to.

#### options.message
Type: `String`
Default value: `'autocommit'`

Commit message.

#### options.tag
Type: `Boolean`/`String`
Default value: `false`

Whether to tag the release. Provide a tag name (string) to tag the release commit. To use the package version, first 
read the package.json 

    grunt.initConfig({
      pkg: grunt.file.readJSON("package.json")
      ...
    })
    
and then pass the value `'<%= pkg.version %>'`

#### options.tagMessage
Type: `String`
Default value: `'autocommit'`

The message for the tag referenced above. This option is ignored if `options.tag` is `false`.

## Contributing
If you can think of a way to unit test this plugin please take a shot at it.
