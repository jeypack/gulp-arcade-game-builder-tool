"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/**
 * GULP ARCADE GAME BUILDER TOOL
 * AUTHOR: J. Pfeifer (c) 2021
 */
//const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');
//const log = require('fancy-log');
var _require = require('gulp'),
    watch = _require.watch,
    series = _require.series,
    parallel = _require.parallel,
    src = _require.src,
    dest = _require.dest;

var gulpif = require('gulp-if');

var concat = require('gulp-concat');

var rename = require('gulp-rename');

var sass = require('gulp-sass')(require('sass'));

var postcss = require('gulp-postcss');

var cssnano = require('gulp-cssnano');

var uglify = require('gulp-uglify');

var removeLogging = require('gulp-remove-logging');

var saveLicense = require('uglify-save-license');

var autoprefixer = require('autoprefixer');

var flexbugsfixer = require('postcss-flexbugs-fixes');

var htmlReplace = require('gulp-html-replace');

var browserSync = require('browser-sync').create();

var reload = browserSync.reload;

var del = require('del'); //config.DEV_FOLDER


var config = {
  DEVELOPMENT: true,
  PATH_INCLUDES_SASS: ['bower_components/juiced/sass/'],
  HTDOCS_PATH: '/Applications/MAMP/htdocs/',
  SRC_PATH: './src/version-banner/',
  SRC_VENDOR: './src/vendor/',
  SRC_VANILLA: ['Clipboard.js', 'EventDispatcher.js', 'Point.js', 'Rectangle.js', 'Vector2D.js', 'PointerEvents.js', 'GameModel.js', 'GameController.js'],
  DEV_FOLDER: './_temp_banner/',
  BUILD_FOLDER: './_build_banner/'
};
/* const print = (cb) => {
    log(white('->'), bold(tplName));
    cb();
}; */

var enableDevelopment = function enableDevelopment(cb) {
  config.DEVELOPMENT = true;
  cb();
};

var enableProduction = function enableProduction(cb) {
  config.DEVELOPMENT = false;
  cb();
};

var cleanDirectory = function cleanDirectory(cb) {
  //del.bind(null, config.DEVELOPMENT ? [config.DEV_FOLDER + '**'] : [config.BUILD_FOLDER + '**']);
  del.sync(config.DEVELOPMENT ? [config.DEV_FOLDER + '**'] : [config.BUILD_FOLDER + '**'], {
    force: true
  });
  cb();
};

var moveAssets = function moveAssets(cb) {
  var destination = config.DEVELOPMENT ? config.DEV_FOLDER : config.BUILD_FOLDER;
  src(config.SRC_PATH + 'assets/**/*') //.pipe(cache(imagemin()))
  .pipe(dest(destination + 'assets/'));
  src(config.SRC_PATH + 'sounds/*.mp3').pipe(dest(destination + 'sounds/'));
  var streamPixi = src(config.SRC_VENDOR + 'pixi.export.js').pipe(rename('pixi.min.js')).pipe(dest(destination + 'js/'));
  return streamPixi;
}; //Helper for 'createHtml' task - compiles our scss


var getSassCss = function getSassCss(sources, name, destination) {
  //const destination = config.SRC_PATH + 'scss';
  var output = config.DEVELOPMENT ? 'expanded' : 'compressed';
  var processors = [autoprefixer, flexbugsfixer];
  var stream = src(sources).pipe(sass.sync({
    outputStyle: output,
    precision: 10,
    includePaths: []
  }).on('error', sass.logError)).pipe(postcss(processors)) //.pipe(gulpif(!config.DEVELOPMENT, cssnano({ safe: true })))
  .pipe(cssnano({
    safe: true
  }));

  if (destination) {
    stream.pipe(rename(name)).pipe(dest(destination));
  }

  return stream.pipe(reload({
    stream: true
  }));
}; //Helper for 'createHtml' task


