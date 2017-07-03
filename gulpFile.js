var gulp        = require('gulp');
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');
var htmlmin     = require('gulp-htmlmin');
var cssnano     = require('gulp-cssnano');
var fs          = require('fs');
var browserSync = require('browser-sync').create();
var babyparse   = require('babyparse');
var _           = require('lodash');

// ****************************************************************************
// Minify CSS
gulp.task('build-css', function() {
  return gulp.src('./src/css/*')
             .pipe(cssnano())
             .pipe(rename({ suffix: '.min'}))
             .pipe(gulp.dest('./docs/css/'));
});

// Minify static HTML
gulp.task('build-html', function() {
  return gulp.src('./src//index.html')
             .pipe(htmlmin({collapseWhitespace: true}))
             .pipe(gulp.dest('./docs/'));
});

// Minify Javascript
gulp.task('build-js', function() {
  return gulp.src('./src/js/*')
             .pipe(uglify())
             .pipe(rename({ suffix: '.min'}))
             .pipe(gulp.dest('./docs/js/'));
});

// Convert apk CSV to JSON
gulp.task('convert-csvToJson', function() {
  var parseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  };
  var apkJsonData = babyparse.parseFiles('./src/apkData.csv', parseOptions).data.map(function(i) {
    return _.pickBy(i, _.identity);
  });

  // Sort by label
  apkJsonData = _.sortBy(apkJsonData, function (i) {
    return String(i.label).toLowerCase();
  });

  return fs.writeFileSync('./docs/apkData.json', JSON.stringify(apkJsonData), 'utf-8');
});

// ****************************************************************************

// DO ALL OF THE THINGZ!!!!!
gulp.task('build', ['build-html','build-js', 'build-css', 'convert-csvToJson']);

// Dev web Server
gulp.task('dev', ['build'], function() {
  browserSync.init({ server: { baseDir: "./docs" }, injectChanges: true });

  gulp.watch(['./src/**/*'], ['build'], function() {
    browserSync.reload('*.*');
  });
});
