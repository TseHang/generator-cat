var path = require('path');
var gulp = require('gulp');
var nsp = require('gulp-nsp');
var gulpRequireTasks = require('gulp-require-tasks');
var watch = require('gulp-watch');
var taskListing = require('gulp-task-listing');
<% if(type === 'Dynamic pages') { -%>
var exec = require('gulp-exec');
<% } -%>
<% if(type === 'Static pages') { -%>
var staticRender = require('./gulp-tasks/static');
<% } -%>

gulpRequireTasks({
  path: path.resolve(process.cwd(), './gulp-tasks')
});

gulp.task('help', taskListing);

gulp.task('nsp', function(cb) {
  nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('prepublish', ['nsp']);
<% if(type === 'Static pages') { -%>

gulp.task('build', [
  'babel:build'
], staticRender);
<% } -%>
<% if(type === 'Dynamic pages') { -%>

gulp.task('server', [
  'babel:build'
], function() {
  gulp.src('./')
    .pipe(exec('NODE_ENV=1 node ./lib/server'))
    .pipe(exec.reporter(reportOptions));
});

gulp.task('server:dev', [
  'babel:build'
], function() {
  gulp.src('./')
    .pipe(exec('node ./lib/server'))
    .pipe(exec.reporter(reportOptions));
});
<% } -%>

gulp.task('watch',
<% if(type === 'Dynamic pages') { -%>
  ['server:dev'],
<% } -%>
  function() {
  gulp.watch('./src/**', [
<% if(type === 'Dynamic pages') { -%>
    'server:dev',
<% } -%>
    'test',
    'lint'
  ]);
});

gulp.task('default', [
  'lint',
  'test'
]);
