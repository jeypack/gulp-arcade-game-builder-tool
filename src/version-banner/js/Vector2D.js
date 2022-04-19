/**
 * Vector2D.js : Math -> Vector
 * Author  : Joerg Pfeifer - pfeifer@create4web.de
 * Created : 28.12.2017
 * Modified: 04.01.2018 | 13.01.2021
 */
(function () {

  'use strict';

  if (!window.lib) {
    window.lib = {};
  }

  // save shortcut to prototype
  var START_TIME = Date.now(),
    SQRT = Math.sqrt,
    ATAN2 = Math.atan2,
    SIN = Math.sin,
    COS = Math.cos,
    PI = Math.PI,
    p;

  /**
   *
   * @param {Number} [startX=0]
   * @param {Number} [startY=0]
   * @param {Number} [endX=0]
   * @param {Number} [endY=0]
   * @param {Number} [newVX=0]
   * @param {Number} [newVY=0]
   */
  function Vector(startX, startY, endX, endY, newVX, newVY) {
    this.privateA = {
      x: 0,
      y: 0
    };
    this.privateB = {
      x: 0,
      y: 0
    };
    this.privateVX = 0;
    this.privateVY = 0;
    this.update(startX, startY, endX, endY, newVX, newVY);
  }

  // save shortcut to prototype
  p = Vector.prototype;
  p.constructor = Vector;

  p.name = 'Vector2D';

  Object.defineProperty(p, 'a', {
    get: function () {
      return this.privateA;
    },
    enumerable: true
  });
  Object.defineProperty(p, 'b', {
    get: function () {
      return this.privateB;
    },
    enumerable: true
  });
  // velocity -> vx and vy properties
  Object.defineProperty(p, 'vx', {
    get: function () {
      if (this.privateVX === 0) {
        return this.b.x - this.a.x;
      }
      return this.privateVX;
    },
    enumerable: true
  });
  Object.defineProperty(p, 'vy', {
    get: function () {
      if (this.privateVY === 0) {
        return this.b.y - this.a.y;
      }
      return this.privateVY;
    },
    enumerable: true
  });
  //magnitude (length)
  Object.defineProperty(p, 'm', {
    get: function () {
      if (this.vx !== 0 || this.vy !== 0) {
        return SQRT(this.vx * this.vx + this.vy * this.vy);
      } else {
        return 0.001;
      }
    },
    enumerable: true
  });
  //left normal
  Object.defineProperty(p, 'ln', {
    get: function () {
      var ln = new Vector();
      if (this.privateVX === 0 && this.privateVY === 0) {
        ln.update(this.a.x, this.a.y, (this.a.x + this.lx), (this.a.y + this.ly));
      } else {
        ln.update(0, 0, 0, 0, this.vx, this.vy);
      }
      return ln;
    },
    enumerable: true
  });
  //right normal
  Object.defineProperty(p, 'rn', {
    get: function () {
      var rn = new Vector();
      if (this.privateVX === 0 && this.privateVY === 0) {
        rn.update(this.a.x, this.a.y, (this.a.x + this.rx), (this.a.y + this.ry));
      } else {
        rn.update(0, 0, 0, 0, this.vx, this.vy);
      }
      return rn;
    },
    enumerable: true
  });
  // right normal x component
  Object.defineProperty(p, 'rx', {
    get: function () {
      return -this.vy;
    },
    enumerable: true
  });
  // right normal y component
  Object.defineProperty(p, 'ry', {
    get: function () {
      return this.vx;
    },
    enumerable: true
  });
  // left normal x component
  Object.defineProperty(p, 'lx', {
    get: function () {
      return this.vy;
    },
    enumerable: true
  });
  // left normal y component
  Object.defineProperty(p, 'ly', {
    get: function () {
      return -this.vx;
    },
    enumerable: true
  });
  /**
   * Normalized vector
   * The code needs to make sure that
   * the length value isn't zero to avoid
   * returning NaN
   */
  Object.defineProperty(p, 'dx', {
    get: function () {
      if (this.m !== 0) {
        return this.vx / this.m;
      } else {
        return 0.001;
      }
    },
    enumerable: true
  });
  //
  Object.defineProperty(p, 'dy', {
    get: function () {
      if (this.m !== 0) {
        return this.vy / this.m;
      } else {
        return 0.001;
      }
    },
    enumerable: true
  });
  /**
   * angle (degrees)
   * finding the vx and vy properties with a vector's angle:
   * vx = magnitude * Math.cos(angle);
   * vy = magnitude * Math.sin(angle);
   */
  Object.defineProperty(p, 'radians', {
    get: function () {
      return ATAN2(this.vy, this.vx);
    },
    enumerable: true
  });
  /**
   * angle (degrees)
   * finding the vx and vy properties with a vector's angle:
   * vx = magnitude * Math.cos(angle);
   * vy = magnitude * Math.sin(angle);
   */
  Object.defineProperty(p, 'angle', {
    get: function () {
      return this.radians * 180 / PI;
    },
    enumerable: true
  });

  /**
   * Initialization method. Can also be used to reinitialize the instance.
   * @method update
   * @param {Number} [startX=0]
   * @param {Number} [startY=0]
   * @param {Number} [endX=0]
   * @param {Number} [endY=0]
   * @param {Number} [newVX=0]
   * @param {Number} [newVY=0]
   * @return {Vector} This instance. Useful for chaining method calls.
   */
  p.update = function (startX, startY, endX, endY, newVX, newVY) {
    startX = startX || 0;
    startY = startY || 0;
    endX = endX || 0;
    endY = endY || 0;
    newVX = newVX || 0;
    newVY = newVY || 0;
    //console.log("update : ", startX, startY, endX, endY, newVX, newVY);
    if (newVX === 0 && newVY === 0) {
      this.privateA.x = startX;
      this.privateA.y = startY;
      this.privateB.x = endX;
      this.privateB.y = endY;
    } else {
      this.privateVX = newVX;
      this.privateVY = newVY;
    }
    return this;
  };

  p.toString = function () {
    var timestamp = ((Date.now() - START_TIME) / 1000).toFixed(4);
    return "[ " + timestamp + " ] " + " [ a.x: " + this.a.x.toFixed(1) + ", a.y: " + this.a.y.toFixed(1) + ", b.x: " + this.b.x.toFixed(1) + ", b.y: " + this.b.y.toFixed(1) + ", vx: " + this.vx.toFixed(3) + ", vy: " + this.vy.toFixed(3) + ", m: " + this.m.toFixed(3) + ", dx: " + this.dx.toFixed(3) + ", dy: " + this.dy.toFixed(3) + " ]";
  };

  /**
   * Returns a clone of the Vector instance.
   * @method clone
   * @return {Vector} a clone of the Vector instance.
   **/
  p.clone = function () {
    return new Vector(this.a.x, this.a.y, this.b.x, this.b.y);
  };

  p.getMidVector = function () {
    if (this.a.x === 0 && this.a.y === 0 && this.b.x === 0 && this.b.y === 0) {
      return null;
    }
    var d = Vector.distance(this.a.x, this.a.y, this.b.x, this.b.y) / 2,
      nvx = this.a.x + this.dx * d,
      nvy = this.a.y + this.dy * d;
    return new Vector(nvx, nvy, this.b.x, this.b.y);
  };

  p.normalize = function () {
    return this.update(0, 0, 0, 0, this.dx, this.dy);
  };

  /**
   * angle (degrees)
   * finding the vx and vy properties with a vector's angle:
   * vx = magnitude * Math.cos(angle);
   * vy = magnitude * Math.sin(angle);
   */
  Vector.getVectorFromAngle = function (angle, magnitude) {
    var v = new Vector(),
      m = magnitude || 1.0;
    return v.update(0, 0, 0, 0, m * COS(angle), m * SIN(angle));
  };

  /**
   * Find the distance between two points
   * @param   {number} ax start x
   * @param   {number} ay start y
   * @param   {number} bx end x
   * @param   {number} by end y
   * @returns {number} The new vector's magnitude
   */
  Vector.distance = function (ax, ay, bx, by) {
    var v = new Vector(ax, ay, bx, by);
    return v.m;
  };

  /**
   * Finding the dot product:
   * the first vector is multiplied by the second vector's normalized unit vector.
   * @param   {object} v1 The first vector
   * @param   {object} v2 The second vector
   * @returns {number} A positive number if the vectors are pointing in the same direction.
   */
  Vector.dotProduct = function (v1, v2) {
    return v1.vx * v2.dx + v1.vy * v2.dy;
  };
  // and this is non scaled version
  Vector.dotProduct2 = function (v1, v2) {
    return v1.vx * v2.vx + v1.vy * v2.vy;
  };

  /**
   * The same as finding the dot product, except instead of using v1 we use v1's normal.
   * @param   {object} v1 The first vector
   * @param   {object} v2 The second vector
   * @returns {number} The perpendicular dot product
   */
  Vector.perpProduct = function (v1, v2) {
    var perpProduct = v1.ln.vx * v2.dx + v1.ln.vy * v2.dy;
    //You can calculate the same result using
    //the vectors' vx and vy like this:
    //var perpProduct = v1.vx * v2.vy - v1.vy * v2.vx;
    if (perpProduct !== 0) {
      return perpProduct;
    }
    return 1;
  };

  /**
   * Find the ratio between the perpProducts of v1 and v2
   * This helps to find the intersection point
   * @param   {object} v1 The first vector
   * @param   {object} v2 The second vector
   * @returns {number} ratio
   */
  Vector.ratio = function (v1, v2) {
    var v3, ratio;
    //Make sure that the vectors aren't parallel
    if ((v1.dx === v2.dx && v1.dy === v2.dy) || (v1.dx === -v2.dx && v1.dy === -v2.dy)) {
      return 1;
    }
    //Make sure that neither vector has a length of zero
    if ((v1.m === 0 || v2.m === 0)) {
      return 1;
    }
    //Create a third vector between
    //the start points of vectors one and two
    //to help find the interection point
    v3 = new Vector();
    v3.update(v1.a.x, v1.a.y, v2.a.x, v2.a.y);

    return Vector.perpProduct(v3, v2) / Vector.perpProduct(v1, v2);
  };

  /**
   * Calculate a collision force vector
   * @param   {object} v1 The first vector
   * @param   {object} v2 The second vector
   * @returns {object} The new collision vector
   */
  Vector.collisionForce = function (v1, v2) {
    var t = Vector.ratio(v1, v2),
      intersectionX = v1.a.x + v1.vx * t,
      intersectionY = v1.a.y + v1.vy * t,
      //Calculate the force of the impact (collision vector)
      collisionForceVx = v1.a.x + v1.vx - intersectionX,
      collisionForceVy = v1.a.y + v1.vy - intersectionY,
      //Create a collision force Vector to return to the caller
      collisionVector = new Vector(0, 0, 0, 0, collisionForceVx, collisionForceVy);
    return collisionVector;
  };

  /**
   * Calculate a projection
   * @param   {object} v1 The first vector
   * @param   {object} v2 The second vector
   * @returns {object} The projection vector
   */
  Vector.project = function (v1, v2) {
    //Find the dot product between v1 and v2
    var dp1 = Vector.dotProduct(v1, v2),
      //Find the projection of v1 onto v2
      vx = dp1 * v2.dx,
      vy = dp1 * v2.dy,
      //Add start and end points, if they exist
      aX = 0,
      aY = 0,
      bX = 0,
      bY = 0,
      //Create a projection Vector to return to the caller
      projectionVector = new Vector();

    if (v2.a.x !== 0 && v2.a.y !== 0) {
      aX = v2.a.x;
      aY = v2.a.y;
      bX = v2.a.x + vx;
      bY = v2.a.y + vy;
      projectionVector.update(aX, aY, bX, bY);
    } else {
      projectionVector.update(0, 0, 0, 0, vx, vy);
    }
    return projectionVector;
  };

  Vector.bounce = function (v1, v2) {
    //Find the projection onto v2
    var p1 = Vector.project(v1, v2),
      //Find the projection onto v2's normal
      p2 = Vector.project(v1, v2.ln),
      //Calculate the bounce vector by adding up the projections
      //and reversing the projection onto the normal
      bounceVX = p1.vx + (p2.vx * -1),
      bounceVY = p1.vy + (p2.vy * -1),
      //Create a bounce VectorModel to return to the caller
      bounceVector = new Vector(0, 0, 0, 0, bounceVX, bounceVY);
    // bounce2
    //bounceVX = p1.vx + p2.vx;
    //bounceVY = p1.vy + p2.vy;
    return bounceVector;
  };

  Vector.findIntersection = function (v1, v2) {
    //Find out if the vectors are paralell
    if ((v1.dx === v2.dx && v1.dy === v2.dy) || (v1.dx === -v2.dx && v1.dy === -v2.dy)) {
      return 1;
    } else {
      //Create two new vectors between the
      //start points of vectors 1 and 2
      var v3 = new Vector(v1.a.x, v1.a.y, v2.a.x, v2.a.y),
        v4 = new Vector(v2.a.x, v2.a.y, v1.a.x, v1.a.y),
        t1 = Vector.perpProduct(v3, v2) / Vector.perpProduct(v1, v2),
        t2 = Vector.perpProduct(v4, v1) / Vector.perpProduct(v2, v1);
      if (t1 > 0 && t1 <= 1 && t2 > 0 && t2 <= 1) {
        return t1;
      } else {
        return 1;
      }
    }
  };

  /*function mixinVector(obj) {

  }*/

  // save Vector in global namespace
  lib.Vector = Vector;

}());
