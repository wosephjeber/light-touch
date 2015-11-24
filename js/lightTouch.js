var LightTouch = function(elem, callback) {
  var _this = this;
  var noop = function() {};
  
  var Event = function() {
    this.type = null;
    this.startX = null;
    this.startY = null;
    this.startTime = null;
    this.deltaX = 0;
    this.deltaY = 0;
    this.duration = 0;
  };
  
  this.elem = $(elem);
  this.callback = typeof callback === 'function' ? callback : noop;
  this.touchDown = false;
  this.event = null;
  
  this.handleTouch = function() {
    _this.callback.call(_this, _this.event);
  };
  
  elem.bind('touchstart mousedown', function(e) {
    console.log(e);
    _this.event = new Event();
    _this.touchDown = true;
    _this.event.type = 'start';
    _this.event.startX = e.originalEvent.touches ? e.originalEvent.touches[0].clientX : e.clientX;
    _this.event.startY = e.originalEvent.touches ? e.originalEvent.touches[0].clientY: e.clientY;
    _this.event.startTime = e.timeStamp;
    _this.handleTouch();
  });
  
  elem.bind('touchmove mousemove', function(e) {
    if (_this.touchDown) {
      _this.event.type = 'move';
      _this.event.deltaX = (e.originalEvent.touches ? e.originalEvent.touches[0].clientX: e.clientX) - _this.eventInfo.startX;
      _this.event.deltaY = (e.originalEvent.touches ? e.originalEvent.touches[0].clientY : e.clientY) - _this.eventInfo.startY;
      _this.event.duration = e.timeStamp - _this.eventInfo.startTime;
      _this.handleTouch();
    }
  });
  
  elem.bind('touchend mouseup', function(e) {
    _this.touchDown = false;
    _this.event.type = 'end';
    _this.handleTouch();
    
    _this.event = null;
  });
};
