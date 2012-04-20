(function(Daisy, $) {
	/**
	 * doodle类。使用了js的面向对象。
	 * 总父类 ： Daisy._Doodle
	 * 一级子类： Daisy._NormalDoodle, Daisy._ImageDoodle, Daisy._LightDoodle, Daisy._LineDoodle,
	 *        Daisy._RectDoodle, Daisy._CircleDoodle, Daisy._EraserDoodle 和  Daisy._FilterDoodle
	 * 二级子类： Daisy._FilterDoodle是所有滤镜效果doodle的父类，子类有， Daisy._BlurDoodle, Daisy._EmbossDoodle, Daisy._NeonDoodle,
	 *        Daisy._ScribbleDoodle, Daisy._SketchDoodle. 其中Scribble和Sketch还未实现。
	 */

	Daisy._Doodle = function(type, points, color, pen_width, eraser_list) {
		this.points = points;
		this.color = color;
		this.pen_width = pen_width;
		this.eraser_list = eraser_list;
		this.type = type;
		this.edit_mode = false;
		this.boundary = {
			left : 0,
			top : 0,
			height : 0,
			width : 0
		}
		if(this.points.length > 0)
			this._calc();
	}
	Daisy._Doodle.Type = {
		NORMAL : 0,
		EMBOSS : 1,
		BLUR : 2,
		NEON : 3,
		LIGHT : 4,
		LINE : 5,
		SQUARE : 6,
		CIRCLE : 7,
		IMAGE : 8,
		ERASER : 10,
		GROUP : 11,
		SCRIBBLE : 12,
		SKETCH : 13,
		EDITHELPER : 999
	};
	/**
	 * tag: IMAGE下是变形矩阵 matrix
	 *
	 */
	Daisy._Doodle.create = function(type, pen_width, color, eraser_list, value, tag) {
		var d = null, T = Daisy._Doodle.Type;
		switch(type) {
			case T.IMAGE:
				return new Daisy._ImageDoodle(value, tag, eraser_list);
			case T.ERASER:
				return new Daisy._EraserDoodle(value, pen_width);
			case T.LINE:
				return new Daisy._LineDoodle(value, color, pen_width, eraser_list);
			case T.SQUARE:
				return new Daisy._RectDoodle(value, color, pen_width, eraser_list);
			case T.CIRCLE:
				return new Daisy._CircleDoodle(value, color, pen_width, eraser_list);
			case T.LIGHT :
				return new Daisy._LightDoodle(value, color, pen_width, eraser_list);
			case T.NORMAL :
				return new Daisy._NormalDoodle(value, color, pen_width, eraser_list);
			case T.EMBOSS :
				return new Daisy._EmbossDoodle(value, color, pen_width, eraser_list);
			case T.BLUR :
				return new Daisy._BlurDoodle(value, color, pen_width, eraser_list);
			case T.NEON :
				return new Daisy._NeonDoodle(value, color, pen_width, eraser_list);
			case T.SCRIBBLE :
				return new Daisy._ScribbleDoodle(value, color, pen_width, eraser_list);
			case T.SKETCH :
				return new Daisy._SketchDoodle(value, color, pen_width, eraser_list);
			case T.GROUP :
				return new Daisy._GroupDoodle(value);
			default:
				$.log("unkown type of doodle:%d", type);
				return null;
				break;
		}
	}
	Daisy._Doodle.prototype = {
		_calc : function() {
			this.boundary = $.getPointsBound(this.points, Math.round(this.pen_width));
		},
		drawEraser : function(ctx) {
			ctx.save();
			ctx.globalCompositeOperation = "destination-out";
			for(var i = 0; i < this.eraser_list.length; i++) {
				ctx.lineWidth = this.eraser_list[i].pen_width;
				$.drawBesier(ctx, this.eraser_list[i].points);
			}
			ctx.restore();
		},
		getBoundary : function() {
			return this.boundary;
		},
		draw : function(ctx) {
			throw "abstract method";
		},
		editMove : function(dx,dy) {
			for(var i = 0; i < this.points.length; i++) {
				this.points[i].x = this._pre_ps[i].x + dx;
				this.points[i].y = this._pre_ps[i].y + dy;
			}
		},
		editRotateScale : function(relay_point, rotate, scale) {
			for(var i=0;i<this.points.length;i++){
				var c_x = this._pre_ps[i].x - relay_point.x, c_y = this._pre_ps[i].y - relay_point.y;
					c_x = c_x*scale;
					c_y = c_y*scale;
				this.points[i].x = Math.round(c_x + relay_point.x);
				this.points[i].y = Math.round(c_y + relay_point.y);
				
				this.points[i].x = Math.round(c_x*Math.cos(rotate) - c_y*Math.sin(rotate) + relay_point.x);
				this.points[i].y = Math.round(c_x*Math.sin(rotate) + c_y*Math.cos(rotate) + relay_point.y);				
			}
			this.pen_width = this._pre_pw*scale;
		},
		_copyPoints : function() {
			var c_ps = [];
			for(var i = 0; i < this.points.length; i++) {
				c_ps.push({
					x : this.points[i].x,
					y : this.points[i].y
				});
			}
			return c_ps;
		},
		editStart : function() {
			this.edit_mode = true;
			this._pre_ps = this._copyPoints();
			this._pre_b = $.copyJson(this.boundary);
			this._pre_pw = this.pen_width;
		},
		editFinish : function(point) {
			this.edit_mode = false;
			this._calc();
		},
		editPushPoint : function(p) {
			this.points.push(p);
			this._calc();
		}
	}

	Daisy._ImageDoodle = function(img_src, matrix, e_list) {
		this.base(Daisy._Doodle.Type.IMAGE, [], "black", 5, e_list);
		this.image = new Image();
		if(matrix != null)
			this.matrix = matrix;
		else
			this.matrix = [1, 0, 0, 0, 1, 0];
		this.image.onload = $.createDelegate(this, this._img_load);
		this.image.src = img_src;

	}
	Daisy._ImageDoodle.prototype = {
		_img_load : function() {
			SNEditor.render.paint();
			this._calc();
		},
		_calc : function(w, h) {
			var m = this.matrix, w = this.image.width, h = this.image.height;
			this.points = [{
				x : m[2],
				y : m[5]
			}, {
				x : m[0] * w + m[2],
				y : m[3] * w + m[5]
			}, {
				x : m[1] * h + m[2],
				y : m[4] * h + m[5]
			}, {
				x : m[0] * w + m[1] * h + m[2],
				y : m[3] * w + m[4] * h + m[5]
			}];
			this.callBase("_calc");
		},
		draw : function(ctx) {
			ctx.save();
			ctx.setTransform(this.matrix[0], this.matrix[3], this.matrix[1], this.matrix[4], this.matrix[2], this.matrix[5]);
			ctx.drawImage(this.image, 0, 0);
			ctx.restore();
			this.drawEraser(ctx);
		},
		_copyMatrix : function(){
			var c_m = [];
			for(var i=0;i<this.matrix.length;i++){
				c_m.push(this.matrix[i]);
			}
			return c_m;
		},
		editStart : function(){
			this.callBase("editStart");
			this.pre_matrix = this._copyMatrix();
		},
		editMove : function(dx, dy) {
			this.matrix[2] = this.pre_matrix[2] + dx;
			this.matrix[5] = this.pre_matrix[5]+ dy;
		},
		editRotateScale : function(relay_point, rotate, scale){
			var m = this.matrix, pm = this.pre_matrix, sin = Math.sin(rotate), cos = Math.cos(rotate);
			m[0] = cos*pm[0]-sin*pm[3];
			m[1] = cos*pm[1] - sin*pm[4];
			m[2] = cos*pm[2] - sin*pm[5];
			m[3] = sin*pm[0] + cos*pm[3];
			m[4] = sin*pm[1] + cos*pm[4];
			m[5] = sin*pm[2] + cos*pm[5];
			
		},
		editPushPoint : function() {
			return;
		}
	}
	$.inherit(Daisy._ImageDoodle, Daisy._Doodle);

	Daisy._EraserDoodle = function(points, pen_width) {
		this.base(Daisy._Doodle.Type.ERASER, points, "black", pen_width, []);
	}
	$.inherit(Daisy._EraserDoodle, Daisy._Doodle);

	Daisy._NormalDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.NORMAL, points, color, pen_width, e_list);
	}
	Daisy._NormalDoodle.prototype = {
		draw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			$.drawBesier(ctx, this.points);
			this.drawEraser(ctx);
		}
	}
	$.inherit(Daisy._NormalDoodle, Daisy._Doodle);

	Daisy._FilterDoodle = function(type, points, color, pen_width, e_list) {
		this.base(type, points, color, pen_width, e_list);
		this.saved_data = null;
		this.change = true;
	}
	Daisy._FilterDoodle.prototype = {
		_applyFilter : function() {
			throw "abstract method";
		},
		editMove : function(dx,dy) {
			this.callBase("editMove",[dx,dy]);
			this._calc();
		},
		editRotateScale : function(relay_point, rotate, scale){
			this.callBase("editRotateScale", [relay_point, rotate, scale]);
			this._calc();
			this.change = true;
		},
		draw : function(ctx, width, height) {
			if(this.change) {
				ctx.strokeStyle = this.color;
				ctx.lineWidth = this.pen_width;
				$.drawBesier(ctx, this.points);
				this._applyFilter(ctx,this.boundary.left, this.boundary.top, this.boundary.width, this.boundary.height);
				this.drawEraser(ctx);
				/**
				 * 当用户正在编辑状态下保持change为true使得每次添加新的点（或是改变大小，旋转）后会及时重绘。
				 */
				if(!this.edit_mode) {
					this.data = ctx.getImageData(this.boundary.left, this.boundary.top, this.boundary.width, this.boundary.height);
					this.change = false;
				}
				//$.log("apply filter");
			} else {
				//$.log("direct put data");
				ctx.putImageData(this.data, this.boundary.left, this.boundary.top);
			}
		}
	}
	$.inherit(Daisy._FilterDoodle, Daisy._Doodle);

	Daisy._BlurDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.BLUR, points, color, pen_width, e_list);
	}
	Daisy._BlurDoodle.prototype = {
		_applyFilter : function(ctx,left,top,width,height) {
			$.stackBoxBlurCanvasRGBA(ctx, left, top, width, height);
		}
	}
	$.inherit(Daisy._BlurDoodle, Daisy._FilterDoodle);

	Daisy._EmbossDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.BLUR, points, color, pen_width, e_list);
	}
	Daisy._EmbossDoodle.prototype = {
		_applyFilter : function(ctx,left,top,width,height) {
			var t_f = new Date().getTime();
			//$.boxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height,1);
			//$.stackBoxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height, 1);
			$.processEmboss(ctx, left,top,width,height, 10);
			//$.log("emboss time:%d", new Date().getTime() - t_f);
		}
	}
	$.inherit(Daisy._EmbossDoodle, Daisy._FilterDoodle);

	Daisy._NeonDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.BLUR, points, color, pen_width, e_list);
	}
	Daisy._NeonDoodle.prototype = {
		_applyFilter : function(ctx,left,top,width,height) {
			var t_f = new Date().getTime();
			$.stackBoxBlurCanvasRGBA(ctx, left,top,width,height);
			ctx.strokeStyle = 'white';
			ctx.lineWidth = this.pen_width / 2;
			$.drawBesier(ctx, this.points);
			//$.log("neon time:%d", new Date().getTime() - t_f);
		}
	}
	$.inherit(Daisy._NeonDoodle, Daisy._FilterDoodle);

	Daisy._LightDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.LIGHT, points, color, pen_width, e_list);
	}
	Daisy._LightDoodle.prototype = {
		draw : function(ctx) {
			ctx.save();
			ctx.globalAlpha = 0.4;
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			$.drawBesier(ctx, this.points);
			ctx.restore();
			this.drawEraser(ctx);
		}
	}
	$.inherit(Daisy._LightDoodle, Daisy._Doodle);

	Daisy._RectDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.SQUARE, points, color, pen_width, e_list);
	}
	Daisy._RectDoodle.prototype = {
		draw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			ctx.beginPath();
			ctx.moveTo(this.points[0].x, this.points[0].y);
			ctx.lineTo(this.points[2].x, this.points[2].y);
			ctx.lineTo(this.points[1].x, this.points[1].y);
			ctx.lineTo(this.points[3].x, this.points[3].y);
			ctx.closePath();
			ctx.stroke();
			this.drawEraser(ctx);
		},
		editPushPoint : function(point) {
			this.points[1] = point;
			this.points[2] = {
				x : this.points[0].x,
				y : this.points[1].y
			};
			this.points[3] = {
				x : this.points[1].x,
				y : this.points[0].y
			}
		}
	}
	$.inherit(Daisy._RectDoodle, Daisy._Doodle);

	Daisy._CircleDoodle = function(points, color, pen_width, e_list) {
		if(points.length === 1)
			points[1] = points[0];
		this.base(Daisy._Doodle.Type.CIRCLE, points, color, pen_width, e_list);
	}
	Daisy._CircleDoodle.prototype = {
		editMove : function(dx,dy){
			this.callBase("editMove",[dx,dy]);
			this._calcRadius();
		},
		editRotateScale : function(relay_point, rotate, scale){
			this.callBase("editRotateScale", relay_point,rotate, scale);
			this._calcRadius();
		},
		_calcRadius : function(){
			this.center = $.getMiddlePoint(this.points[0], this.points[1]);
			this.radius = Math.round($.getPTPRange(this.points[0], this.points[1]) / 2);
		},
		_calc : function() {
			var off = Math.round(this.pen_width);
			this._calcRadius();
			this.boundary.width = this.radius * 2 + off * 2;
			this.boundary.height = this.boundary.width;
			this.boundary.left = this.center.x - this.radius - off;
			this.boundary.top = this.center.y - this.radius - off;
		},
		draw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			ctx.beginPath();
			ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.closePath();
			this.drawEraser(ctx);
		},
		editPushPoint : function(point) {
			this.points[1] = point;
			this._calcRadius();
		}
	}
	$.inherit(Daisy._CircleDoodle, Daisy._Doodle);

	Daisy._LineDoodle = function(points, color, pen_width, e_list) {
		if(points.length === 1)
			points[1] = points[0];
		this.base(Daisy._Doodle.Type.CIRCLE, points, color, pen_width, e_list);
	}
	Daisy._LineDoodle.prototype = {
		_calc : function() {
			var off = Math.round(this.pen_width);
			this.boundary.width = Math.abs(this.points[0].x - this.points[1].x) + off * 2;
			this.boundary.height = Math.abs(this.points[0].y - this.points[1].y) + off * 2;
			this.boundary.left = Math.min(this.points[0].x, this.points[1].x) - off;
			this.boundary.top = Math.min(this.points[0].y, this.points[1].y) - off;
		},
		draw : function(ctx) {
			ctx.lineWidth = this.pen_width;
			ctx.strokeStyle = this.color;
			ctx.beginPath();
			ctx.moveTo(this.points[0].x, this.points[0].y);
			ctx.lineTo(this.points[1].x, this.points[1].y);
			ctx.stroke();
			ctx.closePath();
			this.drawEraser(ctx);
		},
		editPushPoint : function(point) {
			this.points[1] = point;
		}
	}
	$.inherit(Daisy._LineDoodle, Daisy._Doodle);

	Daisy._GroupDoodle = function(d_list) {
		this.list = d_list;
	}
	Daisy._GroupDoodle.prototype = {
		draw : function(ctx) {
			//$.log("group draw");
			for(var i = 0; i < this.list.length; i++) {
				ctx.save();
				this.list[i].draw(ctx);
				ctx.restore();
			}
		}
	}

})(Daisy, Daisy.$);
