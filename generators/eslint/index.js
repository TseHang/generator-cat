'use strict';

var generators = require('yeoman-generator');
var _ = require('lodash');
var extend = _.merge;

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);

    this.option('react', {
      type: Boolean,
      required: false,
      default: true,
      desc: 'Use React'
    });
  },

  writing: function() {
    this.fs.copyTpl(
      this.templatePath('eslintignore'),
      this.destinationPath('.eslintignore'), {
        react: this.options.react
      }
    );
    this.fs.copyTpl(
      this.templatePath('eslintrc.js'),
      this.destinationPath('.eslintrc.js'), {
        react: this.options.react
      }
    );

    var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    var pkg = extend({
      scripts: {
        lint: 'eslint --cache ./ --ext .js',
        'lint:watch': 'esw --cache ./ --ext .js -w --color'
      }
    }, currentPkg);

    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  },

  install: function() {
    var modules = [
      'eslint',
      'eslint-watch',
      'eslint-config-google',
      'eslint-plugin-import',
      'eslint-import-resolver-babel-module',
      'babel-eslint'
    ];

    if(this.options.react)
      modules.push('eslint-plugin-react');

    this.npmInstall(modules, {saveDev: true});
  }
});
