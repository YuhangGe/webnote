(function(Daisy,$){
	/**
	 * 编辑doodle的实现，包括doodle的选择，缩放，旋转等
	 */
	Daisy._EditDoodle = function(){
		this.CANCEL_BTN = new Image();
		this.ROTATE_BTN = new Image();
		this.CANCEL_BTN.src = "images/cancel_btn.png";
		this.ROTATE_BTN.src = "images/rotate_btn.png";
		this.attach = null;
		this.points = [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}];
		this.color = "gray";
		this.pen_width = 2;
	}
	Daisy._EditDoodle.prototype = {
		draw : function(ctx){
			ctx.strokeStyle = color;
			
			ctx.beginPath();
			ctx.moveTo(this.points[0].x,this.points[0].y);
			ctx.lineTo(this.points[1].x,this.points[1].y);
			ctx.lineTo(this.points[2].x,this.points[2].y);
			ctx.lineTo(this.points[3].x,this.points[3].y);
			ctx.closePath();
			ctx.stroke();
			
			ctx.drawImage(this.CANCEL_BTN,this.points[1].x-this.CANCEL_BTN.width,this.points[1].y-this.CANCEL_BTN.height);
			ctx.drawImage(this.ROTATE_BTN,this.points[2].x-this.ROTATE_BTN.width,this.points[2].y-this.ROTATE_BTN.height);
		},
		attachDoodle : function(doo){
			doo.getRectPoints(this.points);
		}
	}
	$.extend(Daisy.WebNote.prototype,{
		_doodle_edit_down : function(point){
			
		},
		_doodle_edit_move : function(point){
			
		},
		_doodle_edit_up : function(point){
			var d_l = this.cur_page.doodle_list,
				m_w = 0;
			this.select_doodle = null;
			for(var i=0;i<d_l.length;i++){
				var weight = d_l[i].getPointWeight(point.x,point.y);
				if(weight>0 && m_w<weight){
					this.select_doodle = d_l[i];
					m_w = weight;
				}
			}
			if(this.select_doodle!=null){
				$.log("sd");
			}else{
				$.log("n sd");
			}
		}
	});
})(Daisy,Daisy.$);
