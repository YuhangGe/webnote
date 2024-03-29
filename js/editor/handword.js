/**
 * 手写体绘制模块
 */
(function(Daisy, $) {
	$.extend(Daisy.WebNote.prototype, {
		_createHandWord : function(bihuas) {
			var hw = new Daisy._HandElement([], {
				color : this.color,
				weight : Daisy.Global.hand_weight,
				bold : this.font_bold
			},0,0);

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
				hw.value.push(bh);
			}
			hw.width = Math.round((w / h * b_h) + this.font_height * 0.3);
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
		_handword_rightmouse_down : function(e, is_chrome) {
			this.__right_mouse_down__ = true;
			this.hand_mode = true;
			this.__tmp_new_bihua = [];
			this.__tmp_new_length = 0;
			//$.log(p);
			if(this.__hand_timeout != null) {
				window.clearTimeout(this.__hand_timeout);
				this.__hand_timeout = null;
			}
			if( typeof this.canvas.setCapture === 'function')
				this.canvas.setCapture(true);
		},
		_doodle_rightmouse_down : function(point) {

			this.__right_mouse_down__ = true;
		
			this.doodle_mode = true;
			this.tmp_doodle = Daisy._Doodle.create(Daisy.Global.doodle_type, Daisy.Global.doodle_weight, this.color, [], [point]);
			this.tmp_doodle.editStart();
		},
		_rightmousedown_handler : function(e, is_chrome) {
			if(this.cur_mode === 'readonly')
				return;

			// if(Daisy.Global.cur_mode === 'doodle') {
			// var p = is_chrome ? this._getEventPoint_chrome(e, false) : this._getEventPoint(e, false);
			// p.y += Math.round(this.padding_top / this.render.scale);
			// this._doodle_rightmouse_down(p);
			// } else {
			// this._handword_rightmouse_down(e, is_chrome);
			//
			// }
			else if(this.cur_mode === 'handword')
				this._handword_rightmouse_down(e, is_chrome);
			this.canvas.style.cursor = 'crosshair';
			
			$.stopEvent(e);
		},
		_handword_rightmouse_up : function() {
			this.hand_mode = false;
			if(this.__tmp_new_length > 0) {
				//$.log("add new bihua");
				this.hand_bihua.push(this.__tmp_new_bihua);
			}
			this.__hand_timeout = window.setTimeout($.createDelegate(this, this._timeout_handler), 600);
			if( typeof this.canvas.releaseCapture === 'function')
				this.canvas.releaseCapture();
		 },
		_doodle_rightmouse_up : function() {
			if(this.__right_mouse_down__ === false)
				return;
			this.__right_mouse_down__ = false;
			this.doodle_mode = false;
			this.tmp_doodle.editFinish();
			if(this.tmp_doodle.points.length === 1){
				var p = this.tmp_doodle.points[0], p2 = {
					x : p.x + 1,
					y : p.y + 1
				};
				p.x--;
				p.y--;
				this.tmp_doodle.points.push(p2);
			}
			var dl = this.cur_page.doodle_list;
			if(this.tmp_doodle.type !== Daisy._Doodle.Type.ERASER) {
				this.insertDoodle(this.tmp_doodle);
			} else {
				var c_cmd = new Daisy._CombineCommand(), e_size = 0;
				for(var i = 0; i < dl.length; i++) {
					dl[i].removeTmpEraser(this.tmp_doodle);
					var e = dl[i].addEraserIfIn(this.tmp_doodle);
					if(e !== null) {
						c_cmd.add(new Daisy._DoodleEraserCommand(dl[i], e));
						e_size++;
					}
				}
				if(e_size > 0)
					this.doodle_history.add(c_cmd);
				this.render.paint();
			}

		},
		_rightmouseup_handler : function(e, is_chrome) {
			if(this.__right_mouse_down__ === false)
				return;
			this.__right_mouse_down__ = false;
			// if(Daisy.Global.cur_mode === 'doodle') {
			// //this._doodle_rightmouse_up();
			// } else {
			// this._handword_rightmouse_up();
			// }
			if(this.cur_mode === 'handword')
				this._handword_rightmouse_up();
			
			this.canvas.style.cursor = 'text';
			$.stopEvent(e);

		},
		_handword_rightmouse_move : function(e, is_chrome) {
			var p = this._getEventPoint(e, is_chrome, true);
			this.__tmp_new_length++;
			this.__tmp_new_bihua.push(p);
			this.render.paint();
		},
		_doodle_rightmouse_move : function(point) {
			this.tmp_doodle.editPushPoint(point);
			if(this.tmp_doodle.type === Daisy._Doodle.Type.ERASER) {
				for(var i = 0; i < this.cur_page.doodle_list.length; i++) {
					this.cur_page.doodle_list[i].addTmpEraser(this.tmp_doodle);
				}
			}
			this.render.paint();
		},
		_rightmousemove_handler : function(e, is_chrome) {
			if(this.__right_mouse_down__) {

				// if(Daisy.Global.cur_mode === 'doodle') {
				// var p = is_chrome ? this._getEventPoint_chrome(e, false) : this._getEventPoint(e, false);
				// p.y += Math.round(this.padding_top / this.render.scale);
				// //this._doodle_rightmouse_move(p);
				// } else {
				// this._handword_rightmouse_move(e, is_chrome);
				// }
				if(this.cur_mode === 'handword')
					this._handword_rightmouse_move(e, is_chrome);
			}

		}
	});
})(Daisy, Daisy.$);
