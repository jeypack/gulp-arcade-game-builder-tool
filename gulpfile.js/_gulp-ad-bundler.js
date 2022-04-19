/**
 * GULP ADD BUILDER TOOL
 * AUTHOR: J. Pfeifer (c) 2019-2020
 * LICENSE: GNU GENERAL PUBLIC LICENSE
*/
const { watch, series, parallel, src, dest } = require('gulp');
const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');
const autoprefixer = require('autoprefixer');
const col = red;
const del = require('del');
const fs = require('fs');
const log = require('fancy-log');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const cleanCSS = require('gulp-clean-css');
const data = require('gulp-data');
const dom = require('gulp-dom');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
//const imagemin = require('./gulp-imagemin');
const merge2 = require('merge2');
const path = require("path");
const postcss = require('gulp-postcss');
const removeLogging = require('gulp-remove-logging');
const rename = require('gulp-rename');
const tap = require('gulp-tap');
//const through = require('through2');
const uglify = require('gulp-uglify');
const inquirer = require('inquirer');
//const wait = require('gulp-wait2');
//const ui = new inquirer.ui.BottomBar();
// Advertiser could be: IAB SIZMEK ADF ADFM GDN DCM DCS ADW LR ATLAS FT APPNEXUS
const { regexSaveSize, regexFindLang, regexFindBlank, regexFind_BlankPattern, regexCta, copyFromToImmutable, getSizeFromName, getAdvertiser, getAdBundling, getAdSize, getAdTitle, getAdName, getBgExitPartial, getBottomScriptPartial, getNissanDomElements, hasScriptImportFor, getAdDirName } = require('./ad-bundler-utils');
const { ENUM_ADVERTISER, ENUM_BUNDLING, ENUM_TASKS, ENUM_NISSAN_CTA, ENUM_AD_FORMAT, ENUM_MC_MONTH } = require('./ad-bundler-enums');
const webshot = require('./gulp-webshot-egp');
const zipper = require('./gulp-zipper');
const adinfo = require('./gulp-ad-nfo');
const nunjucksRender = require('./gulp-nunjucks-render');

// DEST: './output/',
// DEST_ZIP: './output/zip/',
const RUNTIME_FOLDERS = [];
const adBundler = {
    VERSION: '1.6.4',
    CONCAT: true,
    SRC: './src/adBundler/',
    SRC_INPUT: 'ad_bundler_input/',
    DEST: './build/ad_bundler_output/',
    DEST_ZIP: './build/ad_bundler_output/zip/'
};
//  config\.(.*?) =
let DEVELOPMENT = false,
    hasEmptyDirectory = false,
    configInsideEmptyFolder = false,
    fallbackInsideAdFolder = false,
    // DEFAULT config
    config = {
        "autostart": false,
        "date": "",
        "task": "build",
        "ADVERTISER": "IAB",
        "FALLBACK_INSIDE_FOLDER": true,
        "LOG_BUILD": false,
        "MINIFY_IMAGES": false,
        "QUALITY_IMAGES": 75,
        "QUALITY_FALLBACKS": 80,
        "QUALITY_FALLBACKS_AUTO": true,
        "TAXONOMY_WW": false,
        "TAXONOMY_MC": "",
        "TAXONOMY_NISSAN": "",
        "TAXONOMY_NISSAN_PARTS": [],
        "TAXONOMY_MC_PARTS": []
    };


function minifyCSS(obj) {
    //.on('error', error)
    //.on('end', function () { log(redBright('END SRC '), col.bold(fileNotFound))})
    return src([adBundler.SRC_INPUT + obj.dir + '/index.css'])
        //.pipe(postcss([autoprefixer()]))
        //.pipe(postcss())
		//.pipe(cssnano({ safe: true }))
        .pipe(cleanCSS({ compatibility: 'ie9' }))
		.pipe(rename('index.min.css'));
}
function minifyJS(obj) {
    let streamA, streamB, scrFiles,
        destFiles = adBundler.DEST + obj.dir + '/js/';
    if (obj.concat) {
        scrFiles = [adBundler.SRC + 'js/egplus-html5-slim-2.3.0.js'];
        if (obj.debug) {
            scrFiles.push(adBundler.SRC + 'js/ad-timeline-control-2.0.0.js');
        }
        if (obj.hasSplitText) {
            scrFiles.push(adBundler.SRC + 'js/ad-split-text-2.0.0.js');
        }
        scrFiles.push(adBundler.SRC_INPUT + obj.dir + '/js/anim.js');
        streamB = src(scrFiles)
            .pipe(concat('index.min.js'))
            .pipe(removeLogging({ methods: ['log', 'info'] }))
            .pipe(uglify());
    } else {
        scrFiles = [adBundler.SRC + 'js/egplus-html5-slim-2.3.0.min.js'];
        if (obj.debug) {
            scrFiles.push(adBundler.SRC + 'js/ad-timeline-control-2.0.0.min.js');
        }
        if (obj.hasSplitText) {
            scrFiles.push(adBundler.SRC + 'js/ad-split-text-2.0.0.min.js');
        }
        if (obj.hasCustomEase) {
            scrFiles.push(adBundler.SRC + 'js/CustomEase.min.js');
        }
        scrFiles.push(adBundler.SRC_INPUT + obj.dir + '/js/anim.min.js');
    }
    if (obj.hasCustomEase) {
        streamA = src(adBundler.SRC + 'js/CustomEase.min.js');
        return merge2(streamA, streamB).pipe(concat('index.min.js'));
        /*return merge2(streamA, streamB)
            .pipe(concat('index.min.js'))
            .pipe(dest(adBundler.DEST + obj.dir + '/'));*/
    }
    //return streamB.pipe(dest(adBundler.DEST + obj.dir + '/'));
    return streamB;
}

// .pipe(data(function() { return require('./app/data.json'); }))
function nunjucks(obj) {
    let dir = getAdDirName(obj, config);
    // Gets .html and .nunjucks files in pages
    //return src(adBundler.SRC + 'pages/**/*.+(html|njk|nunjucks)')
    return src(adBundler.SRC + 'pages/index.njk')
        .pipe(data(function (file) {
            //log('nunjucks data obj: ' + JSON.stringify(obj));
            //log('nunjucks data path: ' + file.path);
            return obj;
        }))
        // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: [adBundler.SRC + 'templates']
        }))
        // output files (index.html) in app folder
        .pipe(dest(adBundler.DEST + dir + '/'));
}
function nunjucksNissan(obj) {
    let dir = getAdDirName(obj, config);
    // Gets .html and .nunjucks files in pages
    return src(adBundler.SRC + 'pages/index-nissan.njk')
        .pipe(data(function (file) {
            return obj;
        }))
        // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: [adBundler.SRC + 'templates']
        }))
        .pipe(rename('index.html'))
        // output files (index.html) in app folder
        .pipe(dest(adBundler.DEST + dir + '/'));
}

