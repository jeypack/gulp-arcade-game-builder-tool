/**
 * GameController
 *
 * Author  : Joerg Pfeifer - pfeifer@create4web.de
 * Created : 22.04.2020
 * Modified:
 */
(function () {

  'use strict';

  var p,
    mathMin = Math.min,
    mathAbs = Math.abs;

  if (!window.lib) {
    window.lib = {};
  }

  /**
   * Abstract GameController prototype
   * @param {object} model A model for MVC
   */
  function GameController(name, model) {
    this.name = name;
    this.model = model;
    this.operatingSystem = GameController.getMobileOperatingSystem();
    // mixin EventDispatcher
    window.lib.EventDispatcher.init(this);
  }

  // save shortcut to prototype
  p = GameController.prototype;

  p.model = null;
  p.name = 'GameController';

  /**
   * Determine the mobile operating system.
   * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
   *
   * @returns {String}
   */
  GameController.getMobileOperatingSystem = function () {

    var userAgent = navigator.userAgent || navigator.vendor || window.opera,
      getIOSVersion = function (ua) {
        var regexOS = /iPhone OS ([0-9]+)/,
          version = regexOS.exec(ua);
        //console.log(version);
        return (version && version.length > 1) ? parseInt(version[1]) : 'iOS';
      };
    GameController.flag = 0;
    //
    try {
      document.createEvent("TouchEvent");
      GameController.flag = 1;
    } catch (e) {
      if (window.navigator.pointerEnabled) {
        GameController.flag = 2;
      } else if (window.navigator.msPointerEnabled) {
        GameController.flag = 3;
      }
    }
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
      return "Android";
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      //console.log('getMobileOperatingSystem', 'userAgent:', userAgent);
      //$('#consolas-1').html('getMobileOperatingSystem' + '<br>userAgent:<br>' + userAgent);
      //Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1
      //Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1
      return getIOSVersion(userAgent);
    }
    //console.log('getMobileOperatingSystem', 'flag:', GameController.flag);
    if (GameController.flag === 0) {
      return "desktop";
    }
    if (GameController.flag === 1) {
      return "mobile";
    }
    return "unknown";
  };

  /**
   * KeyController keeps track of ground moving
   * @param {GameModel} model   The model
   */
  function KeyController(model) {
    // call super constructor.
    GameController.call(this, 'KeyController', model);
    // register keyboard events desktop
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.active = true;
    this.isDown = false;
  }

  // subclass extends superclass
  p = KeyController.prototype = Object.create(GameController.prototype);
  p.constructor = KeyController;

  p.kill = function () {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  };

  p.setActive = function (active) {
    this.active = active;
  };

  p.handleKeyDown = function (e) {
    //console.log("Controller", "handleKeyDown", "e.code:", e.code);
    if (this.active && !this.isDown) {
      //if (this.active) {
      switch (e.code) {
        case 'ArrowLeft':
          this.model.direction = -1;
          this.model.moveSpeedX = -this.model.MOVE_SPEED_X;
          break;
        case 'ArrowRight':
          this.model.direction = 1;
          this.model.moveSpeedX = this.model.MOVE_SPEED_X;
          break;
      }
      //this.dispatchEvent({ type: "change", keydown: true, keyup: false, code: e.code, direction: this.model.direction });
    }
    this.isDown = true;
  };

  p.handleKeyUp = function (e) {
    this.isDown = false;
    this.model.moveSpeedX = 0;
    this.model.direction = 0;
    this.model.playerSpeedX = 1;
    //if (this.active) { this.dispatchEvent({ type: "change", keydown: false, keyup: true, code: e.code, direction: this.model.direction }); }
  };

  /**
   * KeyControllerGsap keeps track of ground moving
   * @param {GameModel} model   The model
   */
  function KeyControllerGsap(model) {
    // call super constructor.
    GameController.call(this, 'KeyControllerGsap', model);
    // register keyboard events desktop
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.active = true;
    this.isDown = false;
    this.isRunning = false;
    this.speedX = 1;
    this.duration = 0.075;
  }

  // subclass extends superclass
  p = KeyControllerGsap.prototype = Object.create(GameController.prototype);
  p.constructor = KeyControllerGsap;

  p.kill = function () {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
  };

  p.setActive = function (active) {
    this.active = active;
  };

  p.handleKeyDown = function (e) {
    //console.log("Controller", "handleKeyDown", "e.code:", e.code);
    var that = this;
    if (this.active) {
      switch (e.code) {
        case 'ArrowLeft':
          this.model.moveSpeedX = -this.model.MOVE_SPEED_X;
          this.model.direction = -1;
          break;
        case 'ArrowRight':
          this.model.moveSpeedX = this.model.MOVE_SPEED_X;
          this.model.direction = 1;
          break;
      }
      /* switch (e.code) {
      case 'ArrowLeft':
          this.model.direction = -1;
          if (!this.isDown) {
              this.isRunning = true;
              gsap.to(this, { speedX: this.model.MOVE_SPEED_X, onUpdate: function () {
                  that.model.moveSpeedX = -that.speedX;
              }, onComplete: function () {
                  that.isRunning = false;
              }, duration: this.duration });
          } else if (!this.isRunning) {
              this.model.moveSpeedX = -this.model.MOVE_SPEED_X;
          }
          break;
      case 'ArrowRight':
          this.model.direction = 1;
          if (!this.isDown) {
              this.isRunning = true;
              gsap.to(this, { speedX: this.model.MOVE_SPEED_X, onUpdate: function () {
                  that.model.moveSpeedX = that.speedX;
                  //console.log("Controller", "handleKeyDown", "moveSpeedX:", that.model.moveSpeedX);
              }, onComplete: function () {
                  that.isRunning = false;
              }, duration: this.duration });
          } else if (!this.isRunning) {
              this.model.moveSpeedX = this.model.MOVE_SPEED_X;
          }
          break;
      } */
      //this.dispatchEvent({ type: "change", keydown: true, keyup: false, code: e.code, direction: this.model.direction });
    }
    this.isDown = true;
  };

  p.handleKeyUp = function (e) {
    this.isDown = false;
    if (this.active) {
      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
          this.model.moveSpeedX = 0;
          this.model.direction = 0;
          this.model.playerSpeedX = 1;
          this.isRunning = false;
          this.speedX = 1;
          gsap.killTweensOf(this);
          break;
      }
      //this.dispatchEvent({ type: "change", keydown: false, keyup: true, code: e.code, direction: this.model.direction });
    }
  };

  /**
   * TouchControllerEuler keeps track of mouse/touch moving
   * @param {GameModel} model   The model
   * @param {jQuery} $target
   */
  function TouchControllerEuler(model, $target) {
    // call super constructor.
    GameController.call(this, 'TouchControllerEuler', model);
    this.$target = $target;
    this.moveObj = {
      x: this.model.moveX
    };
    lib.pointerEvents.onDrag($target, this.handleDrag.bind(this));
    //type: "x", bounds: { minX: -320, maxX: 320, minY: 0, maxY: 0 },
    this.active = true;
  }

  // subclass extends superclass
  p = TouchControllerEuler.prototype = Object.create(GameController.prototype);
  p.constructor = TouchControllerEuler;

  p.setActive = function (active) {
    this.active = active;
  };

  p.kill = function () {
    lib.pointerEvents.offDrag(this.$target);
  };

  p.handleDrag = function (event) {
    var that = this,
      minVX = 3,
      durationMove = 0.1,
      model = this.model,
      pEvents = lib.pointerEvents,
      playerHalfWidth = model.rectPlayer.width / 2,
      moveX = (pEvents.pointerPos.x - model.rectStage.x - playerHalfWidth) / model.factorScale,
      vx = pEvents.vectorPos.vx;
    //console.log("");
    //console.log("TouchControllerEuler", "handleDrag", "vx:", vx, "moveX:", moveX, "direction:", model.direction);
    //console.log("TouchControllerEuler", "handleDrag", "event:", event.type, "vectorPos:", pEvents.vectorPos, "touches:", event.touches);
    if (this.active) {
      //if (moveX < minX) { moveX = minX; }
      //if (moveX > maxX) { moveX = maxX; }
      if (vx < -minVX) {
        //left
        model.direction = -1;
      } else if (vx > minVX) {
        //right
        model.direction = 1;
      }
      gsap.to(this.moveObj, {
        x: moveX,
        onUpdate: function () {
          model.moveX = that.moveObj.x;
        },
        onComplete: function () {
          model.direction = 0;
          //$('#consolas-1').html('handleDrag' + '<br>pointerPos: ' + pEvents.pointerPos.x.toFixed(3) + '<br>moveX: ' + moveX.toFixed(3) + '<br>x: ' + model.x.toFixed(3) + '<br>factorScale: ' + model.factorScale.toFixed(3));
        },
        duration: durationMove,
        ease: 'power0'
      });
    }
    //$('#consolas-1').html('handleDrag' + '<br>pointerPos: ' + pEvents.pointerPos.x.toFixed(3) + '<br>moveX: ' + moveX.toFixed(3) + '<br>x: ' + model.x.toFixed(3) + '<br>factorScale: ' + model.factorScale.toFixed(3));
    //console.log("TouchControllerEuler", "handleDrag", "x:", model.x, "prevX:", model.prevX, "moveX:", moveX);
    //console.log("TouchControllerEuler", "handleDrag", "factorScale:", model.factorScale, "stage.x:", model.rectStage.x, "scaledStageWidth:", scaledStageWidth);
    if (event.type === pEvents.EVENT_UP) {
      model.direction = 0;
    }
    //this.dispatchEvent({ type: "change", keydown: true, keyup: false, code: e.code, direction: this.model.direction });
  };

  p.handleDragEnd = function () {
    //console.log("handleDragEnd");
    this.model.direction = 0;
    gsap.killTweensOf(this.moveObj);
    //this.dispatchEvent({ type: "change", keydown: false, keyup: true, code: e.code, direction: this.model.direction });
  };

  /**
   * TouchControllerVerlet keeps track of mouse/touch moving
   * @param {GameModel} model   The model
   * @param {jQuery} $target
   */
  function TouchControllerVerlet(model, $target) {
    // call super constructor.
    GameController.call(this, 'TouchControllerVerlet', model);
    this.$target = $target;
    //lib.pointerEvents.lockAxis = 'x';
    lib.pointerEvents.onDrag($target, this.handleDrag.bind(this));
    //type: "x", bounds: { minX: -320, maxX: 320, minY: 0, maxY: 0 },
    this.active = true;
  }

  // subclass extends superclass
  p = TouchControllerVerlet.prototype = Object.create(GameController.prototype);
  p.constructor = TouchControllerVerlet;

  p.setActive = function (active) {
    this.active = active;
  };

  p.kill = function () {
    lib.pointerEvents.offDrag(this.$target);
  };

  p.handleDrag = function (event) {
    var that = this,
      vectorPos = lib.pointerEvents.vectorPos,
      vx = vectorPos.vx;
    //console.log("");
    //console.log("TouchControllerVerlet", "handleDrag", "vx:", vx, "moveX:", moveX, "direction:", this.model.direction);
    //console.log("TouchControllerVerlet", "handleDrag", "event:", event.type, "touches:", event.touches);
    //console.log("TouchControllerVerlet", "handleDrag", "vectorPos.a:", vectorPos.a.x, "vectorPos.b:", vectorPos.b.x);
    //console.log("TouchControllerVerlet", "handleDrag", "rectStage.x:", this.model.rectStage.x, "rectStage.width:", this.model.rectStage.width);
    if (this.active) {
      if (vx < 0) {
        //left
        that.model.moveSpeedX = -this.model.MOVE_SPEED_X;
        that.model.direction = -1;
      } else if (vx > 0) {
        //right
        that.model.moveSpeedX = this.model.MOVE_SPEED_X;
        that.model.direction = 1;
      }
    }
    if (event.type === lib.pointerEvents.EVENT_UP) {
      this.handleDragEnd();
    }
    //this.dispatchEvent({ type: "change", keydown: true, keyup: false, code: e.code, direction: this.model.direction });
  };

  p.handleDragEnd = function () {
    //console.log("handleDragEnd");
    this.model.moveSpeedX = 0;
    this.model.direction = 0;
    this.model.playerSpeedX = 1;
    //this.dispatchEvent({ type: "change", keydown: false, keyup: true, code: e.code, direction: this.model.direction });
  };

  /*
  +++ e.acceleration Beschleunigung - Einfluss der Schwerkraft kompensiert - außer bei Geräten ohne Gyroskop! +++
  x: Represents the acceleration upon the x axis which is the west to east axis - West-Ost-Achse
  y: Represents the acceleration upon the y axis which is the south to north axis - Süd-Nord-Achse
  z: Represents the acceleration upon the z axis which is the down to up axis - Achse von unten nach oben

  +++ e.accelerationIncludingGravity - Quadratmetern pro Sekunde (m / s 2 ) +++
  x: Represents the acceleration upon the x axis which is the west to east axis - West-Ost-Achse
  y: Represents the acceleration upon the y axis which is the south to north axis - Süd-Nord-Achse
  z: Represents the acceleration upon the z axis which is the down to up axis - Achse von unten nach oben

  +++ e.rotationRate Gibt die Geschwindigkeit zurück, mit der sich das Gerät in Grad pro Sekunde um jede seiner Achsen dreht. +++
  das heißt, um eine Linie senkrecht zum Bildschirm gedreht zu werden
  alpha: The rate at which the device is rotating about its Z axis; that is, being twisted about a line perpendicular to the screen.
  beta : The rate at which the device is rotating about its X axis; that is, front to back.
  gamma: The rate at which the device is rotating about its Y axis; that is, side to side.
  */

  /**
   * MotionController keeps track of device motion
   * @param {VerletModel} model   The model
   * @param {Vector}      options A vector instance
   * @param {Rectangle}   options A rectangle instance
   */
  function MotionController(model) {
    // call super constructor.
    GameController.call(this, 'MotionController', model);
    // check for device motion event support
    /*if (typeof window.DeviceMotionEvent === 'undefined') {
        throw new Error("DeviceMotionEvent has to be supported or enabled!");
    }
    // Listen to motion events and update the position
    window.addEventListener('devicemotion', this.handleMotion.bind(this), true);
    */
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      throw new Error("DeviceOrientationEvent has to be supported or enabled!");
    }
    window.addEventListener("deviceorientation", this.handleOrientation.bind(this), true);
    this.active = true;
    this.minGamma = 3;
  }

  // subclass extends superclass
  p = MotionController.prototype = Object.create(GameController.prototype);
  p.constructor = MotionController;

  p.setActive = function (active) {
    this.active = active;
  };

  p.kill = function () {
    //window.removeEventListener("deviceorientation", this.handleOrientation.bind(this), true);
  };

  p.handleOrientation = function (e) {
    // nach links < 1 oder nach rechts > 1
    this.model.orientationX = e.gamma;
    // nach oben > 1 oder nach unten < 1
    this.model.orientationY = e.beta;
    this.model.orientationZ = e.alpha;
    var moveSpeedX = mathMin(mathAbs(e.gamma) * this.model.FRICTION_DEVICE, this.model.DRAG_SPEED_X);
    //$('#consolas-1').html() +
    //$('#consolas-1').html('gamma: ' + Number(e.gamma).toFixed(3) + '<br>DRAG_SPEED_X: ' + this.model.DRAG_SPEED_X + '<br>Ctrl X: ' + Number(moveSpeedX).toFixed(2) + '<br>Model X: ' + Number(this.model.moveSpeedX).toFixed(2));
    if (this.active) {
      // nach links < 1 oder nach rechts > 1
      if (e.gamma < -this.minGamma) {
        //this.model.moveSpeedX = -this.model.DRAG_SPEED_X;
        //this.model.moveSpeedX = -moveSpeedX;
        this.model.moveSpeedX += (-moveSpeedX - this.model.moveSpeedX) * 0.15;
        this.model.direction = -1;
      } else if (e.gamma > this.minGamma) {
        //this.model.moveSpeedX = this.model.DRAG_SPEED_X;
        //this.model.moveSpeedX = moveSpeedX;
        //(this.moveX - this.prevX) * 0.075;
        this.model.moveSpeedX += (moveSpeedX - this.model.moveSpeedX) * 0.15;
        this.model.direction = 1;
      } else {
        this.model.moveSpeedX = 0;
        this.model.direction = 0;
      }
    }

    //this.dispatchEvent({ type: "change", orientation: true, origEvent: e });
  };

  /**
   * DragController keeps track of mouse/touch moving
   * @param {GameModel} model   The model
   */
  function DragController(model, $target) {
    // call super constructor.
    GameController.call(this, 'DragController', model);
    console.log("DragController", "model", this.model);
    var that = this;
    //register plugin and create draggable instance
    //gsap.registerPlugin(InertiaPlugin);
    this.speed = 1;
    this.$target = $target;
    this.draggable = Draggable.create($target, {
      autoScroll: 0,
      type: "x",
      bounds: {
        minX: -320,
        maxX: 320,
        minY: 0,
        maxY: 0
      },
      inertia: true,
      callbackScope: that,
      allowNativeTouchScrolling: false,
      //cursor: 'url(./assets/ui-hand.png), auto',
      minimumMovement: 15,
      onDrag: that.handleDrag,
      //onDrag: function () {},
      onDragEnd: that.handleDragEnd,
    })[0];
    this.active = true;
  }

  // subclass extends superclass
  p = DragController.prototype = Object.create(GameController.prototype);
  p.constructor = DragController;

  p.setActive = function (active) {
    this.active = active;
  };

  p.kill = function () {
    this.draggable.kill();
  };

  p.handleDrag = function () {
    //momentary velocity *requires InertiaPlugin
    //startDirection = this.getDirection("start"),
    var DRAG_SPEED_X = this.model.DRAG_SPEED_X,
      momentaryDirection = this.draggable.getDirection("velocity");
    console.log("DragController", "handleDrag", "momentaryDirection:", momentaryDirection, "deltaX:", this.draggable.deltaX, "isThrowing:", this.draggable.isThrowing);
    //console.log("DragController", "handleDrag", "this:", this);
    //console.log("DragController", "handleDrag", "this.draggable:", this.draggable);
    this.model.momentaryDirection = momentaryDirection;
    this.speed += 0.25;
    if (this.speed > DRAG_SPEED_X) {
      this.speed = DRAG_SPEED_X;
    }
    switch (momentaryDirection) {
      case 'left':
        this.model.moveSpeedX = -this.speed;
        this.model.direction = -1;
        break;
      case 'right':
        this.model.moveSpeedX = this.speed;
        this.model.direction = 1;
        break;
    }
    //this.dispatchEvent({ type: "change", keydown: true, keyup: false, code: e.code, direction: this.model.direction });
  };

  p.handleDragEnd = function () {
    console.log("handleDragEnd");
    //gsap.set(this.$target, { x: 0 });
    this.model.moveSpeedX = 0;
    this.model.direction = 0;
    this.speed = 1;
    //this.dispatchEvent({ type: "change", keydown: false, keyup: true, code: e.code, direction: this.model.direction });
  };

  /**
   * SoundCtrlAudioContext keeps track of audio
   * @param {GameModel} model   The model
   * @param {String}    type    A rectangle instance
   */
  function SoundCtrlAudioContext(model) {
    // call super constructor.
    GameController.call(this, 'SoundCtrlAudioContext', model);
    //console.log("SoundCtrlAudioContext", "model", this.model);
  }

  // subclass extends superclass
  p = SoundCtrlAudioContext.prototype = Object.create(GameController.prototype);
  p.constructor = SoundCtrlAudioContext;

  p.create = function (ready) {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    //console.log("SoundCtrlAudioContext", "create", "window.AudioContext", window.AudioContext);
    this.context = new window.AudioContext();
    //
    var key, sound,
      that = this,
      sounds = this.model.sounds,
      length = Object.keys(sounds).length;
    for (key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        sound = sounds[key];
        length--;
        //console.log("SoundCtrlAudioContext", "create", "length:", length, "key:", key, "sounds[key]", sound);
        this.loadSound(sound, (length === 0), ready);
      }
    }
  };

  //@private
  p.loadSound = function (sound, last, callback) {
    var that = this,
      request = new XMLHttpRequest();
    request.open('GET', sound.src, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function () {
      that.context.decodeAudioData(request.response, function (buffer) {
        if (!buffer) {
          console.log('Error decoding file data: ' + sound.src);
          return;
        }
        sound.buffer = buffer;
        //console.log("SoundCtrlAudioContext", "loadSound", "sound:", sound);
        if (last) {
          callback('ready');
        }
      });
    };
    request.onerror = function () {
      console.log('BufferLoader: XHR error');
    };
    request.send();
    //console.log("SoundCtrlAudioContext", "loadSound", "sound:", sound, "last:", last);
  };
  //@private
  p.playSound = function (buffer, time, volume, autostop) {
    if (typeof autostop === 'undefined') {
      autostop = false;
    }
    //console.log("SoundCtrlAudioContext", "playSound", "time:", time, "volume:", volume);
    //buffer, time, volume
    var source, gainNode;
    // creates a sound source AudioBufferSourceNode
    source = this.context.createBufferSource();
    // tell the source which sound to play
    source.buffer = buffer;
    // connect the source to the context's destination (the speakers)
    source.connect(this.context.destination);
    // Create a gain node
    /*gainNode = this.context.createGain();
    // Connect the source to the gain node
    source.connect(gainNode);
    // Connect the gain node to the destination
    gainNode.connect(this.context.destination);
    // Set the volume
    gainNode.gain.value = volume;*/
    //gainNode.gain.setValueAtTime(volume, 0);
    // play the source at the deisred time 0=now
    //source.start(time);
    if (source.noteOn) {
      source.noteOn(0);
    } else {
      source.start(0);
    }
  };

  /*AudioMixer.waContext = new window.AudioContext;
      var i = AudioMixer.waContext.createBuffer(1, 1, 22050),
          source = AudioMixer.waContext.createBufferSource();
      source.buffer = i;
      source.connect(AudioMixer.waContext.destination);
      source.noteOn ? source.noteOn(0) : source.start(0);*/

  p.play = function (sound, time, volume) {
    if (!time) {
      time = 0;
    }
    if (typeof volume === 'undefined') {
      volume = 1;
    }
    //early out if sound off
    if (!this.model.isSoundOn) {
      return false;
    }
    var soundItem = (typeof sound === 'object') ? sound : this.model.sounds[sound];
    this.playSound(soundItem.buffer, time, volume);
    //this.dispatchEvent({ type: "start" });
  };

  p.stop = function (sound) {
    var soundItem = (typeof sound === 'object' && sound.elem) ? sound : this.model.sounds[sound];
    //console.log("SoundCtrlAudioContext", "stop soundItem", soundItem);
    if (soundItem && soundItem.elem && soundItem.elem.pause) {
      soundItem.elem.pause();
    }
    //this.dispatchEvent({ type: "stop" });
  };

  // save specific controller classes in global namespace
  // and leave abstract GameController private
  lib.GameController = GameController;
  lib.SoundCtrlAudioContext = SoundCtrlAudioContext;
  lib.KeyController = KeyController;
  lib.KeyControllerGsap = KeyControllerGsap;
  lib.DragController = DragController;
  lib.MotionController = MotionController;
  lib.TouchControllerEuler = TouchControllerEuler;
  lib.TouchControllerVerlet = TouchControllerVerlet;

}());
