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
  this.event = null;
  
  this.handleTouch = function() {
    _this.callback.call(_this, _this.event);
  };
  
  function startHandler(e) {
    var evt = e.originalEvent || e;
    
    _this.event = new Touch();
    _this.event.stage = 'start';
    _this.event.type = evt.type;
    _this.event.startX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    _this.event.startY = evt.touches ? evt.touches[0].clientY: evt.clientY;
    _this.event.startTime = evt.timeStamp;
    _this.event.calculateVelocity(evt.timeStamp);
    _this.handleTouch();
    
    bind(_this.elem, 'touchmove mousemove', moveHandler);
  }
  
  function moveHandler(e) {
    e.preventDefault();
    
    var evt = e.originalEvent || e;
    
    _this.event.stage = 'move';
    _this.event.type = evt.type;
    _this.event.deltaX = (evt.touches ? evt.touches[0].clientX: evt.clientX) - _this.event.startX;
    _this.event.deltaY = (evt.touches ? evt.touches[0].clientY : evt.clientY) - _this.event.startY;
    _this.event.duration = evt.timeStamp - _this.event.startTime;
    _this.event.calculateVelocity(evt.timeStamp);
    _this.handleTouch();
  }
  
  function endHandler(e) {
    var evt = e.originalEvent || e;
    
    _this.event.stage = 'end';
    _this.event.type = evt.type;
    _this.handleTouch();
    
    _this.event = null;
    
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