function makeWebshot(root) {
    return webshot.make({
        defaultWhiteBackground: true,
        customCSS: '#bg-exit{opacity:1;}',
        dest: adBundler.DEST,
        root: root,
        renderDelay: 2500,
        // takes ads folder name as filename
        basePathNames: true,
        insideFallbackFolder: true,
        // write image to ad folder or if false inside fallbacks folder
        insideFolder: fallbackInsideAdFolder,
        getSizeFromFolderName: true,
        onLoadFinished: function () {
            setTimeout(function () {
                var video,
                    egp = window.EGPlus,
                    setFallback = function () {
                        if (egp.ad.tl.labels && egp.ad.tl.labels.fallback) {
                            egp.ad.tl.seek(egp.ad.tl.labels.fallback, false);
                        } else {
                            egp.ad.tl.seek(egp.ad.tl.totalDuration(), false);
                        }
                    },
                    initializeForWebshot = function () {
                        setTimeout(setFallback);
                        /*video = egp.$('video');
                        if (video.length) {
                            video[0].oncanplaythrough = function (e) {
                                video[0].oncanplaythrough = null;
                                e.target.currentTime = e.target.duration;
                                egp.ad.tl.seek(egp.ad.tl.totalDuration());
                            };
                        } else {
                            setTimeout(setFallback);
                        }*/
                    };
                if (egp) {
                    egp.doFallback = true;
                    if (egp.isInitialized()) {
                        setTimeout(initializeForWebshot);
                    } else {
                        egp.on('init', initializeForWebshot);
                    }
                } else {
                    setTimeout(initializeForWebshot);
                }
            });
        },
        filename: 'fallback', // is only used if 'basePathNames' is false or undefined
        autoQuality: config.QUALITY_FALLBACKS_AUTO,
        quality: config.QUALITY_FALLBACKS
    });
}

function moveAll(obj) {
    let dir = getAdDirName(obj, config);
    return src(adBundler.SRC_INPUT + obj.dir + '/**')
		.pipe(dest(adBundler.DEST + dir + '/'));
}
//@see buildOthers
function moveNissan(obj) {
    let scrFiles, tempFiles,
        counter = 0,
        dir = getAdDirName(obj, config);
    if (config.LOG_BUILD) {
        log(grey('moveNissan obj.id:'), col.bold(obj.id), col('moveNissan obj.nissan:'), col.bold(JSON.stringify(obj.nissan)));
    }
    log(grey('moveNissan'), col(obj.id), col.bold(obj.id), col('nissan.hasAdrress:'), col.bold(obj.nissan.hasAdrress), col('nissan.hasAddressFile:'), col.bold(obj.nissan.hasAddressFile));
    if (obj.nissan.hasAddress) {
        if (obj.nissan.hasAddressFile) {
            tempFiles = ['/index.html', '/egp-address.js', '/egp-data.js'];
            scrFiles = tempFiles.map(src => (adBundler.SRC_INPUT + obj.dir + src));
        } else {
            scrFiles = [adBundler.SRC_INPUT + obj.dir + '/index.html', adBundler.SRC + 'js/egp-address.js', adBundler.SRC_INPUT + obj.dir + '/egp-data.js'];
        }
    } else {
        tempFiles = ['/index.html', '/egp-data.js'];
        scrFiles = tempFiles.map(src => (adBundler.SRC_INPUT + obj.dir + src));
    }
    
    return src(scrFiles, { allowEmpty: true })
        .pipe(dest(adBundler.DEST + dir + '/'));
}
function moveImagesNissan(obj, minify) {
    let counter = 0,
        dir = getAdDirName(obj, config),
        tempFiles = ['/img/*.*'],
        scrFiles = tempFiles.map(src => (adBundler.SRC_INPUT + obj.dir + src));
    return src(scrFiles, { allowEmpty: true })
        /*.pipe(gulpif(minify, imagemin.make([
            imagemin.gifsicle({ interlaced: false }),
            imagemin.mozjpeg({ quality: config.QUALITY_IMAGES, progressive: false }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ])))*/
        .pipe(dest(adBundler.DEST + dir + '/img/'));
}
function moveImages(obj, minify) {
    let counter = 0,
        dir = getAdDirName(obj, config);
    return src(adBundler.SRC_INPUT + obj.dir + '/img/**')
		/*
        .pipe(gulpif(minify, imagemin.make([
            imagemin.gifsicle({ interlaced: false }),
            imagemin.mozjpeg({ quality: config.QUALITY_IMAGES, progressive: false }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ])))*/
		.pipe(dest(adBundler.DEST + dir + '/img/'));
}
function moveManifestJS(obj) {
    let dir = getAdDirName(obj, config);
    return src(adBundler.SRC_INPUT + obj.dir + '/manifest.js')
		.pipe(dest(adBundler.DEST + dir + '/'));
}

// ++++++++++++++++++++++++++
// export helper functions +
// +++++++++++++++++++++++++

function writeManifestJSON(obj) {
    let dir = getAdDirName(obj, config);
    return src(adBundler.SRC + 'js/manifest.json')
        .pipe(tap(function (file) {
            let i, elem, dir, isNissan, isDir,
                fileJson = JSON.parse(file.contents.toString());
            //log('writeManifestJSON tap title: ' + fileJson.title + 'description: ' + fileJson.description + 'width: ' + fileJson.width + 'height: ' + fileJson.height);
            fileJson.title = obj.title;
            fileJson.description = obj.client;
            fileJson.title = obj.title;
            fileJson.width = obj.size.width.toString();
            fileJson.height = obj.size.height.toString();
            file.contents = Buffer.from(JSON.stringify(fileJson))
            //return obj;
        }))
        // output files (index.html) in app folder
        .pipe(dest(adBundler.DEST + dir + '/'));
}


