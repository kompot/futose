'use strict';

var spawn = require('child_process').spawn;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: 'gulp{-,.}*',
  replaceString: /gulp(\-|\.)/
});
var runSequence = require('run-sequence');
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
var dstHashPath = '-hashed';
var client      = '/client';
var server      = '/server';

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
    jsWatch:     srcPath + '/js/**/*',
    jsServer:    srcPath + '/js/server/**/*'
  },
  dst: {
    dev: {
      root: dstDevPath,
      css: dstDevPath + client + '/css',
      img: dstDevPath + client + '/img',
      js:  dstDevPath + client + '/js',
      jsServer: dstDevPath + server + '/js'
    },
    prod: {
      root: dstProdPath,
      rootHashed: dstProdPath + dstHashPath,
      css: dstProdPath + client + '/css',
      img: dstProdPath + client + '/img',
      js:  dstProdPath + client + '/js',
      jsServer: dstProdPath + server + '/js'
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
    .pipe($.util.env.type === 'prod' ? $.uglify() : $.util.noop())
    .pipe($.rename("bundle.js"))
    .pipe($.filesize())
    .pipe(gulp.dest(paths.dst[$.util.env.type].js));
});

gulp.task('clean', function () {
  var pathsToClean = [paths.dst[$.util.env.type].root];
  if ($.util.env.type === 'prod') {
    pathsToClean.push(paths.dst[$.util.env.type].rootHashed);
  }
  return gulp.src(pathsToClean, { read: false })
    .pipe($.rimraf())
    .on('error', $.util.log);
});

gulp.task('default', function (callback) {
  runSequence('clean',
    ['images', 'stylus', 'webpack', 'copy-server-code'],
    'fb-flo', 'http-server', callback);
  gulp.watch(paths.src.imgWatch,    ['images']);
  gulp.watch(paths.src.cssWatch,    ['stylus']);
  gulp.watch(paths.src.spriteWatch, ['sprite']);
  gulp.watch(paths.src.jsWatch,     ['webpack']);
});

gulp.task('copy-server-code', function () {
  gulp.src([paths.src.jsWatch])
    .pipe(gulp.dest(paths.dst[$.util.env.type].jsServer));
});

var everythingHashed = [
    dstProdPath + client + '/**/*',
    dstProdPath + server + '/**/*'
];
var options = {
  transformPath: function (rev, source, path) {
    return source.indexOf('./') === 0 ? './' + rev : rev;
  }
};

gulp.task('hash:client', function () {
  return gulp.src(everythingHashed)
    .pipe(revall(options))
    .pipe($.filter(['**/*', '!**/*.js', '**/bundle*js']))
    .pipe(gulp.dest(dstProdPath + dstHashPath + client));
});

gulp.task('hash:server', function () {
  return gulp.src(everythingHashed)
    .pipe(revall(options))
    .pipe($.filter(['**/*.js', '!**/bundle*js']))
    .pipe(gulp.dest(dstProdPath + dstHashPath + server));
});

gulp.task('build', function (callback) {
  runSequence('clean',
    ['images', 'stylus', 'webpack', 'copy-server-code'],
    'hash:client', 'hash:server', callback);
});

gulp.task('http-server', ['copy-server-code'], function () {
  spawn('node_modules/.bin/nodemon', ['-w', 'src/js/*', 'dev/server/js/server/server.js'], { stdio: 'inherit' });
  console.log('Server listening on http://127.0.0.1:9001');
});

gulp.task('fb-flo', function () {
  var flo = require('fb-flo');
  var fs = require('fs');

  var server = flo(dstDevPath + client, {
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
          contents: fs.readFileSync(paths.dst.dev.css + '/screen.css'),
          reload: false
        });
      }
      if (filepath.indexOf('js') != -1) {
        callback({
          resourceURL: 'bundle.js',
          contents: fs.readFileSync(paths.dst.dev.js + '/bundle.js'),
          reload: false
        });
      }
    }
  );

  server.once('ready', function() {
    $.util.log('Ready!');
  });
});
