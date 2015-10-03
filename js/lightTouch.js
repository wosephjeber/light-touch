var LightTouch = function(elem, callback) {
  var _this = this;
  var noop = function() {};
  
  this.elem = $(elem);
  this.callback = typeof callback === 'function' ? callback : noop;
  this.touchDown = false;
  this.eventInfo = {
    eventType: null,
    startX: null,
    startY: null,
    startTime: null,
    deltaX: 0,
    deltaY: 0,
    duration: 0
  };
  this.handleTouch = function() {
    _this.callback.call(_this, _this.eventInfo);
  };
  
  elem.bind('touchstart mousedown', function(e) {
    _this.touchDown = true;
    _this.eventInfo.eventType = 'start';
    _this.eventInfo.startX = e.clientX;
    _this.eventInfo.startY = e.clientY;
    _this.eventInfo.startTime = e.timeStamp;
    _this.handleTouch();
  });
  
  elem.bind('touchmove mousemove', function(e) {
    if (_this.touchDown) {
      _this.eventInfo.eventType = 'move';
      _this.eventInfo.deltaX = e.clientX - _this.eventInfo.startX;
      _this.eventInfo.deltaY = e.clientY - _this.eventInfo.startY;
      _this.eventInfo.duration = e.timeStamp - _this.eventInfo.startTime;
      _this.handleTouch();
    }
  });
  
  elem.bind('touchend mouseup', function(e) {
    _this.touchDown = false;
    _this.eventInfo.eventType = 'end';
    _this.handleTouch();
    
    _this.eventInfo = {
      startX: null,
      startY: null,
      startTime: null,
      deltaX: 0,
      deltaY: 0,
      duration: 0
    };
  });
};
