/**
 * GULP ZIPPER PLUGIN
 * AUTHOR: J. Pfeifer (c) 2020
 * LICENSE: GNU GENERAL PUBLIC LICENSE
*/
//const { watch, series, parallel, src, dest } = require('gulp');
const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');
const log = require('fancy-log');
const EventEmitter = require('events');
const fs = require('fs');
const PluginError = require('plugin-error');
const through = require('through2');
const path = require("path");
const zipper = require("zip-local");

const createDirectory = (dir, cb) => {
    fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
            // ignore the error if the folder already exists
            if (err.code == 'EEXIST') {
                cb(null);
            } else {
                // something else went wrong
                cb(err);
            }
        } else {
            // successfully created folder
            cb(null);
        }
    });
};

// see 'Writing a plugin'
  // https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
module.exports = (opts, callback) => {
    let destination = opts.destination;
    //log(bold('gulp-zipper module.exports destination:'), bold(destination));
    const errorEmitter = new EventEmitter();
    
    if (!destination || !destination.length || typeof destination !== 'string') {
        errorEmitter.emit('error', new PluginError('gulp-zipper', { message: "Param 'destination' has to be type of string" }));
    }
    if (callback && typeof callback !== 'function') {
        errorEmitter.emit('error', new PluginError('gulp-zipper', { message: "Param 'callback' has to be type of function" }));
    }
    
    // 
    let countFiles = 0,
        // encoding could be e.g. utf8
        handleFile = function (file, encoding, next) {
            let that = this,
                //isDirectory = file.isNull(),
                parseObj = path.parse(file.path),
                handle = function (f, p) {
                    //log(bold('gulp-zipper handle:'), bold(p.base));
                    if (f) {
                        that.push(f);
                    }
                    if (callback) {
                        callback(f, destination, p ? ' saved successfully !' : 'save failed !');
                    }
                    next();
                };
            //log(bold('gulp-zipper file'), 'dir:', bold(isDirectory), 'root:', bold(parseObj.root), 'base:', bold(parseObj.base), 'name:', bold(parseObj.name), 'ext:', bold(parseObj.ext));
            if (file.isStream()) {
                that.emit('error', new PluginError('gulp-zipper', { message: 'Streaming not supported' }));
                //log(bold('gulp-zipper' + 'file.isStream'));
                return next();
            }
            
            // create directory even if it does not exists
            createDirectory(destination, (err) => {
                if (!err) {
                    // try zipping a file
                    try {
                        //log(bold('gulp-zipper createDirectory file.path:'), bold(file.path));
                        zipper.zip(file.path, function (error, zipped) {
                            //log(bold('gulp-zipper zipper.zip'), bold(error), bold(zipped));
                            if (!error) {
                                // compress before exporting
                                zipped.compress();
                                // get the zipped file as a Buffer
                                //let buff = zipped.memory();
                                // or save the zipped file to disk
                                zipped.save(destination + parseObj.base + ".zip", function (error) {
                                    if (!error) {
                                        countFiles++;
                                        handle(file, parseObj);
                                    } else {
                                        handle(null, parseObj);
                                    }
                                });
                            }
                        });
                    } catch(err) {
                        log(redBright('Unable to zip file/directory:'), redBright.bold(parseObj.base));
                        handle(null, parseObj);
                    }
                } else {
                    that.emit('error', new PluginError('gulp-zipper', { message: err }));
                    return next();
                }
            });
            
        };
    
    // processing non-binary streams
    return through.obj(handleFile, (cb) => {
        zipper.zip(destination, function (error, zipped) {
            //log(bold('gulp-zipper zipper.zip'), bold(error), bold(zipped));
            if (!error) {
                // compress before exporting
                zipped.compress();
                let jsonStr = JSON.stringify([{ date: new Date() }]),
                    json = JSON.parse(jsonStr),
                    stamp = json[0].date;
                // or save the zipped file to disk
                zipped.save(destination + opts.config.ADVERTISER + "-AD-BUNDLE-" + stamp + ".zip", function (error) {
                    if (!callback) {
                        //log(greenBright('gulp-zipper ' + countFiles + ' files/directories successfully zipped!'));
                        log(grey('ZIPPER   '), red(' ✔ '), red.bold(countFiles + ' files/directories successfully zipped :)'));
                    }
                    cb();
                });
            }
        });
    });
};