'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/
});
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
    js:          srcPath + '/js',
    jsWatch:     srcPath + '/js/**/*'
  },
  dst: {
    dev: {
      css: dstDevPath + '/css',
      img: dstDevPath + '/img',
      js:  dstDevPath + '/js'
    },
    prod: {
      css: dstProdPath + '/css',
      img: dstProdPath + '/img',
      js:  dstProdPath + '/js'
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
    .on('error', $.util.log)
    .pipe($.myth())
    .pipe($.util.env.type === 'prod' ? $.csso() : $.util.noop())
    .pipe(gulp.dest(paths.dst[$.util.env.type].css));
});

gulp.task('images', ['sprite'], function () {
  gulp.src(paths.src.imgWatch)
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.dst[$.util.env.type].img));
});

gulp.task('webpack', function() {
  return gulp.src('./assets/js/app.js')
    .pipe($.webpack({
      module: {
        loaders: [
          { test: /\.js$/, loader: 'jsx-loader' }
        ]
      }
    }))
    .pipe($.util.env.type === 'prod' ? $.uglify() : $.util.noop())
    .pipe($.rename("app.js"))
    .pipe(gulp.dest(paths.dst[$.util.env.type].js));
});

gulp.task('default', ['images', 'stylus', 'webpack'], function () {
  gulp.watch(paths.src.imgWatch,    ['images']);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.spriteWatch, ['sprite']);
  gulp.watch(paths.src.jsWatch,     ['webpack']);
  gulp.run('fb-flo');
  gulp.run('http-server');
});

gulp.task('build', ['images', 'stylus', 'webpack']);

var spawn = require('child_process').spawn;
var node;

gulp.task('http-server', function () {
  node = spawn('nodemon', ['server.js'], { stdio: 'inherit' });
  console.log('Server listening on http://127.0.0.1:9001');
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
