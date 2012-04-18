(function(Daisy,$){
	/**
	 * 编辑doodle的实现，包括doodle的选择，缩放，旋转等
	 */
	Daisy._EditDoodle = function(){
		this.CANCEL_BTN = new Image();
		this.ROTATE_BTN = new Image();
		this.CANCEL_BTN.src = "images/cancel_btn.png";
		this.ROTATE_BTN.src = "images/rotate_btn.png";
		this.points = [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];
		this.center = {x:0,y:0};
		this.color = "rgba(123,123,123,0.8)";
		this.pen_width = 3;
	}
	Daisy._EditDoodle.prototype = {
		draw : function(ctx){
			if(this.attach===null)
				return;
				
			ctx.strokeStyle = this.color;
			ctx.lineWidth = this.pen_width;
			if(typeof ctx.mozDash !== 'undefined')
				ctx.mozDash = [30,10];
			ctx.beginPath();
			ctx.moveTo(this.points[0].x,this.points[0].y);
			ctx.lineTo(this.points[1].x,this.points[1].y);
			ctx.lineTo(this.points[2].x,this.points[2].y);
			ctx.lineTo(this.points[3].x,this.points[3].y);
			ctx.closePath();
			ctx.stroke();
			
			
			ctx.beginPath();
			ctx.arc(this.center.x, this.center.y, 5, 0, Math.PI * 2);
			ctx.stroke();
			ctx.closePath();
			
			ctx.drawImage(this.CANCEL_BTN,this.points[1].x-this.CANCEL_BTN.width/2,this.points[1].y-this.CANCEL_BTN.height/2);
			ctx.drawImage(this.ROTATE_BTN,this.points[2].x-this.ROTATE_BTN.width/2,this.points[2].y-this.ROTATE_BTN.height/2);
		},
		attachDoodle : function(doo){
			doo.getFocusRect(this.points);
			this._calc();
		},
		_calc : function(){
			this.center.x = Math.round((this.points[0].x+this.points[2].x)/2);
			this.center.y = Math.round((this.points[0].y+this.points[2].y)/2);
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
		move : function(dx,dy){
			for(var i=0;i<this.points.length;i++){
				this.points[i].x += dx;
				this.points[i].y += dy;
			}
			this._calc();
		},
		_scale : function(s){
			for(var i=0;i<this.points.length;i++){
				this.points[i].x = Math.round((this.points[i].x - this.center.x)*s + this.center.x);
				this.points[i].y = Math.round((this.points[i].y - this.center.y)*s + this.center.y);
			}
		},
		setRotateScale : function(rotate,scale){
			this._scale(scale);
			this._rotate(rotate);
		},
		_rotate : function(a){
			for(var i=0;i<this.points.length;i++){
				var c_x = this.points[i].x - this.center.x, c_y = this.points[i].y - this.center.y;
				this.points[i].x = Math.round(c_x*Math.cos(a) - c_y*Math.sin(a) + this.center.x);
				this.points[i].y = Math.round(c_x*Math.sin(a) + c_y*Math.cos(a) + this.center.y);
			}
		},
		getRSValue : function(pre_p,cur_p){
			
			var r1 = $.getPTPRange(this.center,cur_p), r2 = $.getPTPRange(this.center,pre_p), r3 = $.getPTPRange(pre_p,cur_p),
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
				this.canvas.style.cursor ="pointer";
			}else if(this.edit_doodle.isPointIn(point)){
				this.__doodle_move__ = true;
				this.canvas.style.cursor ="move";
			}else{
				return;
			}
			this.__doodle_pre_point__ = point;
			//$.log(point);
		},
		_doodle_edit_move : function(point){
			if(this.__doodle_move__){
				var dx = point.x-this.__doodle_pre_point__.x, dy = point.y-this.__doodle_pre_point__.y;
				this.select_doodle.move(dx,dy);
				this.edit_doodle.move(dx,dy);
				
			}else if(this.__doodle_rotate__){
				var rs = this.edit_doodle.getRSValue(this.__doodle_pre_point__,point);
				this.select_doodle.setRotateScale(rs.rotate,rs.scale);
				this.edit_doodle.setRotateScale(rs.rotate,rs.scale);
			}else {
				return;
			}
			this.__doodle_pre_point__ = point;
			this.render.paint();
		},
		_doodle_edit_up : function(point){
			// var d_l = this.cur_page.doodle_list,
				// min_w = Daisy._Doodle.HUGE_RANGE;
			// this.select_doodle = null;
			// for(var i=0;i<d_l.length;i++){
				// var weight = d_l[i].getPointWeight(point);
				// $.log("weight"+weight)
				// if(min_w > weight){
					// this.select_doodle = d_l[i];
					// min_w = weight;
				// }
			// }
			//$.log(point)
			this.canvas.style.cursor ="default";
			if(this.__doodle_move__){
				
				this.__doodle_move__ = false;
				return;
			}else if(this.__doodle_close__){
				
				this.__doodle_close__ = false;
				return;
			}else if(this.__doodle_rotate__){
				
				this.__doodle_rotate__ = false;
				return;
			}
			
			$.log("find new select")
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
