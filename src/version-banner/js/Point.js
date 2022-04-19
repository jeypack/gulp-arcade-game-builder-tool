/**
 * Point.js
 * Author: Joerg Pfeifer - pfeifer@create4web.de
 * Created : 19.04.2020
 * Modified: 13.01.2021
 */
(function (window) {

  'use strict';

  if (!window.lib) {
    window.lib = {};
  }

  /**
   * Represents a point on a 2 dimensional x / y coordinate system.
   * @param {Number} [x=0] X position.
   * @param {Number} [y=0] Y position.
   */
  function Point(x, y) {
    this.initialize(x, y);
  }

  // save shortcut to prototype
  var p = Point.prototype;
  p.constructor = Point;

  p.x = 0;
  p.y = 0;

  /**
   * Initialization method. Can also be used to reinitialize the instance.
   * @method initialize
   * @param {Number} [x=0] X position.
   * @param {Number} [y=0] Y position.
   * @return {Point} This instance. Useful for chaining method calls.
   */
  p.initialize = function (x, y) {
    this.x = !x ? 0 : x;
    this.y = !y ? 0 : y;
    return this;
  };

  /**
   * Returns a clone of the Point instance.
   * @method clone
   * @return {Point} a clone of the Point instance.
   **/
  p.clone = function () {
    return new Point(this.x, this.y);
  };

  /**
   * Returns the distance between to given points.
   * @method STATIC distance
   * @param {Point} p1
   * @param {Point} p2
   * @return {Number} the distance between p1 and p2.
   **/
  Point.distance = function (p1, p2) {
    var xs = p2.x - p1.x,
      ys = p2.y - p1.y;
    xs = xs * xs;
    ys = ys * ys;
    return Math.sqrt(xs + ys);
  };

  // save Point in global namespace as part of lib module
  lib.Point = Point;

}(window));
