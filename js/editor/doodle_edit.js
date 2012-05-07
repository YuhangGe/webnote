(function(Daisy, $) {
	/**
	 * 编辑doodle的实现，包括doodle的选择，缩放，旋转等
	 */
	Daisy._EditDoodle = function() {
		this.base(Daisy._Doodle.Type.EDITHELPER, [{
			x : 0,
			y : 0
		}, {
			x : 0,
			y : 0
		}, {
			x : 0,
			y : 0
		}, {
			x : 0,
			y : 0
		}], "rgba(123,123,123,0.8)", 0, []);
		this.CANCEL_BTN = new Image();
		this.ROTATE_BTN = new Image();
		this.CANCEL_BTN.src = "images/cancel_btn.png";
		this.ROTATE_BTN.src = "images/rotate_btn.png";
		this.center = {
			x : 0,
			y : 0
		};
	}
	Daisy._EditDoodle.prototype = {
		draw : function(ctx) {
			ctx.save();
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 3;
			if( typeof ctx.mozDash !== 'undefined')
				ctx.mozDash = [30, 10];
			ctx.beginPath();
			ctx.moveTo(this.points[0].x, this.points[0].y);
			ctx.lineTo(this.points[1].x, this.points[1].y);
			ctx.lineTo(this.points[2].x, this.points[2].y);
			ctx.lineTo(this.points[3].x, this.points[3].y);
			ctx.closePath();
			ctx.stroke();

			ctx.drawImage(this.CANCEL_BTN, this.points[1].x - this.CANCEL_BTN.width / 2, this.points[1].y - this.CANCEL_BTN.height / 2);
			ctx.drawImage(this.ROTATE_BTN, this.points[2].x - this.ROTATE_BTN.width / 2, this.points[2].y - this.ROTATE_BTN.height / 2);
			ctx.restore();
		},
		attachDoodle : function(doo) {
			var b = doo.getBoundary();
			this.points[0].x = b.left;
			this.points[0].y = b.top;
			this.points[1].x = b.right;
			this.points[1].y = b.top;
			this.points[2].x = b.right;
			this.points[2].y = b.bottom;
			this.points[3].x = b.left;
			this.points[3].y = b.bottom;
			this._calc();
		},
		_calc : function() {
			this.center = $.getMiddlePoint(this.points[0], this.points[2]);
		},
		editStart : function(point) {
			this.callBase("editStart");
			this.pre_point = point;
		},
		editMove : function(point) {
			var d = {
				x : point.x - this.pre_point.x,
				y : point.y - this.pre_point.y
			}
			this.callBase("editMove", d.x, d.y);
			return d;
		},
		editFinish : function(point) {
			//重新计算中点。
			this._calc();
			return {
				x : point.x - this.pre_point.x,
				y : point.y - this.pre_point.y
			}
		},
		isPointIn : function(p) {
			var ps = this.points;
			return p.x >= Math.min(ps[0].x,ps[1].x,ps[2].x,ps[3].x)
					&& p.x <= Math.max(ps[0].x,ps[1].x,ps[2].x,ps[3].x)
					&& p.y >= Math.min(ps[0].y,ps[1].y,ps[2].y,ps[3].y)
					&& p.y <= Math.max(ps[0].y,ps[1].y,ps[2].y,ps[3].y);
			//return p.x >= this.points[0].x && p.x <= this.points[1].x && p.y >= this.points[0].y && p.y <= this.points[2].y;
		},
		isPointInClose : function(p) {
			return p.x >= this.points[1].x - this.CANCEL_BTN.width / 2 && p.x <= this.points[1].x + this.CANCEL_BTN.width / 2 && p.y >= this.points[1].y - this.CANCEL_BTN.height / 2 && p.y <= this.points[1].y + this.CANCEL_BTN.height / 2;
		},
		isPointInRotate : function(p) {
			return p.x >= this.points[2].x - this.ROTATE_BTN.width / 2 && p.x <= this.points[2].x + this.ROTATE_BTN.width / 2 && p.y >= this.points[2].y - this.ROTATE_BTN.height / 2 && p.y <= this.points[2].y + this.ROTATE_BTN.height / 2;
		},
		editRotateScale : function(point) {
			var rs = this._calcRSValue(point);
			this.callBase("editRotateScale", this.center, rs.rotate, rs.scale,true);
			return rs;
		},
		_calcRSValue : function(point) {
			var vx1 = point.x - this.center.x, vy1 = point.y - this.center.y, vx2 = this.pre_point.x - this.center.x, vy2 = this.pre_point.y - this.center.y;
			var r1 = Math.sqrt(vx1 * vx1 + vy1 * vy1), r2 = Math.sqrt(vx2 * vx2 + vy2 * vy2);
			var cosa = (vx1 * vx2 + vy1 * vy2) / (r1 * r2), angle = Math.acos(cosa);
			if(Math.abs(cosa - 1.0) <= 0.0000001) {
				angle = 0;
			} else if(Math.abs(cosa + 1.0) <= 0.0000001) {
				angle = Math.PI;
			} else if(vx1 * vy2 - vx2 * vy1 > 0) {
				angle = Math.PI * 2 - angle;
			}
			return {
				scale : r1 / r2,
				rotate : angle
			}
		}
	}
	$.inherit(Daisy._EditDoodle, Daisy._Doodle);

	$.extend(Daisy.WebNote.prototype, {
		/**
		 * 专门用于undo redo的移动doodle
		 */
		_moveDoodle : function(doo, dx, dy) {
			doo.move(dx, dy);
			if(this.select_doodle === doo) {
				this.edit_doodle.attachDoodle(doo);
				this.select_doodle = doo;
			}
			this.render.paint();
		},
		/**
		 * 专门用于undo redo 的旋转和缩放doodle 
		 */
		_rotateScaleDoodle : function(doo, point,rotate,scale){
			if(doo.type === Daisy._Doodle.Type.IMAGE){
				doo.matrix = point;
				doo._calc();
			}else{
				doo.rotateScale(point, rotate,scale);
			}
			if(this.select_doodle === doo) {
				this.edit_doodle.attachDoodle(doo);
				this.select_doodle = doo;
			}
			this.render.paint();
		},
		_doodle_edit_down : function(point) {
			if(this.select_doodle === null) {
				return;
			}
			if(this.edit_doodle.isPointInClose(point)) {
				this.__doodle_close__ = true;
			} else if(this.edit_doodle.isPointInRotate(point)) {
				this.__doodle_rotate__ = true;
				this.select_doodle.editStart(point);
				this.edit_doodle.editStart(point);
				this.canvas.style.cursor = "pointer";
			} else if(this.edit_doodle.isPointIn(point)) {
				this.__doodle_move__ = true;
				this.select_doodle.editStart(point);
				this.edit_doodle.editStart(point);
				this.canvas.style.cursor = "move";
			} else {
				return;
			}

		},
		_doodle_edit_move : function(point) {
			if(this.__doodle_move__) {
			
				var d = this.edit_doodle.editMove(point);
				this.select_doodle.editMove(d.x, d.y);

			} else if(this.__doodle_rotate__) {
			
				var rs = this.edit_doodle.editRotateScale(point);
				this.select_doodle.editRotateScale(this.edit_doodle.center, rs.rotate, rs.scale);

			} else {
				return;
			}
			this.__doodle_pre_point__ = point;
			this.render.paint();
		},
		_doodle_edit_up : function(point) {

			this.canvas.style.cursor = "default";
			if(this.__doodle_move__) {
				var d = this.edit_doodle.editFinish(point);
				this.select_doodle.editFinish(point);
				this.doodle_history.add(new Daisy._DoodleMoveCommand(this.select_doodle, d.x, d.y));
				this.__doodle_move__ = false;
				return;
			} else if(this.__doodle_close__) {
				if(window.confirm("确认删除涂鸦？")) {
					this.cur_page.removeDoodle(this.select_doodle);
					this.doodle_history.add(new Daisy._DoodleDelCommand(this.select_doodle));
					this.select_doodle = null;
				}
				this.__doodle_close__ = false;
				return;
			} else if(this.__doodle_rotate__) {
				this.edit_doodle.editFinish(point);
				this.select_doodle.editFinish(point);
				var rs = this.edit_doodle._calcRSValue(point);
				this.doodle_history.add(new Daisy._DoodleRSCommand(this.select_doodle, this.edit_doodle.center, rs.rotate, rs.scale));
				this.__doodle_rotate__ = false;
				return;
			}

			var d_l = this.cur_page.doodle_list;
			this.select_doodle = null;
			for(var i = 0; i < d_l.length; i++) {
				this.edit_doodle.attachDoodle(d_l[i]);
				if(this.edit_doodle.isPointIn(point)) {

					this.select_doodle = d_l[i];
					break;
				}
			}
		}
	});
})(Daisy, Daisy.$);
