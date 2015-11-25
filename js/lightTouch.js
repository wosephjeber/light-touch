var LightTouch = function(elem, callback) {
  var _this = this;
  var noop = function() {};
  
  var Event = function() {
    var _this = this;
    
    var prevDeltaX = 0;
    var prevDeltaY = 0;
    var prevTimestamp = 0;
    
    this.type = null;
    this.startX = null;
    this.startY = null;
    this.startTime = null;
    this.deltaX = 0;
    this.deltaY = 0;
    this.duration = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    
    this.calculateVelocity = function(timestamp) {
      var deltaTime = timestamp - prevTimestamp;
      _this.velocityX = (_this.deltaX - prevDeltaX) / deltaTime;
      _this.velocityY = (_this.deltaY - prevDeltaY) / deltaTime;
      
      prevTimestamp = timestamp;
      prevDeltaX = _this.deltaX;
      prevDeltaY = _this.deltaY;
    };
  };
  
  this.elem = $(elem);
  this.callback = typeof callback === 'function' ? callback : noop;
  this.touchDown = false;
  this.event = null;
  
  this.handleTouch = function() {
    _this.callback.call(_this, _this.event);
  };
  
  this.elem.bind('touchstart mousedown', function(e) {
    console.log(e);
    _this.event = new Event();
    _this.touchDown = true;
    _this.event.stage = 'start';
    _this.event.type = e.type;
    _this.event.startX = e.originalEvent.touches ? e.originalEvent.touches[0].clientX : e.clientX;
    _this.event.startY = e.originalEvent.touches ? e.originalEvent.touches[0].clientY: e.clientY;
    _this.event.startTime = e.timeStamp;
    _this.event.calculateVelocity(e.timeStamp);
    _this.handleTouch();
    
    bindMove();
  });
  
  this.elem.bind('touchend mouseup', function(e) {
    _this.touchDown = false;
    _this.event.stage = 'end';
    _this.event.type = e.type;
    _this.handleTouch();
    
    _this.event = null;
    
    unbindMove();
  });
  
  function bindMove() {
    _this.elem.bind('touchmove mousemove', function(e) {
      e.preventDefault();
      
      _this.event.stage = 'move';
      _this.event.type = e.type;
      _this.event.deltaX = (e.originalEvent.touches ? e.originalEvent.touches[0].clientX: e.clientX) - _this.event.startX;
      _this.event.deltaY = (e.originalEvent.touches ? e.originalEvent.touches[0].clientY : e.clientY) - _this.event.startY;
      _this.event.duration = e.timeStamp - _this.event.startTime;
      _this.event.calculateVelocity(e.timeStamp);
      _this.handleTouch();
    });
  }
  
  function unbindMove() {
    _this.elem.unbind('touchmove mousemove');
  }
};
