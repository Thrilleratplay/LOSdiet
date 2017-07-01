var gulp        = require('gulp');
var ejs         = require('gulp-ejs');
var uglify      = require('gulp-uglify');
var htmlmin     = require('gulp-htmlmin');
var cssnano     = require('gulp-cssnano');
var browserSync = require('browser-sync').create();
var babyparse   = require('babyparse');

// Build static HTML
gulp.task('build-html', function() {
  var apkData = babyparse.parseFiles('./src/apkData.csv', {header: true, dynamicTyping: true}).data;

  return gulp.src('./src/templates/index.ejs')
             .pipe(ejs({apkData: apkData}, {}, {ext: '.html'}).on('error', console.error))
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest('./docs/'));
});

// Minify Javascript
gulp.task('build-js', function() {
  return gulp.src('./src/js/*')
             .pipe(uglify())
             .pipe(gulp.dest('./docs/js/'));
});

// Minify CSS
gulp.task('build-css', function() {
  return gulp.src('./src/css/*')
             .pipe(cssnano())
             .pipe(gulp.dest('./docs/css/'));
});

// Dev web Server
gulp.task('browser-sync', ['build-html','build-js', 'build-css'] ,function() {
  browserSync.init({ server: { baseDir: "./docs" } });
});

// Watch and reload server
gulp.task('watch', function () {
  gulp.watch(['./src/**/*'], ['build-html','build-js', 'build-css'], function() {
    browserSync.reload('*.*');
  });
});

gulp.task('dev', ['browser-sync', 'watch']);
