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
	var s;
	( s = ua.match(/msie ([\d.]+)/)) ? $.ie = s[1] : ( s = ua.match(/firefox\/([\d.]+)/)) ? $.firefox = s[1] : ( s = ua.match(/chrome\/([\d.]+)/)) ? $.chrome = s[1] : ( s = ua.match(/opera.([\d.]+)/)) ? $.opera = s[1] : ( s = ua.match(/version\/([\d.]+).*safari/)) ? $.safari = s[1] : 0;
	$.extend = function(src, ext) {
		for(var f in ext) {
			if(src[f] == null)
				src[f] = ext[f];
			else
				throw "extend error!"
		}
	};
	$.extend($, {
		log : function(format, arg1, arg2) {
			jQuery.log.apply(this, arguments);
		},
		IME_KEY : $.opera ? 197 : 229,
		addEvent : function(ele, event, handler) {
			if( typeof ele === 'string')
				ele = $(ele);
			if(window.addEventListener) {
				ele.addEventListener(event, handler);
			} else {
				ele.attachEvent('on' + event, handler);
			}
		},
		delEvent : function(ele, event, handler) {
			if( typeof ele === 'string')
				ele = $(ele);
			if(window.removeEventListener) {
				ele.removeEventListener(event, handler);
			} else {
				ele.detachEvent('on' + event, handeler);
			}
		},
		createDelegate : function(instance, func) {
			return function() {
				func.apply(instance, arguments);
			}
		},
		stopEvent : function(e) {
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
		},
		addWheelEvent : function(ele, handler) {
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
		},
		/**
		 * js 面向对象。
		 *
		 */
		inherit : function(inheritClass, baseClass) {
			//首先把父类的prototype中的函数继承到子类中
			for(var pFunc in baseClass.prototype) {
				var sp = inheritClass.prototype[pFunc];
				//如果子类中没有这个函数，添加
				if( typeof sp === 'undefined') {
					inheritClass.prototype[pFunc] = baseClass.prototype[pFunc];
				}
				//如果子类已经有这个函数，则忽略。以后可使用下面的callBase函数调用父类的方法

			}
			//保存继承树，当有多级继承时要借住继承树对父类进行访问
			inheritClass.__base_objects__ = new Array();
			inheritClass.__base_objects__.push(baseClass);

			if( typeof baseClass.__base_objects__ !== 'undefined') {
				for(var i = 0; i < baseClass.__base_objects__.length; i++)
					inheritClass.__base_objects__.push(baseClass.__base_objects__[i]);
			}

			/**
			 * 执行父类构造函数，相当于java中的this.super()
			 * 不使用super是因为super是ECMAScript保留关键字.
			 * @param {arguments} args 参数，可以不提供
			 */
			inheritClass.prototype.base = function(args) {

				var baseClass = null, rtn = undefined;
				if( typeof this.__inherit_deep__ === 'undefined') {
					this.__inherit_deep__ = 0;
				} else {
					this.__inherit_deep__++;
					//$.dprint("d+:"+this.__inherit_deep__);
				}

				baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

				if( typeof args === "undefined" || args == null) {
					rtn = baseClass.call(this);
				} else if( args instanceof Array === true) {
					rtn = baseClass.apply(this, args);
				} else {
					var _args = new Array();
					for(var i = 0; i < arguments.length; i++)
						_args.push(arguments[i]);
					rtn = baseClass.apply(this, _args);
				}

				this.__inherit_deep__--;

				//$.dprint("d-:"+this.__inherit_deep__);
				return rtn;
			}
			/**
			 * 给继承的子类添加调用父函数的方法
			 * @param {string} method 父类的函数的名称
			 * @param {arguments} args 参数，可以不提供
			 */
			inheritClass.prototype.callBase = function(method, args) {

				var baseClass = null, rtn = undefined;

				if( typeof this.__inherit_deep__ === 'undefined') {
					this.__inherit_deep__ = 0;

				} else {
					this.__inherit_deep__++;
					//$.dprint("d+:"+this.__inherit_deep__);
				}

				//$.dprint(this.__inherit_deep__);
				baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

				var med = baseClass.prototype[method];
				if( typeof med === 'function') {
					if( typeof args === "undefined" || args === null) {
						rtn = med.call(this);
					} else if( args instanceof Array === true) {
						rtn = med.apply(this, args);
					} else {
						var _args = new Array();
						//从位置1开始，因为第0位参数是method的名称
						for(var i = 1; i < arguments.length; i++) {
							_args.push(arguments[i]);
						}
						rtn = med.apply(this, _args);
					}
				} else {
					throw "There is no method:" + method + " in baseClass";
				}

				this.__inherit_deep__--;

				//$.dprint("d-:"+this.__inherit_deep__);
				//$.dprint("----");
				return rtn;
			}
		},
		getFontHeight : function(font) {
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
		},
		getMiddlePoint : function(p1, p2) {
			return {
				x : (p1.x + p2.x) / 2,
				y : (p1.y + p2.y) / 2
			}
		},
		besierToSVG : function(points) {
			var len = points.length, p_str = [];

			if(len < 2)
				return "";

			var s = points[0], e = points[len - 1];

			var ctrl = null, dest = null;
			ctrl = points[0];
			p_str.push("M", ctrl.x, " ", ctrl.y, " ");
			for(var i = 0; i < len - 1; i++) {
				dest = $.getMiddlePoint(points[i], points[i + 1]);
				//ctx.quadraticCurveTo(ctrl.x, ctrl.y, dest.x, dest.y);
				p_str.push("Q", ctrl.x, " ", ctrl.y, " ", dest.x, " ", dest.y, " ");
				ctrl = points[i + 1];
			}
			dest = points[len - 1];
			//ctx.quadraticCurveTo(ctrl.x, ctrl.y, dest.x, dest.y);
			p_str.push("Q", ctrl.x, " ", ctrl.y, " ", dest.x, " ", dest.y, " ");

			return p_str.join("");
		},
		drawBesier : function(ctx, points) {
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
		},
		hasFont : function(font_name) {
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
		},
		HAS_DROID_FONT : false,
		FONTFACE_DROID : "@font-face {\nfont-family: 'Droid Sans';\n\tsrc: url('css/font/DroidSans.ttf') format('truetype');\n}\n@font-face {\nfont-family: 'Droid Sans';\n\tsrc: url('css/font/DroidSans-Bold.ttf') format('truetype');\nfont-weight: bold;\n}",

		loadDroidSans : function() {
			var se = document.createElement("style");
			se.type = "text/css";
			if($.ie) {
				se.styleSheet.cssText = $.FONTFACE_DROID;
			} else {
				var frag = document.createDocumentFragment();
				frag.appendChild(document.createTextNode($.FONTFACE_DROID));
				se.appendChild(frag);
			}
			jQuery(function() {
				document.getElementsByTagName('head')[0].appendChild(se);
			});
		},
		/*
		 * 35px Droid Sans Fallback
		 */
		CHAR_WIDTH_TABLE : "",

		loadCharWidthTable : function() {
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
		},
		copyArray : function(arr){
			var n_a = [];
			for(var i=0;i<arr.length;i++){
				n_a.push(arr[i]);
			}
			return arr;
		},
		copyJson : function(json) {
			var rtn = {}
			for(var j in json) {
				rtn[j] = json[j]
			}
			return rtn;
		},
		jsonEqual : function(json1, json2) {
			for(var j1 in json1) {
				if(json2[j1] !== json1[j1])
					return false;
			}
			return true;
		},
		getOffset : function(ele) {
			var left = ele.offsetLeft, top = ele.offsetTop;
			if(ele.offsetParent !== null) {
				var ot = $.getOffset(ele.offsetParent);
				left += ot.left;
				top += ot.top;
			}
			return {
				left : left,
				top : top
			}
		},
		/**
		 * 计算点到直线距离。(Point To Line)
		 * point : {x:0,y:0}
		 * line_start,line_end : {x:0,y:0}
		 */
		getPTLRange : function(point, line_start, line_end) {
			var vx1 = line_end.x - line_start.x, vy1 = line_end.y - line_start.y, r1 = $.getPTPRange(line_start, line_end), vx2 = point.x - line_start.x, vy2 = point.y - line_start.y, r2 = $.getPTPRange(line_start, point);
			var cosa = (vx1 * vx2 + vy1 * vy2) / (r1 * r2), angle = Math.acos(cosa);
			//$.log("cosa:"+cosa+", angle:"+angle)
			if(angle > Math.PI / 2 || r2 * cosa > r1)
				return Daisy._Doodle.HUGE_RANGE;
			else {
				return r2 * Math.sin(angle);
			}
			// var x1 = line_start.x, y1 = line_start.y, x2 = line_end.x, y2 = line_end.y;
			// var A = y2 - y1, B = x1 - x2, C = x2 * y1 - x1 * y2;
			// return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
		},
		/**
		 * 计算两点距离(Point To Point)
		 */
		getPTPRange : function(point1, point2) {

			return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
		},
		/**
		 * 得到包围点阵的最小矩形
		 * @param {Object} points 点阵
		 * @param {Number} offset 包围点阵的矩形的偏移量
		 * @return {Object} rect {left:,top:,width:,height:}
		 */
		getPointsBound : function(points, offset) {
			//$.log(points)
			var p = points[0], x1 = p.x, y1 = p.y, x2 = p.x, y2 = p.y;
			for(var j = 0; j < points.length; j++) {
				p = points[j];
				if(p.x < x1)
					x1 = p.x;
				if(p.x > x2)
					x2 = p.x;
				if(p.y < y1)
					y1 = p.y;
				if(p.y > y2)
					y2 = p.y;
			}
			return {
				width : x2 - x1 + offset * 2,
				height : y2 - y1 + offset * 2,
				left : x1 - offset,
				top : y1 - offset,
				right : x2 + offset,
				bottom : y2 + offset
			}
		}
	});
})(Daisy.$);