function cleanBundle(cb) {
    del.sync([adBundler.SRC + 'templates/partials/ads/**']);
    del.sync([adBundler.DEST + '**', '!' + adBundler.DEST, '!' + adBundler.DEST + 'fallbacks/**']);
    cb();
}
function cleanZip(cb) {
    //del.sync([adBundler.DEST + '**/*.jpg']);
    del.sync([adBundler.DEST + 'zip/**']);
    cb();
}
function cleanFallbacks(cb) {
    //del.sync([adBundler.DEST + '**/*.jpg']);
    del.sync([adBundler.DEST + 'fallbacks/**']);
    cb();
}
function cleanFallbacksInside(cb) {
    del.sync([adBundler.DEST + '**/*.jpg', '!' + adBundler.DEST + '**/img/**', '!' + adBundler.DEST + 'fallbacks/**']);
    //del.sync([adBundler.DEST + 'fallbacks/**']);
    cb();
}

function fallbacks(cb) {
    fs.readFile(adBundler.DEST + 'log.json', (err, data) => {
        if (!err) {
            let json = JSON.parse(data),
                sources = json.map(obj => {
                    let dir = getAdDirName(obj, config);
                    return (adBundler.DEST + dir + '/index.html');
                });
            return src(sources).pipe(makeWebshot(adBundler.DEST));
        }
        cb();
    });
}
function fallbacksFromDest(cb) {
    return src(adBundler.DEST + '*/index.html')
        .pipe(makeWebshot(adBundler.DEST));
}

function logTotal(cb) {
    // list files with sizes and write output json to destination folder
    // optional path to json -> adBundler.DEST + 'log.json'
    return src([adBundler.DEST + '*/index.html', adBundler.DEST + '*/img/**', '!' + adBundler.DEST + '*/img'])
        /*.pipe(adinfo({ destination: adBundler.DEST }, function (file, destination) {
            log(col('logTotal adinfo path:'), col.bold(file.path));
        }));*/
        .pipe(adinfo({ destination: adBundler.DEST, pathToJson: adBundler.DEST + 'log.json', version: adBundler.VERSION }));
}
function logVersion(cb) {
    log(grey('--------'), grey('VERSION '), col.bold(adBundler.VERSION), grey('DEVMODE:'), col.bold(DEVELOPMENT), grey('CONCAT:'), col.bold(adBundler.CONCAT), grey('MINIFY:'), col.bold(config.MINIFY_IMAGES));
    cb();
}
function logVersionFallbacks(cb) {
    log(grey('--------'), grey('VERSION '), col.bold(adBundler.VERSION), grey('QUALITY_FALLBACKS:'), col.bold(config.QUALITY_FALLBACKS), grey('FALLBACK INSIDE:'), col.bold(config.FALLBACK_INSIDE_FOLDER));
    cb();
}
function logFallbacks(cb) {
    log(grey('--------'), grey('QUALITY_FALLBACKS '), col.bold(config.QUALITY_FALLBACKS), grey('FALLBACK INSIDE:'), col.bold(config.FALLBACK_INSIDE_FOLDER));
    cb();
}

function moveFallbacksInside(cb) {
    if (!config.FALLBACK_INSIDE_FOLDER) { return cb(); }
    return src(adBundler.DEST + 'fallbacks/*.*')
        .pipe(data(function (file) {
            let parseObj = path.parse(file.path);
            return parseObj;
        }))
        .pipe(rename('fallback.jpg'))
        .pipe(dest(function (file) {
            let data = file.data;
            // TODO: check this - what about dir?
            //log('moveFallbacksInside', 'name:', data.name);
            return adBundler.DEST + data.name + '/';
        }));
}

/*function moveFallbacksInside(cb) {
    if (!config.FALLBACK_INSIDE_FOLDER) { return cb(); }
    return src(adBundler.DEST + 'fallbacks/*.*')
        .pipe(data(function (file) {
            let parseObj = path.parse(file.path);
            return parseObj;
        }))
        .pipe(rename('fallback.jpg'))
        .pipe(dest(function (file) {
            let data = file.data;
            // TODO: check this - what about dir?
            //log('moveFallbacksInside', 'name:', data.name);
            return adBundler.DEST + data.name + '/';
        }));
}*/

