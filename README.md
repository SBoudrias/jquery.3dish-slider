# 3dish  Slider

Threedish is a basic 3d effet slider jQuery plugin. It use CSS 3 transform operation to scale down and up any kind of html content.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/SimonBoudrias/jquery.3dish-slider/master/dist/jquery.3dish-slider.min.js
[max]: https://raw.github.com/SimonBoudrias/jquery.3dish-slider/master/dist/jquery.3dish-slider.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/jquery.3dish-slider.min.js"></script>
```
_(Coming soon)_

## Documentation

### Initialize
To initialize Threedish, just call on any element.

```javascript
$('.slider').ThreeDish();
```

You can of course chain other jQuery function afterward and pass personnalized option to the plugins (those will be explain later).

Initializing ThreeDish will only set up default style and create an instance of Threedish. It will not add any button; this is up to you using the methods below.

### Methods

You can call pretty basic method on a ThreeDish instance.

####next

```javascript
$('.slider').ThreeDish('next');
```

Move the slides forward

####prev

```javascript
$('.slider').ThreeDish('prev');
```

Move the slides backward

####goTo

```javascript
$('.slider').ThreeDish('goTo', '.className');
// the selector could be [name=myslide] or any valid jQuery selector
```

Move the slides to the first slide corresponding to the jQuery selector passed as argument.

####append

```javascript
$('.slider').ThreeDish('append', $('<div/>'));
```

Append any jQuery element to the slider. Ideally, you'd have to give this new element the same class name as the other slides.

### Options

_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Simon Boudrias  
Licensed under the MIT, GPL licenses.
