/**
 * 实用函数类，全局依赖，必须首先引用。
 */
if( typeof Daisy === 'undefined')
	Daisy = {};

Daisy.$ = function(id) {
	return document.getElementById(id);
};
(function($) {

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
	$.hasFont = function(font_name) {
		/*
		 * test if there is font in system .
		 * inspired by http://remysharp.com/2008/07/08/how-to-detect-if-a-font-is-installed-only-using-javascript/
		 */
		var test_str = "abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ~!@#$%^&*()_+`1234567890-=爱小扬";
		if($.COMIC_WIDTH == null) {
			var comic_ele = document.createElement('span');
			comic_ele.style.font = "50px Comic Sans MS";
			comic_ele.innerHTML = test_str;
			comic_ele.style.visibility = "hidden";
			document.body.appendChild(comic_ele);
			$.COMIC_WIDTH = comic_ele.offsetWidth;
			document.body.removeChild(comic_ele);
			//$.log("comic width:" + $.COMIC_WIDTH)
		}
		var f_ele = document.createElement("span");
		f_ele.style.font = "50px " + font_name + ",Comic Sans MS";
		f_ele.style.visibility = "hidden";
		f_ele.innerHTML = test_str;
		document.body.appendChild(f_ele);
		var f_width = f_ele.offsetWidth;
		document.body.removeChild(f_ele);

		//$.log("font width:"+f_width);

		return f_width !== $.COMIC_WIDTH;
	}
	$.FONTFACE_DROID = "@font-face {\nfont-family: 'Droid Sans';\n\tsrc: url('css/font/DroidSans.ttf') format('truetype');\n}\n@font-face {\nfont-family: 'Droid Sans';\n\tsrc: url('css/font/DroidSans-Bold.ttf') format('truetype');\nfont-weight: bold;\n}";

	$.loadDroidSans = function() {
		var se = document.createElement("style");
		se.type = "text/css";
		if($.ie) {
			se.styleSheet.cssText = $.FONTFACE_DROID;
		} else {
			var frag = document.createDocumentFragment();
			frag.appendChild(document.createTextNode($.FONTFACE_DROID));
			se.appendChild(frag);
		}
		jQuery(function(){
			document.getElementsByTagName('head')[0].appendChild(se);
		});
		
	}
	/*
	 * 35px Droid Sans Fallback
	 */
	$.CHAR_WIDTH_TABLE = "";
	$.HAS_DROID_FONT = null;
	$.loadCharWidthTable = function() {
		jQuery.ajax({
			async : false,
			url : 'char_width_table.txt'
		}).done(function(table) {
			window.tb = $.CHAR_WIDTH_TABLE = (function decode(t) {
				var _tbl = (window.Int8Array ? new Int8Array(0xffff) : new Array(0xffff));
				var idx = 0;
				for(var i = 0; i < t.length; i += 2) {
					var len = t.charCodeAt(i), v = t.charCodeAt(i + 1);
					for(var j = 0; j < len; j++) {
						_tbl[idx] = v;
						idx++;
					}
				}
				//$.log("idx:%X",idx);
				return _tbl;
			})(table);
		}).fail(function(table) {
		});
	};

	$.copyJson = function(json) {
		var rtn = {}
		for(var j in json) {
			rtn[j] = json[j]
		}
		return rtn;
	}
	$.jsonEqual = function(json1, json2) {
		for(var j1 in json1) {
			if(json2[j1] !== json1[j1])
				return false;
		}
		return true;
	}
})(Daisy.$);
