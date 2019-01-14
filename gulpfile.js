var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2018-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %>\n',
    ' */\n',
    '\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {

    // Bootstrap
    gulp.src([
            './node_modules/bootstrap/dist/**/*',
            '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
            '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
        ])
        .pipe(gulp.dest('./docs/vendor/bootstrap'))

    // Font Awesome
    gulp.src([
            './node_modules/@fortawesome/**/*',
        ])
        .pipe(gulp.dest('./docs/vendor'))

    // jQuery
    gulp.src([
            './node_modules/jquery/dist/*',
            '!./node_modules/jquery/dist/core.js'
        ])
        .pipe(gulp.dest('./docs/vendor/jquery'))

    // jQuery Easing
    gulp.src([
            './node_modules/jquery.easing/*.js'
        ])
        .pipe(gulp.dest('./docs/vendor/jquery-easing'))

});

// Compile SCSS
gulp.task('css:compile', function() {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass.sync({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./docs/css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
    return gulp.src([
            './docs/css/*.css',
            '!./docs/css/*.min.css'
        ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./docs/css'))
        .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function() {
    return gulp.src([
            './js/*.js'
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('./docs/js'))
        .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

//copy the assets and index file in docs
gulp.task('copy-index', function() {
    gulp.src('./index.html')
        .pipe(gulp.dest('./docs/'));
});

gulp.task('copy-assets', function() {
    gulp.src('./img/*.*')
        .pipe(gulp.dest('./docs/img/'));
});

gulp.task('copy', ['copy-index', 'copy-assets']);

// Default task to build the app
gulp.task('default', ['css', 'js', 'vendor', 'copy']);

// Dev task
gulp.task('dev', ['css', 'js', 'browserSync'], function() {
    gulp.watch('./scss/*.scss', ['css']);
    gulp.watch('./js/*.js', ['js']);
    gulp.watch('./*.html', browserSync.reload);
});