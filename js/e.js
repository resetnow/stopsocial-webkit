/* jshint unused:strict */
/* jshint strict: true */
/* global Event */ 

var e;

(function() {
	"use strict";
	e = function(selector) {
		return new E(selector);
	};
	var E = function(selector) {
		switch (typeof selector) {
			case "string":
				var nodes = document.querySelectorAll(selector);
				for (var i = 0; i < nodes.length; i++)
					this[i] = nodes[i];
				this.length = nodes.length;
				return this;
			case "function":
				window.addEventListener('DOMContentLoaded', function() {
					selector();
				});
				return;
			case "object":
				this.length = 1;
				this[0] = selector;
				return this;
		}
	};
	e.fn = E.prototype = {
		hide: function() {
			for (var i = 0; i < this.length; i++)
				this[i].style.display = 'none';
			return this;
		},
		show: function(display) {
			display = (display) ? display : "block";
			for (var i = 0; i < this.length; i++)
				this[i].style.display = display;
			return this;
		},
		remove: function() {
			for (var i = 0; i < this.length; i++)
				this[i].parentNode.removeChild(this[i]);
			return this;
		},
		on: function(events, callback) {
			events = events.split(' ');
			for (var i = 0, c = events.length; i < c; i++)
				for (var k = 0; k < this.length; k++)
					this[i].addEventListener(events[i], callback);
		},
		click: function(callback) {
			for (var i = 0; i < this.length; i++)
				this[i].addEventListener("click", callback);
			return this;
		},
		change: function(callback) {
			for (var i = 0; i < this.length; i++)
				this[i].addEventListener("change", callback);
			return this;
		},
		html: function(content) {
			var i = 0;
			if (content) {
				for (; i < this.length; i++)
					this[i].innerHTML = content;
			}
			else {
				var html = [];
				for (; i < this.length; i++)
					html[i] = this[i].innerHTML;
				return html;
			}
			return this;
		},
		addClass: function(c) {
			for (var i = 0; i < this.length; i++)
				this[i].className += " " + c;
			return this;
		},
		removeClass: function(c) {
			var r = new RegExp(c, 'g');
			for (var i = 0; i < this.length; i++) {
				this[i].className = this[i].className.replace(r, '');
				this[i].className = this[i].className.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			}
			return this;
		},
		attr: function(name, value) {
			var i;
			if (typeof name == "object") {
				for (i = 0; i < this.length; i++) {
					if (this[i].setAttribute) {
						for (var v in name)
							this[i].setAttribute(v, name[v]);
					}
				}
				return this;
			}
			if (value !== undefined) {
				for (i = 0; i < this.length; i++) {
					if (this[i].setAttribute) {
						this[i].setAttribute(name, value);
					}
				}
			}
			else {
				var attr = [];
				for (i = 0; i < this.length; i++)
					if (this[i].getAttribute) 
						attr[i] = this[i].getAttribute(name);
				return (attr.length > 1) ? attr : attr[0];
			}
			return this;
		},
		prop: function(name, value) {
			var i = 0;
			if (value !== undefined) {
				for (; i < this.length; i++) {
					this[i][name] = value;
				}
				return this;
			} else {
				var attr = [];
				for (; i < this.length; i++)
					attr[i] = this[i][name];
				return attr;
			}
		},
		trigger: function(e) {
			var event = new Event(e);
			switch(e) {
				case "click":
					event = new MouseEvent('click', {
						'view': window,
						'bubbles': true,
						'cancelable': true
					});
				break;
			}
			for (var i = 0; i < this.length; i++)
				this[i].dispatchEvent(event);
		},
		each: function(callback) {
			for (var i = 0; i < this.length; i++)
				callback(i, this[i]);
		},
		appendTo: function(selector) {
			var element = document.querySelector(selector);
			if (!element)
				return;
			for (var i = 0; i < this.length; i++)
				element.appendChild(this[i]);
		}
	};
}());