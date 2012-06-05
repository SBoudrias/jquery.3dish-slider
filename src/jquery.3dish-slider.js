/*
 * jquery.3dish-slider
 * https://github.com/SimonBoudrias/3dish-slider
 *
 * Copyright (c) 2012 Simon Boudrias
 * Licensed under the MIT, GPL licenses.
 */

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
			this.$slides = this.$element.find(this.opt.slideClass);
			this.styles = [];
			this.zIndex = [];
			this.animating = false;
			
			// Set elem collection
			this.$hiddenSlides  = [];
			this.$visibleSlides = [];
			
			var self = this,
				bottom  = 0,
				left = 0,
				i = 0;
			
			
			// ---
			// Set defaults styles
			for (; i < this.opt.slideNbr + 1; i += 1) {
				
				var zAxe = 1 - (this.opt.zStep * i),
					xAxe = (left   + this.opt.xStep * i) + 'px',
					yAxe = (bottom + this.opt.yStep * i) + 'px';
					
				
				this.styles[i] = {
					opacity : 1,
					transform : "scale(" + zAxe + ") translate(" + xAxe + "," + yAxe + ") " // @todo: calculate scaling
				};
				
				this.zIndex[i] = {
					zIndex: (this.opt.slideZIndex - i)
				};
				
			}
			
			this.hiddenStyle = this.styles.pop();
			this.hiddenStyle = $.extend(this.hiddenStyle, {opacity: 0, transform: "scale(0.1)"}, this.zIndex.pop());
			
			this.leavingStyle = {
				zIndex: this.opt.slideZIndex + 1,
				transform: "scale(" + (1 + this.opt.zStep) + ") translate(" + (-self.opt.xStep) + "px,0)",
				opacity: 0
			};
			
			// ---
			// Build elem collection
			this.$slides.slice(this.opt.slideNbr).each(function () {
				self.$hiddenSlides.push($(this));
			});
			this.$slides.slice(0, this.opt.slideNbr).each(function () {
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
		
		next: function (callback) {
			
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
			
			this.animate('next', callback);
			
		},
		
		prev: function (callback) {
			
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
			
			this.animate('prev', callback);
			
		},
		
		animate : function (dir, callback) {
			var self = this,
				state = [];
			
			// ---
			// Move slide
			
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
			
			if (dir === 'next') {
				// Fade the first slide
				this.$disappearingSlide.animate(this.leavingStyle, {
					duration : self.opt.animationSpeed,
					complete : function () {
						$(this).css(self.hiddenStyle);
					}
				});
			} else {
				// Fade the last slide
				this.$disappearingSlide.animate(this.hiddenStyle, {
					duration : self.opt.animationSpeed
				});
			}
			
			
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
						self.opt.moveCallback(self.$visibleSlides[0]);
					}
					if (typeof self.opt.moveEvent === "string") {
						self.$element.trigger(self.opt.moveEvent, self.$visibleSlides[0]);
						self.$element.trigger(self.opt.moveEvent + ":" + dir, self.$visibleSlides[0]);
					}
					if ($.isFunction(callback)) {
						callback(self.$visibleSlides[0]);
					}
				});
		},
		
		goTo : function (position) {
			
			if (this.animating) {
				return;
			}
			
			var self = this,
				index = parseFloat(position),
				$nextSlide = this.$slides.eq(index),
				visiblesIndex,
				nextSlideIndex,
				i = 0,
				loop;
			
			if (!$nextSlide.length) {
				return;
			}
			
			visiblesIndex = $.map(this.$visibleSlides, function ($elem) {
				return $elem.index();
			});
			
			nextSlideIndex = $.inArray(index, visiblesIndex);
			
			if (nextSlideIndex >= 0) {
				
				// If slide is visible
				
				if (nextSlideIndex === 0) {
					return;
				}
				
				(function loop() {
					self.next(function () {
						i += 1;
						if (i < nextSlideIndex) {
							loop();
						}
					});
				}());
				
			} else {
				// If side is not visible
				this.animating = true;
				
				var newHiddenArray = [];
				$.each(this.$hiddenSlides, function (index, $elem) {
					if ($elem.get(0) !== $nextSlide.get(0)) {
						newHiddenArray.push($elem);
					}
				});
				this.$hiddenSlides = newHiddenArray;
				
				this.$disappearingSlide = this.$visibleSlides.pop();
				this.$hiddenSlides.unshift(this.$disappearingSlide);
				
				this.$visibleSlides.unshift($nextSlide);
				$nextSlide.css(this.leavingStyle);
				
				this.animate('prev');
				
			}
			
		},
		
		append : function ($elem) {
			
			var self = this;
			
			$elem.css(this.hiddenStyle);
			
			this.$element.append($elem);
			this.$slides.add($elem);
			this.$hiddenSlides.push($elem);
			
		}
		
	};
	
	
	$.fn.ThreeDish = function (option, args) {
		return this.each(function () {
			var $this   = $(this),
				data    = $this.data('ThreeDish'),
				options = (typeof option === 'object') && option;
				
			if (!data) {
				$this.data('ThreeDish', (data = new ThreeDish(this, options)));
			}
			if (typeof option === 'string') {
				data[option](args);
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
		//slideSize  : {
		//	width  : '300px',
		//	height : '100px'
		//},
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