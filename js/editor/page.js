/**
 * 页面逻辑
 */
(function(Daisy, $) {

	Daisy._Page = function(editor) {
		this.editor = editor;
		this.ele_array = [];
		this.doodle_list = [];
		this.doodle_width = 0;
		this.doodle_height = 0;
		this._init();

	}
	Daisy._Page.prototype = {
		_init : function() {
			this.para_number = 1;
			this.para_info = [{
				index : -1,
				length : 0,
				line_start : 0,
				line_cross : 1
			}];
			this.select_mode = false;
			this.select_range = {
				from : null,
				to : null
			}

			this.doodle_list.length = 0;
			this.ele_array.length = 0;
		},
		reset : function() {
			this._init();
		},
		select : function(from, to) {
			if(from == null || to == null) {
				this.select_mode = false;
			} else {
				this.select_mode = true;
				this.select_range = {
					from : from,
					to : to
				}
			}
		},
		_getParaByRow : function(row) {
			for(var i = 0; i < this.para_info.length; i++) {
				var p = this.para_info[i];
				if(p.line_start + p.line_cross > row)
					return i;
			}
			return this.para_info.length - 1;
		},
		_getCaret_xy : function(x, y) {
			//$.log(x+","+y);
			var rd = this.editor.render, line_height = rd.line_height, row = Math.floor(y / line_height), p_i = this._getParaByRow(row), para = this.para_info[p_i], idx = para.index, left = 0, bottom = (row + 1) * line_height, p_at = -1;
			var lp = this.para_info[this.para_info.length - 1], max_bot = (lp.line_start + lp.line_cross) * line_height;
			if(bottom > max_bot) {
				bottom = max_bot;
				row = lp.line_start + lp.line_cross - 1;
				x = this.editor.width;
			}
			//$.log("row:%d,p:%d",row,p_i)
			if(para.length > 0) {
				var k = para.index + 1, e = k + para.length;
				while(k < e && this.ele_array[k].line_at !== row) {
					k++;
				}
				for(; k < e; k++) {
					if(this.ele_array[k].line_at !== row)
						break;
					var cw = this.ele_array[k].width;

					if(left + cw / 2 > x)
						break;
					else
						left += cw;
				}
				idx = k - 1;
				//
				// //$.log(left);
				p_at = idx - para.index - 1;
			}
			//
			//$.log("%d",bottom);
			return {
				para : p_i,
				para_at : p_at,
				line : row,
				index : idx,
				left : left,
				top : bottom - this.editor.font_height
			};
		},
		/**
		 * 某个元素之后的caret位置
		 * p_idx:段落号
		 * p_at: 在该段落的第几个元素之后(-1表示段落最顶部，即第一个元素之前.null表示最尾部，最后一个元素之后)
		 */
		_getCaret_p : function(p_idx, p_at) {
			//$.log("%d,%d",p_idx,p_at);
			var para = this.para_info[p_idx], e_idx = para.index + ( p_at = (p_at === null ? para.length - 1 : p_at)) + 1, line = para.line_start, left = 0, rd = this.editor.render, bottom = (line + 1) * rd.line_height;
			if(p_at >= 0) {
				var ele = this.ele_array[e_idx];
				while(!ele.visible && p_at >= -1) {
					e_idx--;
					p_at--;
					ele = this.ele_array[e_idx];
				}
				left = ele.left + ele.width;
				//$.log(ele.line_at);
				line = ele.line_at;
				bottom = (ele.line_at + 1) * this.editor.line_height;
			}

			return {
				para : p_idx,
				para_at : p_at,
				line : line,
				index : e_idx,
				left : left,
				top : bottom - this.editor.font_height
			}
		},
		_resetParagraph : function(p_idx, index_step) {
			var para = this.para_info[p_idx], pre_lc = para.line_cross;
			para.line_cross = this.editor.render._measureParagraph(para);
			index_step = (index_step == null ? 0 : index_step);
			for(var i = p_idx + 1; i < this.para_number; i++) {
				var p = this.para_info[i];
				p.index += index_step;
				if(para.line_cross !== pre_lc) {
					p.line_start += para.line_cross - pre_lc;
					for(var j = p.index + 1; j <= p.index + p.length; j++) {
						var ele = this.ele_array[j];
						ele.bottom += (para.line_cross - pre_lc) * this.editor.render.line_height;
						ele.line_at += para.line_cross - pre_lc;
					}
				}
			}

		},
		_insertLine : function(caret) {
			this.ele_array.splice(caret.index + 1, 0, new Daisy._NewLineElement());

			var para = this.para_info[caret.para], l_len = caret.para_at + 1, r_len = para.length - l_len;
			para.length = l_len;
			for(var i = caret.para + 1; i < this.para_number; i++) {
				this.para_info[i].index++;
			}

			var pre_lc = para.line_cross;
			para.line_cross = this.editor.render._measureParagraph(para);

			var new_para = {
				index : caret.index + 1,
				length : r_len,
				line_start : para.line_start + para.line_cross,
				line_cross : 1
			};
			this.para_info.splice(caret.para + 1, 0, new_para);
			this.para_number++;

			new_para.line_cross = this.editor.render._measureParagraph(new_para);

			if(pre_lc !== (para.line_cross + new_para.line_cross)) {
				this._moveLineUpDown(caret.para + 2, this.para_number - 1, (para.line_cross + new_para.line_cross) - pre_lc);
			}
			return this._getCaret_p(caret.para + 1, -1);
		},
		insert : function(ele, caret, style) {
			if(this.select_mode) {
				caret = this._delSelect();
				this.select_mode = false;
			}
			var new_ele = null;
			if( typeof ele === 'string') {
				if(ele === '\n') {
					return this._insertLine(caret);
				}
				new_ele = new Daisy._CharElement(ele, style == null ? {
					font : this.editor.font,
					bold : this.editor.font_bold,
					color : this.editor.color
				} : $.copyJson(style));
			} else {
				new_ele = new Daisy._HandElement(ele.bihua, style == null ? {
					weight : ele.weight,
					color : ele.color
				} : $.copyJson(style), ele.width, ele.height);
			}
			this.ele_array.splice(caret.index + 1, 0, new_ele);

			this.para_info[caret.para].length++;
			this._resetParagraph(caret.para, 1);

			return this._getCaret_p(caret.para, caret.para_at + 1);
		},
		_moveLineUpDown : function(start, end, step) {
			//$.log("move %d,%d,%d",start,end,step);
			for(var i = start; i <= end; i++) {
				var p = this.para_info[i];
				p.line_start += step;

				for(var j = p.index + 1; j <= p.index + p.length; j++) {
					//if(this.ele_array[j]==null)
					//j=j;
					this.ele_array[j].bottom += step * this.editor.line_height;
					this.ele_array[j].line_at += step;
				}
			}
		},
		_appendLine : function() {

			var last_para = this.para_info[this.para_number - 1]
			this.para_info.push({
				index : this.ele_array.length,
				length : 0,
				line_start : last_para.line_start + last_para.line_cross,
				line_cross : 1
			})

			this.ele_array.push(new Daisy._NewLineElement());
			this.para_number++;
		},
		append : function(ele) {

			var new_ele = null;
			if( typeof ele === 'string') {
				if(ele === '\n') {
					this._appendLine();
					return;
				}
				new_ele = new Daisy._CharElement(ele, {
					font : this.editor.font,
					bold : this.editor.font_bold,
					color : this.editor.color
				});
			} else {
				new_ele = new Daisy._HandElement(ele.bihua, {
					weight : ele.weight,
					color : ele.color
				}, ele.width, ele.height);
			}
			this.ele_array.push(new_ele);

			this.para_info[this.para_number - 1].length++;
			this._resetParagraph(this.para_number - 1);

		},
		_delElement : function(p_idx, p_at) {
			var para = this.para_info[p_idx], e_idx = para.index + ( p_at = (p_at == null ? para.length : p_at)) + 1;

			this.ele_array.splice(e_idx, 1);
			if(p_at === para.length) {
				var b_para = this.para_info.splice(p_idx+1,1)[0], pre_lc = para.line_cross + b_para.line_cross;
				//$.log(this.para_info);
				para.length += b_para.length;
				para.line_cross = this.editor.render._measureParagraph(para);
				this.para_number--;
				for(var i = p_idx + 1; i < this.para_number; i++) {
					this.para_info[i].index--;
				}
				//$.log("%d,%d",para.line_cross,pre_lc);
				if(pre_lc !== para.line_cross) {
					//$.log('move up:%d',para.line_cross-pre_lc)
					this._moveLineUpDown(p_idx + 1, this.para_number - 1, para.line_cross - pre_lc);
				}

			} else {
				para.length--;
				this._resetParagraph(p_idx, -1);
			}

			return this._getCaret_p(p_idx, p_at - 1);
		},
		_delSelect : function() {

			var f = this.select_range.from, t = this.select_range.to;
			var f_p = f.para, t_p = t.para, f_at = f.para_at, t_at = t.para_at;
			var len = t.index - f.index;
			this.ele_array.splice(f.index + 1, len);

			for(var i = t_p + 1; i < this.para_number; i++) {
				this.para_info[i].index -= len;
			}

			var para = this.para_info[f_p];
			if(f_p === t_p) {
				para.length -= len;
				this._resetParagraph(f_p);
			} else {
				var pre_lc = 0;
				for(var i = f_p; i <= t_p; i++)
				pre_lc += this.para_info[i].line_cross;

				para.length = f_at + this.para_info[t_p].length - t_at;
				this.para_info.splice(f_p + 1, t_p - f_p);
				this.para_number -= t_p - f_p;
				para.line_cross = this.editor.render._measureParagraph(para);

				if(pre_lc !== para.line_cross) {
					//$.log('move up:%d',para.line_cross-pre_lc)
					this._moveLineUpDown(f_p + 1, this.para_number - 1, para.line_cross - pre_lc);
				}
			}

			this.select_mode = false;

			return this.select_range.from;
		},
		_del : function(caret) {
			if(this.select_mode) {
				return this._delSelect();
			}
			if(caret.index === this.ele_array.length - 1)
				return caret;
			else
				return this._delElement(caret.para, caret.para_at + 1);
		},
		_back : function(caret) {
			if(this.select_mode) {
				return this._delSelect();
			}
			if(caret.para_at >= 0) {
				return this._delElement(caret.para, caret.para_at);
			} else if(caret.para > 0) {
				return this._delElement(caret.para - 1, null);
			} else {
				return caret;
			}
		},
		setSelectColor : function(color) {
			if(this.select_mode) {
				var f = this.select_range.from.index + 1, t = this.select_range.to.index;
				for(var i = f; i <= t; i++) {
					this.ele_array[i].style.color = color;
				}
			}
		},
		setSelectBold : function(is_bold) {
			if(this.select_mode) {
				var f = this.select_range.from.index + 1, t = this.select_range.to.index;
				for(var i = f; i <= t; i++) {
					var ele = this.ele_array[i];
					if(ele.type === Daisy._Element.Type.CHAR) {
						ele.style.bold = is_bold;
						ele.style.font = this.editor.font;
					}
				}
			}
		},
		copyElement : function() {
			var f = this.select_range.from.index + 1, t = this.select_range.to.index, rtn = [];
			for(var i = f; i <= t; i++) {
				rtn.push(this.ele_array[i].copy());
			}
			return rtn;
		}
	}

})(Daisy, Daisy.$);
