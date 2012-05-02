/*! 3dish  Slider - v0.1.0 - 2012-05-02
* https://github.com/SimonBoudrias/jquery.3dish-slider
* Copyright (c) 2012 Simon Boudrias; Licensed MIT, GPL */

(function ($) {
	"use strict";	
	
	var ThreeDish = function (element, options) {
		this.init('ThreeDish', element, options);
	};
	
	ThreeDish.prototype = {
		
		constructor : ThreeDish,
		
		init : function (type, element, options) {
			
			// Set vars
			this.type     = type;
			this.$element = $(element);
			this.opt  = this.getOptions(options);
			this.styles = [];
			this.zIndex = [];
			this.animating = false;
			
			// Set elem collection
			this.$hiddenSlides  = [];
			this.$visibleSlides = [];
			
			var self = this,
				$slides = this.$element.find(this.opt.slideClass),
				bottom  = 0,
				left = 0,
				i = 0;
			
			
			// ---
			// Set defaults styles
			for (; i < this.opt.slideNbr + 1; i += 1) {
				
				var zAxe = 1 - (this.opt.zStep * i);
				
				this.styles[i] = {
					display : "block",
					opacity : 1,
					transform : "scale(" + zAxe + ")" // @todo: calculate scaling
				};
				this.styles[i][this.opt.xOrigin] = (left   + this.opt.xStep * i) + 'px';
				this.styles[i][this.opt.yOrigin] = (bottom + this.opt.yStep * i) + 'px';
				
				this.zIndex[i] = {
					zIndex: (this.opt.slideZIndex - i)
				};
				
			}
			
			this.hiddenStyle = this.styles.pop();
			this.hiddenStyle = $.extend(this.hiddenStyle, {opacity: 0, transform: "scale(0)"}, this.zIndex.pop());
			
			this.leavingStyle = {
				zIndex: this.opt.slideZIndex + 1,
				transform: "scale(" + (1 + this.opt.zStep) + ")",
				opacity: 0
			};
			this.leavingStyle[this.opt.xOrigin] = "-" + self.opt.xStep + "px";
			this.leavingStyle[this.opt.yOrigin] = "-" + self.opt.yStep + "px";
			
			// ---
			// Build elem collection
			$slides.slice(this.opt.slideNbr).each(function () {
				self.$hiddenSlides.push($(this));
			});
			$slides.slice(0, this.opt.slideNbr).each(function () {
				self.$visibleSlides.push($(this));
			});
			
			// Set Slide overlaping
			$.each(this.$visibleSlides, function (i, $elem) {
				$elem.css($.extend(self.styles[i], self.zIndex[i]));
			});
			
			// Hide unavaible slides
			$.each(this.$hiddenSlides, function (i, $elem) {
				$elem.css(self.hiddenStyle);
			});
		},
		
		getOptions: function (options) {
			options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data());
			return options;
		},
		
		next: function () {
			
			if (this.animating) {
				return;
			}
			this.animating = true;
			
			var self = this,
				state = [];
			
			
			// ---
			// Prepare new slide and add it to active slides
			
			var $nextSlide = this.$hiddenSlides.shift();
			this.$visibleSlides.push($nextSlide);
			
			
			// ---
			// Get first slide and add it to hidden slides
			
			this.$disappearingSlide = this.$visibleSlides.shift();
			this.$hiddenSlides.push(this.$disappearingSlide);
			
			
			// ---
			// Animate slider to advance
			
			// move active in place
			$.each(this.$visibleSlides, function (i, $elem) {
				var def = new $.Deferred();
				state.push(def.promise());
				
				$elem.animate(self.styles[i], {
						duration : self.opt.animationSpeed,
						complete : function () {
							def.resolve();
						}
					});
			});
			
			// Fade the first slide
			this.$disappearingSlide.animate(this.leavingStyle, {
				duration : self.opt.animationSpeed,
				complete : function () {
					$(this).css(self.hiddenStyle);
				}
			});
			
			
			// ---
			// Fire callback
			
			$.when.apply(this, state)
				.done(function () {
					
					// unlocked animation
					self.animating = false;
					
					// apply z-index
					$.each(self.$visibleSlides, function (i, $elem) {
						$elem.css(self.zIndex[i]);
					});
					
					// callbacks
					
					if ($.isFunction(self.opt.moveCallback)) {
						self.opt.moveCallback();
					}
					if (typeof self.opt.moveEvent === "String") {
						$(document).trigger(self.opt.moveEvent);
						$(document).trigger(self.opt.moveEvent + ":next");
					}
				});
			
		},
		
		prev: function () {
			
			if (this.animating) {
				return;
			}
			this.animating = true;
			
			var self = this,
				state = [];
			
			
			// ---
			// Prepare new slide and add it to active slides
			
			var $nextSlide = this.$hiddenSlides.pop();
			this.$visibleSlides.unshift($nextSlide);
			
			$nextSlide.css(this.leavingStyle);
			
			
			// ---
			// Get first slide and add it to hidden slides
			
			this.$disappearingSlide = this.$visibleSlides.pop();
			this.$hiddenSlides.unshift(this.$disappearingSlide);
			
			
			// ---
			// Animate slider to advance
			
			// move active in place
			$.each(this.$visibleSlides, function (i, $elem) {
				var def = new $.Deferred();
				state.push(def.promise());
				
				$elem.animate(self.styles[i], {
					duration : self.opt.animationSpeed,
					complete : function () {
						def.resolve();
					}
				});
			});
			
			// Fade the last slide
			this.$disappearingSlide.animate(this.hiddenStyle, {
				duration : self.opt.animationSpeed
			});
			
			
			// ---
			// Fire callback
			
			$.when.apply(this, state)
				.done(function () {
					
					// unlocked animation
					self.animating = false;
					
					// apply z-index
					$.each(self.$visibleSlides, function (i, $elem) {
						$elem.css(self.zIndex[i]);
					});
					
					// callbacks
					
					if ($.isFunction(self.opt.moveCallback)) {
						self.opt.moveCallback();
					}
					if (typeof self.opt.moveEvent === "String") {
						$(document).trigger(self.opt.moveEvent);
						$(document).trigger(self.opt.moveEvent + ":prev");
					}
				});
		}
		
	};
	
	
	$.fn.ThreeDish = function (option) {
		return this.each(function () {
			var $this   = $(this),
				data    = $this.data('ThreeDish'),
				options = (typeof option === 'object') && option;
				
			if (!data) {
				$this.data('ThreeDish', (data = new ThreeDish(this, options)));
			}
			if (typeof option === 'string') {
				data[option]();
			}
		});
	};
	
	$.fn.ThreeDish.Constructor = ThreeDish;
  
	$.fn.ThreeDish.defaults = {
		// @todo: make autoplay
		//autoplay      : false,
		//autoplaySpeed : 2000,
		
		animationSpeed : 500,
		
		slideClass : '.slide',
		slideSize  : {
			width  : '300px',
			height : '100px'
		},
		slideZIndex : 10000,
		slideNbr : 4,
		
		xOrigin : "left",
		yOrigin : "bottom",
		
		xStep : 30,
		yStep : 20,
		zStep : 0.2,
		
		// Callbacks
		moveCallback : false,
		moveEvent    : "ThreeDish:move"
	};
		

}(window.jQuery));
