var gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    tap = require('gulp-tap'),
    fs = require('fs'),
    clean = require('gulp-clean'),
    compileCSS = require('gulp-sass'),
    minifyCSS = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    replaceExtension = require('gulp-ext-replace'),
    path = require('path');

var SOURCE_DIR = path.resolve('source'),
    BUILD_DIR = path.resolve('build');

var JS_GLOB = path.resolve(SOURCE_DIR, '**/*.js*'),
    IMG_GLOB = path.resolve(SOURCE_DIR, 'img/**/*.*'),
    SCSS_GLOB = path.resolve(SOURCE_DIR, '**/*.scss');

var minifyConfig = function(filePath) {
    return {
        map: path.resolve('/', path.basename(filePath) + '.map'),
        output: filePath.replace(SOURCE_DIR, BUILD_DIR) + '.map'
    }
};

gulp.task('watch', ['watch_scripts'], function() {
    livereload.listen();
    gulp.watch(SCSS_GLOB, ['watch_styles']);
    gulp.watch([path.join(SOURCE_DIR, '**/*.jinja'), path.join(SOURCE_DIR, '**/*.html')], ['copy_markup']).on('change', livereload.changed);
});

gulp.task('build', ['clean', 'build_scripts', 'build_styles', 'copy_markup', 'build_images']);

gulp.task('watch_scripts', function() {
    return gulp.src(JS_GLOB)
    .pipe(
        tap(function(file) {
            var bundler = browserify(file.path, {
                paths: [SOURCE_DIR],
                debug: true,
                cache: {},
                packageCache: {},
                transform: ['babelify']
            });
            file.path = file.path.replace('.jsx', '.js');

            var watcher = watchify(bundler);
            watcher.on('update', function() {
                bundler.bundle(function(err, data) {
                    if(err) console.log(err);
                    var bundled_stream = fs.createWriteStream(file.path.replace(SOURCE_DIR, BUILD_DIR));
                    bundled_stream.write(data);
                    livereload.changed();
                    console.log('bundled ' + file.path);
                });
            });
            file.contents = bundler.bundle();
        })
    )
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.tas('build_scripts', function() {
    return gulp.src(JS_GLOB)
    .pipe(
        tap(function(file) {
            var bundler = browserify(file.path, {
                paths: [SOURCE_DIR],
                debug: true,
                transform: ['babelify']
            });
            file.path = file.path.replace('.jsx', '.js');
            bundler.plugin('minifyify', minifyConfig(file.path));
            file.contents = bundler.bundle();
        })
    )
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('watch_styles', function () {
    return gulp.src(SCSS_GLOB)
        .pipe(compileCSS({
            includePaths: [
                'node_modules'
            ]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 9-11'],
            cascade: false
         }))
        .pipe(replaceExtension('.css'))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(livereload());
});

gulp.task('build_styles', function () {
    return gulp.src(SCSS_GLOB)
        .pipe(compileCSS({
            includePaths: [
                'node_modules'
            ]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 9-11'],
            cascade: false
         }))
        .pipe(minifyCSS())
        .pipe(replaceExtension('.css'))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('copy_markup', ['clean_markup'], function () {
    return gulp.src([path.join(SOURCE_DIR, '**/*.jinja'), path.join(SOURCE_DIR, '**/*.html')], { base: SOURCE_DIR })
        .pipe(gulp.dest(BUILD_DIR + '/'));
});

gulp.task('build_images', ['clean_images'], function() {
    return gulp.src(IMG_GLOB)
        .pipe(gulp.dest(gulp.dest(BUILD_DIR + '/')))
});

gulp.task('clean', function() {
    return gulp.src([BUILD_DIR], {read: false})
        .pipe(clean());
});
