'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const _ = require('lodash');

gulp.task('serve', function () {
  $.nodemon({
    verbose: true,
    script: 'app.js',
    ext: 'js,json',
    ignore: [
      'node_modules/*',
      'test/*',
      'gulpfile.js',
    ],
    env: {
      'NODE_ENV': 'development',
      'NODE_CONFIG_STRICT_MODE': true,
    },
  });
});

gulp.task('net', function () {
  $.nodemon({
    verbose: true,
    script: 'netServer.js',
    ext: 'js,json',
    ignore: [
      'node_modules/*',
      'test/*',
      'gulpfile.js',
    ],
    env: {
      'NODE_ENV': 'development',
    },
  });
});

gulp.task('init', function () {
  $.run('sh scripts/init.sh').exec();
});
