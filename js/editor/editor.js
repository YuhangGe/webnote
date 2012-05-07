/**
 * 程序主逻辑
 */
(function(Daisy, $) {
	Daisy.createEditor = function(parent) {
		if( typeof parent === 'string')
			parent = $(parent);
		if(document.createElement('canvas').getContext('2d') == null) {
			parent.innerHTML = "SuperNote 编辑器只支持Firefox、Chrome和IE9及以上浏览器。<br/>请使用新版浏览器获得最佳体验。"
			return null;
		}
		if($.HAS_DROID_FONT === false) {
			$.HAS_DROID_FONT = $.hasFont("Droid Sans Fallback") || $.hasFont("Microsoft Yahei") || $.hasFont("微软雅黑");
		}
		$.log("has droid font:" + $.HAS_DROID_FONT)

		if((!$.HAS_DROID_FONT) && $.CHAR_WIDTH_TABLE === "") {
			//$.log($.HAS_DROID_FONT)
			parent.innerHTML = "由于系统没有Droid字体，正在加载字符宽度集...";
			$.loadCharWidthTable();
		}
		parent.innerHTML = '<!-- supernote web editor -->' + '<div id="sn-editor" class="sn-editor">' + '<canvas width="400" height="350" id="sn-canvas" class="sn-canvas"></canvas>' + '<textarea id="sn-caret" spellcheck="false" cols="0" rows="0" class="sn-caret-new" wrap="wrap"></textarea>' + '</div><!--<textarea style="position:absolute;left:500px;top:100px;font:35px Microsoft Yahei;width:400px;height:200px;overflow:hidden;"></textarea>--><!-- supernote web editor -->';
		var config = {
			line_width : 1164,
			line_count : 32,
			line_height : 48,
			font_name : "Droid Sans Fallback, Microsoft Yahei, 微软雅黑",
			font_size : 35,
			width : 1170,
			height : 800
		};
		return new Daisy.WebNote(config);
	}
	Daisy.WebNote = function(config) {

		this.canvas = $('sn-canvas');
		this.container = $('sn-editor');
		this.caret = $('sn-caret');

		this.clipboard = Daisy.Clipboard.getInstance();
		this.text_history = new Daisy._TextHistory(this);
		this.doodle_history = new Daisy._UndoRedoManager(this);

		this.line_height = config.line_height;
		this.line_count = config.line_count;

		this.font_name = config.font_name == null ? '宋体' : config.font_name;
		this.font_size = config.font_size == null ? 35 : config.font_size;
		this.font_bold = config.font_bold == null ? false : config.font_bold;
		this.padding_top = config.padding_top == null ? 22 : config.padding_top;
		this.font_height = config.font_height == null ? 40 : config.font_height;

		//为了让底线和caret与文字底端对齐而设置的两个offset像素
		this.caret_offset_1 = 0;
		this.caret_offset_2 = 0;
		this.baseline_offset = 2;

		if($.chrome || $.safari) {
			this.caret_offset_1 = 8;
			this.caret_offset_2 = 8;
		} else if($.ie) {
			this.caret_offset_1 = 5;
			this.caret_offset_2 = 0;
		} else if($.firefox) {
			this.caret_offset_1 = 6;
			this.caret_offset_2 = 1;
		} else if($.opera) {
			this.caret_offset_1 = 6;
			this.caret_offset_2 = -2;
		}

		this.font = (this.font_bold ? 'bold ' : '') + this.font_size + "px " + this.font_name;

		this.background = config.background == null ? '#ffffcc' : config.background;
		this.color = config.foreground == null ? 'black' : config.foreground;
		this.cur_mode = config.read_only === true ? 'readonly' : 'handword';

		this.def_width = config.line_width;
		this.def_height = this.line_height * this.line_count + this.padding_top;
		this.def_bili = this.def_height / this.def_width;

		this.width = config.width == null ? this.def_width : config.width;
		this.height = config.height == null ? this.def_height : config.height;
		this.c_width = this.def_width;
		this.c_height = this.def_height;

		this.canvas.width = this.c_width;
		this.canvas.height = this.c_height;

		this.container.style.width = (this.width + (this.c_height > this.height ? 20 : 0)) + "px";
		this.container.style.height = this.height + 'px';
		this.container.style.background = this.background;

		this.caret.style.font = this.font;
		this.caret.style.color = this.color;
       
		//当前是否在正在手写
		this.hand_mode = false;
		this.hand_bihua = [];
		//当前是否正在涂鸦
		this.doodle_mode = false;
		this.tmp_doodle = null;
		this.select_doodle = null;
		this.edit_doodle = new Daisy._EditDoodle();

		this.cur_page = null;
		this.pages = [];

		this.caret_pos = {
			index : -1,
			para : 0,
			para_at : -1,
			left : 0,
			line : 0,
			top : this.line_height - this.font_height
		}

		this.render = new Daisy._Render(this);
		this.loader = new Daisy._Load(this);

		/**
		 * ie 9 下面的一个hack. input必须有过非空值，它的style.height才能生效。
		 */
		if($.ie) {
			this.caret.value = "a";
			this.caret.value = "";
		}
		this.createPage();
		this.setCurPage(0);
		this.initEvent();
		this.render.paint();
		this.focus();

	}
	Daisy.WebNote.prototype = {
		setMode : function(mode) {
            this.select_doodle = null;
			if(mode === 'doodle') {
				this.canvas.style.cursor = "crosshair";
				this.caret.style.opacity = "0";
			} else if(mode === 'doodle-edit') {
				this.canvas.style.cursor = "default";
				if(this.cur_page.doodle_list.length > 0) {
					this.select_doodle = this.cur_page.doodle_list[0];
					this.edit_doodle.attachDoodle(this.select_doodle);
				}
				this.caret.style.opacity = "0";
			} else if(mode === 'handword' || mode === 'readonly'){
				this.caret.style.opacity = "1";
                this.canvas.style.cursor = "text";
			} else {
                throw 'unknown mode';
            }
            this.cur_mode = mode;
			this.focus();
			this.render.paint();
		},
		setColor : function(color) {
			this.color = color;

			if(this.cur_mode!=='readonly' && this.cur_page.select_mode) {
				this.cur_page.setSelectColor(color);
				this.render.paint();
			}

		},
		setReadOnly : function(read_only) {
			if(read_only === true || read_only === 'readonly')
                this.cur_mode = 'readonly';
		},
		setBold : function(is_bold) {
			this.font_bold = is_bold;
			this.font = (this.font_bold ? 'bold ' : '') + this.font_size + "px " + this.font_name;
			if(this.cur_mode!=='readonly' && this.cur_page.select_mode) {
				this.cur_page.setSelectBold(is_bold);
				this.render.paint();
			}
		},
		loadPage : function(data, from) {
			this.loader.loadPage(data, from);
			this.render.paint();
		},
		loadItem : function(data, from) {
			this.loader.loadItem(data, from);
			this.render.paint();
		},
		loadDoodle : function(data, from) {
			this.loader.loadDoodle(data, from);
			this.render.doodle_change = true;
			this.render.paint();
		},
		setSize : function(width, height) {
			if(height != null) {
				this.height = height;
				this.container.style.height = this.height + 'px';
			}
			if(width != null) {
				this.width = width;
				var tmp_h = this.width * this.def_bili;
				if(tmp_h > this.height) {
					this.c_width = this.width - 20;
					this.c_height = this.c_width * this.def_bili;
					this.container.style.scroll_y = "scroll";
				} else {
					this.c_width = this.width;
					this.c_height = tmp_h;
					this.container.style.scroll_y = "auto";
				}
				this.canvas.width = this.c_width;
				this.canvas.height = this.c_height + 10;
				this.render.setScale(this.c_height / this.def_height);
				this.caret.style.height = ((this.font_height + this.caret_offset_1) * this.render.scale) + 'px';
				this.caret.style.font = Math.floor(this.font_size * this.render.scale) + "px " + this.font_name;
				//$.log("font:%d", Math.floor(this.font_size*this.render.scale) )
				this._resetCaret();
				//$.log(this.font_size*scale)
				this.container.style.width = this.width + "px";
			}

		},
		_getEventPoint_chrome : function(e, not_scale) {
			var off = $.getOffset(this.container);
			var x = e.x - off.left + this.container.scrollLeft + document.body.scrollLeft, y = e.y - off.top + this.container.scrollTop + document.body.scrollTop;
			if(y < 0)
				y = 0;
			return {
				x : not_scale ? x : Math.round(x / this.render.scale),
				y : not_scale ? y : Math.round((y - this.padding_top) / this.render.scale)
			}
		},
		_getEventPoint : function(e, is_chrome, not_scale) {
			var x = 0, y = 0;
			if(is_chrome){
				var off = $.getOffset(this.container);
				x = e.x - off.left + this.container.scrollLeft + document.body.scrollLeft;
				y = e.y - off.top + this.container.scrollTop + document.body.scrollTop;
			}else if( typeof e.offsetX !== 'undefined') {
				x = e.offsetX;
				y = e.offsetY;
			} else if( typeof e.x !== 'undefined') {
				x = e.x, y = e.y
			} else if( typeof e.layerX !== 'undefined') {
				x = e.layerX;
				y = e.layerY;
			} else {
				throw "no x in event(_getEventPoint)";
			}
			if(e.target === this.caret && !is_chrome){
				x += this.caret.offsetLeft;
				y += this.caret.offsetTop;
			}
			return {
				x : not_scale ? x : Math.round(x / this.render.scale),
				y : not_scale ? y : Math.round((y - this.padding_top) / this.render.scale)
			};
		},
		createPage : function() {
			this.pages.push(new Daisy._Page(this));
			return this.pages.length - 1;
		},
		setCurPage : function(index) {
			this.cur_page = this.pages[index];
			this._resetCaret();
			this.render.resetPage();
		},
		_moveCaret_xy : function(x, y) {
			var new_pos = this.cur_page._getCaret_xy(x, y);
			this._setCaret(new_pos);
		},
		_moveCaret_lc : function(line, colum) {

		},
		_setCaret : function(caret) {
			//$.log(caret)
			this.caret_pos = caret;
			this._resetCaret();
		},
		_resetCaret : function() {
			//$.log(this.caret_pos.top);
			var l = this.caret_pos.left * this.render.scale, t = (this.caret_pos.top + this.padding_top + this.baseline_offset - this.caret_offset_2) * this.render.scale, off_t = t - this.container.scrollTop, off_b = off_t - this.height + this.line_height + this.caret_offset_2;

			//$.log("off %d,%d",off_t,off_b)
			if(off_t < 0) {
				this.container.scrollTop += off_t;
			} else if(off_b > 0) {
				this.container.scrollTop += off_b;
			}
			if($.chrome && this.cur_page.select_mode)
				t += 3;
			this.caret.style.left = l + 'px';
			this.caret.style.top = t + "px";
		},
		focus : function() {
			this.focused = true;
			this.caret.focus();
		},
		_insertText : function(text, caret) {
			var e_arr = [], re;
			text = text.replace("\t", "    ").replace(/\r\n/g, "\n");
			for(var i = 0; i < text.length; i++) {
				re = this.cur_page.insertChar(text[i], caret);
				caret = re.caret;
				e_arr.push(re.value);
			}
			return {
				caret : caret,
				value : e_arr
			};
		},
		_insertElements : function(e_arr, caret) {
			for(var i = 0; i < e_arr.length; i++) {
				re = this.cur_page.insertElement(e_arr[i], caret);
				caret = re.caret;
			}
			return {
				caret : caret,
				value : e_arr
			};
		},
		/**
		 * 直接插入元素，不设置撤销。这个专门用来给undo 和  redo时后插入元素使用
		 */
		_insert : function(e_arr, caret) {
			this._setCaret(this._insertElements(e_arr, caret).caret);
			this.render.paint();
		},
		/**
		 * 删除from 到 to 的元素。专门给undo redo调用
		 * @param {Object} from
		 * @param {Object} to
		 */
		_delete : function(from, to) {
			this.cur_page.delRange(from, to);
			this._setCaret(this.cur_page._getCaret_p(from.para, from.para_at));
			this.render.paint();
		},
		_insertDoodle : function(doo) {
			this.cur_page.doodle_list.unshift(doo);
			this.render.paint();
		},
		_removeDoodle : function(doo) {
			var dl = this.cur_page.doodle_list;
			dl.splice(dl.indexOf(doo), 1);
			if(this.select_doodle === doo) {
				this.select_doodle = null;

			}
			this.render.paint();
		},
		insertDoodle : function(doo) {
			var cmd = null;
			if( doo instanceof Array) {
				cmd = new Daisy._CombineCommand();
				for(var i = 0; i < doo.length; i++) {
					this._insertDoodle(doo[i]);
					cmd.add(new Daisy._DoodleNewCommand(doo[i]))
				}
			} else {
				cmd = new Daisy._DoodleNewCommand(doo);
				this._insertDoodle(doo);
			}
			this.doodle_history.add(cmd);
		},
		removeDoodle : function(doo) {
			this._removeDoodle(doo);
			this.doodle_history.add(new Daisy._DoodleDelCommand(doo));
		},
		insert : function(value, caret) {
			//$.log("insert:%s", value)
			//console.trace()
			caret = caret ? caret : this.caret_pos;
			/*
			 * re result
			 * c_b caret_before
			 * c_a caret_after
			 * ele_arr element array
			 */
			var cmd = null;
			var re;
			if(this.cur_page.select_mode) {
				var sr = this.cur_page.select_range, fc = sr.from, tc = sr.to;
				re = this.cur_page.delRange(fc, tc);
				cmd = new Daisy._CombineCommand();
				cmd.add(new Daisy._DeleteCommand(tc, re.caret, re.value));
				caret = re.caret;
			}

			if( typeof value === 'string') {
				re = this._insertText(value, caret);
			} else if( value instanceof Array) {
				re = this._insertElements(value, caret);
			} else {
				var ie = this.cur_page.insertElement(value, caret);
				re = {
					caret : ie.caret,
					value : [ie.value]
				}
			}
			if(cmd !== null)
				cmd.add(new Daisy._InsertCommand(caret, re.caret, re.value));
			else
				cmd = new Daisy._InsertCommand(caret, re.caret, re.value);

			this.text_history.add(cmd);
			this._setCaret(re.caret);
			this.render.paint();
		},
		/**
		 * 处理键盘按键delete
		 */
		_key_del : function() {
			var from = this.caret_pos, to = null;
			if(from.index === this.cur_page.ele_array.length - 1) {
				return;
			}
			to = {
				para : from.para,
				para_at : from.para_at + 1,
				index : from.index + 1
			};
			if(from.para_at === this.cur_page.para_info[from.para].length - 1) {
				to.para++;
				to.para_at = -1;
			}
			this.del(from, to);
		},
		/**
		 * 处理键盘按键 backspace
		 */
		_key_back : function() {
			var to = this.caret_pos, from = null;
			if(to.index < 0)
				return;
			from = {
				para : to.para,
				para_at : to.para_at - 1,
				index : to.index - 1
			};
			if(to.para_at < 0) {
				from.para--;
				from.para_at = this.cur_page.para_info[from.para].length - 1;
			};
			this.del(from, to);

		},
		/**
		 * 删除caret处的元素
		 * @param {Object} caret
		 */
		del : function(from, to, c_t) {
			var re = this.cur_page.delRange(from, to);
			this.text_history.add(new Daisy._DeleteCommand(to, from, re.value));
			this._setCaret(this.cur_page._getCaret_p(from.para, from.para_at));
			this.render.paint();
		},
		_delOrBack : function(is_del) {
			if(this.cur_page.select_mode) {
				this.del(this.cur_page.select_range.from, this.cur_page.select_range.to);
				this.cur_page.select_mode = false;
			} else if(is_del) {
				this._key_del();
			} else {
				this._key_back();
			}
		},

		moveCaret : function(dir) {
			var cp = this.caret_pos, p_idx = cp.para, p_at = cp.para_at, new_cp = cp;
			switch(dir) {
				case 'left':
					if(p_at >= 0) {
						p_at--;
					} else if(p_idx > 0) {
						p_idx--;
						p_at = null;
					}
					new_cp = this.cur_page._getCaret_p(p_idx, p_at);
					break;
				case 'right':
					if(p_at < this.cur_page.para_info[p_idx].length - 1) {
						p_at++;
					} else if(p_idx < this.cur_page.para_number - 1) {
						p_idx++;
						p_at = -1;
					}
					new_cp = this.cur_page._getCaret_p(p_idx, p_at);
					//$.log(new_cp);
					break;
				case 'up':
					if(cp.top - this.line_height > 0)
						new_cp = this.cur_page._getCaret_xy(cp.left, cp.top - this.line_height);
					break;
				case 'down':
					var pi = this.cur_page.para_info, lp = pi[pi.length - 1];
					if(cp.top + this.line_height < (lp.line_start + lp.line_cross) * this.line_height)
						new_cp = this.cur_page._getCaret_xy(cp.left, cp.top + this.line_height);
					break;
			}

			this._setCaret(new_cp);
		},
		getThumb : function() {
			return this.render.getThumb();
		},
		clear : function() {
			this.cur_page.reset();
			this.select_doodle = null;
			this._setCaret({
				index : -1,
				para : 0,
				para_at : -1,
				left : 0,
				top : this.line_height - this.font_height
			});
			this.render.paint();
			this.focus();
			this.clearUndoRedo();
		},
		clearUndoRedo : function() {
			this.text_history.clear();
			this.doodle_history.clear();
		}
	}

})(Daisy, Daisy.$);
