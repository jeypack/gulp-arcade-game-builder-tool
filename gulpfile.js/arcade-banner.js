/**
 * GULP ARCADE GAME BUILDER TOOL
 * AUTHOR: J. Pfeifer (c) 2021
 */
//const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');
//const log = require('fancy-log');
const {
  watch,
  series,
  parallel,
  src,
  dest
} = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const removeLogging = require('gulp-remove-logging');
const saveLicense = require('uglify-save-license');
const autoprefixer = require('autoprefixer');
const flexbugsfixer = require('postcss-flexbugs-fixes');
const htmlReplace = require('gulp-html-replace');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const del = require('del');

//config.DEV_FOLDER
const config = {
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
const enableDevelopment = (cb) => {
  config.DEVELOPMENT = true;
  cb();
};

const enableProduction = (cb) => {
  config.DEVELOPMENT = false;
  cb();
};

const cleanDirectory = (cb) => {
  //del.bind(null, config.DEVELOPMENT ? [config.DEV_FOLDER + '**'] : [config.BUILD_FOLDER + '**']);
  del.sync(config.DEVELOPMENT ? [config.DEV_FOLDER + '**'] : [config.BUILD_FOLDER + '**'], {
    force: true
  });
  cb();
};

const moveAssets = (cb) => {
  const destination = config.DEVELOPMENT ? config.DEV_FOLDER : config.BUILD_FOLDER;
  src(config.SRC_PATH + 'assets/**/*')
    //.pipe(cache(imagemin()))
    .pipe(dest(destination + 'assets/'));
  src(config.SRC_PATH + 'sounds/*.mp3')
    .pipe(dest(destination + 'sounds/'));
  const streamPixi = src(config.SRC_VENDOR + 'pixi.export.js')
    .pipe(rename('pixi.min.js'))
    .pipe(dest(destination + 'js/'));
  return streamPixi;
};

//Helper for 'createHtml' task - compiles our scss
const getSassCss = (sources, name, destination) => {
  //const destination = config.SRC_PATH + 'scss';
  const output = config.DEVELOPMENT ? 'expanded' : 'compressed';
  const processors = [
    autoprefixer,
    flexbugsfixer
  ];
  const stream = src(sources)
    .pipe(sass.sync({
      outputStyle: output,
      precision: 10,
      includePaths: []
    }).on('error', sass.logError))
    .pipe(postcss(processors))
    //.pipe(gulpif(!config.DEVELOPMENT, cssnano({ safe: true })))
    .pipe(cssnano({
      safe: true
    }));
  if (destination) {
    stream.pipe(rename(name))
      .pipe(dest(destination));
  }
  return stream.pipe(reload({
    stream: true
  }));
};

//Helper for 'createHtml' task
const getCombinedJS = (sources, name, destination, minified) => {
  //const destination = config.SRC_PATH + 'js';
  const stream = src(sources)
    .pipe(concat(name + '.js'))
    .pipe(gulpif(minified, removeLogging({
      methods: ['log', 'info']
    })))
    .pipe(gulpif(minified, uglify({
      output: {
        comments: saveLicense
      }
    })));
  if (destination) {
    stream.pipe(dest(destination));
  }
  return stream.pipe(reload({ stream: true }));
};

const createGameJS = (cb) => {
  const sources = [config.SRC_PATH + 'js/game.js', ...config.SRC_VANILLA.map(elem => config.SRC_PATH + 'js/' + elem), config.SRC_PATH + 'js/index.js'];
  return getCombinedJS(sources, 'game.min', config.DEVELOPMENT ? config.DEV_FOLDER + 'js' : config.BUILD_FOLDER + 'js', false);
};

//
const createHtml = (cb) => {
  const sourcesScss = [config.SRC_PATH + 'index.scss'];
  const sourcesVendor = [config.SRC_VENDOR + 'jquery-3.5.1.min.js'];
  const sources = [config.SRC_PATH + 'js/game.js', ...config.SRC_VANILLA.map(elem => config.SRC_PATH + 'js/' + elem), config.SRC_PATH + 'js/index.js'];
  return src(config.SRC_PATH + 'index.html')
    .pipe(htmlReplace({
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
    }))
    .pipe(rename('index.html'))
    .pipe(dest(config.DEVELOPMENT ? config.DEV_FOLDER : config.BUILD_FOLDER))
    .pipe(reload({
      stream: true
    }));
};

// Watch Files For Changes
const watchDirectory = (cb) => {
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
  watch([config.SRC_PATH + 'js/*.js', '!' + config.SRC_PATH + 'js/*.min.js'], createHtml);
  //gulp.watch('./src/vendor/*.js', ['lint']);
  watch(config.SRC_PATH + 'scss/*.scss', createHtml);
  watch(config.SRC_PATH + 'index.html', createHtml);
  cb();
};

const combinedTask = series(
  cleanDirectory,
  moveAssets,
  createGameJS,
  createHtml,
  watchDirectory
);

exports.default = series(enableDevelopment, combinedTask);
exports.build = series(enableProduction, combinedTask);
exports.clean = series(enableDevelopment, cleanDirectory, enableProduction, cleanDirectory);
