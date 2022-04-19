//const log = require('fancy-log');
//const { bold, dim, cyan, blue, red, green, magenta, grey, white, redBright, cyanBright, greenBright, blueBright, bgMagenta } = require('ansi-colors');

// DYNAMIC CONTENT EXPORT
const game = require('./arcade-game.js');
const banner = require('./arcade-banner.js');
exports.default = game.default;
exports.build = game.build;
exports.clean = game.clean;
exports.banner = banner.default;
exports.bannerbuild = banner.build;
