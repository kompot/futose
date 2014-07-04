'use strict';

var lr = require('tiny-lr');
var server = lr();

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/
});
var webpack   = require("webpack");
var webpackConfig = require("./webpack.config.js");
//var connect = require('connect');
var nib = require('nib');
var jeet = require('jeet');
var stylusConfig = { use: [nib(), jeet()] };

var defaultEnv = $.util.env._[0] === 'build' ? 'prod' : 'dev';
$.util.env.type = $.util.env.type || defaultEnv;
$.util.log('Environment is `' + $.util.env.type + '`.');

var srcPath     = './assets';
var dstProdPath = './build';
var dstDevPath  = './public';

var paths = {
  src: {
    img:         srcPath + '/img',
    imgWatch:    srcPath + '/img/**/*',
    spriteWatch: srcPath + '/sprite/**/*',
    css:         srcPath + '/stylus',
    cssWatch:    srcPath + '/stylus/**/*',
    cssCompile: [srcPath + '/stylus/*.styl',
           '!' + srcPath + '/stylus/_*.styl'],
    jsWatch:     srcPath + '/js/**/*'
  },
  dst: {
    dev: {
      css: dstDevPath + '/css',
      img: dstDevPath + '/img'
    },
    prod: {
      css: dstProdPath + '/css',
      img: dstProdPath + '/img'
    }
  }
};

gulp.task('sprite', function () {
  var spriteData = gulp.src(paths.src.spriteWatch).pipe($.spritesmith({
    imgName: 'sprite.png',
    imgPath: '/img/sprite.png',
    cssName: '_sprite.styl',
    engine: 'pngsmith' // for maximum compatibility
  }));
  spriteData.img.pipe(gulp.dest(paths.src.img));
  spriteData.css.pipe(gulp.dest(paths.src.css));
});

gulp.task('stylus', ['sprite'], function () {
  gulp.src(paths.src.cssCompile)
    .pipe($.stylus(stylusConfig))
    .on('error', console.log)
    .pipe($.myth())
    .pipe($.util.env.type === 'prod' ? $.csso() : $.util.noop())
    .pipe(gulp.dest(paths.dst[$.util.env.type].css));
});

gulp.task('images', ['sprite'], function () {
  gulp.src(paths.src.imgWatch)
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.dst[$.util.env.type].img));
});

var spawn = require('child_process').spawn;
var node;

gulp.task('http-server', function () {
  node = spawn('nodemon', ['server.js'], { stdio: 'inherit' });
  console.log('Server listening on http://127.0.0.1:9001');
});

var devConfig = Object.create(webpackConfig);
devConfig.devtool = "sourcemap";
//devConfig.devtool = "eval";
devConfig.debug = true;
var devCompiler = webpack(devConfig);

gulp.task('webpack:build-dev', function(callback) {
  devCompiler.run(function(err, stats) {
    if(err) throw new gutil.PluginError('webpack:build-dev', err);
    $.util.log('[webpack:build-dev]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('default', ['images', 'stylus'], function () {
  gulp.watch(paths.src.imgWatch,    ['images']);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.spriteWatch, ['sprite']);

  gulp.watch(paths.src.jsWatch,     ['webpack:build-dev']);

  gulp.run('fb-flo');
  gulp.run('http-server');
});

gulp.task('build', ['images', 'stylus']);

gulp.task('fb-flo', function () {
  if (node) {
    node.kill();
  }
  node = spawn('node', ['flo.js'], { stdio: 'inherit' });
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, turning off fb-flo...');
    }
  });
});
