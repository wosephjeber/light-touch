var LightTouch = function(elem, callback) {
  var _this = this;
  var noop = function() {};
  
  var jQuery = window.jQuery || null;
  
  
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
    pinch_zoom: []
  };
  
  this.touches = [];
  
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
    if (_this.touches.length === 1) {
      for (i = 0; i < _this.callbacks.pan.length; i++) {
        _this.callbacks.pan[i].call(_this, _this.touches[0]);
      }
    } else if (_this.touches.length === 2) {
      for (i = 0; i < _this.callbacks.pinch_zoom.length; i++) {
        _this.callbacks.pinch_zoom[i].call(_this, _this.touches);
      }
    }
  };
  
  function startHandler(e) {
    var evt = e.originalEvent || e;
    
    if (evt.touches) {
      for (i = 0; i < evt.touches.length; i++) {
        _this.touches.push(new Touch());
        _this.touches[i].id = evt.touches[i].identifier;
        _this.touches[i].stage = 'start';
        _this.touches[i].type = evt.type;
        _this.touches[i].startX = evt.touches[i].clientX;
        _this.touches[i].startY = evt.touches[i].clientY;
        _this.touches[i].startTime = evt.timeStamp;
        _this.touches[i].calculateVelocity(evt.timeStamp);
      }
    } else {
      _this.touches.push(new Touch());
      _this.touches[0].stage = 'start';
      _this.touches[0].type = evt.type;
      _this.touches[0].startX = evt.clientX;
      _this.touches[0].startY = evt.clientY;
      _this.touches[0].startTime = evt.timeStamp;
      _this.touches[0].calculateVelocity(evt.timeStamp);
    }
    
    _this.handleTouch();
    
    bind(_this.elem, 'touchmove mousemove', moveHandler);
  }
  
  function moveHandler(e) {
    e.preventDefault();
    
    var evt = e.originalEvent || e;
    
    if (evt.touches) {
      for (i = 0; i < evt.touches.length; i++) {
        _this.touches[i].stage = 'move';
        _this.touches[i].type = evt.type;
        _this.touches[i].deltaX = evt.touches[i].clientX - _this.touches[i].startX;
        _this.touches[i].deltaY = evt.touches[i].clientY - _this.touches[i].startY;
        _this.touches[i].duration = evt.timeStamp - _this.touches[i].startTime;
        _this.touches[i].calculateVelocity(evt.timeStamp);
      }
    } else {
      _this.touches[0].stage = 'move';
      _this.touches[0].type = evt.type;
      _this.touches[0].deltaX = evt.clientX - _this.touches[0].startX;
      _this.touches[0].deltaY = evt.clientY - _this.touches[0].startY;
      _this.touches[0].duration = evt.timeStamp - _this.touches[0].startTime;
      _this.touches[0].calculateVelocity(evt.timeStamp);
    }
    
    _this.handleTouch();
  }
  
  function endHandler(e) {
    var evt = e.originalEvent || e;
    
    if (evt.touches) {
      for (i = 0; i < evt.touches.length; i++) {
        _this.touches[i].stage = 'end';
        _this.touches[i].type = evt.type;
      }
    } else {
      _this.touches[0].stage = 'end';
      _this.touches[0].type = evt.type;
    }
    
    _this.handleTouch();
    
    _this.touches = [];
    
    unbind(_this.elem, 'touchmove mousemove', moveHandler);
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
};