//bundleAds 1.
function read(cb) {
    let countIndex = 0;
    return src(adBundler.SRC_INPUT + '**/index.html')
        // collapseInlineTagWhitespace
        // minifyJS Minify JavaScript in script elements and event attributes
        .pipe(dom(function () {
            let scripts = this.querySelectorAll('script'),
                obj = {
                    date: new Date(),
                    concat: adBundler.CONCAT,
                    debug: DEVELOPMENT,
                    advertiser: getAdvertiser(scripts),
                    size: getAdSize(this),
                    title: getAdTitle(this),
                    name: getAdName(this)
                };
            // first set client via 'title' property
            obj.client = String(obj.title.split(' ')[0]).toUpperCase();
            // next is bundling
            obj.bundling = getAdBundling(obj);
            // only use this for STANDARD
            if (obj.bundling === ENUM_BUNDLING.STANDARD) {
                obj.hasMotionPath = hasScriptImportFor('MotionPathPlugin', scripts);
                obj.hasEasePath = hasScriptImportFor('EasePack', scripts);
                obj.hasSplitText = hasScriptImportFor('ad-split-text', scripts);
                //obj.hasCustomEase = hasScriptImportFor('CustomEase', scripts);
                obj.bottomjs = getBottomScriptPartial(scripts);
            } else {
                obj.hasMotionPath = false;
                obj.hasEasePath = false;
                obj.hasSplitText = false;
                //obj.hasCustomEase = false;
            }
            obj.hasCustomEase = false;
            // at least overwrite advertiser if defined
            if (config.ADVERTISER) {
                obj.advertiser = config.ADVERTISER;
            }
            //log(col('read DOM AD DATA  OUT OF CLIENT ->\t'), obj.client, ' \t', obj.advertiser, ' \t', obj.bundling);
            if (obj.bundling === ENUM_BUNDLING.NISSAN) {
                // { indexJS: null, indexCSS: null, hasAddressScriptTag: false }
                obj.nissan = getNissanDomElements(this);
                obj.nissan.id = countIndex++,
                obj.hasMotionPath = hasScriptImportFor('MotionPathPlugin', scripts);
                obj.hasSplitText = hasScriptImportFor('ad-split-text', scripts);
                //log(col('read DOM obj.nissan:'), obj.nissan.indexCSS.substr(0, 50));
            }
            // IMPORTANT INITIAL ARRAY PUSH
            RUNTIME_FOLDERS.push(obj);
            //log(col('DOM AD DATA: '), JSON.stringify(obj));
            //log(grey('READ DOM AD DATA id:'), col(obj.id));
            return getBgExitPartial(this, obj);
        }))
        .pipe(gulpif(!DEVELOPMENT, htmlmin({ removeComments:  true, collapseWhitespace: true })))
        .pipe(rename(function (path) {
            // path.dirname path.basename path.extname
            let size,
                index = RUNTIME_FOLDERS.length - 1,
                obj = RUNTIME_FOLDERS[index];
            obj.id = index;
            obj.dir = path.dirname;
            if (obj.bundling === ENUM_BUNDLING.NISSAN) {
                //eNV200-ct-994x250-ALL-Campaign key visual-CampaignTagline-Discover more-CH_DE_Q3FY191119
                size = getSizeFromName(obj.dir);
                obj.size = {
                    content: size.content,
                    width: size.width,
                    height: size.height
                };
            }
            //log(grey('READ AD '), JSON.stringify(obj));
            //log(grey('READ AD '), obj.dir);
            // we set directory name as basename
            path.basename = "bg-exit";
            path.extname = ".html";
        }))
        //.pipe(dest(adBundler.SRC + 'templates/partials/ads/'));
        .pipe(dest(function (file) {
            return adBundler.SRC + 'templates/partials/ads/';
        }));
        //.pipe(src(adBundler.SRC_INPUT + '*/*.js'))
        /*.pipe(tap(function (file) {
            let currentFolder,
                parseObj = path.parse(file.path);
            log(grey('read DOM'), col('parseObj:'), JSON.stringify(parseObj));
        }));*/
}
//bundleAds 1b.
function checkNissanAdrress(cb) {
    return src(adBundler.SRC_INPUT + '*/*.js')
        .pipe(tap(function (file) {
            //file.dirname
            //{"root":"/","dir":"/Users/joerg.pfeifer/Documents/Work/Web/npm-gulp/ad_bundler_input/FY20_JUN_Starting-Price_DIS_H5_300x250_PRIS______CH-DE-MR_Leaf_200608","base":"egp-data.js","ext":".js","name":"egp-data"}
            let i, elem,
                parseObj = path.parse(file.path),
                folders = RUNTIME_FOLDERS,
                length = folders.length,
                folder = parseObj.dir.split('/').slice(-1)[0],
                hasAddressFile = (parseObj.name && parseObj.name === 'egp-adrress');
            log(grey('checkNissanAdrress'), col('folder:'), folder, col('hasAddressFile:'), hasAddressFile);
            //log(grey('checkNissanAdrress'), col('parseObj:'), JSON.stringify(parseObj));
            for (i = 0; i < length; i++) {
                elem = folders[i];
                if (elem.bundling === ENUM_BUNDLING.NISSAN) {
                    //log(grey('checkNissanAdrress'), col('folder:'), col(JSON.stringify(elem)));
                    //log(grey('checkNissanAdrress'), col('folder:'), col(Object.keys(elem).join(' | ')));
                    //log(grey('checkNissanAdrress'), col('dir:'), col(elem.dir));
                    if (elem.dir === folder) {
                        elem.nissan.hasAddressFile = hasAddressFile;
                        break;
                    }
                }
            }
            log(grey('checkNissanAdrress'), col('elem.dir:'), grey.bold(elem.dir));
            //folders.forEach(elem => {});
        }));
}
//bundleAds 2.
function readNissanData(cb) {
    const regexPublisher = /(publisher):"(["]|[A-Z]+)/;
    const regexLoadFont = /(loadfont):(\!0|\!1)/;
    //this could also be done via String.indexOf
    //const regexTextTween = /"(type)":"(textTween)"/;
    const regexTextTween = /"(type)":"(textTween)"/;
    const regexDealerVar = /text:{content:"{([A-Za-z0-9]+)}"/;
    let length,
        counter = 0,
        folders = RUNTIME_FOLDERS,
        origlength = folders.length,
        srcFiles = [];
    folders.forEach(elem => {
        if (elem.bundling === ENUM_BUNDLING.NISSAN) {
            srcFiles.push(adBundler.SRC_INPUT + elem.dir + '/egp-data.js');
        }
    });
    length = srcFiles.length;
    //log('readNissanData', col.bold('length:'), grey.bold(length), col.bold('config.ADVERTISER:'), grey.bold(config.ADVERTISER));
    //early out if no nissan files availlable
    //if (length === 0 || config.ADVERTISER) { return cb(); }
    if (length === 0) { return cb(); }
    return src(srcFiles)
        .pipe(uglify())
        .pipe(tap(function (file) {
            let i, elem,
                fileStr = file.contents.toString(),
                reg = regexPublisher.exec(fileStr),
                publisher = reg[2],
                regFont = regexLoadFont.exec(fileStr),
                loadfont = (regFont[2] === '!0') ? true : (regFont[2] === '!1') ? false : false,
                regTextTween = regexTextTween.exec(fileStr),
                hasAddress = regexDealerVar.exec(fileStr),
                folderName = srcFiles[counter].split('/')[1];
            if (config.LOG_BUILD) {
                log('readNissanData tap', col.bold('counter:'), grey.bold(counter), col.bold('folderName:'), grey.bold(folderName), col.bold('reg:'), grey.bold(reg), col.bold('regFont:'), grey.bold(regFont), col.bold('loadfont:'), grey.bold(loadfont));
                log('readNissanData tap', col.bold('counter:'), grey.bold(counter), col.bold('fileStr:'), grey.bold(fileStr));
            }
            //we search for same folder
            for (i = 0; i < origlength; i++) {
                elem = folders[i];
                //if is nissan and is same directory as tap file
                if (elem.bundling === ENUM_BUNDLING.NISSAN && folderName === elem.dir) {
                    if (!config.ADVERTISER) {
                        elem.advertiser = publisher;
                    }
                    elem.nissan.hasAddress = (hasAddress) ? true : false;
                    elem.nissan.loadFont = loadfont;
                    elem.nissan.hasText = (regTextTween) ? true : false;
                    if (config.LOG_BUILD) {
                        //log(grey('readNissanData tap'), col.bold('counter:'), grey.bold(counter), col.bold('write advertiser:'), grey.bold(publisher), col.bold('dir:'), grey.bold(elem.dir));
                        log(grey('readNissanData tap'), col.bold('counter:'), grey.bold(counter), col.bold('elem.nissan.id:'), grey.bold(elem.nissan.id), col.bold('elem.nissan.hasAddress:'), grey.bold(hasAddress));
                        log(grey('readNissanData tap'), col.bold('fileStr:'), grey.bold(fileStr));
                        log('readNissanData tap', col.bold('counter:'), grey.bold(counter), col.bold('elem.nissan.id:'), grey.bold(elem.nissan.id));
                    }
                    break;
                }
            };
            counter++;
        }));
}

