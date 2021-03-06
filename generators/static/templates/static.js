#!/bin/env node
var fs = require('fs');
var path = require('path');
var pug = require('pug');
var _ = require('lodash');
var extend = _.merge;
var mkdirp = require('mkdirp');
var clc = require('cli-color');
var React = require('react');
var renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
var config = require('./../static.config.js');

var copyFile = function(component) {
  var fn = pug.compileFile('./views/page.pug');
  fs.writeFile(
    path.resolve(__dirname, './../', component.name === 'index' ? 'index.html' : component.name + '/index.html'),
    fn(component.locals),
    function(err) {
      if(err)
        throw err;

      console.log(clc.greenBright('rendered ') + clc.cyanBright((component.name === 'index' ? '' : component.name + '/') + 'index.html'));
    }
  );
};

var render = function(component) {
  if(component.name !== 'index') {
    mkdirp(component.name, function(err) {
      if(err)
        throw err;

      copyFile(component);
    });
  } else
    copyFile(component);
};

var radium = function(component) {
  var Wrapper = require('./../lib/components/radium/Wrapper').default;

  return React.createElement(Wrapper, null, component);
};

var redux = function(component, store) {
  var Provider = require('react-redux').Provider;

  return React.createElement(Provider, {store: store}, component);
};

config.forEach(function(component) {
  if(component.router) {
    var match = require('react-router').match;
    var RouterContext = require('react-router').RouterContext;

    match({routes: component.component, location: component.location}, function(error, redirextLocation, renderProps) {
      if(renderProps) {
        render(extend({}, component, {
          locals: {
            markup: renderToStaticMarkup(
              component.radium ? (
                radium(
                  component.redux ? (
                    redux(React.createElement(RouterContext, renderProps), component.store)
                  ) : (
                    React.createElement(RouterContext, renderProps)
                  )
                )
              ) : (
                component.redux ? (
                  redux(React.createElement(RouterContext, renderProps), component.store)
                ) : (
                  React.createElement(RouterContext, renderProps)
                )
              )
            )
          }
        }));
      } else {
        render(extend({}, component, {
          locals: {
            markup: renderToStaticMarkup(
              React.createElement('div', null, 'not find')
            )
          }
        }));
      }
    });
    return;
  }

  render(extend({}, component, {
    locals: {
      markup: renderToStaticMarkup(
        component.radium ? (
          radium(
            component.redux ? (
              redux(React.createElement(component.component), component.store)
            ) : (
              React.createElement(component.component)
            )
          )
        ) : (
          component.redux ? (
            redux(React.createElement(component.component), component.store)
          ) : (
            React.createElement(component.component)
          )
        )
      )
    }
  }));
});
