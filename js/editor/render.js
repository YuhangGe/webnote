/**
 * 渲染逻辑
 */
(function(Daisy, $) {
	Daisy._MType = {
		HANDWORD : 0,
		WORD : 1,
		DIGIT : 2,
		DIGITQUOTE : 3,
		SPACE : 4,
		UNICODE : 5,

		getType : function(ele) {
			if(ele.type === Daisy._Element.Type.HANDWORD) {
				return this.HANDWORD;
			} else if(ele.value === ' ' || ele.vlaue === '\t') {
				return this.SPACE;
			} else if(ele.value === ',' || ele.vlaue === '.' || ele.vlaue === ':' || ele.value === ';') {
				//$.log("q")
				return this.DIGITQUOTE;
			} else if(ele.value >= '0' && ele.value <= '9') {
				return this.DIGIT;
			} else if(ele.value.charCodeAt(0) < 255) {
				return this.WORD;
			} else {
				return this.UNICODE;
			}
		},
		isSame : function(type) {
			var t1 = type.t1, t2 = type.t2;
			switch(t1) {
				case this.WORD:
					return t2 !== this.SPACE;
					break;
				case this.DIGIT:
					if(t2 === this.DIGITQUOTE) {
						type.t2 = this.DIGIT;
					}
					return t2 !== this.SPACE;
					break;
				case this.UNICODE :
					return t2 !== this.UNICODE && t2 !== this.SPACE && t2 !== this.HANDWORD;
					break;
				case this.HANDWORD:
					return t2 === this.DIGIT || t2 === this.WORD;
					break;
				case this.SPACE:
					return t2 === this.SPACE;
					break;
				case this.DIGITQUOTE:
					//$.log("%d,%d",t1,t2);
					return t2 === this.DIGIT;
					break;
			}
		}
	}
	Daisy._Render = function(editor) {
		this.editor = editor;
		this.page = null;
		this.canvas = this.editor.canvas;
		this.ctx = this.canvas.getContext('2d');

		this.doodle_canvas = document.createElement("canvas");
		this.doodle_ctx = this.doodle_canvas.getContext('2d');

		this.mask_canvas = document.createElement('canvas');
		this.mask_ctx = this.mask_canvas.getContext('2d');

		this.thumb_canvas = document.createElement('canvas');
		this.thumb_ctx = this.thumb_canvas.getContext('2d');

		this.width = editor.def_width;
		this.height = editor.def_height;

		this.doodle_canvas.width = this.width;
		this.doodle_canvas.height = this.height;
		this.mask_canvas.width = this.width;
		this.mask_canvas.height = this.height;
		this.thumb_scale = 1 / 5;
		this.thumb_width = this.width * this.thumb_scale;
		this.thumb_height = this.height * this.thumb_scale;
		this.thumb_canvas.width = this.thumb_width;
		this.thumb_canvas.height = this.thumb_height;

		this.line_height = editor.line_height;
		this.line_count = editor.line_count;
		this.padding_top = editor.padding_top;
		this.baseline_offset = editor.baseline_offset;
		this.font_height = editor.font_height;

		this.scale = 1;

		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.doodle_ctx.lineCap = "round";
		this.doodle_ctx.lineJoin = "round";
		this.mask_ctx.lineCap = "round";
		this.mask_ctx.lineJoin = "round";

		this.ctx.font = this.editor.font;
		this.space_width = this.ctx.measureText(" ").width;
	}
	Daisy._Render.prototype = {
		setScale : function(scale) {
			this.ctx.lineCap = "round";
			this.ctx.lineJoin = "round";
			this.scale = scale;
			this.paint();
		},
		resetPage : function() {
			this.page = this.editor.cur_page;
		},
		_measureParagraph : function(para) {
			var idx = para.index + 1, e_idx = idx + para.length;
			var left = 0, bottom = this.padding_top + (para.line_start + 1) * this.line_height, lc = 1, l_at = para.line_start;
			var e_arr = this.page.ele_array;
			while(idx < e_idx) {
				var e = idx + 1, s_t = Daisy._MType.getType(e_arr[idx]), t_p = {
					t1 : s_t,
					t2 : s_t
				};
				while(e < e_idx) {
					t_p.t2 = Daisy._MType.getType(e_arr[e]);
					if(!Daisy._MType.isSame(t_p)) {
						break;
					} else {
						t_p.t1 = t_p.t2;
					}
					e++;
				}
				//if(debug)
				//$.log("s:%d,e:%d,left:%d",idx,e-1,left);
				var ele = null, do_again = (idx!==para.index + 1), visible = true;
				for(var i = idx; i < e; i++) {
					ele = e_arr[i];
					if(ele.need_measure)
						this._measureElement(ele);

					ele.visible = true;

					var _right = left + ele.width + (t_p.t2 === Daisy._MType.SPACE ? this.space_width : 0);
					if(_right > this.width) {
						if(s_t === Daisy._MType.SPACE) {
							ele.visible = false;
						} else {
                            left = 0;
							bottom += this.line_height;
							lc++;
							l_at++;
                            if(do_again) {
								//换行后重新布局
								do_again = false;
								i = idx - 1;
								continue;
							}
						}
					}
					ele.left = left;
					ele.bottom = bottom;
					ele.line_at = l_at;
					left += ele.width;
				}

				idx = e;
			}
			var nl = e_arr[e_idx];
			if(nl != null) {
				nl.left = left;
				nl.bottom = bottom;
				nl.line_at = l_at;
			}
			return lc;
		},
		_measureElement : function(ele) {
			if(ele.type === Daisy._Element.Type.CHAR) {
				//$.log($.HAS_DROID_FONT)
				if($.HAS_DROID_FONT) {
					this.ctx.font = ele.style.font;
					ele.width = this.ctx.measureText(ele.value).width;
					//$.log(ele.width)
				} else {
					ele.width = $.CHAR_WIDTH_TABLE[ele.value.charCodeAt(0)];
				}
				//$.log("w:%d",ele.width);
			}
			ele.need_measure = false;
		},
		_drawLine : function(ctx, x1, y1, x2, y2) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			ctx.closePath();
		},
		_paintBackground : function() {
			this.ctx.save();
			this.ctx.scale(this.scale, this.scale);

			this.ctx.fillStyle = this.editor.background;
			this.ctx.fillRect(0, 0, this.width, this.height);

			this.ctx.strokeStyle = "#C0C0C0";
			this.ctx.lineWidth = 2;

			var top = this.padding_top + this.baseline_offset;
			for(var i = 0; i < this.line_count; i++) {
				top += this.line_height;
				this._drawLine(this.ctx, 0, top, this.width, top);
			}

			this._paintDoodle();

			if(this.page.select_mode) {
				this._paintSelect(this.page.select_range.from, this.page.select_range.to);
			}

			this.ctx.restore();

		},
		_paintSelect : function(from, to) {
			this.ctx.fillStyle = "rgba(0,255,0,0.2)";
			var e_arr = this.page.ele_array, s_e = e_arr[from.index + 1], e_e = e_arr[to.index],
				s_l = s_e.line_at, e_l = to.line,
				c_h = this.font_height, c_w = this.width;
			if(s_l === e_l) {
				//$.log(s_e);$.log(e_e);
				this.ctx.fillRect(s_e.left, s_e.bottom - c_h + this.baseline_offset, e_e.left - s_e.left + e_e.width, c_h);
			} else {
				//$.log("%d,%d",s_l,e_l);
				//$.log("%s,%s,%s,%s",s_e.left, s_e.bottom - c_h + this.baseline_offset, c_w - s_e.left, c_h)
				this.ctx.fillRect(s_e.left, s_e.bottom - c_h + this.baseline_offset, c_w - s_e.left, c_h);
				
				for(var i = s_l + 1; i < e_l; i++) {
					this.ctx.fillRect(0, this.padding_top + (i + 1) * this.line_height - c_h + this.baseline_offset, c_w, c_h);
				}
				//$.log(e_e)
				if(to.para_at >= 0 && (to.index+1===e_arr.length||e_arr[to.index+1].left>0)) {
					/**
					 * 如果选择结束位置不在一行的行首。
					 */
					this.ctx.fillRect(0, e_e.bottom - c_h + this.baseline_offset, e_e.left + e_e.width, c_h);
				}
			}

		},
		_paintHandWord : function(hw) {
			//$.log(hw.style);
			this.ctx.lineWidth = hw.style.weight;
			this.ctx.strokeStyle = hw.style.color;
			this.ctx.save();
			this.ctx.scale(this.scale, this.scale);
			this.ctx.translate(hw.left, hw.bottom - hw.height);
			for(var i = 0; i < hw.value.length; i++) {
				$.drawBesier(this.ctx, hw.value[i]);
			}
			this.ctx.restore();

		},
		_paintChar : function(ele) {
			this.ctx.save();
			this.ctx.scale(this.scale, this.scale);
			this.ctx.font = ele.style.font;
			this.ctx.fillStyle = ele.style.color;
			this.ctx.fillText(ele.value, ele.left, ele.bottom);
			this.ctx.restore();
		},
		paint : function() {
			//$.log("paint");

			this.ctx.textAlign = "start";
			this.ctx.textBaseline = 'ideographic';

			this._paintBackground();

			var e_arr = this.page.ele_array, T = Daisy._Element.Type;
			this.ctx.save();
			this.ctx.scale(this.scale, this.scale);
			if(e_arr.length > 1) {
				var pre_ele = e_arr[0], cur_ele = null, range_str = pre_ele.type === T.CHAR ? pre_ele.value : "";
				for(var i = 1; i < e_arr.length; i++) {
					cur_ele = e_arr[i];
					if(pre_ele.type === T.HANDWORD || pre_ele.type === T.NEWLINE) {
						pre_ele.draw(this.ctx);
						pre_ele = cur_ele;
						range_str = cur_ele.type === T.CHAR ? pre_ele.value : "";
						continue;
					}
					if(cur_ele.type === T.HANDWORD || cur_ele.type === T.NEWLINE || cur_ele.line_at !== pre_ele.line_at || !$.jsonEqual(cur_ele.style, pre_ele.style)) {
						this.ctx.font = pre_ele.style.font;
						this.ctx.fillStyle = pre_ele.style.color;
						this.ctx.fillText(range_str, pre_ele.left, pre_ele.bottom);
						pre_ele = cur_ele;
						range_str = cur_ele.type === T.CHAR ? pre_ele.value : "";
					} else {
						range_str += cur_ele.value;
					}
					if(cur_ele.line_at > 32)
						break;
				}
				if(cur_ele.type === T.HANDWORD || cur_ele.type === T.NEWLINE) {
					cur_ele.draw(this.ctx);
				} else {
					this.ctx.font = pre_ele.style.font;
					this.ctx.fillStyle = pre_ele.style.color;
					this.ctx.fillText(range_str, pre_ele.left, pre_ele.bottom);
				}

			} else if(e_arr.length === 1) {
				e_arr[0].draw(this.ctx);
			}
			this.ctx.restore();

			//$.log(this.editor.hand_mode);
			if(this.editor.hand_mode) {
				var hb = this.editor.hand_bihua;
				if(hb.length > 0) {
					this.ctx.strokeStyle = this.editor.color;
					this.ctx.lineWidth = Daisy.Global.hand_line_weight;
					for(var i = 0; i < hb.length; i++) {
						$.drawBesier(this.ctx, hb[i]);
					}
				}
				this.ctx.strokeStyle = this.editor.color;
				this.ctx.lineWidth = Daisy.Global.hand_line_weight;
				$.drawBesier(this.ctx, this.editor.__tmp_new_bihua);
			}

			//$.processEmboss(this.ctx,400,200,600,600);
		},
		_paintDoodle : function() {

			for(var i = this.page.doodle_list.length - 1; i >= 0; i--) {
				if(this.editor.select_doodle !== this.page.doodle_list[i])
					this.page.doodle_list[i].draw(this.ctx, this.doodle_ctx, this.mask_ctx);
			}
			/**
			 * 如果有选中的doodle，则最后画这个doodle，同时把辅助边框的edit_doodle画上
			 */
			if(this.editor.select_doodle !== null) {
				//$.log(this.select_doodle)
				this.editor.select_doodle.draw(this.ctx, this.doodle_ctx, this.mask_ctx);
				this.editor.edit_doodle.draw(this.ctx);
			} else if(this.editor.doodle_mode) {
				/**
				 * 如果当前正在画新 的doodle，则将这个临时的新的doodle画上。
				 */
				this.editor.tmp_doodle.draw(this.ctx, this.doodle_ctx, this.mask_ctx);
			}
		},
		getThumb : function() {
			var pre_scale = this.scale;
			this.scale = this.thumb_scale;
			var pre_ctx = this.ctx;
			this.ctx = this.thumb_ctx;

			this.paint();

			this.ctx = pre_ctx;
			this.scale = pre_scale;

			return this.thumb_canvas.toDataURL("image/png");
		}
	}

})(Daisy, Daisy.$);
