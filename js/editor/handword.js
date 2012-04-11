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
				weight : Daisy.Global.hand_line_weight,
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
			hw.width = (w / h * b_h) + this.font_height * 0.3;
			hw.height = b_h;
			return hw;
		},
		_timeout_handler : function() {
			if(this.hand_bihua.length === 0)
				return;

			var hw = this._createHandWord(this.hand_bihua);
			//$.log(hw);
			this.insert(hw);
			this.hand_bihua.length = 0;

			this.render.paint();
		},
		_handword_rightmouse_down : function(e,is_chrome) {
			this.__right_mouse_down__ = true;
			this.hand_mode = true;
			this.__tmp_new_bihua = [];
			this.__tmp_new_length = 0;
			//$.log(p);
			if(this.__hand_timeout != null) {
				window.clearTimeout(this.__hand_timeout);
				this.__hand_timeout = null;
			}
		},
		_doodle_rightmouse_down : function(e,is_chrome){
			var p = is_chrome?this._getEventPoint_chrome(e,false): this._getEventPoint(e, false);
			p.y += Math.round(this.padding_top / this.render.scale);
			this.__right_mouse_down__ = true;
			this.doodle_mode = true;
			this.tmp_doodle = Daisy._Doodle.create(Daisy.Global.doodle_type,Daisy.Global.doodle_weight,Daisy.Global.doodle_color,[],[p],true);
			
		},
		_rightmousedown_handler : function(e) {
			if(this.read_only)
				return;

			
			if(Daisy.Global.cur_mode === 'handword'){
				this._handword_rightmouse_down(e,false);
			}else{
				this._doodle_rightmouse_down(e,false);	
			}
			
			this.canvas.style.cursor = 'crosshair';
			this.canvas.setCapture(true);

			$.stopEvent(e);
		},
		_handword_rightmouse_up : function() {
			this.__right_mouse_down__ = false;
			this.hand_mode = false;

			if(this.__tmp_new_length > 0) {
				//$.log("add new bihua");
				this.hand_bihua.push(this.__tmp_new_bihua);
			}
			this.__hand_timeout = window.setTimeout($.createDelegate(this, this._timeout_handler), 600);

		},
		_doodle_rightmouse_up : function(){
			this.__right_mouse_down__ = false;
			this.doodle_mode = false;
			this.tmp_doodle.tmp_mode = false;
			if(this.tmp_doodle.points.length>1){
				this.cur_page.doodle_list.unshift(this.tmp_doodle);
				this.render.paint();
			}
		},
		_rightmouseup_handler : function(e) {
			if(this.__right_mouse_down__) {
				if(Daisy.Global.cur_mode === 'handword'){
					this._handword_rightmouse_up();
				}else{
					this._doodle_rightmouse_up();
				}
				 
				this.canvas.releaseCapture();
				this.canvas.style.cursor = 'text';
				$.stopEvent(e);
			}
		},
		_handword_rightmouse_move : function(e,is_chrome) {
			var p = is_chrome?this._getEventPoint_chrome(e,true):this._getEventPoint(e, true);
			this.__tmp_new_length++;
			this.__tmp_new_bihua.push(p);
			this.render.paint();
		},
		_doodle_rightmouse_move : function(e,is_chrome){
			var p = is_chrome?this._getEventPoint_chrome(e,false):this._getEventPoint(e, false);
			p.y += Math.round(this.padding_top / this.render.scale);
			this.tmp_doodle._pushPoint(p);
			this.render.paint();
		},
		_rightmousemove_handler : function(e) {
			if(this.__right_mouse_down__) {
				
				if(Daisy.Global.cur_mode === 'handword'){
					this._handword_rightmouse_move(e);
				}else{
					this._doodle_rightmouse_move(e);
				}
				
			}

		},
		_chrome_rightmousemove_handler : function(e) {
			if(this.__right_mouse_down__) {
				if(Daisy.Global.cur_mode === 'handword'){
					this._handword_rightmouse_move(e);
				}else{
					this._doodle_rightmouse_move(e);
				}
				
			}
		},
		_chrome_rightmouseup_handler : function(e) {
			if(this.__right_mouse_down__) {
				if(Daisy.Global.cur_mode === 'handword'){
					this._handword_rightmouse_up();
				}else{
					this._doodle_rightmouse_up();
				}
				document.body.style.cursor = 'default';
				this.canvas.style.cursor = "text";
			}
		},
		_chrome_rightmousedown_handler : function(e) {
			if(this.read_only)
				return;
			if(Daisy.Global.cur_mode === 'handword'){
				this._handword_rightmouse_down(e,true);
			}else{
				this._doodle_rightmouse_down(e,true);	
			}
			document.body.style.cursor = 'crosshair';
			this.canvas.style.cursor = "crosshair";
			$.stopEvent(e);
		}
	});
})(Daisy, Daisy.$);
