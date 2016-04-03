# LightTouch.js

A lightweight JS library for handling touch events. Dependency free, but works with jQuery if you need IE8 support. Still a work in progress. Currently just over 8kb unminified.

## Usage

`LightTouch(target, callback)`

### Parameters

**target** | *DOM object* | The DOM object to listen for touch events on. If jQuery is loaded on the page, you can also pass a jQuery object as the target.

**callback** | *function* | Callback function to be executed for each touch event. Callback is passed a `TouchEvent` object as a parameter. The value of `this` is the `LightTouch` instance.

```javascript
// example
var target = document.querySelector('#target');
var touch = new LightTouch(target, function(e) {
  // Do something in response to touch events.
});

// or, with jQuery loaded
var touch = new LightTouch($('#target'), function(e) {
  ...
});
```

## `TouchEvent` object

The `TouchEvent` object passed to the callback function contains the following properties:

**stage** | *string* | Current stage of touch interaction. Either 'start', 'move', or 'end'.

**deltaX** | *number* | Change in `x` since the first touch.

**deltaY** | *number* | Change in `y` since the first touch.

**duration** | *number* | Duration, in milliseconds, of the touch interaction.

**scale** | number | Percent scaled since touch interaction started, as a decimal value.

**rotation** | *number* | Amount of rotation since touch interaction started, in degrees.

**velocityX** | *number* | Current velocity of change in `x`, in pixels per millisecond (px/ms)

**velocityY** | *number* | Current velocity of change in `y`, in pixels per millisecond (px/ms)

**velocityRotation** | *number* | Current velocity of change in rotation, in degrees per millisecond

**velocityScale** | *number* | Current velocity of change in scale, in percent per millisecond

**touches** | *array* | Array of Touch objects representing each pointer (i.e. finger or cursor) that is currently active on the element.

**anchorTouch** | *object* | The Touch object that serves as the anchor for the touch interaction. `deltaX`, `deltaY`, `velocityX`, and `velocityY` are calculated based off the anchor touch.

## `Touch` object

`Touch` objects contains the following properties:

**startX** | *number* | Starting `x` position of the pointer, in pixels, relative to the document.

**startY** | *number* | Starting `y` position of the pointer, in pixels, relative to the document.

**x** | *number* | Current `x` position of the pointer, in pixels, relative to the document.

**y** | *number* | Current `y` position of the pointer, in pixels, relative to the document.

**timestamp** | *number* | Current timestamp of the latest recorded change for the pointer, in milliseconds.
