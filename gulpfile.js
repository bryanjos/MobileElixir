var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var exec = require('child_process').exec;

var jsSrc = './src/js/**/*.js*';
var exjsSrc = './src/exjs/**/*.exjs';
var jsDest = '.';


function reportChange(event){
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('build-exjs', function(cb) {
  exec('/usr/local/ex2js/bin/ex2js "' + exjsSrc + '" -r "." -o ' + "src/js", function (err, stdout, stderr) {
    cb(err);
  });
});

gulp.task('build-elixir', ['build-exjs'], function() {
  return gulp.src('./src/js/elixir.js')
      .pipe(plumber())
      .pipe(babel({sourceMap: false, modules: 'common'}))
      .pipe(gulp.dest(jsDest));
});

gulp.task('build-index', ['build-elixir'], function() {
  return gulp.src('./src/js/index.js')
      .pipe(plumber())
      .pipe(babel({sourceMap: false, modules: 'common'}))
      .pipe(concat('index.ios.js'))
      .pipe(gulp.dest(jsDest));
});

gulp.task('build-js', ['build-elixir', 'build-index']);

gulp.task('build', ['build-exjs', 'build-js']);

gulp.task('watch', function() {
  gulp.watch([exjsSrc, cssSrc, 'index.html'], ['build']).on('change', reportChange);
});

gulp.task('default', ['build']);