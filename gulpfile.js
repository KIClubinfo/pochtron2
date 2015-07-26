var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var webserver = require('gulp-webserver');
var env = process.env.GULP_ENV;

gulp.task('jshint', function() {
    return gulp
        .src([
            'app/js/**/*.js',
            'app/js/*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
    ;
});

gulp.task('build-less', function() {
    var vendorsFiles = mainBowerFiles();
    var appFiles = [
        'app/less/bootstrap.less'
    ];
    var files = vendorsFiles.concat(appFiles);
    return gulp
        .src(files)
        .pipe(filter(['**/*.css', '**/*.less']))
        .pipe(less())
        .pipe(concat('style.min.css'))
        .pipe(gulpif(env === 'prod', uglifycss()))
        .pipe(gulp.dest('www/'))
    ;
});

gulp.task('build-js', function() {
    var vendorsFiles = mainBowerFiles();
    var appFiles = [
        'app/js/app.js',
        'app/js/*.js',
        'app/js/**/*.js',
    ];
    var files = vendorsFiles.concat(appFiles);
    return gulp
        .src(files)
        .pipe(filter(['**/*.js']))
        .pipe(concat('app.min.js'))
        .pipe(gulpif(env === 'prod', uglify()))
        .pipe(gulp.dest('www/'))
    ;
});

gulp.task('lint-js', function() {
    var appFiles = [
        'app/js/app.js',
        'app/js/*.js',
        'app/js/**/*.js',
    ];
    return gulp
        .src(appFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
    ;
});

gulp.task('copy-fonts', function () {
    return gulp
        .src(mainBowerFiles())
        .pipe(filter(['***.eot', '***.svg', '***.ttf', '***.woff', '***.woff2', '***.otf']))
        .pipe(gulp.dest('www/fonts/'))
    ;
});

gulp.task('serve', function() {
    gulp
        .src( 'www' )
        .pipe(webserver({
            host:             'localhost',
            port:             '9001',
            livereload:       true,
            directoryListing: false
        }))
    ;
});

gulp.task('watch', function() {
    gulp.watch(['app/js/**/*.js', 'app/js/*.js'], ['lint-js', 'build-js']);
    gulp.watch('app/less/*.less', ['build-less']);
});
gulp.task('build', ['build-js', 'build-less', 'copy-fonts']);
gulp.task('start', ['watch', 'serve']);
gulp.task('default', ['build', 'start']);
