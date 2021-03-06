'use strict';

var generators = require('yeoman-generator');
var _ = require('lodash');
var extend = _.merge;

module.exports = generators.Base.extend({
  initializing: function() {
    var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    this.props = {
      hostname: pkg.name
    };
  },

  prompting: function() {
    return this.prompt([{
      type: 'checkbox',
      name: 'modules',
      message: 'Choose modules',
      choices: ['router', 'redux', 'radium', {name: 'default component', checked: true}]
    }, {
      name: 'name',
      message: 'Main component name',
      default: 'index'
    }]).then(function(props) {
      this.props = extend(this.props, props);
    }.bind(this));
  },

  writing: function() {
    // write package.json
    var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    var pkg = extend({
      scripts: {
        static: 'node bin/static.js',
        build: 'npm run babel && npm run static',
        'build:production': 'npm run babel && NODE_ENV=1 npm run static',
        watch: 'concurrently -c green "npm run lint:watch" "npm run webpack-server"'
      },
      'pre-commit': [
        'build:production',
        'webpack',
        'lint',
        'test'
      ]
    }, currentPkg);

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    // copy files
    this.fs.copyTpl(
      this.templatePath('alias.js'),
      this.destinationPath('alias.js'), {
        componentName: this.props.name[0].toUpperCase() + this.props.name.slice(1),
        router: this.props.modules.indexOf('router') !== -1,
        redux: this.props.modules.indexOf('redux') !== -1,
        radium: this.props.modules.indexOf('radium') !== -1
      }
    );

    this.fs.copy(
      this.templatePath('static.js'),
      this.destinationPath('bin/static.js')
    );

    this.fs.copyTpl(
      this.templatePath('config.js'),
      this.destinationPath('static.config.js'), {
        hostname: this.props.hostname,
        router: this.props.modules.indexOf('router') !== -1,
        redux: this.props.modules.indexOf('redux') !== -1,
        radium: this.props.modules.indexOf('radium') !== -1,
        name: this.props.name,
        componentName: this.props.name[0].toUpperCase() + this.props.name.slice(1)
      }
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'), {
        projectName: pkg.name,
        description: pkg.description,
        router: this.props.modules.indexOf('router') !== -1,
        redux: this.props.modules.indexOf('redux') !== -1,
        radium: this.props.modules.indexOf('radium') !== -1,
        license: pkg.license,
        name: pkg.author.name,
        url: pkg.author.url
      }
    );
  },

  default: function() {
    this.composeWith('cat:react', {
      options: {
        name: this.props.name,
        modules: this.props.modules,
        webpack: true,
        skipInstall: this.options.skipInstall
      }
    }, {
      local: require.resolve('../react')
    });

    this.composeWith('cat:pug', {
      options: {
        projectName: 'page',
        type: 'Static pages',
        skipInstall: this.options.skipInstall
      }
    }, {
      local: require.resolve('../pug')
    });
  },

  install: function() {
    this.npmInstall([
      'concurrently',
      'mkdirp',
      'lodash',
      'cli-color',
      'pre-commit'
    ], {saveDev: true});
  },

  end: function() {
    this.spawnCommand('npm', ['run', 'build']);
  }
});
