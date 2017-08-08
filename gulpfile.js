var gulp = require('gulp');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var merge = require('merge-stream');
/**
 * JS and CSS stuff set
 */
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
/**
 * CSS stuff set
 */
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');

/**
 * Images stuff set
 */
var spritesmith = require('gulp.spritesmith'); // sprite
var imagemin = require('gulp-imagemin'); // minifier
var gm = require('gulp-gm'); // converter-resizer

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var path = {
    dist: {
        html: 'build/',
        js: 'build/js/',
        style: 'build/css/',
        img: 'build/pictures/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/index.js',
        style: 'src/scss/**/*.scss',
        img: 'src/pictures/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        style: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

/**
 * HTML stuff
 */
gulp.task('html', function () {
    gulp.src(path.src.html)
        .pipe(gulp.dest(path.dist.html))
        .pipe(browserSync.stream());
});

/**
 * SCSS stuff
 */
gulp.task('scss', function () {
    return gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'extended'}).on('error', sass.logError))
               .pipe(autoprefixer(
        ['last 2 versions', '> 1%'],
        {cascade: false}
        ))
        // .pipe(cleanCSS())
        // .pipe(rename({
        // suffix: '.min'
        // }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.style))
        .pipe(browserSync.stream());
});

/**
 * Sprite stuff
 */
gulp.task('sprite', function () {
    // Generate our spritesheet
    var spriteData = gulp.src('./src/img/sprite_icon/*.png').pipe(spritesmith({
        imgName: 'sprite-icon.png',
        cssName: '_sprite-icon.scss',
        padding: 5,
        imgPath: '../img/sprite-icon.png'
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img/'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(gulp.dest('./src/scss/'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});


// browser-sync server config
browserSync.init({
    server: {
        baseDir: './build/',
        index: 'index.html'
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: 'Frontend_Dev'
});

// Static Server + watching scss/html files
gulp.task('serve', function () {
    gulp.watch(path.watch.style, ['scss']);
    gulp.watch(path.watch.img, ['sprite']);
    gulp.watch(path.watch.html, ['html']);
});
