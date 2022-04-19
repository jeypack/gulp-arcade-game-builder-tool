/**
 * This is a very small, fully-functional JavaScript enum implementation.
 * Enum: prepare a 'self' object to return, so we work with an object instead of a function
 * @private
 * @since 2020-01-28
 * @version 1.0.0
 * @author J. Pfeifer - inspired by Kyli Rouge of Blue Husky Studios
 * @property Enum
 * @params {Array} ...rest args
 * @example let days = Enum("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
 *          Later: case days.Monday: return "That's a hard one...";
 *          An array of all values in your enum:    days.all
 *          An array of all keys in your enum:      days.keys
 *          The length of your enum:                days.length
*/
const Enum = (...rest) => {
    let i, l = rest.length,
        self = { all : [], keys : rest, length: l };
    // for all enum names given
    for (i = 0; i < rest.length; i++) {
        self[rest[i]] = i; // set the index as object property
        self.all[i] = i;     // add the index to the list of all indices
    }
    return Object.freeze(self);
};
module.exports.Enum = Enum;

const EnumString = (...rest) => {
    let i, key, l = rest.length,
        self = { keys : rest, length: l };
    // for all enum names given
    for (i = 0; i < rest.length; i++) {
        key = rest[i];
        self[key] = key; // set the key as object property
    }
    return Object.freeze(self);
};
module.exports.EnumString = EnumString;

/**
* STATIC ENUM
* @private
* @property ENUM_ADVERTISER
*/
const ENUM_ADVERTISER = {
    UNKNOWN: 'UNKNOWN',
    IAB: 'IAB',
    SIZMEK: 'SIZMEK',
    ADF: 'ADF',
    ADFM: 'ADFM',
    GDN: 'GDN',
    DCM: 'DCM',
    DCS: 'DCS',
    ADW: 'ADW',
    LR: 'LR',
    ATLAS: 'ATLAS',
    FT: 'FT',
    APPNEXUS: 'APPNEXUS'
};
module.exports.ENUM_ADVERTISER = ENUM_ADVERTISER;

/**
* STATIC ENUM
* @private
* @property ENUM_BUNDLING
*/
const ENUM_BUNDLING = {
    STANDARD: 'STANDARD',
    SPECIAL: 'SPECIAL',
    NISSAN: 'NISSAN'
};
module.exports.ENUM_BUNDLING = ENUM_BUNDLING;