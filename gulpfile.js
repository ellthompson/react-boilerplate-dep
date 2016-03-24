var gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    tap = require('gulp-tap'),
    fs = require('fs'),
    clean = require('gulp-clean'),
    path = require('path');

var SOURCE_DIR = path.resolve('source'),
    BUILD_DIR = path.resolve('build');

var JS_GLOB = path.resolve(SOURCE_DIR, '**/*.js*'),
    SCSS_GLOB = path.resolve(SOURCE_DIR, '**/*.scss');

var minifyConfig = function(filePath) {
    return {
        map: path.resolve('/', path.basename(filePath) + '.map'),
        output: filePath.replace(SOURCE_DIR, BUILD_DIR) + '.map'
    }
};

gulp.task('watch', ['watch_scripts']);

gulp.task('build', ['clean', 'build_scripts']);

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
                    console.log('bundled ' + file.path);
                });
            });
            file.contents = bundler.bundle();
        })
    )
    .pipe(gulp.dest(BUILD_DIR));
});


gulp.task('build_scripts', function() {
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

gulp.task('clean', function() {
    return gulp.src([BUILD_DIR], {read: false})
        .pipe(clean());
});
