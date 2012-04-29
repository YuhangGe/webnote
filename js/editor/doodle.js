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
		if(this.points.length !== 0)
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
		_isEraserIn : function(points) {
			/**
			 * 判断橡皮查是否和当前doodle有重叠。目前是简单的计算是否有点在boundary内。这个判断比较粗糙，但严格的是否有有点相交判断比较麻烦，尤其对于不规则的点阵涂鸦。
			 */
			for(var i = 0; i < points.length; i++) {
				if(points[i].x > this.boundary.left && points[i].x < this.boundary.right && points[i].y > this.boundary.top && points[i].y < this.boundary.bottom)
					return true;
			}
			return false;
		},
		/**
		 * 判断橡皮擦是否在doodle内，如果有重叠，则添加橡皮擦的拷贝到橡皮擦列表。之所以要添加拷贝，是因为每个doodle的橡皮擦是独立的。
		 */
		addEraserIfIn : function(eraser) {
			var n_e = null;
			if(this._isEraserIn(eraser.points) && this.eraser_list.indexOf(eraser)<0) {
				n_e = new Daisy._Doodle.create(Daisy._Doodle.Type.ERASER, eraser.pen_width, "", [], eraser._copyPoints());
				this.eraser_list.push(n_e);
			}
			return n_e;
		},
		addEraser : function(eraser){
			this.eraser_list.push(eraser);
		},
		removeEraser : function(eraser){
			this.eraser_list.splice(this.eraser_list.indexOf(eraser),1);
		},
		addTmpEraser : function(eraser){
			if(this._isEraserIn(eraser.points) && this.eraser_list.indexOf(eraser)<0) {
				this.eraser_list.push(eraser);
			}
		},
		removeTmpEraser : function(eraser){
			this.eraser_list.splice(this.eraser_list.indexOf(eraser),1);
		},
		getBoundary : function() {
			return this.boundary;
		},
		_doDraw : function(ctx, left, top, width, height) {
			throw "abstract method";
		},
		draw : function(ctx, d_ctx, m_ctx) {
			if(this.eraser_list.length === 0) {
				this._doDraw(ctx);
			} else {
				var b = this.boundary, l = b.left, t = b.top, w = b.width, h = b.height;
				d_ctx.clearRect(0, 0, d_ctx.canvas.width, d_ctx.canvas.height);
				this._doDraw(d_ctx, l, t, w, h);
				this.drawEraser(d_ctx);
				w += (l > 0 ? 0 : l);
				h += (t > 0 ? 0 : t);
				l = l > 0 ? l : 0;
				t = t > 0 ? t : 0;
				w = w > 0 ? w : 0;
				h = h > 0 ? h : 0;
				ctx.drawImage(d_ctx.canvas, l, t, w, h, l, t, w, h);
			}
		},
		editMove : function(dx, dy) {
			for(var i = 0; i < this.points.length; i++) {
				this.points[i].x = this.pre_points[i].x + dx;
				this.points[i].y = this.pre_points[i].y + dy;
			}
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editMove(dx, dy);
			}
			this._calc();
		},
		editRotateScale : function(relay_point, rotate, scale, not_calc) {
			for(var i = 0; i < this.points.length; i++) {
				var c_x = this.pre_points[i].x - relay_point.x, c_y = this.pre_points[i].y - relay_point.y;
				c_x = c_x * scale;
				c_y = c_y * scale;
				this.points[i].x = Math.round(c_x + relay_point.x);
				this.points[i].y = Math.round(c_y + relay_point.y);

				this.points[i].x = Math.round(c_x * Math.cos(rotate) - c_y * Math.sin(rotate) + relay_point.x);
				this.points[i].y = Math.round(c_x * Math.sin(rotate) + c_y * Math.cos(rotate) + relay_point.y);
			}
			this.pen_width = this.pre_pw * scale;
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editRotateScale(relay_point, rotate, scale, true);
			}
			if(not_calc !== true)
				this._calc();
		},
		rotateScale : function(relay_point, rotate, scale){
			this.pre_points = this.points;
			this.pre_pw = this.pen_width;
			for(var i = 0; i < this.eraser_list.length; i++) {
				var e = this.eraser_list[i];
				e.pre_points = e.points;
				e.pre_pw = e.pen_width;
			}
		 
			this.editRotateScale(relay_point, rotate, scale);
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
		move : function(dx, dy){
			for(var i = 0; i < this.points.length; i++) {
				this.points[i].x += dx;
				this.points[i].y += dy;
			}
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].move(dx, dy);
			}
			this._calc();
		},
		editStart : function() {
			this.edit_mode = true;
			this.pre_points = this._copyPoints();
			this.pre_pw = this.pen_width;
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editStart();
			}
		},
		editFinish : function(point) {
			this.edit_mode = false;
			this._calc();
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editFinish();
			}

		},
		editPushPoint : function(p) {
			this.points.push(p);
			this._calc();
		}
	}

	Daisy._ImageDoodle = function(img_src, matrix, e_list) {
		$.log('new img')
		this.base(Daisy._Doodle.Type.IMAGE, [], "black", 5, e_list);
		this.image = new Image();
		if(matrix != null)
			this.matrix = matrix;
		else
			this.matrix = [1, 0, 0, 0, 1, 0];
		this.image.onload = $.createDelegate(this, this._img_load);
		this.image.src = img_src;
		this.img_loaded = false;
	}
	Daisy._ImageDoodle.prototype = {
		_img_load : function() {
			this._calc();
			this.img_loaded = true;
			SNEditor.render.paint();
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
		draw : function(ctx, d_ctx, m_ctx) {
			if(!this.img_loaded)
				return;
			var b = this.boundary, l = b.left, t = b.top, w = b.width, h = b.height;
			d_ctx.clearRect(0, 0, d_ctx.canvas.width, d_ctx.canvas.height);
			this._doDraw(d_ctx, l, t, w, h);
			this.drawEraser(d_ctx);
			w += (l > 0 ? 0 : l);
			h += (t > 0 ? 0 : t);
			l = l > 0 ? l : 0;
			t = t > 0 ? t : 0;
			w = w > 0 ? w : 0;
			h = h > 0 ? h : 0;
			ctx.drawImage(d_ctx.canvas, l, t, w, h, l, t, w, h);
			
		},
		_doDraw : function(ctx) {
			ctx.save();
			ctx.setTransform(this.matrix[0], this.matrix[3], this.matrix[1], this.matrix[4], this.matrix[2], this.matrix[5]);
			ctx.drawImage(this.image, 0, 0);
			ctx.restore();
		},
		_copyMatrix : function() {
			var c_m = [];
			for(var i = 0; i < this.matrix.length; i++) {
				c_m.push(this.matrix[i]);
			}
			return c_m;
		},
		editStart : function() {
			this.callBase("editStart");
			this.pre_matrix = this._copyMatrix();
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editStart();
			}
		},
		editMove : function(dx, dy) {
			this.matrix[2] = this.pre_matrix[2] + dx;
			this.matrix[5] = this.pre_matrix[5] + dy;
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editMove(dx, dy);
			}
			this._calc();
		},
		move : function(dx,dy){
			this.matrix[2] += dx;
			this.matrix[5] += dy;
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].move(dx, dy);
			}
			this._calc();
		},
		rotateScale : function(relay_point, rotate, scale){
			 
			this.pre_matrix = $.copyArray(this.matrix);
			for(var i = 0; i < this.eraser_list.length; i++) {
				var e = this.eraser_list[i];
				e.pre_points = e.points;
				e.pre_pw = e.pen_width;
			}
			this.editRotateScale(relay_point, rotate, scale);
		},
		editRotateScale : function(relay_point, rotate, scale, not_calc) {
			/**
			 * 对矩阵进行缩放。由于操作的时候是相对图形中心点（relay_point）进行的旋转，而this.matrix保存的是相对于原点 的旋转，
			 * 所以实际的操作是先将中点移回原点，然后旋转，缩放，然后再将中点移回来。
			 *
			 * 					[1 0 x]		[cos(rotate) -sin(rotate) x]		[scale 0 0]		[1 0 -x]
			 * this.matrix =	[0 1 y]	* 	[sin(rotate)  cos(rotate) y]	*	[scale 0 0]	* 	[0 1 -y]	*	this.pre_matrix
			 * 					[0 0 1]		[0            0           1]		[0     0 1]		[0 0  1]
			 * 其中x，y是图形中心点（relay_point）的坐标
			 * 注意矩阵相乘的顺序和图形变换操作的次序是相反的，最右边的矩阵代表最先进行的变形。
			 * 注意下面的代码是上面矩阵展开精简后的结果。
			 *
			 */
			var m = this.matrix, pm = this.pre_matrix, s = Math.sin(rotate) * scale, c = Math.cos(rotate) * scale, x = relay_point.x, y = relay_point.y;
			m[0] = c * pm[0] - s * pm[3];
			m[1] = c * pm[1] - s * pm[4];
			m[2] = c * pm[2] - s * pm[5] - c * x + s * y + x;
			m[3] = s * pm[0] + c * pm[3];
			m[4] = s * pm[1] + c * pm[4];
			m[5] = s * pm[2] + c * pm[5] - s * x - c * y + y;
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editRotateScale(relay_point, rotate, scale, true);
			}
			if(not_calc!==true){
				this._calc();
			}
		},
		editPushPoint : function() {
			return;
		}
	}
	$.inherit(Daisy._ImageDoodle, Daisy._Doodle);

	Daisy._EraserDoodle = function(points, pen_width) {
		this.base(Daisy._Doodle.Type.ERASER, points, "black", pen_width, []);
	}
	Daisy._EraserDoodle.prototype = {
		draw : function(ctx) {
			// ctx.save();
			// ctx.lineWidth = this.pen_width;
			// ctx.globalCompositeOperation = "destination-out";
			// $.drawBesier(ctx, this.points);
			// ctx.restore();
			return;
		},
		_calc : function(){
			return;
		}
	}
	$.inherit(Daisy._EraserDoodle, Daisy._Doodle);

	Daisy._NormalDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.NORMAL, points, color, pen_width, e_list);
	}
	Daisy._NormalDoodle.prototype = {
		_doDraw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			$.drawBesier(ctx, this.points);
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
		editRotateScale : function(relay_point, rotate, scale) {
			this.callBase("editRotateScale", [relay_point, rotate, scale]);
			this.change = true;
		},
		draw : function(ctx, d_ctx, m_ctx) {
			var b = this.boundary, l = b.left, t = b.top, w = b.width, h = b.height;
			d_ctx.clearRect(0, 0, d_ctx.canvas.width, d_ctx.canvas.height);
			this._doDraw(d_ctx, l, t, w, h);
			this.drawEraser(d_ctx);
			w += (l > 0 ? 0 : l);
			h += (t > 0 ? 0 : t);
			l = l > 0 ? l : 0;
			t = t > 0 ? t : 0;
			w = w > 0 ? w : 0;
			h = h > 0 ? h : 0;
			ctx.drawImage(d_ctx.canvas, l, t, w, h, l, t, w, h);
		},
		_doDraw : function(ctx, left, top, width, height) {
			if(this.change) {
				ctx.strokeStyle = this.color;
				ctx.lineWidth = this.pen_width;
				$.drawBesier(ctx, this.points);
				this._applyFilter(ctx, left, top, width, height);
				/**
				 * 当用户正在编辑状态下保持change为true使得每次添加新的点（或是改变大小，旋转）后会及时重绘。
				 */
				if(!this.edit_mode) {
					this.data = ctx.getImageData(left, top, width, height);
					this.change = false;
				}
				//$.log("apply filter");
			} else {
				//$.log("direct put data");
				ctx.putImageData(this.data, left, top);
			}
		}
	}
	$.inherit(Daisy._FilterDoodle, Daisy._Doodle);

	Daisy._BlurDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.BLUR, points, color, pen_width, e_list);
	}
	Daisy._BlurDoodle.prototype = {
		_applyFilter : function(ctx, left, top, width, height) {
			$.stackBoxBlurCanvasRGBA(ctx, left, top, width, height);
		}
	}
	$.inherit(Daisy._BlurDoodle, Daisy._FilterDoodle);

	Daisy._EmbossDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.BLUR, points, color, pen_width, e_list);
	}
	Daisy._EmbossDoodle.prototype = {
		_applyFilter : function(ctx, left, top, width, height) {
			var t_f = new Date().getTime();
			//$.boxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height,1);
			//$.stackBoxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height, 1);
			$.processEmboss(ctx, left, top, width, height, 10);
			//$.log("emboss time:%d", new Date().getTime() - t_f);
		}
	}
	$.inherit(Daisy._EmbossDoodle, Daisy._FilterDoodle);

	Daisy._NeonDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.BLUR, points, color, pen_width, e_list);
	}
	Daisy._NeonDoodle.prototype = {
		_applyFilter : function(ctx, left, top, width, height) {
			var t_f = new Date().getTime();
			$.stackBoxBlurCanvasRGBA(ctx, left, top, width, height);
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
		_doDraw : function(ctx) {
			ctx.save();
			ctx.globalAlpha = 0.4;
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			$.drawBesier(ctx, this.points);
			ctx.restore();
		}
	}
	$.inherit(Daisy._LightDoodle, Daisy._Doodle);

	Daisy._RectDoodle = function(points, color, pen_width, e_list) {
		this.base(Daisy._Doodle.Type.SQUARE, points, color, pen_width, e_list);
	}
	Daisy._RectDoodle.prototype = {
		_doDraw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			ctx.beginPath();
			ctx.moveTo(this.points[0].x, this.points[0].y);
			ctx.lineTo(this.points[2].x, this.points[2].y);
			ctx.lineTo(this.points[1].x, this.points[1].y);
			ctx.lineTo(this.points[3].x, this.points[3].y);
			ctx.closePath();
			ctx.stroke();
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
			};
		}
	}
	$.inherit(Daisy._RectDoodle, Daisy._Doodle);

	Daisy._CircleDoodle = function(points, color, pen_width, e_list) {
		if(points.length === 1)
			points[1] = points[0];
		this.base(Daisy._Doodle.Type.CIRCLE, points, color, pen_width, e_list);
	}
	Daisy._CircleDoodle.prototype = {
		_calc : function() {
			var off = Math.round(this.pen_width);
			this.center = $.getMiddlePoint(this.points[0], this.points[1]);
			this.radius = Math.round($.getPTPRange(this.points[0], this.points[1]) / 2);
			this.boundary.width = this.radius * 2 + off * 2;
			this.boundary.height = this.boundary.width;
			this.boundary.left = this.center.x - this.radius - off;
			this.boundary.top = this.center.y - this.radius - off;
			this.boundary.right = this.boundary.left + this.boundary.width;
			this.boundary.bottom = this.boundary.top + this.boundary.height;
		},
		_doDraw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			ctx.beginPath();
			ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.closePath();
		},
		editPushPoint : function(point) {
			this.points[1] = point;
			this._calc();
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
			this.boundary.right = this.boundary.left + this.boundary.width;
			this.boundary.bottom = this.boundary.top + this.boundary.height;
		},
		_doDraw : function(ctx) {
			ctx.lineWidth = this.pen_width;
			ctx.strokeStyle = this.color;
			ctx.beginPath();
			ctx.moveTo(this.points[0].x, this.points[0].y);
			ctx.lineTo(this.points[1].x, this.points[1].y);
			ctx.stroke();
			ctx.closePath();
		},
		editPushPoint : function(point) {
			this.points[1] = point;

		}
	}
	$.inherit(Daisy._LineDoodle, Daisy._Doodle);

	Daisy._GroupDoodle = function(d_list) {
		this.base(Daisy._Doodle.Type.GROUP, [], "black", 1, [])
		this.list = d_list;
		this._calc();
	}
	Daisy._GroupDoodle.prototype = {
		_calc : function() {
			var len = this.list.length;
			if(len === 0)
				return;
			var bo = this.list[0].boundary, l = bo.left, t = bo.top, r = bo.right, b = bo.bottom;
			for(var i = 1; i < len; i++) {
				bo = this.list[i].boundary;
				if(l > bo.left)
					l = bo.left;
				if(t > bo.top)
					t = bo.top;
				if(r < bo.right)
					r = bo.right;
				if(b < bo.bottom)
					b = bo.bottom;
			}
			this.boundary = {
				left : l,
				top : t,
				right : r,
				bottom : b,
				width : r - l,
				height : b - t
			}
			//$.log(this.boundary)
		},
		editStart : function() {
			for(var i = 0; i < this.list.length; i++) {
				this.list[i].editStart();
			}
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editStart();
			}
		},
		editMove : function(dx, dy) {
			for(var i = 0; i < this.list.length; i++) {
				this.list[i].editMove(dx, dy);
			}
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editMove(dx, dy);
			}
			this._calc();
		},
		editFinish : function() {
			for(var i = 0; i < this.list.length; i++) {
				this.list[i].editFinish();
			}
		},
		editRotateScale : function(relay_point, rotate, scale) {
			for(var i = 0; i < this.list.length; i++) {
				this.list[i].editRotateScale(relay_point, rotate, scale);
			}
			for(var i = 0; i < this.eraser_list.length; i++) {
				this.eraser_list[i].editRotateScale(relay_point, rotate, scale);
			}
			this._calc();
		},
		_doDraw : function(ctx, l, t, w, h) {
			return;
		},
		draw : function(ctx, d_ctx, m_ctx) {
			/**
			 * 群组的绘制还有bug。
			 * 当群组物件带橡皮擦时，会使用m_ctx和d_ctx作为临时的绘板，最后将m_ctx绘制到ctx上。
			 * 但如果里面还有嵌套的带橡皮擦的群组物件时，会明显出现引用的混乱。
			 *
			 * 一个简单的解决方案是群组物件规定没有橡皮擦，用户绘制橡皮擦时统一将橡皮擦附加到群组里面的物件。但已经进行的尝试证明这样效率很低。
			 */
			if(this.eraser_list.length > 0) {
				var b = this.boundary, l = b.left, t = b.top, w = b.width, h = b.height;
				m_ctx.clearRect(0,0,m_ctx.canvas.width,m_ctx.canvas.height);
				for(var i = 0; i < this.list.length; i++) {
					this.list[i].draw(m_ctx, d_ctx, m_ctx);
				}
				this.drawEraser(m_ctx);
				w += (l > 0 ? 0 : l);
				h += (t > 0 ? 0 : t);
				l = l > 0 ? l : 0;
				t = t > 0 ? t : 0;
				w = w > 0 ? w : 0;
				h = h > 0 ? h : 0;
				ctx.drawImage(m_ctx.canvas, l, t, w, h, l, t, w, h);
			} else {
				for(var i = 0; i < this.list.length; i++) {
					this.list[i].draw(ctx, d_ctx, m_ctx);
				}
			}
		}
	}
	$.inherit(Daisy._GroupDoodle, Daisy._Doodle);

})(Daisy, Daisy.$);
