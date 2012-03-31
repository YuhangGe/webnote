/**
 * 手写体绘制模块
 */
(function(Daisy, $) {
	$.extend(Daisy.WebNote.prototype, {
		_createHandWord : function(bihuas) {
			var hw = {
				width : 0,
				height : 0,
				color : this.color,
				weight : 1,
				bihua : []
			}
			var p0 = bihuas[0][0], x1 = p0.x, y1 = p0.y, x2 = p0.x, y2 = p0.y;
			for(var i = 0; i < bihuas.length; i++) {
				var bh = bihuas[i];
				for(var j = 0; j < bh.length; j++) {
					var p = bh[j];
					if(p.x < x1)
						x1 = p.x;
					if(p.x > x2)
						x2 = p.x;
					if(p.y < y1)
						y1 = p.y;
					if(p.y > y2)
						y2 = p.y;
				}
			}
			var w = x2 - x1, h = y2 - y1;
			var b_h = this.font_height * 0.75;
			var bili = b_h / h;
			for(var i = 0; i < bihuas.length; i++) {
				var bh = bihuas[i];
				for(var j = 0; j < bh.length; j++) {
					var p = bh[j];
					p.x = Math.floor((p.x - x1) * bili) + this.font_height * 0.1;
					p.y = Math.floor((p.y - y1) * bili);
				}
				hw.bihua.push(bh);
			}
			hw.width = (w / h * b_h) + this.font_height*0.2;
			hw.height = b_h;
			return hw;
		},
		_timeout_handler : function() {

			var hw = this._createHandWord(this.hand_bihua);
			//$.log(hw);
			this.insert(hw);
			this.hand_bihua.length = 0;

			this.render.paint();
		},
		_rightmousedown_handler : function(e) {
			if(this.read_only)
				return;
			this.__right_mouse_down__ = true;
			this.canvas.style.cursor = 'crosshair';
			this.hand_mode = true;
			var p = this._getEventPoint(e, true);
			$.log(p);
			this.__tmp_new_bihua = [];
			this.__tmp_new_length = 0;
			//$.log(p);
			if(this.__hand_timeout != null) {
				window.clearTimeout(this.__hand_timeout);
				this.__hand_timeout = null;
			}
			if(this.canvas.setCapture)
				this.canvas.setCapture();

			$.stopEvent(e);
		},
		_rightmouseup_handler : function(e) {
			if(this.__right_mouse_down__) {
				this.__right_mouse_down__ = false;
				this.hand_mode = false;

				if(this.__tmp_new_length > 0) {
					//$.log("add new bihua");
					this.hand_bihua.push(this.__tmp_new_bihua);
				}
				this.__hand_timeout = window.setTimeout($.createDelegate(this, this._timeout_handler), 600);
				
				if(this.canvas.releaseCapture)
					this.canvas.releaseCapture();
				
				this.canvas.style.cursor = 'text';
				
				$.stopEvent(e);
			}
		},
		_rightmousemove_handler_deal : function(e) {
			if(this.__right_mouse_down__) {
				var p = this._getEventPoint(e, true);
				//$.log("%d,%d",p.x,p.y)
				this.__tmp_new_length++;
				this.__tmp_new_bihua.push(p);

				this.render.paint();
			}

		}
	});
})(Daisy, Daisy.$);
