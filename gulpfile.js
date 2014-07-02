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

var srcPath    = './assets';
var dstPath    = './build';
var dstDevPath = './public';

var paths = {
  src: {
    img:         srcPath + '/img/**/*',
    cssWatch:    srcPath + '/stylus/**/*',
    cssCompile: [srcPath + '/stylus/*.styl',
           '!' + srcPath + '/stylus/_*.styl']
  },
  dev: {
    css: dstDevPath + '/css',
    img: dstDevPath + '/img'
  },
  prod: {
    css: dstPath + '/css',
    img: dstPath + '/img'
  }
};

var fSrc = './assets';
var fServerTemplates = '/template';
var fJs = '/js';
var fSrcImg = fSrc + '/img/*.png';

gulp.task('sprite', function () {
  var spriteData = gulp.src(fSrc + '/sprite/*.png').pipe($.spritesmith({
    imgName: 'sprite.png',
    imgPath: '/img/sprite.png',
    cssName: '_sprite.styl',
    engine: 'pngsmith' // for maximum compatibility
  }));
  spriteData.img.pipe(gulp.dest(fSrc + '/img'));
  spriteData.css.pipe(gulp.dest(fSrc + '/stylus'));
});

gulp.task('stylus', ['sprite'], function () {
  gulp.src(paths.src.cssCompile)
    .pipe($.stylus(stylusConfig))
    .on('error', console.log)
    .pipe($.myth())
    .pipe($.util.env.type === 'prod' ? $.csso() : $.util.noop())
    .pipe(gulp.dest(paths[$.util.env.type].css));
//    .pipe ($.livereload(server));
});


//gulp.task('jade', function () {
//  gulp.src([fSrc + fServerTemplates + '/*.jade',
//      '!' + fSrc + fServerTemplates + '/_*.jade'])
//    .pipe($.jade({ pretty: true }))
//    .on('error', console.log)
//    .pipe(gulp.dest('./public/'))
//    .pipe($.livereload(server));
//});


//gulp.task('js', function () {
//  gulp.src([fSrc + fJs + '/**/*.js',
//      '!' + fSrc + fJs + '/vendor/**/*.js'])
//    .pipe($.concat('index.js'))
//    .pipe(gulp.dest('./public/js'))
////    .pipe($.livereload(server));
//});

gulp.task('images', ['sprite'], function () {
  gulp.src(paths.src.img)
    .pipe($.imagemin())
    .pipe(gulp.dest(paths[$.util.env.type].img));
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
    $.util.log('[webpack:build-dev]', stats.toString({
      colors: true
    }));
    callback();
  });
});


gulp.task('default', ['images', 'stylus'], function () {
  $.util.env.type = 'dev';

  gulp.watch(paths.src.img, ['images']);
  gulp.watch(paths.src.cssWatch, ['stylus']);
  gulp.watch(fSrc + '/sprite/*.png', ['sprite']);

  gulp.watch(fSrc + fJs + '/**/*', ['webpack:build-dev']);

  gulp.run('webpack:build-dev');
  gulp.run('fb-flo');
  gulp.run('http-server');
});

gulp.task('build', ['stylus'], function () {
  $.util.env.type = 'prod';



//  gulp.src(fSrc + '/stylus/screen.styl')
//    .pipe($.stylus(stylusConfig))
//    .pipe($.myth())
//    .pipe($.csso())
//    .pipe(gulp.dest('./build/css/'));

//  gulp.src([fSrc + fServerTemplates + '/*.jade',
//      '!' + fSrc + fServerTemplates + '/_*.jade'])
//    .pipe($.jade())
//    .pipe(gulp.dest('./build/'));

//  gulp.src([fSrc + fJs + '/**/*.js',
//      '!' + fSrc + fJs + '/vendor/**/*.js'])
//    .pipe($.concat('index.js'))
//    .pipe($.uglify())
//    .pipe(gulp.dest('./build/js'));
//
//  gulp.src(paths.img)
//    .pipe($.imagemin())
//    .pipe(gulp.dest('./build/img'))
});

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
