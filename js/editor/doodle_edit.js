(function(Daisy,$){
	/**
	 * 编辑doodle的实现，包括doodle的选择，缩放，旋转等
	 */
	Daisy._EditDoodle = function(){
		this.base(Daisy._Doodle.Type.EDITHELPER, [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}], "rgba(123,123,123,0.8)", 0, []);
		this.CANCEL_BTN = new Image();
		this.ROTATE_BTN = new Image();
		this.CANCEL_BTN.src = "images/cancel_btn.png";
		this.ROTATE_BTN.src = "images/rotate_btn.png";
		this.center = {x:0,y:0};
	}
	Daisy._EditDoodle.prototype = {
		draw : function(ctx){
			ctx.save();
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 3;
			if(typeof ctx.mozDash !== 'undefined')
				ctx.mozDash = [30,10];
			ctx.beginPath();
			ctx.moveTo(this.points[0].x,this.points[0].y);
			ctx.lineTo(this.points[1].x,this.points[1].y);
			ctx.lineTo(this.points[2].x,this.points[2].y);
			ctx.lineTo(this.points[3].x,this.points[3].y);
			ctx.closePath();
			ctx.stroke();
			
			ctx.drawImage(this.CANCEL_BTN,this.points[1].x-this.CANCEL_BTN.width/2,this.points[1].y-this.CANCEL_BTN.height/2);
			ctx.drawImage(this.ROTATE_BTN,this.points[2].x-this.ROTATE_BTN.width/2,this.points[2].y-this.ROTATE_BTN.height/2);
			ctx.restore();
		},
		attachDoodle : function(doo){
			var b = doo.getBoundary();
			this.points[0].x = b.left;
			this.points[0].y = b.top;
			this.points[1].x = b.left + b.width;
			this.points[1].y = b.top;
			this.points[2].x = b.left + b.width;
			this.points[2].y = b.top + b.height;
			this.points[3].x = b.left;
			this.points[3].y = b.top + b.height;
			this._calc();
		},
		_calc : function(){
			this.center = $.getMiddlePoint(this.points[0],this.points[2]);
		},
		editStart : function(point){
			this.callBase("editStart");
			this.pre_point = point;
		},
		editMove : function(point){
			var d ={
				x : point.x - this.pre_point.x,
				y : point.y - this.pre_point.y
			}
			this.callBase("editMove",d.x,d.y);
			return d;
		},
		editFinish : function(point){
			//重新计算中点。
			this._calc();
		},
		isPointIn : function(p){
			return p.x >= this.points[0].x && p.x <= this.points[1].x && p.y >= this.points[0].y && p.y <= this.points[2].y;
		},
		isPointInClose : function(p){
			return false;
		},
		isPointInRotate : function(p){
			return p.x >= this.points[2].x - this.ROTATE_BTN.width/2 && p.x <= this.points[2].x + this.ROTATE_BTN.width/2
				&& p.y >= this.points[2].y-this.ROTATE_BTN.height/2 && p.y <= this.points[2].y + this.ROTATE_BTN.height/2;
		},
		editRotateScale : function(point){
			var rs = this._getRSValue(point);
			this.callBase("editRotateScale", this.center, rs.rotate,rs.scale);
			return rs;
		},
		_getRSValue : function(point){
			
			var r1 = $.getPTPRange(this.center,point), r2 = $.getPTPRange(this.center,this.pre_point), r3 = $.getPTPRange(this.pre_point,point),
				 cosa = (r1*r1+r2*r2-r3*r3)/(2*r1*r2);  
			var scale = r1 / r2;
			//$.log(cosa / Math.PI * 180);
			var rotate = Math.acos(cosa);
			//$.log(cur_p)
			// to do 逆时针旋转
			return {
				scale : scale,
				rotate : rotate
			}
		}
	}
	$.inherit(Daisy._EditDoodle,Daisy._Doodle);
	
	$.extend(Daisy.WebNote.prototype,{
		_doodle_edit_down : function(point){
			if(this.select_doodle===null){
				return;
			}
			
			if(this.edit_doodle.isPointInClose(point)){
				this.__doodle_close__ = true;
			}else if(this.edit_doodle.isPointInRotate(point)){
				//$.log('i r')
				this.__doodle_rotate__ = true;
				this.select_doodle.editStart(point);
				this.edit_doodle.editStart(point);
				this.canvas.style.cursor ="pointer";
			}else if(this.edit_doodle.isPointIn(point)){
				this.__doodle_move__ = true;
				this.select_doodle.editStart(point);
				this.edit_doodle.editStart(point);
				this.canvas.style.cursor ="move";
			}else{
				return;
			}
		
		},
		_doodle_edit_move : function(point){
			if(this.__doodle_move__){
				//var dx = point.x-this.__doodle_pre_point__.x, dy = point.y-this.__doodle_pre_point__.y;
				var d = this.edit_doodle.editMove(point);
				this.select_doodle.editMove(d.x,d.y);
				
			}else if(this.__doodle_rotate__){
				/**
				 * todo 现在的旋转只能顺时针，而且还有bug。 
				 */
				var rs = this.edit_doodle.editRotateScale(point);
				this.select_doodle.editRotateScale(this.edit_doodle.center,rs.rotate,rs.scale);
				
			}else {
				return;
			}
			this.__doodle_pre_point__ = point;
			this.render.paint();
		},
		_doodle_edit_up : function(point){
	
			this.canvas.style.cursor ="default";
			if(this.__doodle_move__){
				this.edit_doodle.editFinish(point);
				this.select_doodle.editFinish(point);
				this.__doodle_move__ = false;
				return;
			}else if(this.__doodle_close__){
				
				this.__doodle_close__ = false;
				return;
			}else if(this.__doodle_rotate__){
				this.edit_doodle.editFinish(point);
				this.select_doodle.editFinish(point);
				this.__doodle_rotate__ = false;
				return;
			}
			

			var d_l = this.cur_page.doodle_list;
			this.select_doodle = null;
			for(var i=0;i<d_l.length;i++){
				this.edit_doodle.attachDoodle(d_l[i]);
				if(this.edit_doodle.isPointIn(point)){

					this.select_doodle = d_l[i];
					break;
				}
			}
		}
	});
})(Daisy,Daisy.$);