var getCombinedJS = function getCombinedJS(sources, name, destination, minified) {
  //const destination = config.SRC_PATH + 'js';
  var stream = src(sources).pipe(concat(name + '.js')).pipe(gulpif(minified, removeLogging({
    methods: ['log', 'info']
  }))).pipe(gulpif(minified, uglify({
    output: {
      comments: saveLicense
    }
  })));

  if (destination) {
    stream.pipe(dest(destination));
  }

  return stream.pipe(reload({
    stream: true
  }));
};

var createGameJS = function createGameJS(cb) {
  var sources = [config.SRC_PATH + 'js/game.js'].concat(_toConsumableArray(config.SRC_VANILLA.map(function (elem) {
    return config.SRC_PATH + 'js/' + elem;
  })), [config.SRC_PATH + 'js/index.js']);
  return getCombinedJS(sources, 'game.min', config.DEVELOPMENT ? config.DEV_FOLDER + 'js' : config.BUILD_FOLDER + 'js', false);
}; //


var createHtml = function createHtml(cb) {
  var sourcesScss = [config.SRC_PATH + 'index.scss'];
  var sourcesVendor = [config.SRC_VENDOR + 'jquery-3.5.1.min.js'];
  var sources = [config.SRC_PATH + 'js/game.js'].concat(_toConsumableArray(config.SRC_VANILLA.map(function (elem) {
    return config.SRC_PATH + 'js/' + elem;
  })), [config.SRC_PATH + 'js/index.js']);
  return src(config.SRC_PATH + 'index.html').pipe(htmlReplace({
    cssInline: {
      src: getSassCss(sourcesScss, 'index.css', config.DEVELOPMENT ? config.DEV_FOLDER : null),
      tpl: '<style>%s</style>'
    }
    /* jsInlineVendor: {
      src: getCombinedJS(sourcesVendor, 'vendor.min', config.DEVELOPMENT ? config.DEV_FOLDER + 'js' : config.BUILD_FOLDER + 'js', false),
      tpl: '<script>%s</script>'
    },
    jsInline: {
      src: getCombinedJS(sources, 'index.min', config.DEVELOPMENT ? config.DEV_FOLDER : null, !config.DEVELOPMENT),
      tpl: '<script>%s</script>'
    } */

  })).pipe(rename('index.html')).pipe(dest(config.DEVELOPMENT ? config.DEV_FOLDER : config.BUILD_FOLDER)).pipe(reload({
    stream: true
  }));
}; // Watch Files For Changes


var watchDirectory = function watchDirectory(cb) {
  // proxy for MAMP htdocs

  /*browserSync.init({
  	proxy: "http://localhost/banner/bankcler/index-dev.php"
  });*/
  browserSync.init({
    // Open the site in Chrome & Firefox
    //browser: ["google chrome", "firefox"],
    // Wait for 0.15 seconds before any browsers should try to inject/reload a file.
    //reloadDelay: 150,
    // Don't show any notifications in the browser.
    notify: false,
    port: 9000,
    //server: "temp"
    server: {
      //directory: true,
      //index: "index.php",
      baseDir: config.DEVELOPMENT ? config.DEV_FOLDER : config.BUILD_FOLDER
    }
  });
  /* function handleChange(event) {
  	console.log('File ' + event.path + ' was changed');
  	reload();
  } */
  //gulp.watch("./build/**/*.html").on("change", handleChange);

  watch([config.SRC_PATH + 'js/*.js', '!' + config.SRC_PATH + 'js/*.min.js'], createHtml); //gulp.watch('./src/vendor/*.js', ['lint']);

  watch(config.SRC_PATH + 'scss/*.scss', createHtml);
  watch(config.SRC_PATH + 'index.html', createHtml);
  cb();
};

var combinedTask = series(cleanDirectory, moveAssets, createGameJS, createHtml, watchDirectory);
exports["default"] = series(enableDevelopment, combinedTask);
exports.build = series(enableProduction, combinedTask);
exports.clean = series(enableDevelopment, cleanDirectory, enableProduction, cleanDirectory);