/**
 * Event.js
 * Author: Joerg Pfeifer - pfeifer@create4web.de
 * Created : 22.04.2020
 * Modified:
 *
 */
(function (window) {

  'use strict';

  if (!window.lib) {
    window.lib = {};
  }

  /**
   * EventDispatcher Mixin prototype
   * @param {object} obj An object for mixin in EventDispatcher
   */
  function EventDispatcher(obj) {
    EventDispatcher.init(obj);
  }

  // save shortcut to prototype
  var p = EventDispatcher.prototype;

  /**
   * EventDispatcher (Mixin)
   * @example EGPlus.initEventDispatcher(obj);
   *              obj.on('eventType', function (event) {});
   *              obj.dispatchEvent('eventType');
   * @param   {object} obj The object to mixin EventDispatcher functionality
   * @returns {object} Returns the same object
   */
  EventDispatcher.init = function (obj) {
    // @property method
    // @property parameters
    var registry = {},
      register = function (type, method, params, once, ob) {
        var handler = {
          method: method || type,
          parameters: params,
          once: typeof once === 'boolean' ? once : false,
          stopPropagation: false
        };
        if (registry.hasOwnProperty(type)) {
          ob.off(type, method);
          registry[type].push(handler);
        } else {
          registry[type] = [handler];
        }
      };

    /**
     * The dispatchEvent method fires listeners for the specified event type
     * @param   {object} event An event type string or an object with a property 'type'
     * @returns {object} Returns this for chaining
     */
    Object.defineProperty(obj, 'dispatchEvent', {
      value: function (event) {
        var listeners, func, handler, i, l,
          type = typeof event === 'string' ? event : event.type;
        //console.info("dispatchEvent", "event:", event, "registry.hasOwnProperty(type):", registry.hasOwnProperty(type));
        if (registry.hasOwnProperty(type)) {
          listeners = registry[type];
          i = listeners.length;
          while (--i > -1) {
            handler = listeners[i];
            func = handler.method;
            if (typeof func === 'string') {
              func = this[func];
            }
            // call handler
            func.apply(this, handler.parameters || [event]);
            // stop propagation
            if (handler.stopPropagation) {
              handler.stopPropagation = false;
              break;
            }
            //console.log("dispatchEvent", "handler:", handler);
            //console.log("dispatchEvent", "func:", func);

            // unregister if once -> 'one'
            if (handler.once && typeof handler.once === 'boolean') {
              listeners.splice(i, 1);
              if (listeners.length === 0) {
                registry[type] = null;
                return this;
              }
            }
          }
        }
        return this;
      }
    });

    /**
     * The has method looks for a registered event of the given type
     * @param   {string}  type The event type as a string
     * @returns {boolean} Returns true if the event type is registered
     */
    Object.defineProperty(obj, 'has', {
      value: function (type) {
        //console.info("has", "type:", type, "registry.hasOwnProperty(type):", registry.hasOwnProperty(type), "registry[type]:", registry[type]);
        return (registry.hasOwnProperty(type) && registry[type] && registry[type].length > 0);
      }
    });

    /**
     * The on method registers a specified event type
     * @param   {string}   type   The event type as a string
     * @param   {function} method A callback function
     * @param   {object}   params An optional parameter object
     * @returns {object}   Returns this for chaining
     */
    Object.defineProperty(obj, 'on', {
      value: function (type, method, params, once) {
        //console.info("on", "type:", type, "registry.hasOwnProperty(type):", registry.hasOwnProperty(type));
        register(type, method, params, typeof once === 'boolean' ? once : false, this);
        return this;
      }
    });

    /**
     * The one method registers a specified event type once
     * @param   {string}   type   The event type as a string
     * @param   {function} method A callback function
     * @param   {object}   params An optional parameter object
     * @returns {object}   Returns this for chaining
     */
    Object.defineProperty(obj, 'one', {
      value: function (type, method, params) {
        //console.info("one", "type:", type, "registry.hasOwnProperty(type):", registry.hasOwnProperty(type));
        register(type, method, params, true, this);
        return this;
      }
    });

    /**
     * The off method unregisters a specified event type
     * @param   {string}   type   The event type as a string
     * @param   {function} method A callback function
     * @returns {object}   Returns this for chaining
     */
    Object.defineProperty(obj, 'off', {
      value: function (type, method) {
        if (registry.hasOwnProperty(type)) {
          //console.info("off", "type:", type, "registry.hasOwnProperty(type):", registry.hasOwnProperty(type), "registry[type]:", registry[type]);
          if (registry[type].length && method && typeof method === 'function') {
            var i, handler, listeners = registry[type],
              l = listeners.length;
            for (i = 0; i < l; i++) {
              handler = listeners[i];
              if (handler.method === method) {
                //console.info("off", "find handler");
                listeners.splice(i, 1);
                return this;
              }
            }
          } else {
            registry[type].splice(0);
          }
        }
        return this;
      }
    });

    /**
     * The off method unregisters a specified event type
     * @param   {string}   type   The event type as a string
     * @param   {function} method A callback function
     * @returns {object}   Returns this for chaining
     */
    Object.defineProperty(obj, 'stopPropagation', {
      value: function (event) {
        var listeners, func, handler, i, l,
          type = typeof event === 'string' ? event : event.type;
        //console.info("dispatchEvent", "event:", event, "registry.hasOwnProperty(type):", registry.hasOwnProperty(type));
        if (registry.hasOwnProperty(type)) {
          listeners = registry[type];
          i = listeners.length;
          while (--i > -1) {
            listeners[i].stopPropagation = true;
            //console.log("dispatchEvent", "handler:", handler);
            //console.log("dispatchEvent", "func:", func);
          }
        }
        return this;
      }
    });

    return obj;
  };

  /**
   * Returns a clone of the Point instance.
   * @method clone
   * @return {Point} a clone of the Point instance.
   **/
  /*p.clone = function () {
  	return new Point(this.x, this.y);
  };*/

  // save EventDispatcher in global namespace as part of lib module
  lib.EventDispatcher = EventDispatcher;

}(window));
