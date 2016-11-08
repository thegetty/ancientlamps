var gulp = require('gulp')
var sass = require('gulp-sass')
var cssnano = require('gulp-cssnano')
var autoprefixer = require('gulp-autoprefixer')
var rename = require('gulp-rename')

const PATH = {
  CSS: {
    src: 'source/assets/stylesheets/application.scss',
    dest: '.tmp/assets/stylesheets'
  },
  JS: {
    src: [
      'source/assets/javascripts/vendor/*',
      'source/assets/javascripts/!(main)*.js',
      'source/assets/javascripts/main.js'
    ],
    dest: '.tmp/assets/javascripts'
  },
  FONTS: {
    src: 'src/fonts/*',
    dest: '.tmp/fonts'
  }
}

gulp.task('css', function () {
  return gulp.src(PATH.CSS.src)
    .pipe(sass({errLogToConsole: true}))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest(PATH.CSS.dest))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(PATH.CSS.dest))
})

gulp.task('fonts', function () {
  gulp.src(PATH.FONTS.src)
    .pipe(gulp.dest(PATH.FONTS.dest))
})

gulp.task('default', ['css', 'fonts'], function () {
  gulp.watch('source/assets/stylesheets/**/*.scss', ['css'])
  gulp.watch('source/assets/fonts/*', ['fonts'])
})
