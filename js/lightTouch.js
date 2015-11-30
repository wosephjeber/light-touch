var LightTouch = function(elem, callback) {
  var _this = this;
  var noop = function() {};
  
  var jQuery = window.jQuery || null;
  
  // lookup object used to efficiently find touches by their ID
  var lookup = {};
  
  
  /**
   * Use a class to calculate and keep track of data about individual touches.
  **/
   
  var Touch = function() {
    var _this = this;
    
    // variables needed for velocity calculation
    var prevDeltaX = 0;
    var prevDeltaY = 0;
    var prevTimestamp = 0;
    
    // public properties
    this.id = 1;
    this.type = null;
    this.startX = null;
    this.startY = null;
    this.startTime = null;
    this.deltaX = 0;
    this.deltaY = 0;
    this.duration = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    
    // calculates the velocity of the touch event
    this.calculateVelocity = function(timestamp) {
      var deltaTime = timestamp - prevTimestamp;
      _this.velocityX = (_this.deltaX - prevDeltaX) / deltaTime;
      _this.velocityY = (_this.deltaY - prevDeltaY) / deltaTime;
      
      prevTimestamp = timestamp;
      prevDeltaX = _this.deltaX;
      prevDeltaY = _this.deltaY;
    };
  };
  
  
  this.elem = jQuery && elem instanceof jQuery ? elem[0] : elem;
  this.callback = typeof callback === 'function' ? callback : noop;
  
  this.callbacks = {
    pan: [],
    pinch_zoom: [],
    rotate: []
  };
  
  this.touches = [];
  this.multitouch = {};
  
  this.on = function(evt, callback) {
    if (_this.callbacks[evt] && typeof callback === 'function') _this.callbacks[evt].push(callback);
  };
  
  this.off = function(evt, callback) {
    if (_this.callbacks[evt]) {
      if (callback) {
        var index = _this.callbacks[evt].indexOf(callback);
        if (index !== -1) _this.callbacks[evt].splice(index, 1);
      } else {
        _this.callbacks[evt] = [];
      }
    }
  };
  
  this.handleTouch = function() {
    // for (i = 0; i < _this.touches.length; i++) {
    //   console.log(_this.touches[i]);
    // }
    
    if (_this.touches.length > 0) {
      for (i = 0, length = _this.callbacks.pan.length; i < length; i++) {
        _this.callbacks.pan[i].call(_this, _this.touches[0]);
      }
    } 
    
    if (_this.touches.length > 1) {
      for (i = 0, length = _this.callbacks.pinch_zoom.length; i < length; i++) {
        _this.callbacks.pinch_zoom[i].call(_this, _this.multitouch, _this.touches.slice(0,2));
      }
    }
  };
  
  function startHandler(e) {
    
    var evt = e.originalEvent || e;
    var t;
    
    if (evt.changedTouches) {
      for (i = 0, length = evt.changedTouches.length; i < length; i++) {
        if (_this.touches.indexOf(lookup[evt.changedTouches[i].identifier]) === -1) {
          t = new Touch();
          t.id = evt.changedTouches[i].identifier;
          t.stage = 'start';
          t.type = evt.type;
          t.startX = evt.changedTouches[i].clientX;
          t.startY = evt.changedTouches[i].clientY;
          t.startTime = evt.timeStamp;
          t.calculateVelocity(evt.timeStamp);
          
          _this.touches.push(t);
        }
      }
      
      if (evt.changedTouches.length > 1) {
        _this.multitouch.scale = evt.scale;
        _this.multitouch.rotation = evt.rotation;
      }
    } else {
      t = new Touch();
      
      t.id = 0;
      t.stage = 'start';
      t.type = evt.type;
      t.startX = evt.clientX;
      t.startY = evt.clientY;
      t.startTime = evt.timeStamp;
      t.calculateVelocity(evt.timeStamp);
      
      _this.touches.push(t);
    }
    
    updateTouchLookup();
    
    _this.handleTouch();
    
    bind(window, 'touchmove mousemove', moveHandler);
  }
  
  function moveHandler(e) {
    e.preventDefault();
    
    var evt = e.originalEvent || e;
    
    var t;
    
    if (evt.touches) {
      for (i = 0, length = evt.changedTouches.length; i < length; i++) {
        t = lookup[evt.touches[i].identifier];
        t.stage = 'move';
        t.type = evt.type;
        t.deltaX = evt.changedTouches[i].clientX - t.startX;
        t.deltaY = evt.changedTouches[i].clientY - t.startY;
        t.duration = evt.timeStamp - t.startTime;
        t.calculateVelocity(evt.timeStamp);
      }
      
      if (evt.touches.length > 1) {
        _this.multitouch.scale = evt.scale;
        _this.multitouch.rotation = evt.rotation;
      }
    } else {
      t = lookup[0];
      t.stage = 'move';
      t.type = evt.type;
      t.deltaX = evt.clientX - t.startX;
      t.deltaY = evt.clientY - t.startY;
      t.duration = evt.timeStamp - t.startTime;
      t.calculateVelocity(evt.timeStamp);
    }
    
    _this.handleTouch();
  }
  
  function endHandler(e) {
    // If no touches have been registered, don't do anything. This would be the
    // case if the touch event started outside of the Touch element.
    if (_this.touches.length === 0) {
      return;
    }
    
    var evt = e.originalEvent || e;
    var endedTouches = [];
    var t;
    
    if (evt.changedTouches) {
      for (i = 0, length = evt.changedTouches.length; i < length; i++) {
        endedTouches.push(evt.changedTouches[i].identifier);
        t = lookup[evt.changedTouches[i].identifier];
        t.stage = 'end';
        t.type = evt.type;
      }
    } else {
      endedTouches.push(0);
      t = lookup[0];
      t.stage = 'end';
      t.type = evt.type;
    }
    _this.handleTouch();
    
    for (i = 0, length = endedTouches.length; i < length; i++) {
      _this.touches.splice(_this.touches.indexOf(lookup[endedTouches[i]]), 1);
      delete lookup[endedTouches[i]];
      
    }
    
    unbind(window, 'touchmove mousemove', moveHandler);
  }
  
  bind(this.elem, 'touchstart mousedown', startHandler);
  bind(this.elem, 'touchend mouseup', endHandler);
  
  
  /** 
   * Helper method to normalize adding event handlers with or without jQuery.
   * If jQuery is loaded, it will use jQuery's bind() method. Otherwise it will
   * use Javascripts native addEventListener method. If you need IE8 support,
   * load jQuery and you'll be taken care of.
  **/
   
  function bind(element, evt, handler) {
    if (jQuery) {
      jQuery(element).bind(evt, handler);
    } else {
      var events = evt.split(' ');
      for (i = 0; events.length > i; i++) {
        element.addEventListener(events[i], handler, false);
      }
    }
  }
  
  
  /** 
   * Helper method to normalize removing event handlers with or without jQuery.
   * If jQuery is loaded, it will use jQuery's unbind() method. Otherwise it will
   * use Javascripts native removeEventListener method. If you need IE8 support,
   * load jQuery and you'll be taken care of.
  **/
   
  function unbind(element, evt, handler) {
    if (jQuery) {
      jQuery(element).unbind(evt, handler);
    } else {
      var events = evt.split(' ');
      for (i = 0; events.length > i; i++) {
        element.removeEventListener(events[i], handler, false);
      }
    }
  }
  
  function updateTouchLookup() {
    for (i = 0, length = _this.touches.length; i < length; i++) {
      lookup[_this.touches[i].id] = _this.touches[i];
    }
  }
};
