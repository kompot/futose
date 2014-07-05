'use strict';

var spawn = require('child_process').spawn;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/
});
var revall = require('gulp-rev-all');
var nib = require('nib');
var jeet = require('jeet');
var stylusConfig = { use: [nib(), jeet()] };

var defaultEnv = $.util.env._[0] === 'build' ? 'prod' : 'dev';
$.util.env.type = $.util.env.type || defaultEnv;
$.util.log('Environment is `' + $.util.env.type + '`.');

var srcPath     = './src';
var dstProdPath = './prod';
var dstDevPath  = './dev';

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
//      root: dstDevPath,
      css: dstDevPath + '/css',
      img: dstDevPath + '/img',
      js:  dstDevPath + '/js'
    },
    prod: {
//      root: dstProdPath,
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

gulp.task('stylus', function () {
  gulp.src(paths.src.cssCompile)
    .pipe($.stylus(stylusConfig))
    .on('error', $.util.log)
    .pipe($.myth())
    .pipe($.util.env.type === 'prod' ? $.csso() : $.util.noop())
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[$.util.env.type].css));
});

gulp.task('images', function () {
  gulp.src(paths.src.imgWatch)
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.dst[$.util.env.type].img));
});

gulp.task('webpack', function() {
  return gulp.src('./src/js/app.js')
    .pipe($.webpack({
      module: {
        loaders: [
          { test: /\.js$/, loader: 'jsx-loader' }
        ]
      }
    }))
//    .pipe($.util.env.type === 'prod' ? $.uglify() : $.util.noop())
    .pipe($.rename("app.js"))
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[$.util.env.type].js));
});

gulp.task('clean', function () {
  // TODO how to make this recursive, as
  // paths.dst[$.util.env.type].root complains about
  // directory is not empty
  return gulp.src([
      paths.dst[$.util.env.type].css,
      paths.dst[$.util.env.type].img,
      paths.dst[$.util.env.type].js
    ], { read: false })
    .pipe($.rimraf())
    .on('error', $.util.log);
});

gulp.task('default', ['clean', 'images', 'stylus', 'webpack', 'fb-flo', 'http-server'], function () {
  gulp.watch(paths.src.imgWatch,    ['images']);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.spriteWatch, ['sprite']);
  gulp.watch(paths.src.jsWatch,     ['webpack']);
});

gulp.task('copy-server-code', function () {
  gulp.src(['src/js/server/**'])
    .pipe(gulp.dest('prod/js/server'));
});

gulp.task('build', ['images', 'stylus', 'webpack', 'copy-server-code'], function () {
  gulp.src(['prod/**'])
    .pipe(revall())
    .pipe(gulp.dest('prod-hashed'))
});

gulp.task('http-server', function () {
  spawn('nodemon', ['-w', 'src/js/*', 'src/js/server/server.js'], { stdio: 'inherit' });
  console.log('Server listening on http://127.0.0.1:9001');
});

gulp.task('fb-flo', function () {
  var flo = require('fb-flo');
  var fs = require('fs');

  var server = flo('dev/', {
      port: 8888,
      host: '127.0.0.1',
      glob: [ '**/*.js', '**/*.css' ]
    }, function resolver(filepath, callback) {
//      console.log("----------------- fb-flo detected changes ");
//      console.log(filepath);
//      console.log(callback);
//      console.log("-----------------");

      if (filepath.indexOf('css') != -1) {
        callback({
//        match: 'equal',
          resourceURL: 'screen.css',
          contents: fs.readFileSync('dev/css/screen.css'),
          reload: false
        });
      }
      if (filepath.indexOf('js') != -1) {
        callback({
          resourceURL: 'app.js',
          contents: fs.readFileSync('dev/js/app.js'),
          reload: false
        });
      }
    }
  );

  server.once('ready', function() {
    $.util.log('Ready!');
  });
});
