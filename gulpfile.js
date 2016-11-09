var gulp = require('gulp')
var sass = require('gulp-sass')
var cssnano = require('gulp-cssnano')
var autoprefixer = require('gulp-autoprefixer')
var rename = require('gulp-rename')
var webpack = require('webpack-stream')
var livereload = require('gulp-livereload')

const PATH = {
  CSS: {
    src: 'source/assets/stylesheets/application.scss',
    dest: '.tmp/assets/stylesheets'
  },
  JS: {
    src: 'source/assets/javascripts/application.js',
    dest: '.tmp/assets/javascripts'
  }
}

gulp.task('css', function() {
  return gulp.src(PATH.CSS.src)
    .pipe(sass({errLogToConsole: true}))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest(PATH.CSS.dest))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(PATH.CSS.dest))
    .pipe(livereload())
})

gulp.task('js', function() {
  return gulp.src(PATH.JS.src)
    .pipe(webpack({
      output: {
        filename: 'application.js'
      }
    }))
    .pipe(gulp.dest(PATH.JS.dest))
    .pipe(livereload())
})

gulp.task('default', ['css', 'js'], function() {
  livereload.listen()
  gulp.watch('source/assets/stylesheets/**/*.scss', ['css'])
  gulp.watch('source/assets/javascripts/**/*.js', ['js'])
})

gulp.task('build', ['css', 'js'])