//bundleAds 3.
function buildCustomJS(cb) {
    let length,
        count = 0,
        folders = [];
    RUNTIME_FOLDERS.forEach(elem => {
        if (elem.bundling === ENUM_BUNDLING.STANDARD) {
            folders.push(elem);
        }
    });
    length = folders.length;
    //log(grey('CUSTOMJS'), col.bold('length'), bold(length));
    if (!length) { return cb(); }
    folders.forEach(elem => {
        fs.writeFile(adBundler.SRC + 'templates/partials/ads/' + elem.dir + '/custom.js', elem.bottomjs, function () {
            if (config.LOG_BUILD) {
                log(grey('CUSTOMJS'), col.bold(elem.id), col.bold('"'), col.bold(elem.advertiser), col.bold('"'), col.bold('dir:'), col(elem.dir));
            }
            if (++count === length) {
                //log(grey('CUSTOMJS'), col.bold('DONE :)'));
                cb();
            }
        });
        //delete RUNTIME_FOLDERS[elem.id].bottomjs;
        delete RUNTIME_FOLDERS[elem.id].bottomjs;
    });
}
//bundleAds 4.
function buildCSS(cb) {
    let stream = [];
    stream.add = (item) => { stream.push(item); };
    RUNTIME_FOLDERS.forEach(obj => {
        let dir = getAdDirName(obj, config);
        if (obj.bundling === ENUM_BUNDLING.STANDARD) {
            // extern
            //streamB = minifyCSS(obj).pipe(dest(adBundler.DEST + obj.dir + '/')),
            if (config.LOG_BUILD) {
                log(grey("BUILDCSS"), col.bold(obj.advertiser), grey(obj.dir));
            }
            stream.add(minifyCSS(obj).pipe(dest(adBundler.SRC + 'templates/partials/ads/' + obj.dir)));
        }
    });
    if (stream.length) { return merge2(stream); }
    cb();
}
//bundleAds 5.
function buildNissanCSS(cb) {
    let length,
        count = 0,
        nissanFolders = [],
        continueBuild = (elem) => {
            if (config.LOG_BUILD) {
                log(grey('NISSACSS'), col.bold(elem.id), col.bold('"'), col.bold(elem.advertiser), col.bold('"'), col.bold('dir:'), col(elem.dir));
            }
            if (++count === length) {
                log(grey('NISSACSS'), col.bold('DONE :)'));
                cb();
            }
        },
        //new logic here is: we allways write font file as default
        writeFontCSS = (elem, callback) => {
            let fontCSS = elem.nissan.fontCSS || '@font-face {font-family: \"nissan_bold\";src: url(\"https://storage.googleapis.com/de-public-assets/nissan/webfonts/Bold/NissanBrandW01-Bold.eot?#iefix\") format(\"embedded-opentype\"),url(\"https://storage.googleapis.com/de-public-assets/nissan/webfonts/Bold/NissanBrandW01-Bold.woff\") format(\"woff\"),url(\"https://storage.googleapis.com/de-public-assets/nissan/webfonts/Bold/NissanBrandW01-Bold.ttf\") format(\"truetype\");font-weight: normal;font-style: normal;}@font-face {font-family: \"nissan_norm\";src: url(\"https://storage.googleapis.com/de-public-assets/nissan/webfonts/Regular/NissanBrandW01-Regular.eot?#iefix\") format(\"embedded-opentype\"),url(\"https://storage.googleapis.com/de-public-assets/nissan/webfonts/Regular/NissanBrandW01-Regular.woff\") format(\"woff\"),url(\"https://storage.googleapis.com/de-public-assets/nissan/webfonts/Regular/NissanBrandW01-Regular.ttf\") format(\"truetype\");font-weight: normal;font-style: normal;}';
            //if (elem.nissan.fontCSS) {}
            fs.writeFile(adBundler.SRC + 'templates/partials/ads/' + elem.dir + '/font.min.css', fontCSS, callback);
            if (elem.nissan.fontCSS) {
                delete RUNTIME_FOLDERS[elem.id].nissan.fontCSS;
            }
        },
        writeIndexCSS = elem => {
            fs.writeFile(adBundler.SRC + 'templates/partials/ads/' + elem.dir + '/index.min.css', elem.nissan.indexCSS, function () {
                /*writeFontCSS(elem, () => {
                    continueBuild(elem);
                });*/
                elem.hasFontImport = false;
                //log(grey('NISSACSS'), col.bold(elem.id), col('hasAddress'), col.bold(elem.nissan.hasAddress), col('loadFont:'), col.bold(elem.nissan.loadFont), col('hasText:'), col.bold(elem.nissan.hasText));
                if (elem.nissan.hasAddress || (elem.nissan.loadFont && elem.nissan.hasText)) {
                    elem.nissan.hasFontImport = true;
                    log(grey('NISSACSS'), col.bold(elem.id), col('hasFontImport'), col.bold(elem.nissan.hasFontImport));
                    writeFontCSS(elem, () => {
                        continueBuild(elem);
                    });
                } else {
                    continueBuild(elem);
                }
            });
            delete RUNTIME_FOLDERS[elem.id].nissan.indexCSS;
        };
    RUNTIME_FOLDERS.forEach(elem => {
        if (elem.bundling === ENUM_BUNDLING.NISSAN) {
            nissanFolders.push(elem);
        }
    });
    length = nissanFolders.length;
    if (length === 0) { return cb(); }
    nissanFolders.forEach(writeIndexCSS);
    /*nissanFolders.forEach(elem => {
        fs.writeFile(adBundler.SRC + 'templates/partials/ads/' + elem.dir + '/index.min.css', elem.nissan.indexCSS, function () {
            writeIndexCSS(elem);
        });
        //delete RUNTIME_FOLDERS[elem.id].nissan.indexCSS;
    });*/
}
//bundleAds 6.
function buildJS(cb) {
    let stream = [];
    stream.add = (item) => { stream.push(item); };
    RUNTIME_FOLDERS.forEach(obj => {
        let dir = getAdDirName(obj, config);
        if (obj.bundling === ENUM_BUNDLING.STANDARD) {
            // extern
            //streamC = minifyJS(obj).pipe(dest(adBundler.DEST + obj.dir + '/')),
            if (config.LOG_BUILD) {
                log(grey("BUILD JS"), col.bold(obj.advertiser), grey(obj.dir));
            }
            stream.add(minifyJS(obj).pipe(dest(adBundler.SRC + 'templates/partials/ads/' + obj.dir)));
        }
    });
    return merge2(stream);
}
//bundleAds 7.
function buildNissanJS(cb) {
    let length,
        count = 0,
        nissanFolders = [];
    RUNTIME_FOLDERS.forEach(elem => {
        if (elem.bundling === ENUM_BUNDLING.NISSAN) {
            nissanFolders.push(elem);
        }
    });
    length = nissanFolders.length;
    if (length === 0) { return cb(); }
    //log(grey('CUSTOMJS'), col.bold('length'), bold(length));
    nissanFolders.forEach(elem => {
        fs.writeFile(adBundler.SRC + 'templates/partials/ads/' + elem.dir + '/index.min.js', elem.nissan.indexJS, function () {
            if (config.LOG_BUILD) {
                log(grey('NISSANJS'), col.bold(elem.id), col.bold('"'), col.bold(elem.advertiser), col.bold('"'), col.bold('dir:'), col(elem.dir));
            }
            if (++count === length) {
                log(grey('NISSANJS'), col.bold('DONE :)'));
                cb();
            }
        });
        delete RUNTIME_FOLDERS[elem.id].nissan.indexJS;
    });
}
//bundleAds 8.
function buildOthers(cb) {
    let stream = [];
    stream.add = (item) => { stream.push(item); };
    RUNTIME_FOLDERS.forEach(obj => {
        let streamA, streamB,
            dir = getAdDirName(obj, config),
            date = JSON.stringify(obj.date),
            title = obj.title,
            size = JSON.stringify(obj.size);
        // + advertiser logic goes here +
        if (obj.bundling === ENUM_BUNDLING.NISSAN) {
            if (config.LOG_BUILD) {
                log(grey('NISSAN  '), col.bold(obj.id), col(date), col.bold('"'), col.bold(obj.advertiser), col.bold('"'), col.bold(title), col.bold(size), grey('RUNTIME_FOLDERS nissan:'), col.bold(obj.nissan));
            }
            streamA = moveImagesNissan(obj, config.MINIFY_IMAGES);
            streamB = moveNissan(obj);
            stream.add(merge2(streamA, streamB));
        } else if (obj.bundling === ENUM_BUNDLING.SPECIAL) {
            if (config.LOG_BUILD) {
                log(grey('SPECIAL '), col.bold(obj.id), col(obj.date), col.bold('"'), col.bold(obj.advertiser), col.bold('"'), col.bold(title), col.bold(size));
            }
            stream.add(moveAll(obj));
        }
    });
    return merge2(stream);
}
//bundleAds 9.
function buildNunjucks(cb) {
    let stream = [];
    stream.add = (item) => { stream.push(item); };
    RUNTIME_FOLDERS.forEach(obj => {
        let streamA, streamW, streamB, streamC, streamD, json,
            dir = getAdDirName(obj, config),
            date = JSON.stringify(obj.date),
            title = obj.title,
            size = JSON.stringify(obj.size),
            split = obj.hasSplitText ? 'ad-split-text' : '',
            motion = obj.hasMotionPath ? 'MotionPathPlugin' : '';
        // + advertiser logic goes here +
        if (obj.bundling === ENUM_BUNDLING.STANDARD) {
            if (config.LOG_BUILD) {
                log(grey('NUNJUCKS'), col.bold(obj.bundling), col.bold(obj.id), col(date), col.bold('"'), col.bold(obj.advertiser), col.bold('"'), col.bold(title), col.bold(size), col.bold(split), col.bold(motion));
            }
            streamA = nunjucks(obj);
            streamB = moveImages(obj, config.MINIFY_IMAGES);
            if (obj.advertiser === ENUM_ADVERTISER.ADF || obj.advertiser === ENUM_ADVERTISER.ADFM) {
                /*json = {
                    "version": "1.0",
                    "title": obj.title,
                    "description": obj.client + ' ' + obj.bundling,
                    "width" : obj.size.width,
                    "height": obj.size.height,
                    "events": {
                        "enabled": 0
                    },
                    "clicktags": {
                        "clickTAG": "http://www.adform.com"
                    },
                    "source": "index.html"
                };
                fs.writeFile(adBundler.DEST + dir + '/manifest.json', JSON.stringify(json), function () { });*/
                streamC = writeManifestJSON(obj);
                //log(grey('NUNJUCKS'), col.bold('ADFORM'), col.bold(obj.id), col(date), col.bold('"'), col.bold(obj.advertiser), col.bold('"'), col.bold(JSON.stringify(obj)));
                stream.add(merge2(streamA, streamB, streamC));
            } else if (obj.advertiser === ENUM_ADVERTISER.FT) {
                streamC = src(adBundler.SRC_INPUT + obj.dir + '/manifest.js')
                    .pipe(dest(adBundler.DEST + dir + '/'));
                stream.add(merge2(streamA, streamB, streamC));
            } else {
                stream.add(merge2(streamA, streamB));
            }
        } else if (obj.bundling === ENUM_BUNDLING.NISSAN) {
            if (config.LOG_BUILD) {
                log(grey('NUNJUCKS'), col.bold(obj.bundling), col.bold(obj.id), col(date), col.bold('"'), col.bold(obj.advertiser), col.bold('"'), col.bold(title), col.bold(size), col.bold(split), col.bold(motion));
            }
            stream.add(nunjucksNissan(obj));
        }
    });
    return merge2(stream);
}
//bundleAds 10.
function writeLog(cb) {
    let jsonStr = JSON.stringify(RUNTIME_FOLDERS, null, '\t');
    fs.writeFile(adBundler.DEST + 'log.json', jsonStr, function () {
        log(grey('LOG DONE'), col('✔ BUNDLED '), col.bold(RUNTIME_FOLDERS.length), col('ADS TO :'), col.bold(adBundler.DEST));
        cb();
    });
}

