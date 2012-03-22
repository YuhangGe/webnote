/**
 * 渲染逻辑
 */
(function(Daisy, $) {
	Daisy._Render = function(editor) {
		this.editor = editor;
		this.page = null;
		this.canvas = this.editor.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.hand_canvas = document.createElement("canvas");
		this.hand_ctx = this.hand_canvas.getContext('2d');

		this.c_width = editor.width;
		this.c_height = editor.c_height;
		this.line_height = editor.line_height;
		this.line_count = editor.line_count;
	}
	Daisy._Render.prototype = {
		resetPage : function() {
			this.page = this.editor.cur_page;
		},
		_measureParagraph : function(para){
			if(para.length===0)
				return 1;
			var idx = para.index+1;
			var left = 0, bottom = (para.line_start+1)*this.line_height,lc=1;
			for(var i=idx;i<idx+para.length;i++){
				var ele = this.page.ele_array[i];
				if(ele.need_measure){
					this._measureElement(ele);
				}
				if(left+ele.width>this.c_width){
					bottom += this.line_height;
					lc++;
					left = 0;
				}
				ele.left = left;
				ele.bottom = bottom;
				
				left += ele.width;
			}
			return lc;
		},
		_measureElement : function(ele){
			if(ele.type===Daisy._Element.Type.CHAR){
				this.ctx.font = ele.style.font;
				ele.width = this.ctx.measureText(ele.value).width;
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
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(0, 0, this.c_width, this.c_height);

			this.ctx.strokeStyle = "gray";
			this.ctx.lineWidth = 1;

			var top = 0;
			for(var i = 0; i < this.line_count; i++) {
				top += this.line_height;
				this._drawLine(this.ctx, 0, top, this.c_width, top);
			}
		},
		_paintHandWord : function(hw) {
			this.hand_canvas.width = hw.width;
			this.hand_canvas.height = hw.height;
			this.hand_ctx.strokeStyle = hw.style.color;
			this.hand_ctx.lineWidth = hw.style.weight;

			for(var i = 0; i < hw.value.length; i++) {
				this._drawBihua(this.hand_ctx, hw.value[i]);
			}

			this.ctx.drawImage(this.hand_canvas, hw.left, hw.bottom - hw.height);
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

			this.ctx.textAlign = "start";
			this.ctx.textBaseline = 'bottom';

			this._paintBackground();

			var e_arr = this.page.ele_array, s_arr = this.page.style_array;

			for(var i = 0; i < e_arr.length; i++) {
				var ele = e_arr[i];
				if( ele.type === Daisy._Element.Type.HANDWORD) {
					this._paintHandWord(hand_word, left, top - 2);

				}else if(ele.type===Daisy._Element.Type.CHAR){
					
					this.ctx.font = ele.style.font;
					this.ctx.fillStyle = ele.style.color;
					this.ctx.fillText(ele.value, ele.left,ele.bottom);	

				}
			}
		}
	}

})(Daisy, Daisy.$);
