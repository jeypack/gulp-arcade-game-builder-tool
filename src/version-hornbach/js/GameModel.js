/**
 * GameModel
 *
 * Author  : Joerg Pfeifer - pfeifer@create4web.de
 * Created : 21.04.2020
 * Modified: 13.01.2021
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
    mathAbs = Math.abs,
    mathMin = Math.min,
    p;

  /**
   * Verlet Integration
   * @returns {object} new GameModel instance
   */
  function GameModel(options) {
    // mixin EventDispatcher
    window.lib.EventDispatcher.init(this);
    //
    this.acc = [{
      x: 0,
      y: 0,
      z: 0
    }];
    this.accg = [{
      x: 0,
      y: 0,
      z: 0
    }];
    this.rota = [{
      alpha: 0,
      beta: 0,
      gamma: 0
    }];
    this.levels = (options && options.levels) ? options.levels : this.levels;
    this.sounds = (options && options.sounds) ? options.sounds : this.sounds;
    this.soundsJS = (options && options.soundsJS) ? options.soundsJS : this.soundsJS;
    this.collectedItems = (options && options.collectedItems) ? options.collectedItems : this.collectedItems;
    this.currentLevel = (options && options.currentLevel) ? options.currentLevel : this.currentLevel;
    this.isSoundOn = (options && typeof options.isSoundOn === 'boolean') ? options.isSoundOn : this.isSoundOn;
    this.levelHeight = 1920;
    this.playerModus = GameModel.PLAYER_MODUS_NORMAL;
    this.momentaryDirection = '';
    this.loop = 0;
    this.playerSpeedX = 2.5;
    this.score = (options && options.score) ? options.score : this.score;
    this.nickname = (options && options.nickname) ? options.nickname : this.nickname;
    this.life = (options && options.life) ? options.life : this.life;
    this.BESERK_TIME = (options && options.BESERK_TIME) ? options.BESERK_TIME : this.BESERK_TIME;
    this.OFFSET_TRAIN = (options && options.OFFSET_TRAIN) ? options.OFFSET_TRAIN : this.OFFSET_TRAIN;
    this.MOVE_SPEED_X = (options && options.MOVE_SPEED_X) ? options.MOVE_SPEED_X : this.MOVE_SPEED_X;
    this.DRAG_SPEED_X = (options && options.DRAG_SPEED_X) ? options.DRAG_SPEED_X : this.DRAG_SPEED_X;
    this.SCROLL_SPEED_Y = (options && options.SCROLL_SPEED_Y) ? options.SCROLL_SPEED_Y : this.SCROLL_SPEED_Y;
    this.SCROLL_SPEED_Y_MAX = (options && options.SCROLL_SPEED_Y_MAX) ? options.SCROLL_SPEED_Y_MAX : this.SCROLL_SPEED_Y_MAX;
    this.SCROLL_SPEED_ACC = (options && options.SCROLL_SPEED_ACC) ? options.SCROLL_SPEED_ACC : this.SCROLL_SPEED_ACC;
    this.SCROLL_SPEED_ACCELERATION = (options && options.SCROLL_SPEED_ACCELERATION) ? options.SCROLL_SPEED_ACCELERATION : this.SCROLL_SPEED_ACCELERATION;
    this.FRICTION_MAIN = (options && options.FRICTION_MAIN) ? options.FRICTION_MAIN : this.FRICTION_MAIN;
    this.FRICTION_KEY = (options && options.FRICTION_KEY) ? options.FRICTION_KEY : this.FRICTION_KEY;
    this.FRICTION_DEVICE = (options && options.FRICTION_DEVICE) ? options.FRICTION_DEVICE : this.FRICTION_DEVICE;
    this.ACCELERATION_KEY = (options && options.ACCELERATION_KEY) ? options.ACCELERATION_KEY : this.ACCELERATION_KEY;
    this.ACCELERATION_DEVICE = (options && options.ACCELERATION_DEVICE) ? options.ACCELERATION_DEVICE : this.ACCELERATION_DEVICE;
    this.scrollSpeedY = this.SCROLL_SPEED_Y;
    this.rectStage = new window.lib.Rectangle();
    this.rectPlayer = new window.lib.Rectangle();
    this.rectPlayerStart = new window.lib.Rectangle();
    this.rectPlayerMid = new window.lib.Rectangle();
    this.rectPlayerEnd = new window.lib.Rectangle();
  }

  // save shortcut to prototype
  p = GameModel.prototype;
  p.constructor = GameModel;

  GameModel.PLAYER_MODUS_NORMAL = 'normal';
  GameModel.PLAYER_MODUS_BESERK = 'beserk';

  // INTRO | LOAD | START | RUN | DEAD | AGAIN | FORM | HIGHSCORE |
  GameModel.STATE_INTRO = 'intro';
  GameModel.STATE_LOAD = 'load';
  GameModel.STATE_START = 'start';
  GameModel.STATE_PAUSE = 'pause';
  GameModel.STATE_RUN = 'run';
  GameModel.STATE_DEAD = 'dead';
  GameModel.STATE_AGAIN = 'again';
  GameModel.STATE_FORM = 'form';
  GameModel.STATE_HIGHSCORE = 'highscore';

  GameModel.lastTime = 0;
  GameModel.fps = 50;
  GameModel.MSPF = 1000 / GameModel.fps;
  GameModel.timeOutArr = [];
  //time based
  //timeNow = Date.now() - GameModel.lastTime,
  //this.scrollSpeedY = this.SCROLL_SPEED_Y * timeNow / GameModel.MSPF,
  //(end - start) / 3 | ((this.moveSpeedX * delta) - tempX) / 3;
  //add to last time
  //GameModel.lastTime += timeNow;
  //GameModel.timeOutArr.push(this.scrollSpeedY);

  //Global friction
  p.BESERK_TIME = 5;
  p.OFFSET_TRAIN = 5;
  p.FRICTION_MAIN = 0.96;
  p.FRICTION_KEY = 0.975;
  p.FRICTION_DEVICE = 0.975;
  p.MOVE_SPEED_X = 5;
  p.DRAG_SPEED_X = 5;
  p.SCROLL_SPEED_Y = 5;
  p.SCROLL_SPEED_Y_MAX = 7.75;
  p.SCROLL_SPEED_ACC = 0.1;
  p.SCROLL_SPEED_ACCELERATION = 0.001;
  p.ACCELERATION_KEY = 0.2;
  p.ACCELERATION_DEVICE = 0.2;

  p.x = 0;
  p.y = 0;
  p.rotationValue = 0;
  p.moveSpeedX = 0;
  p.moveX = 0;
  p.playerSpeedX = 2.5;
  p.scrollSpeedY = 0;
  p.acceleration = 0;
  p.friction = 0;
  p.direction = 0;
  p.playerStageY = 0;
  p.prevX = 0;
  p.prevY = 0;
  p.factorScale = 1;
  /* p.rectStage = new window.lib.Rectangle();
  p.rectPlayer = new window.lib.Rectangle();
  p.rectPlayerStart = new window.lib.Rectangle();
  p.rectPlayerMid = new window.lib.Rectangle();
  p.rectPlayerEnd = new window.lib.Rectangle(); */
  p.levels = [];
  p.sounds = [];
  p.soundsJS = [];
  p.collectedItems = [];
  p.currentLevel = 0;
  p.state = GameModel.STATE_INTRO;
  p.score = 0;
  p.life = 3;
  p.loop = 0;
  p.nickname = '';
  // device motion
  p.average = 10;
  p.active = true;
  p.isSoundOn = false;

  // velocity -> vx and vy properties
  Object.defineProperty(p, 'vx', {
    get: function () {
      return this.x - this.prevX;
    },
    set: function (val) {
      this.prevX = this.x - val;
    },
    enumerable: true
  });
  Object.defineProperty(p, 'vy', {
    get: function () {
      return this.y - this.prevY;
    },
    set: function (val) {
      this.prevY = this.y - val;
      //console.log("GameModel set vy", "val:", val, "prevY:", this.prevY, "y:", this.y);
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
  /**
   * angle (degrees)
   * finding the vx and vy properties with a vector's angle:
   * vx = magnitude * COS(angle);
   * vy = magnitude * SIN(angle);
   */
  Object.defineProperty(p, 'angle', {
    get: function () {
      return this.rotationValue * (PI / 180);
    },
    enumerable: true
  });

  //
  p.getHighestPeak = function (arr, key, lastOut) {
    if (lastOut) {
      return arr[arr.length - 1][key];
    }
    var i, minus, l = arr.length,
      values = [];
    // make array with values of props
    for (i = 0; i < l; i++) {
      values.push(arr[i][key]);
    }
    //
    minus = (values[l - 1] < 0);
    return minus ? mathMin.apply(null, values) : Math.max.apply(null, values);
  };
  p.setAcc = function (acceleration) {
    var acc = this.acc;
    acc.push(acceleration);
    if (acc.length > this.average) {
      acc.shift();
    }
  };
  p.setAccg = function (accelerationIncludingGravity) {
    var accg = this.accg;
    accg.push(accelerationIncludingGravity);
    if (accg.length > this.average) {
      accg.shift();
    }
  };
  p.setRota = function (rotationRate) {
    var rota = this.rota;
    rota.push(rotationRate);
    if (rota.length > this.average) {
      rota.shift();
    }
  };

  p.setX = function (val) {
    this.prevX = val - this.vx;
    this.x = val;
    this.moveX = val;
    this.rectPlayer.x = val;
    this.setRectPlayer(val, mathAbs(this.y - this.playerStageY));
  };

  p.setY = function (val) {
    this.prevY = val - this.vy;
    this.y = val;
    this.rectPlayer.y = mathAbs(val - this.playerStageY);
    this.setRectPlayer(this.x, mathAbs(val - this.playerStageY));
  };

  p.setGlobals = function (obj) {
    var key, val;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        val = obj[key];
        this[key] = val;
        //console.log("setGlobals", "key:", key, "val:", val);
      }
    }
  };

  p.setLife = function (value) {
    var life = this.life + value;
    if (life >= 0) {
      this.life = life;
    }
  };

  p.getNextLevelIndexFrom = function (index) {
    return (index + 1 < this.levels.length) ? index + 1 : 0;
  };

  p.getNextLevelIndex = function () {
    return this.getNextLevelIndexFrom(this.currentLevel);
  };

  p.checkGroundBoundaries = function () {
    /*console.log("checkGroundBoundaries", 'rectStage:', rectStage);
    console.log("checkGroundBoundaries", 'rectPlayer:', rectPlayer);*/
    //change current level index after reaching scrollTo (will change)
    if (this.y >= this.rectStage.height) {
      //nextLevel();
      return false;
    }
    return true;
  };

  p.checkPlayerBoundaries = function () {
    var rectStage = this.rectStage,
      offset = this.width / 2;
    //console.log("checkPlayerBoundaries", 'rectStage:', rectStage);
    if (this.x < offset) {
      this.x = offset;
    } else if (this.x > rectStage.width - this.width - offset) {
      this.x = rectStage.width - this.width - offset;
    }
    //console.log("checkPlayerBoundaries", 'rectPlayer:', rectPlayer);
  };

  //check player rects inside
  p.playerWallCollision = function (wall, intersection, type) {
    //collision happens on the *smallest* amount
    if (intersection.width <= intersection.height) {
      //left-side-hit
      if (wall.x < intersection.x) {
        //console.log("checkPlayerWallCollision", 'happens on x axis left');
        this.x = intersection.x + intersection.width;
      } else {
        //console.log("checkPlayerWallCollision", 'happens on x axis right');
        this.x -= intersection.width;
      }
    } else {
      this.y -= intersection.height;
    }
    if (wall.name === 'stapler-0') {
      wall.tl.pause();
      this.currentWall = wall;
    }
    return type;
  };

  p.checkPlayerWallCollision = function () {
    var i, wall, intersection, interStart, interMid, interEnd,
      level = this.levels[this.currentLevel],
      walls = level.walls,
      l = walls.length,
      rectPlayer = this.rectPlayer,
      rectPlayerStart = this.rectPlayerStart,
      rectPlayerMid = this.rectPlayerMid,
      rectPlayerEnd = this.rectPlayerEnd;

    //console.log("checkPlayerWallCollision", "x", this.x, "y", this.y, "direction", this.direction);
    /*console.log("checkPlayerWallCollision", "rectPlayer", rectPlayer);
    console.log("checkPlayerWallCollision", "rectPlayerStart", rectPlayerStart);
    console.log("checkPlayerWallCollision", "rectPlayerMid", rectPlayerMid);
    console.log("checkPlayerWallCollision", "rectPlayerEnd", rectPlayerEnd);*/
    for (i = 0; i < l; i++) {
      wall = walls[i];
      intersection = rectPlayer.getIntersection(wall);

      //if intersection happens we first check rects inside player
      if (intersection) {
        /*console.log("checkPlayerWallCollision", 'rectPlayer:', rectPlayer, 'wall:', wall);
        console.log("checkPlayerWallCollision", 'rectPlayerStart:', rectPlayerStart);
        console.log("checkPlayerWallCollision", 'rectPlayerMid:', rectPlayerMid);
        console.log("checkPlayerWallCollision", 'rectPlayerEnd:', rectPlayerEnd);*/
        //update rectangles inside player
        interStart = rectPlayerStart.getIntersection(wall);
        if (interStart) {
          //console.log("checkPlayerWallCollision", 'rectPlayer:', rectPlayer, 'interStart:', interStart);
          return this.playerWallCollision(wall, interStart, 'front');
        }
        interMid = rectPlayerMid.getIntersection(wall);
        if (interMid) {
          //console.log("checkPlayerWallCollision", 'rectPlayer:', rectPlayer, 'interMid:', interMid);
          return this.playerWallCollision(wall, interMid, 'mid');
        }
        interEnd = rectPlayerEnd.getIntersection(wall);
        if (interEnd) {
          //console.log("checkPlayerWallCollision", 'rectPlayer:', rectPlayer, 'interEnd:', interEnd);
          return this.playerWallCollision(wall, interEnd, 'end');
        }
        //this.playerWallCollision(wall, intersection);
        //console.log("checkPlayerWallCollision", 'rectPlayer:', rectPlayer, 'wall:', wall, 'intersection:', intersection);
      }
    }
    return '';
  };

  p.toString = function () {
    var timestamp = ((Date.now() - START_TIME) / 1000).toFixed(4);
    return "[ " + timestamp + " ] " + " [ x: " + this.x.toFixed(1) + ", y: " + this.y.toFixed(1) + ", rectPlayer.y: " + this.rectPlayer.y.toFixed(1) + ", life: " + this.life + ", score: " + this.score + " ]";
  };

  /**
   * Called by client application
   */
  p.update = function (delta) {};

  p.updateVerletKey = function (delta) {
    //console.log("update", "active:", this.active);
    var tempX = this.x,
      tempY = this.y;
    //moveSpeedX = this.moveSpeedX;
    //moveSpeedX = (this.moveSpeedX * delta);

    // 2. calculate player x
    //this.playerSpeedX += (moveSpeedX - this.playerSpeedX) * ((moveSpeedX !== 0) ? 0.25 : 0.75);
    /* if (moveSpeedX !== 0) {
        this.playerSpeedX += (moveSpeedX - this.playerSpeedX) * 0.25;
    } else {
        this.playerSpeedX = moveSpeedX;
    }
    this.x += this.playerSpeedX;
    */

    // 3. move
    //this.x += this.moveSpeedX;
    this.x += this.moveSpeedX * delta;
    //this.x += ((this.moveSpeedX * delta) - tempX) * 0.35;
    //this.x += (tempX - (this.moveSpeedX * delta)) / 3;
    //this.y += this.scrollSpeedY;
    // or time based
    this.y += this.scrollSpeedY * delta;

    // 4. previous position is used to calculate velocity
    this.prevX = tempX;
    this.prevY = tempY;

    // 5. calculate player rectangles
    this.setRectPlayer(this.x, mathAbs(this.y - this.playerStageY));
    //console.log("update", "x:", this.x, "y:", this.y);
    //console.log("update", "y:", this.y, "rectPlayer:", this.rectPlayer, "rectPlayerStart:", this.rectPlayerStart);
    //6. accelerate each step
    //this.scrollSpeedY += this.SCROLL_SPEED_ACCELERATION;
  };

  p.updateVerlet = function (delta) {
    var tempX = this.x,
      tempY = this.y;
    this.x += this.moveSpeedX * delta;
    this.y += this.scrollSpeedY * delta;
    //previous position is used to calculate velocity
    this.prevX = tempX;
    this.prevY = tempY;
    //calculate player rectangles
    this.setRectPlayer(this.x, mathAbs(this.y - this.playerStageY));
    //accelerate each step
    //this.scrollSpeedY += this.SCROLL_SPEED_ACCELERATION;
  };

  p.updateEuler = function (delta) {
    // 1. save previous values
    var tempX = this.x,
      tempY = this.y;
    // 2. calculate player and platform
    // 3. move
    //this.x = this.moveX;
    //this.x = this.moveX * delta;
    this.x += (this.moveX - this.prevX) * 0.075;
    this.y += this.scrollSpeedY * delta;
    // 4. previous position is used to calculate velocity
    this.prevX = tempX;
    this.prevY = tempY;
    // 5. calculate player rectangles
    this.setRectPlayer(this.x, mathAbs(this.y - this.playerStageY));
    //console.log("updateMobile", "x:", this.x, "delta:", delta);
    //6. accelerate each step
    //this.scrollSpeedY += this.SCROLL_SPEED_ACCELERATION;
  };

  p.setRectPlayer = function (x, y) {
    var offset = this.OFFSET_TRAIN;
    this.rectPlayer.x = x;
    this.rectPlayerStart.x = x;
    if (this.direction > 0) {
      //right
      this.rectPlayerMid.x = x - offset;
      this.rectPlayerEnd.x = this.rectPlayerMid.x;
    } else if (this.direction < 0) {
      //left
      this.rectPlayerMid.x = x + offset;
      this.rectPlayerEnd.x = this.rectPlayerMid.x;
    } else {
      //center (end - start) / 3
      this.rectPlayerMid.x += (x - this.rectPlayerMid.x) / 3;
      this.rectPlayerEnd.x = this.rectPlayerMid.x;
    }
    this.rectPlayer.y = y;
    this.rectPlayerStart.y = this.rectPlayer.y;
    this.rectPlayerMid.y = this.rectPlayer.y + this.rectPlayerStart.height;
    this.rectPlayerEnd.y = this.rectPlayerMid.y + this.rectPlayerMid.height;
  };

  /**
   * GroundModel extends GameModel
   * @param {object} options an optional option object
  function GameModel(options) {
      // call super constructor.
      GameModel.call(this);
  }
  // subclass extends superclass
  p = GroundModel.prototype = Object.create(GameModel.prototype);
  p.constructor = GroundModel; */

  // save GroundModel in global namespace
  // and leave abstract GameModel private
  //lib.GroundModel = GroundModel;
  lib.GameModel = GameModel;

}());