function setFallbackInsideAdFolder(cb) {
    fallbackInsideAdFolder = true;
    cb();
}

function zip(cb) {
    let stream = src([adBundler.DEST + '*', '!' + adBundler.DEST + 'zip', '!' + adBundler.DEST + '*.*']);
    if (config.task === ENUM_TASKS.BUNDLE) {
        // leave fallbacks folder by default
        stream = src([adBundler.DEST + '*', '!' + adBundler.DEST + 'zip', '!' + adBundler.DEST + 'fallbacks', '!' + adBundler.DEST + '*.json']);
    }
    // get only folders inside directory without single files and zip folder
    return stream.pipe(zipper({ destination: adBundler.DEST_ZIP, config: config }));
        /*.pipe(zipper(adBundler.DEST + 'zip/', function (file, dest, msg) {
            log(grey.bold('testZipper file:'), col.bold(path.basename(file.path)), grey.bold('destination:'), col.bold(dest), col.bold(msg));
        }));*/
}

// standalone user prompt without gulp pipeline
function promptUserInput(cb) {
    let autostart = false,
        createConfigQuestion = {
            type: 'confirm',
            name: 'createConfig',
            message: 'Empty input folder detected! Would you like to create/update the config.json file?',
            default: true
        },
        autostartQuestion = {
            type: 'confirm',
            name: 'autostart',
            message: 'Skip questions?',
            default: true
        },
        questions = [
            {
                type: 'list',
                name: 'task',
                message: 'Choose task...',
                choices: Object.keys(ENUM_TASKS),
                pageSize: '2',
                default: ENUM_TASKS.BUILD,
                when: (answers) => {
                    return !answers.autostart;
                }
            },
            {
                type: 'confirm',
                name: 'LOG_BUILD',
                message: 'Log files to console?',
                default: false,
                when: (answers) => {
                    return !answers.autostart;
                }
            },
            {
                type: 'list',
                name: 'ADVERTISER',
                message: 'Choose advertiser...',
                choices: Object.keys(ENUM_ADVERTISER),
                pageSize: '6',
                default: 'IAB',
                when: (answers) => {
                    return !answers.autostart;
                }
            },
            {
                type: 'confirm',
                name: 'ENABLE TAXONOMY_WW',
                message: 'Choose this to enable automatic Ad naming.\n',
                default: false,
                when: (answers) => {
                    return !answers.autostart;
                }
            },
            {
                type: 'input',
                name: 'TAXONOMY_MC',
                message: 'Leave empty to keep input names or enter full taxonomy\nMcDonalds - @example:\n{DATE}_McDo-RoyalWeeks_Genf_BigMac_fr_994x250_{FORMAT}\n',
                default: '',
                when: (answers) => {
                    return !answers.autostart;
                }
            },
            {
                type: 'confirm',
                name: 'TAXONOMY_MC_FORMAT_SHORT',
                message: 'McDonalds only! Format shortcut for this bundle.',
                default: false,
                when: (answers) => {
                    return !answers.autostart && answers.TAXONOMY_NISSAN !== '' && regexCta.test(answers.TAXONOMY_NISSAN);
                }
            },
            {
                type: 'input',
                name: 'TAXONOMY_NISSAN',
                message: 'Leave empty to keep input names or enter full taxonomy\nNissan - @example:\nLeaf-ct-994x250-ALL-Campaign key visual-CampaignTagline-{CTA}-CH_DE_Q3FY191119\n',
                default: '',
                when: (answers) => {
                    return !answers.autostart && answers.TAXONOMY_MC === '';
                }
            },
            {
                type: 'checkbox',
                name: 'TAXONOMY_NISSAN_CTA',
                message: 'Nissan only! Choose all callToActions for this bundle. Leave empty if unused!',
                choices: Object.values(ENUM_NISSAN_CTA),
                pageSize: '10',
                default: '',
                /*filter: (answer) => {
                    let na = answer.map(cta => {
                        return cta.replace(regexFindBlank, "[_| ]");
                    });
                    return na;
                },*/
                when: (answers) => {
                    return !answers.autostart && answers.TAXONOMY_MC === '' && answers.TAXONOMY_NISSAN !== '' && regexCta.test(answers.TAXONOMY_NISSAN);
                }
            },
            {
                type: 'confirm',
                name: 'FALLBACK_INSIDE_FOLDER',
                message: 'Plus fallbacks inside folders?',
                default: false,
                when: (answers) => {
                    return !answers.autostart && answers.task === ENUM_TASKS.BUILD;
                }
            },
            {
                type: 'confirm',
                name: 'QUALITY_FALLBACKS_AUTO',
                message: 'Automatic fallback quality?',
                default: true,
                when: (answers) => {
                    return !answers.autostart && answers.task === ENUM_TASKS.BUILD;
                }
            },
            {
                type: 'number',
                name: 'QUALITY_FALLBACKS',
                message: 'Set quality (enter a number)',
                default: 100,
                when: (answers) => {
                    return !answers.autostart && !answers.QUALITY_FALLBACKS_AUTO && answers.task === ENUM_TASKS.BUILD;
                }
            }
        ],
        getQuestion = (name) => {
            let question, i = questions.length;
            while (--i > -1) {
                question = questions[i];
                if (question.name === name) {
                    return question;
                }
            }
            return null;
        },
        setDefaultValues = (json) => {
            config = JSON.parse(json);
            //copyFromToImmutable(json, config);
            //log("promptTest -> setDefaultValues", "json config:", config);
            let i, v, prop, value, question;
            questions.unshift(autostartQuestion);
            // set default values
            for (prop in config) {
                value = config[prop];
                question = getQuestion(prop);
                if (question) {
                    //log("promptTest -> setDefaultValues", "prop:", prop, "value:", value, "default:", question.default);
                    if (prop === 'TAXONOMY_NISSAN_CTA') {
                        value = value.map(cta => {
                            return cta.replace(regexFind_BlankPattern, ' ');
                        });
                    }
                    question.default = value;
                }
            }
        },
        handleAnswers = (answers) => {
            let prop, answer, execTaxoSize, execTaxoDate, splitTaxoSize, execTaxoLang, last, splitTaxoLang, finalTaxoSplit,
                lang = '',
                hasData = config.hasOwnProperty('date');
            // first we set actual date time to string
            config.date = JSON.parse(JSON.stringify(new Date()));
            // next check is for autostart: saving values
            if (answers.QUALITY_FALLBACKS) {
                config.QUALITY_FALLBACKS = answers.QUALITY_FALLBACKS;
            }
            // and finaly overwrite config value with existing answer values
            for (prop in answers) {
                answer = answers[prop];
                config[prop] = answer;
                log("handleAnswers", "prop:", prop, "answer:", answer, "config[prop]:", config[prop]);
            }
            // McDonalds Taxonomy
            if (config.TAXONOMY_MC && config.TAXONOMY_MC !== '') {
                config.TAXONOMY_MC_PARTS = config.TAXONOMY_MC.split('_');

                log("config.TAXONOMY_MC_PARTS:", config.TAXONOMY_MC_PARTS);
            }
            // Nissan Taxonomy
            if (config.TAXONOMY_NISSAN && config.TAXONOMY_NISSAN !== '') {
                if (config.TAXONOMY_NISSAN_CTA && config.TAXONOMY_NISSAN_CTA.length) {
                    config.TAXONOMY_NISSAN_CTA = config.TAXONOMY_NISSAN_CTA.map(cta => {
                        return cta.replace(regexFindBlank, "[_| ]");
                    });
                }
                execTaxoSize = regexSaveSize.exec(config.TAXONOMY_NISSAN);
                splitTaxoSize = config.TAXONOMY_NISSAN.split(execTaxoSize[0]);
                execTaxoLang = regexFindLang.exec(splitTaxoSize[1]);
                //log("splitTaxoSize:", splitTaxoSize);
                //log("execTaxoLang:", execTaxoLang);
                // if no language defined split after last underscore
                if (!execTaxoLang) {
                    splitTaxoLang = splitTaxoSize[1].split('_');
                    last = '_' + splitTaxoLang[splitTaxoLang.length - 1];
                    splitTaxoLang = [splitTaxoLang.slice(0, -1).join(''), last];
                    //log("splitTaxoLang:", splitTaxoLang);
                } else {
                    lang = execTaxoLang[0].toUpperCase();
                    //log("lang:", lang);
                    splitTaxoLang = splitTaxoSize[1].split(lang);
                    //log("splitTaxoLang:", splitTaxoLang);
                }
                // ["-ALL-Campaign key visual-CampaignTagline-Discover more-CH", "_Q3FY191119"]
                config.TAXONOMY_NISSAN_PARTS = [splitTaxoSize[0], splitTaxoLang[0], lang, splitTaxoLang[1]];
            }
            // make object immutable
            Object.freeze(config);
            //log("handleAnswers after prompt ->", "answers:", answers);
            //log("handleAnswers after prompt ->", "config:", config);
            fs.writeFile(adBundler.SRC_INPUT + 'config.json', JSON.stringify(config, null, '\t'), () => {
                log(grey('CONFIG  '), col((hasData ? 'UPDATED' : 'CREATED') + ' INSIDE INPUT ✔'));
                cb();
            });
        },
        // Create a self contained inquirer module if u don't
        // want sideaffects when u overwrite/add new prompt types.
        //const prompt = inquirer.createPromptModule();
        promptUser = () => {
            //ui.updateBottomBar('PROMPT USER...');
            inquirer.prompt(questions).then(handleAnswers);
        },
        start = (err, json) => {
            // no existing config.json - start user prompt
            if (err && err.code === 'ENOENT') {
                //log("promptTest", "ERROR:", err.code, "in:", err.path);
                promptUser();
            } else {
                setDefaultValues(json);
                /*log("readFile", "config.hasOwnProperty('autostart'):", config.hasOwnProperty('autostart'));
                log("readFile", "(config.autostart === true):", (config.autostart === true));
                log("readFile", "(typeof config.autostart):", (typeof config.autostart));*/
                if (config.hasOwnProperty('autostart') && config.autostart === true) {
                    cb();
                } else {
                    promptUser();
                }
            }
        },
        handleConfig = (err, json) => {
            // if directory is empty we prompt user to create config
            // after that we're out because of empty folder!!!
            if (hasEmptyDirectory) {
                inquirer.prompt(createConfigQuestion).then((answers) => {
                    if (answers.createConfig) {
                        configInsideEmptyFolder = true;
                        start(err, json);
                    } else {
                        cb();
                    }
                });
            } else {
                start(err, json);
            }

        };
    //ui.updateBottomBar('READ CONFIG JSON...');
    // try to read config
    fs.readFile(adBundler.SRC_INPUT + 'config.json', handleConfig);
}
function checkDirectory(cb) {
    fs.readdir(adBundler.SRC_INPUT, (err, files) => {
        //log(bold("checkDirectory err:"), bold(err));
        if (err) {
            hasEmptyDirectory = true;
        } else {
            let isDir, path, i = files.length;
            while (--i > -1) {
                path = files[i];
                isDir = path.substr(0, 1) !== '.' && path !== 'config.json';
                hasEmptyDirectory = !isDir;
                //log(bold("checkDirectory file hasEmptyDirectory:"), bold(hasEmptyDirectory), 'path:', bold(path));
                if (!hasEmptyDirectory) {
                    break;
                }
            }
        }
        cb();
    });
}
function startAdBundler(cb) {
    if (!hasEmptyDirectory) {
        cb();
        // at this point we return new tasks
        if (config.task === ENUM_TASKS.BUILD) {
            return buildDefault();
        } else if (config.task === ENUM_TASKS.BUNDLE) {
            return bundleDefault();
        }
    } else {
        if (configInsideEmptyFolder) {
            log(grey('START   '), col.bold('config.json AVAILABLE BUT INPUT DIRECTORY IS EMPTY! PLEASE ADD BANNER/ADS TO INPUT FOLDER? :)'));
        } else {
            log(grey('START   '), col.bold('INPUT DIRECTORY IS EMPTY! DID YOU FORGET TO ADD BANNER/ADS TO INPUT FOLDER? :)'));
        }
        cb();
    }
}

