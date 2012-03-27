/**
 * 手写体绘制模块 
 */
(function(Daisy,$){
	$.extend(Daisy.WebNote.prototype,{
		_timeout_handler : function(){
			

			this.hand_bihua.length = 0;
			
			this.render.paint();
		},
		_rightmousedown_handler : function(e) {
			this.__right_mouse_down__ = true;
			this.hand_mode = true;
			var p = this._getEventPoint(e);
			this.__tmp_new_bihua = [];
			this.__tmp_new_length = 0;
			//$.log(p);
			if(this.__hand_timeout!=null){
				window.clearTimeout(this.__hand_timeout);
				this.__hand_timeout = null;
			}
			
			this.canvas.setCapture();
			
			$.stopEvent(e);
		},
		_rightmouseup_handler : function(e) {
			this.__right_mouse_down__ = false;
			this.hand_mode = false;
			
			if(this.__tmp_new_length>0){
				//$.log("add new bihua");
				this.hand_bihua.push(this.__tmp_new_bihua);
			}
			this.__hand_timeout = window.setTimeout($.createDelegate(this,this._timeout_handler),2000);
			
			this.canvas.releaseCapture();
			
			$.stopEvent(e);
		},
		_rightmousemove_handler_deal : function(e){
			var p = this._getEventPoint(e);
			//$.log("%d,%d",p.x,p.y)
			this.__tmp_new_length++;
			this.__tmp_new_bihua.push(p);
			
			this.render.paint();
		}
	});
})(Daisy,Daisy.$);
