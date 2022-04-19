const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');
const col = red;
const fs = require('fs');
const filesize = require('filesize');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const through = require('through2');
const webshot = require('webshot');
const path = require("path");
const connect = require("connect");
const serveStatic = require('serve-static');
const url = require('url');

// through2 webshot connect serve-static url
exports.make = (opt) => {
    
    if (!opt) { opt = {}; }
    
    opt.p = opt.p || 9000;
    opt.streamType = opt.streamType || 'jpg';
    
    if (!opt.screenSize) {
        opt.screenSize = {
            width: 1440,
            height: 900
        };
    }
    //log(white('gulp-webshot-egp opt.dest: ' + opt.dest));
    if (!opt.dest) {
        opt.dest = 'fallbacks/';
    }
    //log(white('gulp-webshot-egp opt.dest: ' + opt.dest));
    
    if (!opt.basePathNames) {
        opt.basePathNames = false;
    }
    
    if (!opt.insideFolder) {
        opt.insideFolder = false;
    }
    
    let server,
        counter = 0,
        app = connect(),
        resolvedRoot = path.resolve(opt.root),
        getSizeFromName = (name) => {
            const regex = /([0-9]+)x([0-9]+)/;
            let size = regex.exec(name);
            try {
                return { index: size.index, raw: size[0], name: size.input, width: parseInt(size[1], 10), height: parseInt(size[2], 10) };
            } catch (e) {}
            return { index: -1, raw: '1440x900', name: name, width: 1440, height: 900 }
        },
        getDynQuality = size => {
            if (opt.autoQuality) {
                if (size.width <= 320 && size.height <= 250) {
                    return 75;
                } else if (size.width <= 160 && size.height <= 600) {
                    return 85;
                } else if (size.width > 728 && size.height > 90) {
                    return 48;
                } else if (size.width >= 300 && size.height === 600) {
                    return 75;
                }
            }
            return opt.quality;
        };
    
    //log(bold('Quality: '), bold(opt.quality));
    app.use(serveStatic(resolvedRoot));
    server = app.listen(opt.p);
    
    return through.obj(function (file, enc, next) {
        let pathArr, baseIndex, basepath, parsep, name, filename, relativeFilePath, urlPath, size;
        counter++;
        if (!opt.root) {
            this.emit('error', new PluginError('gulp-webshot-egp', 'Please root directory'));
            log(redBright('Please root directory root: "build" '));
            return next();
        }

        if (!opt.shotSize) {
            opt.shotSize = { width: 1440, height: 900 };
        }

        if (file.isNull()) {
            this.push(file);
            return next();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-webshot-egp', 'Streaming not supported'));
            return next();
        }

        if (opt.root) {
            pathArr = path.dirname(file.path).split(path.sep);
            baseIndex = pathArr.indexOf(opt.root);
            basepath = path.relative(opt.root, path.dirname(file.path));
        }

        parsep = path.basename(file.relative);
        name = path.basename(file.relative, '.html');
        filename = path.join(basepath, name + '.' + opt.streamType);
        
        if (opt.filename) {
            if (opt.basePathNames) {
                opt.filename = basepath;
            }
            if (opt.getSizeFromFolderName) {
                size = getSizeFromName(basepath);
                //log('gulp-webshot size:', size.raw, 'width:', size.width, 'height:', size.height);
                opt.screenSize.width = opt.shotSize.width = size.width;
                opt.screenSize.height = opt.shotSize.height = size.height;
                //log('gulp-webshot opt.screenSize:', opt.screenSize, 'opt.shotSize:', opt.shotSize);
            }
            // full size or simple keeping fallbacks small
            opt.quality = getDynQuality(size);
            
            filename = opt.filename + '.' + opt.streamType;
        }
        if (opt.flatten) {
            separator = /[._-a-zA-Z0-9]+/.test(opt.flatten) ? opt.flatten : '__';
            filename = filename.replace(/\//g, separator);
        }
        // 
        relativeFilePath = path.join(path.sep, basepath, parsep);
        urlPath = url.resolve('http://localhost:' + opt.p, relativeFilePath);
        // opt.dest with ending slash
        if (opt.insideFolder) {
            filename = path.join(opt.dest + basepath + '/', filename);
        } else if (!opt.insideFallbackFolder) {
            filename = path.join(opt.dest, filename);
        } else if (opt.basePathNames) {
            filename = path.join(opt.dest + 'fallbacks/', filename);
        } else {
            filename = path.join(opt.dest, filename);
        }
        //filename = (opt.basePathNames) ? path.join(opt.dest + 'fallbacks/', filename) : path.join(opt.dest, filename);
        //log(grey('FALLBACK'), col(basepath), grey.bold(filename));
        
        webshot(urlPath, filename, opt, function (err, stream) {
            if (err) {
                this.emit('error', new PluginError('gulp-webshot', err));
                server.close();
            } else {
                let stats = fs.statSync(filename),
                    fileSizeInKb = filesize(stats.size, { round: 0 });
                log(grey('FALLBACK'), col(' ✔ '), col.bold(counter), col(basepath), dim.grey(' ('), grey.bold(fileSizeInKb), grey('- quality:'), grey(opt.quality), dim.grey(') '));
                //log(grey('FALLBACK'), (filename.split('.')[0] + 'fallback.jpg'));
                next();
            }
        }.bind(this));

        this.push(file);

    }, function (done) {

        server.close(function () {
            log(grey('FALLBACK'), col.bold('==== DONE FALLBACKS :)'));
            //log(grey('FALLBACK'), JSON.stringify(opt.data, null, '\t'));
            done();
        });

    });
};