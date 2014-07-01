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
var connect = require('connect');
var nib = require('nib');
var jeet = require('jeet');
var stylusConfig = { use: [nib(), jeet()] };

var fSrc = './assets';
var fServerTemplates = '/template';
var fJs = '/js';

gulp.task('stylus', function () {
  gulp.src(fSrc + '/stylus/screen.styl')
    .pipe($.stylus(stylusConfig))
    .on('error', console.log)
    .pipe($.myth())
    .pipe(gulp.dest('./public/css/'));
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


gulp.task('js', function () {
  gulp.src([fSrc + fJs + '/**/*.js',
      '!' + fSrc + fJs + '/vendor/**/*.js'])
    .pipe($.concat('index.js'))
    .pipe(gulp.dest('./public/js'))
//    .pipe($.livereload(server));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src(fSrc + '/sprite/*.png').pipe($.spritesmith({
    imgName: 'sprite.png',
    imgPath: '/img/sprite.png',
    cssName: 'sprite.styl',
    engine: 'pngsmith' // for maximum compatibility
  }));
  spriteData.img.pipe(gulp.dest(fSrc + '/img'));
  spriteData.css.pipe(gulp.dest(fSrc + '/stylus'));
});

gulp.task('images', function () {
  gulp.src(fSrc + '/img/**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest('./public/img'))
});

var spawn = require('child_process').spawn;
var node;

gulp.task('http-server', function () {
//  connect()
//    .use(require('connect-livereload')())
//    .use(connect.static('./public'))
//    .listen('9000');
  node = spawn('nodemon', ['server.js'], { stdio: 'inherit' });
  console.log('Server listening on http://127.0.0.1:9001');
});

var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
//myDevConfig.devtool = "eval";
myDevConfig.debug = true;
var devCompiler = webpack(myDevConfig);
gulp.task('webpack:build-dev', function(callback) {
  devCompiler.run(function(err, stats) {
    if(err) throw new gutil.PluginError('webpack:build-dev', err);
    $.util.log('[webpack:build-dev]', stats.toString({
      colors: true
    }));
    callback();
  });
});

gulp.task('default', function () {
  gulp.run('sprite');
  gulp.run('stylus');
//  gulp.run('jade');
  gulp.run('images');
//  gulp.run('js');
  gulp.run('webpack:build-dev');
  gulp.run('fb-flo');

  gulp.watch(fSrc + '/stylus/**/*.styl', ['stylus']);
  gulp.watch(fSrc + fJs + '/**/*', ['webpack:build-dev']);
  gulp.watch(fSrc + '/sprite/*', ['sprite']);

  server.listen(35729, function (err) {
    if (err) return console.log(err);

//    gulp.watch('assets/stylus/**/*.styl', function() {
//        gulp.run('stylus');
//    });
    gulp.watch(fSrc + fServerTemplates + '/**/*.jade', function () {
      console.log('wach!!!!!!!!!!!!!!');
//      gulp.run('jade');
    });
//    gulp.watch('assets/img/**/*', function() {
//        gulp.run('images');
//    });
//    gulp.watch('assets/js/**/*', function() {
//        gulp.run('js');
//    });
  });
  gulp.run('http-server');
});

gulp.task('build', function () {
  gulp.src(fSrc + '/stylus/screen.styl')
    .pipe($.stylus(stylusConfig))
    .pipe($.myth())
    .pipe($.csso())
    .pipe(gulp.dest('./build/css/'));

//  gulp.src([fSrc + fServerTemplates + '/*.jade',
//      '!' + fSrc + fServerTemplates + '/_*.jade'])
//    .pipe($.jade())
//    .pipe(gulp.dest('./build/'));

  gulp.src([fSrc + fJs + '/**/*.js',
      '!' + fSrc + fJs + '/vendor/**/*.js'])
    .pipe($.concat('index.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('./build/js'));

  gulp.src(fSrc + '/img/**/*')
    .pipe($.imagemin())
    .pipe(gulp.dest('./build/img'))
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
