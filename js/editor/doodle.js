(function(Daisy, $) {
	/**
	 * doodle类。目前的设计不够好，很多冗余代码，应该使用面向对象。
	 */
	Daisy._Doodle = function() {
		this.eraser_list = null;
	}
	Daisy._Doodle.prototype = {
		drawEraser : function(ctx) {
			ctx.save();
			ctx.strokeStyle = 'blue';
			ctx.globalCompositeOperation = "destination-out";
			for(var i = 0; i < this.eraser_list.length; i++) {
				ctx.lineWidth = this.eraser_list[i].pen_width;
				$.drawBesier(ctx, this.eraser_list[i].points);
			}
			ctx.restore();
		}
	}
	Daisy._Doodle.create = function(type, pen_width, color, eraser_list, value, tag) {
		var d = null, T = Daisy._Doodle.Type;
		switch(type) {
			case T.IMAGE:
				//$.log("image");
				var img = new Image();
				img.src = "data:image/gif;base64," + value;
				d = new Daisy._ImageDoodle(img, tag);
				break;
			case T.ERASER:
				return new Daisy._EraserDoodle(pen_width, value);
				break;
			case T.LINE:
				//$.log("line:");
				//$.log(value);
				d = new Daisy._LineDoodle(value, pen_width);
				break;
			case T.SQUARE:
				d = new Daisy._RectDoodle(value, pen_width);
				break;
			case T.CIRCLE:
				d = new Daisy._CircleDoodle(value, pen_width);
				break;
			case T.LIGHT :
				d = new Daisy._LightDoodle(value, pen_width);
				break;
			case T.NORMAL :
			case T.EMBOSS :
			case T.BLUR :
			case T.NEON :
			case T.SCRIBBLE :
			case T.SKETCH :
				d = new Daisy._PointDoodle(value, pen_width);
				d.tmp_mode = tag;
				break;
			case T.GROUP :
				d = new Daisy._GroupDoodle(value);
				break;
			default:
				$.log("unkown type of doodle:%d", type);
				return null;
				break;
		}
		d.type = type;
		d.pen_width = pen_width;
		d.color = color
		d.eraser_list = eraser_list;
		d.SELECT_RANGE = 10;
		d.HUGE_RANGE = 999999;
		d.parent = new Daisy._Doodle();
		d.parent.eraser_list = eraser_list;
		return d;
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
		SKETCH : 13
	}

	Daisy._ImageDoodle = function(image, matrix, eraser_list) {
		this.image = image;
		this.image.onload = function() {
			SNEditor.render.paint();
		}
		this.matrix = matrix;
	}
	Daisy._ImageDoodle.prototype = {
		draw : function(ctx) {
			ctx.save();
			ctx.setTransform(this.matrix[0], this.matrix[3], this.matrix[1], this.matrix[4], this.matrix[2], this.matrix[5]);
			ctx.drawImage(this.image, 0, 0);
			ctx.restore();

			this.parent.drawEraser(ctx);

		}
	}
	Daisy._EraserDoodle = function(pen_width, points) {
		this.points = points;
		this.pen_width = pen_width;
	}

	Daisy._PointDoodle = function(points, pen_width) {
		this.points = points;
		this._calc(pen_width);
		this.data = null;
		this.change = true;
	}
	Daisy._PointDoodle.prototype = {
		getPointWeight : function(point){
			
		},
		getFocusRect : function(rect_points) {
			rect_points[0].x = this.left;
			rect_points[0].y = this.top;
			rect_points[1].x = this.left + this.width;
			rect_points[1].y = this.top;
			rect_points[2].x = this.left + this.width;
			rect_points[2].y = this.top + this.height;
			rect_points[3].x = this.left;
			rect_points[3].y = this.top + this.height;
		},
		_calc : function(pen_width) {
			if(this.points.length === 0) {
				this.width = 0;
				this.height = 0;
				this.left = 0;
				this.top = 0;
				return;
			}
			var p0 = this.points[0], x1 = p0.x, y1 = p0.y, x2 = p0.x, y2 = p0.y;
			for(var j = 0; j < this.points.length; j++) {
				var p = this.points[j];
				if(p.x < x1)
					x1 = p.x;
				if(p.x > x2)
					x2 = p.x;
				if(p.y < y1)
					y1 = p.y;
				if(p.y > y2)
					y2 = p.y;
			}
			//$.log("pw:"+pen_width);
			var off = Math.floor(pen_width);

			this.width = x2 - x1 + off * 2;
			this.height = y2 - y1 + off * 2;
			this.left = x1 - off;
			this.top = y1 - off;
		},
		draw : function(ctx, width, height) {
			if(this.points.length === 0) {
				return;
			}

			if(this.change) {

				ctx.strokeStyle = this.color;
				ctx.lineWidth = this.pen_width;
				$.drawBesier(ctx, this.points);

				if(this.type === Daisy._Doodle.Type.BLUR) {
					//$.log('blur : %d,%d	',this.width,this.height);

					var t_f = new Date().getTime();
					//$.boxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height);
					$.stackBoxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height);

				} else if(this.type === Daisy._Doodle.Type.EMBOSS) {
					var t_f = new Date().getTime();
					//$.boxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height,1);
					//$.stackBoxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height, 1);
					$.processEmboss(ctx, this.left, this.top, this.width, this.height, 10);
					//$.log("emboss time:%d", new Date().getTime() - t_f);
				} else if(this.type === Daisy._Doodle.Type.NEON) {
					var t_f = new Date().getTime();
					$.stackBoxBlurCanvasRGBA(ctx, this.left, this.top, this.width, this.height);
					ctx.strokeStyle = 'white';
					ctx.lineWidth = this.pen_width / 2;
					$.drawBesier(ctx, this.points);
					var t_f = new Date().getTime();
					//$.log("neon time:%d", new Date().getTime() - t_f);
				}
				this.parent.drawEraser(ctx);
				if(!this.tmp_mode) {
					this.data = ctx.getImageData(this.left, this.top, this.width, this.height);
					this.change = false;
				}
			} else {
				//$.log('not change');
				ctx.putImageData(this.data, this.left, this.top);
			}

		},
		_pushPoint : function(point) {
			this.points.push(point);
			this._calc(this.pen_width);
		}
	}

	Daisy._LightDoodle = function(points) {
		this.points = points;
		this._calc(this.pen_width)
	}
	Daisy._LightDoodle.prototype = {
		getPointWeight : function(point){
			
		},
		getFocusRect : function(rect_points) {
			rect_points[0].x = this.left;
			rect_points[0].y = this.top;
			rect_points[1].x = this.left + this.width;
			rect_points[1].y = this.top;
			rect_points[2].x = this.left + this.width;
			rect_points[2].y = this.top + this.height;
			rect_points[3].x = this.left;
			rect_points[3].y = this.top + this.height;
		},
		_calc : function(pen_width) {
			if(this.points.length === 0) {
				this.width = 0;
				this.height = 0;
				this.left = 0;
				this.top = 0;
				return;
			}
			var p0 = this.points[0], x1 = p0.x, y1 = p0.y, x2 = p0.x, y2 = p0.y;
			for(var j = 0; j < this.points.length; j++) {
				var p = this.points[j];
				if(p.x < x1)
					x1 = p.x;
				if(p.x > x2)
					x2 = p.x;
				if(p.y < y1)
					y1 = p.y;
				if(p.y > y2)
					y2 = p.y;
			}
			//$.log("pw:"+pen_width);
			var off = Math.round(pen_width);

			this.width = x2 - x1 + off * 2;
			this.height = y2 - y1 + off * 2;
			this.left = x1 - off;
			this.top = y1 - off;
		},
		draw : function(ctx) {
			ctx.save();
			ctx.globalAlpha = 0.4;
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			$.drawBesier(ctx, this.points);
			ctx.restore();
		},
		_pushPoint : function(point) {
			this.points.push(point);
			this._calc(this.pen_width)
		}
	}
	Daisy._RectDoodle = function(points) {
		///$.log(points);
		this.points = points;
	}
	Daisy._RectDoodle.prototype = {
		getPointWeight : function(point){
			
		},
		getFocusRect : function(rect_points) {
			this._calc(this.pen_width);
			rect_points[0].x = this.left;
			rect_points[0].y = this.top;
			rect_points[1].x = this.left + this.width;
			rect_points[1].y = this.top;
			rect_points[2].x = this.left + this.width;
			rect_points[2].y = this.top + this.height;
			rect_points[3].x = this.left;
			rect_points[3].y = this.top + this.height;
		},
		_calc : function(pen_width) {
			if(this.points.length === 0) {
				this.width = 0;
				this.height = 0;
				this.left = 0;
				this.top = 0;
				return;
			}
			var p0 = this.points[0], x1 = p0.x, y1 = p0.y, x2 = p0.x, y2 = p0.y;
			for(var j = 0; j < this.points.length; j++) {
				var p = this.points[j];
				if(p.x < x1)
					x1 = p.x;
				if(p.x > x2)
					x2 = p.x;
				if(p.y < y1)
					y1 = p.y;
				if(p.y > y2)
					y2 = p.y;
			}
			//$.log("pw:"+pen_width);
			var off = Math.floor(pen_width);

			this.width = x2 - x1 + off * 2;
			this.height = y2 - y1 + off * 2;
			this.left = x1 - off;
			this.top = y1 - off;
		},
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
			//ctx.strokeRect(Math.min(this.start.x,this.end.x), Math.min(this.start.y,this.end.y), Math.abs(this.end.x - this.start.x), Math.abs(this.end.y - this.start.y));
		},
		_pushPoint : function(point) {
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
	Daisy._CircleDoodle = function(points) {
		this.points = points;
		//$.log(this.points);
		this.start = points[0];
		this.end = points[1] == null ? this.start : points[1];
		this._setRadius();
	}
	Daisy._CircleDoodle.prototype = {
		getPointWeight : function(point){
			var r = this.radius - $.getPTPRange(point,this.center);
			if( Math.abs(r) < this.pen_width/2 + this.SELECT_RANGE){
				return 1000 + Math.round(1000 * r);
			}else if(r>0)
				return Math.round(r/this.radius*1000);
			else
				return 0;
		},
		getFocusRect : function(rect_points) {
			this._calc(this.pen_width);
			rect_points[0].x = this.left;
			rect_points[0].y = this.top;
			rect_points[1].x = this.left + this.width;
			rect_points[1].y = this.top;
			rect_points[2].x = this.left + this.width;
			rect_points[2].y = this.top + this.height;
			rect_points[3].x = this.left;
			rect_points[3].y = this.top + this.height;
		},
		_calc : function(pen_width) {
			var off = Math.round(pen_width);
			this.width = this.radius*2 + off * 2;
			this.height = this.width;
			this.left = this.center.x - this.radius - off;
			this.top = this.center.y - this.radius - off;
		},
		_setRadius : function() {
			//$.log([this.start,this.end]);
			this.center = $.getMiddlePoint(this.start, this.end);
			this.radius = Math.round($.getPTPRange(this.start,this.end) / 2);
		},
		draw : function(ctx) {
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			ctx.beginPath();
			ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.closePath();
		},
		_pushPoint : function(point) {
			this.end = point;
			this.points[1] = point;
			this._setRadius();
		}
	}
	Daisy._LineDoodle = function(points) {
		this.points = points;
		this.start = points[0];
		this.end = points[1];
	}
	Daisy._LineDoodle.prototype = {
		getPointWeight : function(point){
			var r = $.getPTLRange(point,this.start,this.end);
			if(r<=this.pen_width/2 + this.SELECT_RANGE){
				return 1000 + Math.round(1000 * r);
			}else
				return 0;
		},
		getFocusRect : function(rect_points) {
			this._calc(this.pen_width);
			rect_points[0].x = this.left;
			rect_points[0].y = this.top;
			rect_points[1].x = this.left + this.width;
			rect_points[1].y = this.top;
			rect_points[2].x = this.left + this.width;
			rect_points[2].y = this.top + this.height;
			rect_points[3].x = this.left;
			rect_points[3].y = this.top + this.height;
		},
		_calc : function(pen_width) {
			var off = Math.round(pen_width);

			this.width = Math.abs(this.start.x - this.end.x) + off * 2;
			this.height = Math.abs(this.start.y - this.end.y) + off * 2;
			this.left = Math.min(this.start.x,this.end.x) - off;
			this.top = Math.min(this.start.y,this.end.y) - off;
		},
		draw : function(ctx) {

			ctx.lineWidth = this.pen_width;
			ctx.strokeStyle = this.color;
			ctx.beginPath();
			ctx.moveTo(this.start.x, this.start.y);
			ctx.lineTo(this.end.x, this.end.y);
			ctx.stroke();
			ctx.closePath();

			this.parent.drawEraser(ctx);
		},
		_pushPoint : function(point) {
			this.end = point;
			this.points[1] = point;
		}
	}

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
