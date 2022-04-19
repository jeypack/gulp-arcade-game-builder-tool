/**
 * pointerEvents
 * Author  : Joerg Pfeifer - pfeifer@create4web.de
 * Created : 27.12.2020
 * Modified:
 */
(function ($) {

  'use strict';

  var pointerEvents = {
      vectorPos: new lib.Vector(),
      pointerPos: {
        distance: 0,
        origX: 0,
        origY: 0,
        x: 0,
        y: 0
      },
      lockAxis: false,
      direction: '',
      EVENT_DOWN: "mousedown",
      EVENT_UP: "mouseup",
      EVENT_MOVE: "mousemove",
      minDistanceToDrag: 2,
      minDistanceToSwipe: 40,
      // will be overwritten by 'setOSEventNames'
      isMobile: true,
    },
    handlers = [],
    UID = 0,
    timeoutID = null,
    getUniqueID = function () {
      return UID++;
    },
    getHandler = function ($element) {
      var i, l = handlers.length,
        uid = $element.data('uid');
      //console.log("# pointerEvents getHandler ", "$element", $element, "uid", uid);
      // early out
      if (typeof uid === 'undefined') {
        return null;
      }
      for (i = 0; i < l; i++) {
        //console.log("# pointerEvents getHandler ", "handlers[", i, "]", handlers[i]);
        //console.log("# pointerEvents getHandler ", "(handlers[", i, "].elem == $element)", (handlers[i].elem == $element));
        if (handlers[i].uid === uid) {
          return handlers[i];
        }
      }
      return null;
    },
    setOSEventNames = function () {
      var flag = 0;
      pointerEvents.isMobile = true;
      try {
        document.createEvent("TouchEvent");
        flag = 1;
      } catch (ed) {
        if (window.navigator.pointerEnabled) {
          flag = 2;
        } else if (window.navigator.msPointerEnabled) {
          flag = 3;
        }
      }
      switch (flag) {
        case 0:
          pointerEvents.EVENT_DOWN = 'mousedown';
          pointerEvents.EVENT_UP = 'mouseup';
          pointerEvents.EVENT_MOVE = 'mousemove';
          break;
        case 1:
          pointerEvents.EVENT_DOWN = 'touchstart';
          pointerEvents.EVENT_UP = 'touchend';
          pointerEvents.EVENT_CANCEL = 'touchcancel';
          pointerEvents.EVENT_MOVE = 'touchmove';
          break;
        case 2:
          pointerEvents.EVENT_DOWN = 'pointerup';
          pointerEvents.EVENT_UP = 'pointerdown';
          pointerEvents.EVENT_MOVE = 'pointermove';
          break;
        case 3:
          pointerEvents.EVENT_DOWN = 'MSPointerDown';
          pointerEvents.EVENT_UP = 'MSPointerUp';
          pointerEvents.EVENT_MOVE = 'MSPointerMove';
          break;
      }
    },
    hasHandler = function ($element) {
      var i, l = handlers.length,
        uid = $element.data('uid');
      // early out
      if (typeof uid === 'undefined') {
        return false;
      }
      for (i = 0; i < l; i++) {
        if (handlers[i].uid === uid) {
          return true;
        }
      }
      return false;
    },
    handleDown = function (e) {
      //console.log("# pointerEvents handleDown ", "event", e);
      //if (e.preventDefault) { e.preventDefault(); }
      var pointerPos = pointerEvents.pointerPos;
      pointerPos.state = pointerEvents.EVENT_DOWN;
      pointerPos.origX = e.clientX || e.touches[0].clientX;
      pointerPos.origY = e.clientY || e.touches[0].clientY;
      pointerPos.x = pointerPos.origX;
      pointerPos.y = pointerPos.origY;
      pointerPos.distance = 0;
      pointerEvents.direction = null;
      pointerEvents.vectorPos.update(pointerPos.x, pointerPos.y, pointerPos.x, pointerPos.y);
      //console.log("# pointerEvents handleDown ", "pointerPos", pointerPos);
    },
    handleUp = function (e) {
      //console.log("# pointerEvents handleUp ", "event", e);
      if (e.preventDefault) {
        e.preventDefault();
      }
      var $target = $(e.currentTarget),
        callback = getHandler($target);
      pointerEvents.pointerPos.state = pointerEvents.EVENT_UP;
      /* console.log("# pointerEvents handleUp ", "e.currentTarget", e.currentTarget);
      console.log("# pointerEvents handleUp ", "$target", $target);
      console.log("# pointerEvents handleUp ", "callback", callback);
      console.log("# pointerEvents handleUp ", "pointerPos", JSON.stringify(pointerEvents.pointerPos)); */
      if (callback) {
        callback.func({
          type: pointerEvents.EVENT_UP
        });
      }
    },
    handleMove = function (e) {
      //console.log("# pointerEvents handleMove ", "event", e);
      var $target = $(e.currentTarget),
        callback = getHandler($target),
        pointerPos = pointerEvents.pointerPos,
        x = e.clientX || e.touches[0].clientX,
        y = e.clientY || e.touches[0].clientY,
        distance = pointerEvents.getDistance(pointerPos.origX, pointerPos.origY, x, y);
      //
      pointerPos.state = pointerEvents.EVENT_MOVE;
      if (x < pointerPos.origX) {
        pointerEvents.direction = 'left';
      } else if (x > pointerPos.origX) {
        pointerEvents.direction = 'right';
      }

      pointerPos.distance = distance;
      pointerPos.x = x;
      pointerPos.y = y;

      /* console.log("# pointerEvents handleMove ", "e.currentTarget", e.currentTarget);
      console.log("# pointerEvents handleMove ", "$target", $target);
      console.log("# pointerEvents handleMove ", "callback", callback);
      console.log("# pointerEvents handleMove ", "pointerPos", JSON.stringify(pointerEvents.pointerPos)); */
      if (callback) {
        callback.func({
          type: 'move',
          id: $target.data('uid'),
          pointer: {
            event: e,
            direction: pointerEvents.direction,
            position: JSON.parse(JSON.stringify(pointerEvents.pointerPos))
          }
        });
      }
    },
    handleSwipe = function (e) {
      //console.log("# pointerEvents handleSwipe ", "event", e);
      var $target, callback, pointerPos = pointerEvents.pointerPos;
      //console.log("# pointerEvents handleSwipe ", "pointerPos", pointerPos);
      // only allow swipe if distance greater than 'minDistanceToSwipe'
      if (pointerPos.distance > pointerEvents.minDistanceToSwipe) {
        $target = $(e.currentTarget);
        callback = getHandler($target);
        //console.log("# pointerEvents handleSwipe ", "$target", $target);
        //console.log("# pointerEvents handleSwipe ", "callback", callback);
        if (callback) {
          setTimeout(function () {
            callback.func({
              type: 'change',
              id: $target.data('uid'),
              pointer: {
                event: e,
                direction: pointerEvents.direction,
                position: JSON.parse(JSON.stringify(pointerPos))
              }
            });
          });
        }
      }
    },
    handleDrag = function (e) {
      //console.log("# pointerEvents handleDrag ", "event", e);
      if (e.preventDefault) {
        e.preventDefault();
      }
      var $target, hasChanged, distance, vx, vy,
        callback = null,
        direction = '',
        pointerPos = pointerEvents.pointerPos,
        x = e.clientX || e.touches[0].clientX,
        y = e.clientY || e.touches[0].clientY,
        lastDistance = pointerPos.distance,
        lastDirection = pointerEvents.direction;
      //
      if (pointerEvents.lockAxis) {
        if (pointerEvents.lockAxis === 'x') {
          x = pointerPos.origX;
        } else if (pointerEvents.lockAxis === 'y') {
          y = pointerPos.origY;
        }
      }
      //
      pointerEvents.vectorPos.update(pointerPos.x, pointerPos.y, x, y);
      distance = pointerEvents.vectorPos.m;
      vx = pointerEvents.vectorPos.vx;
      vy = pointerEvents.vectorPos.vy;

      //console.log("#");
      //console.log("# pointerEvents handleDrag ", "distance", distance, "x:", x, "vx:", vx);
      //if (timeoutID) { clearTimeout(timeoutID); }
      // only allow scratch if move is
      if (Math.abs(distance) > pointerEvents.minDistanceToDrag) {
        if (Math.abs(vx) > Math.abs(vy)) {
          if (vx < 0) {
            direction = 'left';
          } else if (vx > 0) {
            direction = 'right';
          }
        } else if (Math.abs(vx) < Math.abs(vy)) {
          if (vy < 0) {
            direction = 'up';
          } else if (vy > 0) {
            direction = 'down';
          }
        }
        hasChanged = (lastDirection !== '' && direction !== '' && lastDirection !== direction) || (typeof lastDirection === 'undefined');
        pointerPos.x = x;
        pointerPos.y = y;
        pointerPos.distance = distance;
        //
        $target = $(e.currentTarget);
        callback = getHandler($target);
        //console.log("# pointerEvents handleDrag ", "$target", $target);
        //console.log("# pointerEvents handleDrag ", "callback", callback);
        if (hasChanged) {
          pointerEvents.direction = direction;
          //console.log("# pointerEvents handleDrag ", "e.currentTarget", e.currentTarget);
          if (callback) {
            callback.func({
              type: 'change',
              touches: e.touches
            });
          }
        }
        if (callback) {
          callback.func({
            type: 'drag',
            touches: e.touches
          });
        }
        /*timeoutID = setTimeout(function () {
            callback.func({ type: 'dragend', touches: e.touches });
        }, 25);*/
      }

    },
    handleResize = function () {
      setOSEventNames();
    },
    preventDefault = function (e) {
      //if (e.touches && e.touches.length > 1) { return true; }
      //e.cancelable &&
      if (e.cancelable && e.preventDefault) {
        e.preventDefault();
      }
      return false;
    },
    removeHandler = function ($element) {
      var i, l = handlers.length,
        uid = $element.data('uid');
      //console.log("# pointerEvents removeHandler ", "$element", $element, "uid", uid);
      // early out
      if (!uid) {
        return false;
      }
      for (i = 0; i < l; i++) {
        //console.log("# pointerEvents removeHandler ", "handlers[", i, "]", handlers[i]);
        //console.log("# pointerEvents removeHandler ", "(handlers[", i, "].elem == $element)", (handlers[i].elem == $element));
        if (handlers[i].uid === uid) {
          handlers.splice(i, 1);
          return true;
        }
      }
    };

  //
  // init event names
  setOSEventNames();
  // register for resize so we are able to change event names
  //window.addEventListener('resize', handleResize);
  //console.log("# pointerEvents setOSEventNames ", "pointerEvents.EVENT_DOWN", pointerEvents.EVENT_DOWN);
  //console.log("# pointerEvents setOSEventNames ", "pointerEvents.EVENT_UP", pointerEvents.EVENT_UP);
  //console.log("# pointerEvents setOSEventNames ", "pointerEvents.EVENT_MOVE", pointerEvents.EVENT_MOVE);

  //
  pointerEvents.getDistance = function (ax, ay, bx, by) {
    var vx = bx - ax,
      vy = by - ay;
    if (vx !== 0 || vy !== 0) {
      return Math.sqrt(vx * vx + vy * vy);
    }
    return 0.001;
  };

  pointerEvents.up = function ($element, callback) {
    var uid = $element.data('uid');
    //console.log("+ pointerEvents up ", "uid", uid, "$element", $element, "uid", uid);
    if (!uid || !hasHandler($element)) {
      $element.on(pointerEvents.EVENT_UP, handleUp);
      uid = (!uid) ? getUniqueID() : uid;
      $element.data('uid', uid);
      //console.log("+ pointerEvents up ", "uid", uid, "$element", $element, "$element.data('uid')", $element.data('uid'));
      handlers.push({
        uid: uid,
        $elem: $element,
        func: callback
      });
    }
  };

  pointerEvents.disableScroll = function () {
    document.addEventListener(pointerEvents.EVENT_MOVE, preventDefault, {
      passive: false
    });
  };

  pointerEvents.enableScroll = function () {
    document.removeEventListener(pointerEvents.EVENT_MOVE, preventDefault, {
      passive: false
    });
  };

  pointerEvents.onSwipe = function ($element, callback) {
    var uid = $element.data('uid');
    //console.log("+ pointerEvents onSwipe ", "uid", uid, "eventDown", eventDown, "eventMove", eventMove, "eventUp", eventUp);
    if (!uid || !hasHandler($element)) {
      $element.on(pointerEvents.EVENT_DOWN + '.swipe', function (e) {
        //pointerEvents.disableScroll();
        handleDown(e);
      });
      $element.on(pointerEvents.EVENT_MOVE + '.swipe', handleMove);
      $element.on(pointerEvents.EVENT_UP + '.swipe', function (e) {
        handleSwipe(e);
        //pointerEvents.enableScroll();
      });
      uid = (!uid) ? getUniqueID() : uid;
      $element.data('uid', uid);
      //console.log("+ pointerEvents onSwipe ", "uid", uid, "$element", $element, "$element.data('uid')", $element.data('uid'));
      handlers.push({
        uid: uid,
        $elem: $element,
        func: callback
      });
    }
  };

  pointerEvents.offSwipe = function ($element) {
    $element.off(pointerEvents.EVENT_DOWN + '.swipe');
    $element.off(pointerEvents.EVENT_MOVE + '.swipe');
    $element.off(pointerEvents.EVENT_UP + '.swipe');
    removeHandler($element);
  };

  pointerEvents.onDrag = function ($element, callback) {
    var uid = $element.data('uid'),
      $parent = $('#ground-move-dummy');
    if (!uid || !hasHandler($element)) {
      pointerEvents.direction = undefined;
      /* $(document).on('touchstart touchmove touchend', function(e) {
          // Example of a parentSelector
          // var parentSelector = '#parentElement';
          if ($(e.target).closest($parent).length) {
              e.preventDefault();
          }
      }); */
      //
      $element.on(pointerEvents.EVENT_DOWN + '.drag', handleDown);
      $element.on(pointerEvents.EVENT_MOVE + '.drag', function (e) {
        //console.log("+ pointerEvents onDrag ", "uid", uid, "$element", $element, "pointerEvents.pointerPos.state", pointerEvents.pointerPos.state);
        if (pointerEvents.pointerPos.state === pointerEvents.EVENT_DOWN) {
          handleDrag(e);
        }
      });
      if (pointerEvents.EVENT_CANCEL) {
        $element.on(pointerEvents.EVENT_CANCEL + '.drag', handleUp);
      }
      $element.on(pointerEvents.EVENT_UP + '.drag', handleUp);
      uid = (!uid) ? getUniqueID() : uid;
      $element.data('uid', uid);
      //console.log("+ pointerEvents onDrag ", "uid", uid, "$element", $element, "$element.data('uid')", $element.data('uid'));
      handlers.push({
        uid: uid,
        $elem: $element,
        func: callback
      });
    }
  };

  pointerEvents.offDrag = function ($element) {
    $element.off(pointerEvents.EVENT_DOWN + '.drag');
    $element.off(pointerEvents.EVENT_MOVE + '.drag');
    $element.off(pointerEvents.EVENT_UP + '.drag');
    //document.body.removeEventListener(pointerEvents.EVENT_UP, handleUp);
    removeHandler($element);
  };

  lib.pointerEvents = pointerEvents;

}(jQuery));
