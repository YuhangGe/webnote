/**
 * 实用函数类，全局依赖，必须首先引用。
 */
if( typeof Daisy === 'undefined')
	Daisy = {};

Daisy.$ = function(id) {
	return document.getElementById(id);
}; (function($) {
	var ua = navigator.userAgent.toLowerCase();
	var s; ( s = ua.match(/msie ([\d.]+)/)) ? $.ie = s[1] : ( s = ua.match(/firefox\/([\d.]+)/)) ? $.firefox = s[1] : ( s = ua.match(/chrome\/([\d.]+)/)) ? $.chrome = s[1] : ( s = ua.match(/opera.([\d.]+)/)) ? $.opera = s[1] : ( s = ua.match(/version\/([\d.]+).*safari/)) ? $.safari = s[1] : 0;

	$.log = function(format, arg1, arg2) {
		jQuery.log.apply(this, arguments);
	}
	$.addEvent = function(ele, event, handler) {
		if( typeof ele === 'string')
			ele = $(ele);
		if(window.addEventListener) {
			ele.addEventListener(event, handler);
		} else {
			ele.attachEvent('on' + event, handler);
		}
	}
	$.delEvent = function(ele, event, handler) {
		if( typeof ele === 'string')
			ele = $(ele);
		if(window.removeEventListener) {
			ele.removeEventListener(event, handler);
		} else {
			ele.detachEvent('on' + event, handeler);
		}
	}
	$.createDelegate = function(instance, func) {
		return function() {
			try {
				func.apply(instance, arguments);
			} catch(e) {
				console.trace();
				$.log(e);
			}
		}
	}
	$.stopEvent = function(e) {
		if(e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		if(e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	}
	$.addWheelEvent = function(ele, handler) {
		if( typeof ele === 'string')
			ele = $(ele);
		if(window.addEventListener) {
			if($.firefox)
				ele.addEventListener('DOMMouseScroll', handler);
			else
				ele.addEventListener('mousewheel', handler);
		} else {
			ele.attachEvent('onmousewheel', handler);
		}
	}
	$.getFontHeight = function(font) {
		var ele = document.createElement("span"), h = 0;
		ele.style.font = font;
		ele.style.margin = "0px";
		ele.style.padding = "0px";
		ele.style.visibility = "hidden";
		ele.innerHTML = "Abraham 04-02.I Love Daisy.南京大学";
		document.body.appendChild(ele);
		h = ele.offsetHeight;
		document.body.removeChild(ele);
		$.log("s:%d", h);
		return h;
	}
	$.extend = function(src, ext) {
		for(var f in ext) {
			if(src[f] == null)
				src[f] = ext[f];
			else
				throw "extend error!"
		}
	}
	$.getMiddlePoint = function(p1, p2) {
		return {
			x : (p1.x + p2.x) / 2,
			y : (p1.y + p2.y) / 2
		}
	}
	$.drawBesier = function(ctx, points) {
		var len = points.length;
		if(len === 0)
			return;
		else if(len === 1) {
			//to do
			return;
		}

		ctx.beginPath();
		var s = points[0], e = points[len - 1];

		var ctrl = null, dest = null;
		ctrl = points[0];
		ctx.moveTo(ctrl.x, ctrl.y);
		for(var i = 0; i < len - 1; i++) {
			dest = $.getMiddlePoint(points[i], points[i + 1]);
			ctx.quadraticCurveTo(ctrl.x, ctrl.y, dest.x, dest.y);
			ctrl = points[i + 1];
		}
		dest = points[len - 1];
		ctx.quadraticCurveTo(ctrl.x, ctrl.y, dest.x, dest.y);
		ctx.stroke();
		ctx.closePath();
	}
})(Daisy.$);
