var gulp        = require('gulp');
var ejs         = require('gulp-ejs');
var uglify      = require('gulp-uglify');
var htmlmin     = require('gulp-htmlmin');
var cssnano     = require('gulp-cssnano');
var browserSync = require('browser-sync').create();

// Build static HTML
gulp.task('build-html', function() {
  var apkData = require('./src/apkData.json');

  return gulp.src('./src/templates/index.ejs')
             .pipe(ejs({apkData: apkData}, {}, {ext: '.html'}).on('error', console.error))
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest('./dist/'));
});

// Minify Javascript
gulp.task('build-js', function() {
  return gulp.src('./src/js/*')
             .pipe(uglify())
             .pipe(gulp.dest('./dist/js/'));
});

// Minify CSS
gulp.task('build-css', function() {
  return gulp.src('./src/css/*')
             .pipe(cssnano())
             .pipe(gulp.dest('./dist/css/'));
});

// Dev web Server
gulp.task('browser-sync', ['build-html','build-js', 'build-css'] ,function() {
  browserSync.init({ server: { baseDir: "./dist" } });
});

// Watch and reload server
gulp.task('watch', function () {
  gulp.watch(['./src/**/*'], ['build-html','build-js', 'build-css'], function() {
    browserSync.reload('*.*');
  });
});

gulp.task('dev', ['browser-sync', 'watch']);
