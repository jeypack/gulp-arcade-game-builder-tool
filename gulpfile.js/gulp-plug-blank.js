/**
 * GULP PLUGIN TEMPLATE
 * AUTHOR: J. Pfeifer (c) 2020
 * LICENSE: GNU GENERAL PUBLIC LICENSE
*/
//const { watch, series, parallel, src, dest } = require('gulp');
const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');
const log = require('fancy-log');
const EventEmitter = require('events');
const fs = require('fs');
const filesize = require('filesize');
const path = require("path");
const PluginError = require('plugin-error');
const through = require('through2');

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
const imageExtensions = '.jpg.jpeg.png.svg.pdf.json';

// see 'Writing a plugin'
  // https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
exports.make = (destination, pathToJson, callback) => {
    
    const errorEmitter = new EventEmitter();
    
    if (!pathToJson && !destination) {
        errorEmitter.emit('error', new PluginError('gulp-ad-nfo', { message: "You need at least 'destination' or 'pathToJson'" }));
    }
    if (pathToJson && (!pathToJson.length || typeof pathToJson !== 'string')) {
        errorEmitter.emit('error', new PluginError('gulp-ad-nfo', { message: "Param 'pathToJson' has to be type of string" }));
    }
    if (destination && (!destination.length || typeof destination !== 'string')) {
        errorEmitter.emit('error', new PluginError('gulp-ad-nfo', { message: "Param 'destination' has to be type of string" }));
    }
    if (callback && typeof callback !== 'function') {
        errorEmitter.emit('error', new PluginError('gulp-ad-nfo', { message: "Param 'callback' has to be type of function" }));
    }
    //log(redBright('pathToJson:'), redBright.bold(pathToJson));
    //log(redBright('destination:'), redBright.bold(destination));
    // 
    let UID = 0,
        totalSize = 0,
        temp = [],
        getFolderObj = (folder) => {
            let item, i = temp.length;
            while (--i > -1) {
                item = temp[i];
                if (item.folder && item.folder === folder) {
                    return item;
                }
            }
            return null;
        },
        // encoding could be e.g. utf8
        handleFile = function (file, encoding, next) {
            let stats, fsize, nsize,
                that = this,
                parseObj = path.parse(file.path),
                isIndex = parseObj.name === 'index',
                isImage = (!isIndex && imageExtensions.indexOf(parseObj.ext) > -1),
                segments = parseObj.dir.split('/'),
                folder = isIndex ? segments[segments.length - 1] : segments[segments.length - 2],
                folderObj = getFolderObj(folder),
                handle = (f, p) => {
                    //log(bold('gulp-ad-nfo handle:'), bold(p.base));
                    if (f) {
                        that.push(f);
                    }
                    if (callback) {
                        //callback(f, destination, p ? ' saved successfully !' : 'save failed !');
                        callback(f, destination);
                    }
                    next();
                };
            
            if (file.isStream()) {
                that.emit('error', new PluginError('gulp-ad-nfo', { message: 'Streaming not supported' }));
                //log(bold('gulp-ad-nfo' + 'file.isStream'));
                return next();
            }
            
            // create folder object once
            if (!folderObj) {
                folderObj = { id: UID++, folder: folder, weight: { html: 0, images: 0, maxImages: 0 } };
                temp.push(folderObj);
                //log(cyan('logTotal tap folderObj:'), cyan.bold(JSON.stringify(folderObj.weight)), 'folder:', bold(folder), 'isIndex:', bold(isIndex));
            }
            
            if (isIndex || isImage) {
                fs.stat(file.path, (err, stats) => {
                    if (!err) {
                        // the size is in KB, not MB; stats.size gives bytes
                        // filesize(stats.size, {round: 0}) give KB
                        // if you have stats.size 218871 it makes filesize(stats.size, {round: 0}) = '214 KB'
                        fsize = filesize(stats.size, { round: 2 });
                        nsize = parseFloat(stats.size / 1024, 10);
                        if (isIndex) {
                            folderObj.weight.html = parseFloat(nsize.toFixed(2), 10);
                        } else {
                            folderObj.weight.maxImages++;
                            folderObj.weight.images += parseFloat(nsize.toFixed(2), 10);
                        }
                        handle(file, parseObj);
                    } else {
                        handle(null, parseObj);
                    }
                    totalSize += nsize;
                });
            } else {
                log(redBright('NO IMAGE OR INDEX.HTML FILE:'), redBright.bold(parseObj.base));
                handle(null, parseObj);
            }
            //log(bold('gulp-ad-nfo file'), 'dir:', bold(isDirectory), 'root:', bold(parseObj.root), 'base:', bold(parseObj.base), 'name:', bold(parseObj.name), 'ext:', bold(parseObj.ext));
        };
    
    // processing non-binary streams
    return through.obj(handleFile, (cb) => {
        //let jsonStr = JSON.stringify(temp, null, '\t');
        //fs.writeFile(destination + 'log-weight.json', jsonStr, cb);
        cb();
    });
};