function delay1000(cb) {
    setTimeout(function () {
        cb();
    }, 1000);
}

// +++++++++++++++++++++++
// export helper series +
// +++++++++++++++++++++
const bundleAds = series(
    cleanBundle,
    read,
    checkNissanAdrress,
    readNissanData,
    buildCustomJS,
    buildCSS,
    buildNissanCSS,
    buildJS,
    buildNissanJS,
    buildOthers,
    //delay1000,
    buildNunjucks,
    writeLog
);
const bundleDefault = series(
    logVersion,
    bundleAds,
    zip,
    logTotal
);
const buildDefault = series(
    logVersion,
    bundleAds,
    cleanFallbacks,
    logFallbacks,
    fallbacksFromDest,
    moveFallbacksInside,
    zip,
    logTotal
);

// +++++++++++++++++++++++++++++
// task composition goes here +
// +++++++++++++++++++++++++++
// ++++++++++++++++++++++++++

exports.default = series(checkDirectory, promptUserInput, startAdBundler);
//exports.test = promptTest;

exports.fallbacks = series(
    logVersionFallbacks,
    cleanFallbacks,
    fallbacksFromDest,
    logTotal
);
exports.fallbacksInside = series(
    setFallbackInsideAdFolder,
    logVersionFallbacks,
    cleanFallbacksInside,
    fallbacksFromDest,
    logTotal
);
exports.cleanFallbacksInside = series(cleanFallbacksInside);
