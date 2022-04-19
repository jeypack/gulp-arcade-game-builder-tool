/**
 * Rectangle.js
 * Author: Joerg Pfeifer - pfeifer@create4web.de
 * Created : 19.04.2020
 * Modified: 13.01.2021 | 210902
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
	function Rectangle(x, y, w, h) {
		this.initialize(x, y, w, h);
	}

	// save shortcut to prototype
	var p = Rectangle.prototype;
	p.constructor = Rectangle;

	p.name = 'Rectangle';
	p.x = 0;
	p.y = 0;
	p.width = 0;
	p.height = 0;

	/**
	 * @method get bottom
	 * @return {Number} Die Summe der Eigenschaften y und height.
	 **/
	Object.defineProperty(p, 'bottom', {
		get: function () {
			return (this.y + this.height);
		},
		enumerable: true
	});
	/**
	 * @method get right
	 * @return {Number} Die Summe der Eigenschaften x und width.
	 **/
	Object.defineProperty(p, 'right', {
		get: function () {
			return (this.x + this.width);
		},
		enumerable: true
	});
	Object.defineProperty(p, 'left', {
		get: function () {
			return this.x;
		},
		enumerable: true
	});
	Object.defineProperty(p, 'top', {
		get: function () {
			return this.y;
		},
		enumerable: true
	});
	/**
	 *
	 * Die Position der rechten unteren Ecke des Rectangle-Objekts, die durch die Werte der Eigenschaften right und bottom angegeben wird.
	 * @method get bottomRight
	 * @return {Point} Der Wert true, wenn das Rectangle-Objekt den angegebenen Punkt enthält, andernfalls false.
	 **/
	Object.defineProperty(p, 'bottomRight', {
		get: function () {
			return new lib.Point(this.right, this.bottom);
		},
		enumerable: true
	});
	Object.defineProperty(p, 'bottomLeft', {
		get: function () {
			return new lib.Point(this.x, this.bottom);
		},
		enumerable: true
	});
	Object.defineProperty(p, 'topLeft', {
		get: function () {
			return new lib.Point(this.x, this.y);
		},
		enumerable: true
	});
	Object.defineProperty(p, 'topRight', {
		get: function () {
			return new lib.Point(this.right, this.y);
		},
		enumerable: true
	});
	Object.defineProperty(p, 'midCenter', {
		get: function () {
			return new lib.Point(Math.round(this.x + this.width / 2), Math.round(this.y + this.height / 2));
		},
		enumerable: true
	});

	/**
	 * Initialization method. Can also be used to reinitialize the instance.
	 * @method initialize
	 * @param {Number} [x=0] X position.
	 * @param {Number} [y=0] Y position.
	 * @param {Number} [w=0] width
	 * @param {Number} [h=0] height
	 * @return {Rectangle} This instance. Useful for chaining method calls.
	 */
	p.initialize = function (x, y, w, h) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = w || 0;
		this.height = h || 0;
		return this;
	};

	/**
	 * Returns a clone of the Rectangle instance.
	 * @method clone
	 * @return {Rectangle} a clone of the Rectangle instance.
	 **/
	p.clone = function () {
		return new Rectangle(this.x, this.y, this.width, this.height);
	};

	/**
	 * @method getIntersection
	 * @param {Rectangle} rect
	 * @return {Rectangle} A new Rectangle object
	 **/
	p.getIntersection = function (rect) {
		var x1 = rect.x,
			y1 = rect.y,
			x2 = x1 + rect.width,
			y2 = y1 + rect.height;
		if (this.x > x1) {
			x1 = this.x;
		}
		if (this.y > y1) {
			y1 = this.y;
		}
		if (this.x + this.width < x2) {
			x2 = this.x + this.width;
		}
		if (this.y + this.height < y2) {
			y2 = this.y + this.height;
		}
		return (x2 <= x1 || y2 <= y1) ? null : new Rectangle(x1, y1, x2 - x1, y2 - y1);
	};

	/**
	 * Vereinigt zwei Rechtecke miteinander, indem der vertikale und horizontale Bereich zwischen ihnen gefüllt wird, sodass ein neues Rectangle-Objekt entsteht.
	 * @method getUnion
	 * @param {Rectangle} rect
	 * @return {Rectangle} The new Rectangle object
	 **/
	p.getUnion = function (rect) {
		var a = this,
			b = rect,
			l = Math.min(a.getLeft(), b.getLeft()),
			r = Math.max(a.getRight(), b.getRight()),
			t = Math.min(a.getTop(), b.getTop()),
			c = Math.max(a.getBottom(), b.getBottom());
		return new Rectangle(l, t, r - l, c - t);
	};

	p.getVolume = function () {
		return this.width * this.height;
	};

	/**
	 * Legt fest, ob der angegebene Punkt innerhalb des rechteckigen Bereichs liegt, der durch das Rectangle-Objekt definiert ist.
	 * Funktioniert auch mit Objekten wenn x, y, width, height vorhanden sind.
	 * @method contains
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Boolean} Der Wert true, wenn das Rectangle-Objekt den angegebenen Punkt enthält, andernfalls false.
	 **/
	p.contains = function (x, y) {
		if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height) {
			return true;
		}
		return false;
	};

	/**
	 * Legt fest, ob sich das von dem Parameter „rect“ angegebene Rectangle-Objekt innerhalb dieses Rectangle-Objekts befindet.
	 * @method containsRect
	 * @param {Rectangle} rect
	 * @return {Boolean} Der Wert true, wenn das Rectangle-Objekt das angegebene Rechteck enthält, andernfalls false.
	 **/
	p.containsRect = function (rect) {
		var a = this,
			b = rect;
		if (b.x >= a.x && b.y >= a.y && (b.x + b.width) <= (a.x + a.width) && (b.y + b.height) <= (a.y + a.height)) {
			return true;
		}
		return false;
	};

	/**
	 * @method isEmpty
	 * @return {Boolean}
	 **/
	p.isEmpty = function () {
		if (this.width === 0 && this.height === 0) {
			return true;
		}
		return false;
	};

	/**
	 * Vergrößert das Rectangle-Objekt um die in Pixeln angegebenen Werte.
	 * @method inflate
	 * @param {Number} x
	 * @param {Number} y
	 **/
	p.inflate = function (x, y) {
		var a = this;
		return this.initialize(a.x - x, a.y - y, a.width + 2 * x, a.height + 2 * y);
	};

	/**
	 * Legt fest, ob sich das im Parameter „toIntersect“ angegebene Objekt mit diesem Rectangle-Objekt überschneidet.
	 * @method contains
	 * @param {Rectangle} rect
	 * @return {Boolean}
	 **/
	p.intersects = function (rect) {
		return (rect.x <= this.x + this.width && this.x <= rect.x + rect.width && rect.y <= this.y + this.height && this.y <= rect.y + rect.height);
	};

	/**
	 * Vereinigt dieses Rechteck mit einem anderen, indem der vertikale und horizontale Bereich zwischen ihnen gefüllt wird.
	 * @method contains
	 * @param {Rectangle} rect
	 * @return {Rectangle} Useful for chaining
	 **/
	p.union = function (rect) {
		var a = this,
			b = rect,
			l = Math.min(a.getLeft(), b.getLeft()),
			r = Math.max(a.getRight(), b.getRight()),
			t = Math.min(a.getTop(), b.getTop()),
			c = Math.max(a.getBottom(), b.getBottom());
		return this.initialize(l, t, r - l, c - t);
	};

	// save Rectangle in global namespace as part of lib module
	lib.Rectangle = Rectangle;

}(window));
