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

		this.filter_canvas = document.createElement('canvas');
		this.filter_ctx = this.filter_canvas.getContext('2d');

		this.thumb_canvas = document.createElement('canvas');
		this.thumb_ctx = this.thumb_canvas.getContext('2d');

		this.width = editor.def_width;
		this.height = editor.def_height;

		this.doodle_canvas.width = this.width;
		this.doodle_canvas.height = this.height;
		this.filter_canvas.width = this.width;
		this.filter_canvas.height = this.height;
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
		this.filter_ctx.lineCap = "round";
		this.filter_ctx.lineJoin = "round";

		this.ctx.font = this.editor.font;		
 		
 		this.space_width = $.CHAR_WIDTH_TABLE.charCodeAt[32];
	}
	Daisy._Render.prototype = {
		setScale : function(scale) {
			this.scale = scale;
			this.paint();
		},
		resetPage : function() {
			this.page = this.editor.cur_page;
		},
		_measureParagraph : function(para) {
			if(para.length === 0)
				return 1;
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
				//$.log("s:%d,e:%d",idx,e-1);
				var ele = null, do_again = true, visible = true;
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
							//$.log('break line');
							if(do_again) {
								//换行后重新布局
								do_again = false;
								i = idx - 1;
							}
							continue;
						}
					}
					ele.left = left;
					ele.bottom = bottom;
					ele.line_at = l_at;
					left += ele.width;
				}
				idx = e;
			}
			return lc;
		},
		_measureElement : function(ele) {
			if(ele.type === Daisy._Element.Type.CHAR) {
				//$.log($.HAS_DROID_FONT)
				if($.HAS_DROID_FONT){
					this.ctx.font = ele.style.font;
					ele.width = this.ctx.measureText(ele.value).width;
				}else{
					ele.width = $.CHAR_WIDTH_TABLE.charCodeAt(ele.value.charCodeAt(0));
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
			var e_arr = this.page.ele_array, s_e = e_arr[from.index + 1], e_e = e_arr[to.index], s_l = from.line, e_l = to.line;
			var c_h = this.font_height, c_w = this.width;
			//$.log("%d,%d",s_l,e_l);
			if(s_l === e_l) {
				//$.log(s_e);$.log(e_e);
				this.ctx.fillRect(s_e.left, s_e.bottom - c_h + this.baseline_offset, e_e.left - s_e.left + e_e.width, c_h);
			} else {
				//$.log(s_e);
				var i = 0;
				if(s_e.type === Daisy._Element.Type.NEWLINE)
					i = s_l;
				else {
					this.ctx.fillRect(s_e.left, s_e.bottom - c_h + this.baseline_offset, c_w - s_e.left, c_h);
					i = s_l + 1;
				}

				for(; i < e_l; i++) {
					this.ctx.fillRect(0, this.padding_top + (i + 1) * this.line_height - c_h + this.baseline_offset, c_w, c_h);
				}
				this.ctx.fillRect(0, e_e.bottom - c_h + this.baseline_offset, e_e.left + e_e.width, c_h);
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
			//'bottom';

			this._paintBackground();

			var e_arr = this.page.ele_array, s_arr = this.page.style_array;

			for(var i = 0; i < e_arr.length; i++) {
				var ele = e_arr[i];
				if(ele.type === Daisy._Element.Type.HANDWORD) {
					this._paintHandWord(ele);

				} else if(ele.type === Daisy._Element.Type.CHAR) {
					this._paintChar(ele);
				}
			}

			var hb = this.editor.hand_bihua;
			if(hb.length > 0) {
				this.ctx.strokeStyle = this.editor.color;
				this.ctx.lineWidth = 2;
				for(var i = 0; i < hb.length; i++) {
					$.drawBesier(this.ctx, hb[i]);
				}
			}
			//$.log(this.editor.hand_mode);
			if(this.editor.hand_mode) {
				//$.log("hm")
				this.ctx.strokeStyle = this.editor.color;
				this.ctx.lineWidth = 2;
				$.drawBesier(this.ctx, this.editor.__tmp_new_bihua);
			}

			//$.processEmboss(this.ctx,400,200,600,600);
		},
		_paintDoodle : function() {
			//return;
			//$.log(this.page.doodle_list.length);
			if(this.page.doodle_list.length === 0)
				return;

			//if(this.doodle_change) {
			//this.doodle_canvas.width = this.doodle_canvas.width;
			this.doodle_ctx.clearRect(0, 0, this.width, this.height);

			for(var i = this.page.doodle_list.length - 1; i >= 0; i--) {
				//$.log('p d %d',i)
				//this.mask_canvas.width = this.page.doodle_width*this.scale;
				//this.mask_canvas.height = this.page.doodle_height*this.scale;
				var doo = this.page.doodle_list[i];
				switch(doo.type) {
					case Daisy._Doodle.Type.LINE:
					case Daisy._Doodle.Type.RECT:
					case Daisy._Doodle.Type.CIRCLE:
					case Daisy._Doodle.Type.IMAGE:
					case Daisy._Doodle.Type.LIGHT:
						doo.draw(this.doodle_ctx);
						break;
					default:

						this.filter_ctx.clearRect(0, 0, this.width, this.height);
						doo.draw(this.filter_ctx, this.width, this.height);
						this.doodle_ctx.drawImage(this.filter_canvas, 0, 0);
						break;

				}

				//break;
			}

			//this.doodle_change = false;
			//}

			this.ctx.drawImage(this.doodle_canvas, 0, 0);
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
