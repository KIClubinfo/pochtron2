var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var webserver = require('gulp-webserver');
var util = require('gulp-util');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');

var production = !!util.env.production;

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
        .pipe(production ? uglifycss() : util.noop())
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
        .pipe(ngAnnotate())
        .pipe(production ? uglify() : util.noop())
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
        .src('bower_components/**/fonts/**/*.{ttf,woff,woff2,eot,svg}')
        // .pipe(filter(['***.eot', '***.svg', '***.ttf', '***.woff', '***.woff2', '***.otf']))
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('www/fonts/'))
    ;
});

gulp.task('serve', function() {
    gulp
        .src( 'www' )
        .pipe(webserver({
            host:             '0.0.0.0',
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
