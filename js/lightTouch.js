var LightTouch = function(elem, callback) {
  var _this = this,
      noop = function() {},
      jQuery = window.jQuery || null;
  
  // lookup object used to efficiently find touches by their ID
  var lookup = {};
  
  
  /**
   * Use a class to calculate and keep track of data about individual touches.
  **/
   
  var Touch = function() {
    var _this = this;
    
    // public properties
    this.id = 1;
    this.x = null;
    this.y = null;
    this.startX = null;
    this.startY = null;
    this.timestamp = 0;
  };
  
  var TouchEvent = function() {
    var _this = this;
        
    // variables needed for velocity calculation
    var prevDeltaX = 0,
        prevDeltaY = 0,
        prevScale = 1,
        prevRotation = 0,
        prevXYTimestamp = 0,
        prevScaleRotationTimestamp = 0,
        prevNumTouches = 0;
        
    this.stage = null;
    this.startX = null;
    this.startY = null;
    this.startTime = null;
    this.startScale = 1;
    this.startRotation = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.duration = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityScale = 0;
    this.velocityRotation = 0;
    this.touches = [];
    this.scale = 1;
    this.rotation = 0;
    
    this.anchorTouch = null;
    
    // calculates the velocity of the touch event
    this.calculateVelocityXandY = function(timestamp) {
      var deltaTime = timestamp - prevXYTimestamp;
      
      if (deltaTime > 0) {
        _this.velocityX = (_this.deltaX - prevDeltaX) / deltaTime;
        _this.velocityY = (_this.deltaY - prevDeltaY) / deltaTime;
        
        prevXYTimestamp = timestamp;
        prevDeltaX = _this.deltaX;
        prevDeltaY = _this.deltaY;
      }
    };
    
    this.calculateVelocityScaleAndRotation = function(timestamp) {
      var deltaTime = timestamp - prevScaleRotationTimestamp;
      
      if (deltaTime > 0) {
        _this.velocityScale = (_this.scale - prevScale) / deltaTime;
        _this.velocityRotation = (_this.rotation - prevRotation) / deltaTime;
        
        prevScaleRotationTimestamp = timestamp;
        prevScale = _this.scale;
        prevRotation = _this.rotation;
      }
    };
  };
  
  
  this.elem = jQuery && elem instanceof jQuery ? elem[0] : elem;
  this.callback = typeof callback === 'function' ? callback : noop;
  
  this.touchEvent = new TouchEvent();
  
  this.handleTouch = function() {
    _this.callback.call(_this, _this.touchEvent);
  };
  
  function startHandler(e) {
    var evt = e.originalEvent || e,
        t;
    
    if (evt.changedTouches) {
      // this must be a multitouch device
      
      // loop through each touch
      for (var i = 0, length = evt.changedTouches.length; i < length; i++) {
        
        // if it's a new touch, add it to the TouchEvent
        if (_this.touchEvent.touches.indexOf(lookup[evt.changedTouches[i].identifier]) === -1) {
          t = new Touch();
          t.id = evt.changedTouches[i].identifier;
          t.startX = evt.changedTouches[i].clientX;
          t.startY = evt.changedTouches[i].clientY;
          t.timestamp = evt.timeStamp;
          
          _this.touchEvent.touches.push(t);
        }
      }
    } else {
      // this must not be a multitouch device
      
      t = new Touch();
      t.id = 0;
      t.startX = evt.clientX;
      t.startY = evt.clientY;
      t.timestamp = evt.timeStamp;
      
      _this.touchEvent.touches.push(t);
    }
    
    if (!_this.touchEvent.stage) {
      _this.touchEvent.stage = 'start';
      _this.touchEvent.anchorTouch = _this.touchEvent.touches[0];
      _this.touchEvent.startX = _this.touchEvent.touches[0].startX;
      _this.touchEvent.startY = _this.touchEvent.touches[0].startY;
      _this.touchEvent.startTime = evt.timeStamp;
      _this.touchEvent.scale = _this.touchEvent.startScale * (evt.scale || 1);
      _this.touchEvent.rotation = _this.touchEvent.startRotation + (evt.rotation || 0);
      _this.touchEvent.calculateVelocityXandY(_this.touchEvent.anchorTouch.timestamp);
      
      if (_this.touchEvent.touches.length > 1) {
        _this.touchEvent.calculateVelocityScaleAndRotation(evt.timeStamp);
      }
    }
    
    updateTouchLookup();
    
    _this.handleTouch();
    
    bind(window, 'touchmove mousemove', moveHandler);
  }
  
  function moveHandler(e) {
    e.preventDefault();
    
    var evt = e.originalEvent || e,
        t;
    
    if (evt.touches) {
      // this must be a multitouch device
      
      for (var i = 0, length = evt.changedTouches.length; i < length; i++) {
        t = lookup[evt.changedTouches[i].identifier];
        if (t) {
          t.x = evt.changedTouches[i].clientX;
          t.y = evt.changedTouches[i].clientY;
          t.timestamp = evt.timeStamp;
        }
      }
    } else {
      // this must not be a multitouch device
      
      t = lookup[0];
      t.x = evt.clientX;
      t.y = evt.clientY;
      t.timestamp = evt.timeStamp;
    }
    
    _this.touchEvent.stage = 'move';
    _this.touchEvent.deltaX = _this.touchEvent.anchorTouch.x - _this.touchEvent.startX;
    _this.touchEvent.deltaY = _this.touchEvent.anchorTouch.y - _this.touchEvent.startY;
    _this.touchEvent.duration = evt.timeStamp - _this.touchEvent.startTime;
    _this.touchEvent.calculateVelocityXandY(_this.touchEvent.anchorTouch.timestamp);
    
    if (_this.touchEvent.touches.length > 1) {
      _this.touchEvent.scale = _this.touchEvent.startScale * (evt.scale || 1);
      _this.touchEvent.rotation = _this.touchEvent.startRotation + (evt.rotation || 0);
      _this.touchEvent.calculateVelocityScaleAndRotation(evt.timeStamp);
    }
    
    _this.handleTouch();
  }
  
  function endHandler(e) {
    if (_this.touchEvent.touches.length === 0) return;
    
    var evt = e.originalEvent || e,
        endedTouches = [],
        t,
        prevAnchorX = _this.touchEvent.anchorTouch.x,
        prevAnchorY = _this.touchEvent.anchorTouch.y;
    
    if (evt.changedTouches) {
      for (var i = 0, length = evt.changedTouches.length; i < length; i++) {
        endedTouches.push(evt.changedTouches[i].identifier);
      }
    } else {
      endedTouches.push(0);
    }
    
    if (endedTouches.length < _this.touchEvent.touches.length) {
      _this.touchEvent.startScale = _this.touchEvent.scale;
      _this.touchEvent.startRotation = _this.touchEvent.rotation;
    } else {
      _this.touchEvent.stage = 'end';
      _this.handleTouch();
      
      unbind(window, 'touchmove mousemove', moveHandler);
      _this.touchEvent = new TouchEvent();
    }
    
    for (var i = 0, length = endedTouches.length; i < length; i++) {
      _this.touchEvent.touches.splice(_this.touchEvent.touches.indexOf(lookup[endedTouches[i]]), 1);
      delete lookup[endedTouches[i]];
    }
    
    if (_this.touchEvent.touches.length > 0) {
      _this.touchEvent.anchorTouch = _this.touchEvent.touches[0];
      
      _this.touchEvent.startX += (_this.touchEvent.anchorTouch.x - prevAnchorX);
      _this.touchEvent.startY += (_this.touchEvent.anchorTouch.y - prevAnchorY);
    }
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
      for (var i = 0, length = events.length; length > i; i++) {
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
      for (var i = 0, length = events.length; length > i; i++) {
        element.removeEventListener(events[i], handler, false);
      }
    }
  }
  
  function updateTouchLookup() {
    for (var i = 0, length = _this.touchEvent.touches.length; i < length; i++) {
      lookup[_this.touchEvent.touches[i].id] = _this.touchEvent.touches[i];
    }
  }
};
