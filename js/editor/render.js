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
			var t1 = type.t1,t2=type.t2;
			switch(t1) {
				case this.WORD:
					return t2 !== this.SPACE;
					break;
				case this.DIGIT:
					if(t2===this.DIGITQUOTE){
						type.t2 = this.DIGIT;
					}
					return t2 !== this.SPACE;
					break;
				case this.UNICODE :
					return t2 !== this.UNICODE && t2 !== this.SPACE && t2 !== this.HANDWORD;
					break;
				case this.HANDWORD:
					return t2===this.DIGIT || t2===this.WORD;
					break;
				case this.SPACE:
					return t2===this.SPACE;
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
		this.hand_canvas = document.createElement("canvas");
		this.hand_ctx = this.hand_canvas.getContext('2d');

		this.width = editor.def_width;
		this.height = editor.def_height;
		this.line_height = editor.line_height;
		this.line_count = editor.line_count;
		this.scale = 1;
	}
	Daisy._Render.prototype = {
		setScale : function(scale){
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
			var left = 0, bottom = (para.line_start + 1) * this.line_height, lc = 1, l_at = para.line_start;
			var e_arr = this.page.ele_array;
			while(idx < e_idx) {
				var e = idx + 1, s_t = Daisy._MType.getType(e_arr[idx]),t_p ={
					t1 : s_t,
					t2 : s_t
				};
				while(e < e_idx) {
					t_p.t2 = Daisy._MType.getType(e_arr[e]);
					if(!Daisy._MType.isSame(t_p)) {
						break;
					}else{
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
					
					if(left + ele.width > this.width) {
						if(s_t === Daisy._MType.SPACE){
							ele.visible = false;
						}else{
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
				this.ctx.font = ele.style.font;
				ele.width = this.ctx.measureText(ele.value).width;
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
			this.ctx.fillStyle = "#FFFFCC";
			this.ctx.fillRect(0, 0, this.width, this.height);

			this.ctx.strokeStyle = "#C0C0C0";
			this.ctx.lineWidth = 1;

			var top = 0;
			for(var i = 0; i < this.line_count; i++) {
				top += this.line_height;
				this._drawLine(this.ctx, 0, top, this.width, top);
			}

			if(this.page.select_mode) {
				this._paintSelect(this.page.select_range.from, this.page.select_range.to);
			}

		},
		_paintSelect : function(from, to) {
			this.ctx.fillStyle = "rgba(0,255,0,0.2)";
			var e_arr = this.page.ele_array, s_e = e_arr[from.index + 1], e_e = e_arr[to.index], s_l = from.line, e_l = to.line;
			var c_h = this.editor.caret_height, c_w = this.width;
			//$.log("%d,%d",s_l,e_l);
			if(s_l === e_l) {
				//$.log(s_e);$.log(e_e);
				this.ctx.fillRect(s_e.left, s_e.bottom - c_h, e_e.left - s_e.left + e_e.width, c_h);
			} else {
				//$.log(s_e);
				var i = 0;
				if(s_e.type === Daisy._Element.Type.NEWLINE)
					i = s_l;
				else {
					this.ctx.fillRect(s_e.left, s_e.bottom - c_h, c_w - s_e.left, c_h);
					i = s_l + 1;
				}

				for(; i < e_l; i++) {
					this.ctx.fillRect(0, (i + 1) * this.line_height - c_h, c_w, c_h);
				}
				this.ctx.fillRect(0, e_e.bottom - c_h, e_e.left + e_e.width, c_h);
			}
		
		},
		_paintHandWord : function(hw) {
			this.hand_canvas.width = hw.width * this.scale;
			this.hand_canvas.height = hw.height * this.scale;
			
			this.hand_ctx.save();
			
			this.hand_ctx.scale(this.scale,this.scale);
			this.hand_ctx.strokeStyle = hw.style.color;
			this.hand_ctx.lineWidth = hw.style.weight;

			for(var i = 0; i < hw.value.length; i++) {
				this._drawBihua(this.hand_ctx, hw.value[i]);
			}
			this.hand_ctx.restore();
			
			this.ctx.restore();
			this.ctx.scale(1,1);
			this.ctx.drawImage(this.hand_canvas, hw.left*this.scale, (hw.bottom - hw.height)*this.scale);
			this.ctx.save();
			this.ctx.scale(this.scale,this.scale);
		},
		_drawBihua : function(ctx, bh) {
			//ctx.strokeStyle = 'red';
			// ctx.lineWidth = 2;
			var len = bh.length;
			if(len === 0)
				return;
			else if(len === 1) {
				//to do
				return;
			}

			ctx.beginPath();
			var s = bh[0], e = bh[len - 1];

			var ctrl = null, dest = null;
			ctrl = bh[0];
			ctx.moveTo(ctrl.x, ctrl.y);
			for(var i = 0; i < len - 1; i++) {
				dest = this._getMiddlePoint(bh[i], bh[i + 1]);
				ctx.quadraticCurveTo(ctrl.x, ctrl.y, dest.x, dest.y);
				ctrl = bh[i + 1];
			}
			dest = bh[len - 1];
			ctx.quadraticCurveTo(ctrl.x, ctrl.y, dest.x, dest.y);
			ctx.stroke();
			ctx.closePath();

		},
		_getMiddlePoint : function(p1, p2) {
			return {
				x : (p1.x + p2.x) / 2,
				y : (p1.y + p2.y) / 2
			}
		},
		paint : function() {
			
			this.ctx.save();
			this.ctx.scale(this.scale,this.scale);
			this.ctx.textAlign = "start";
			this.ctx.textBaseline = 'bottom';
			
			
			this._paintBackground();

			var e_arr = this.page.ele_array, s_arr = this.page.style_array;

			for(var i = 0; i < e_arr.length; i++) {
				var ele = e_arr[i];
				if(ele.type === Daisy._Element.Type.HANDWORD) {
					this._paintHandWord(ele);
					
				} else if(ele.type === Daisy._Element.Type.CHAR) {
					
					this.ctx.font = ele.style.font;
					this.ctx.fillStyle = ele.style.color;
					this.ctx.fillText(ele.value, ele.left, ele.bottom);
					
				}
			}
			this.ctx.restore();
			//this.ctx.scale(1,1);
			var hb = this.editor.hand_bihua;
			if(hb.length>0){
				this.ctx.strokeStyle = "blue";
				this.ctx.lineWidth = 2;
				for(var i=0;i<hb.length;i++){
					this._drawBihua(this.ctx,hb[i]);
				}
			}
			//$.log(this.editor.hand_mode);
			if(this.editor.hand_mode){
				//$.log("hm")
				this.ctx.strokeStyle = "blue";
				this.ctx.lineWidth = 2;
				this._drawBihua(this.ctx,this.editor.__tmp_new_bihua);
			}
		}
	}

})(Daisy, Daisy.$);
