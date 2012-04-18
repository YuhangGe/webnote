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

		this.line_height = config.line_height;
		this.line_count = config.line_count;

		this.font_name = config.font_name == null ? '宋体' : config.font_name;
		this.font_size = config.font_size == null ? 35 : config.font_size;
		this.font_bold = config.font_bold == null ? false : config.font_bold;
		this.padding_top = config.padding_top == null ? 22 : config.padding_top;
		this.font_height = config.font_height == null ? 40 : config.font_height;
		this.baseline_offset = 2;
		//为了让底线和caret与文字底端对齐而设置的两个offset像素
		this.caret_offset_1 = 0;
		this.caret_offset_2 = 0;
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
		this.read_only = config.read_only == null ? false : config.read_only;

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
			top : this.line_height - this.font_height
		}

		this.render = new Daisy._Render(this);
		this.loader = new Daisy._Load(this);

		this._resetCaret();
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
		setColor : function(color) {
			this.color = color;

			if(!this.read_only && this.cur_page.select_mode) {
				this.cur_page.setSelectColor(color);
				this.render.paint();
			}

		},
		setReadOnly : function(read_only) {
			this.read_only = read_only;
		},
		setBold : function(is_bold) {
			this.font_bold = is_bold;
			this.font = (this.font_bold ? 'bold ' : '') + this.font_size + "px " + this.font_name;
			if(!this.read_only && this.cur_page.select_mode) {
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
			var x = e.x - off.left, y = e.y - off.top + this.container.scrollTop + document.body.scrollTop;
			if(y < 0)
				y = 0;
			return {
				x : not_scale ? x : Math.round(x / this.render.scale),
				y : not_scale ? y : Math.round((y - this.padding_top) / this.render.scale)
			}
		},
		_getEventPoint : function(e, not_scale) {
			var x = 0, y = 0;
			//$.log(e);
			if( typeof e.offsetX !== 'undefined') {
				x = e.offsetX;
				y = e.offsetY;
			} else if( typeof e.layerX !== 'undefined') {
				x = e.layerX;
				y = e.layerY;
			}
			if(y < 0)
				y = 0;
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
			this.caret.style.left = this.caret_pos.left * this.render.scale + 'px';
			this.caret.style.top = (this.caret_pos.top + this.padding_top + this.baseline_offset - this.caret_offset_2) * this.render.scale + "px";
		},
		focus : function() {
			this.focused = true;
			this.caret.focus();
		},
		insertImage : function(src) {
			var doo = Daisy._Doodle.create(Daisy._Doodle.Type.IMAGE, 2, 'black', [], src);
			doo.move(this.caret_pos.left, this.caret_pos.top + this.line_height);
			this.cur_page.doodle_list.unshift(doo);
			this.render.paint();
		},
		insert : function(element, style) {
			var n_p;
			if( typeof element === 'string')
				element = element.replace("\t", "    ").replace(/\r\n/g, "\n");

			if(element.length) {
				for(var i = 0; i < element.length; i++) {
					//$.log(element[i]);
					//$.log(element.charCodeAt(i));
					n_p = this.cur_page.insert(element[i], this.caret_pos, style);
					this._setCaret(n_p);
				}
			} else {
				n_p = this.cur_page.insert(element, this.caret_pos, style);
				this._setCaret(n_p);
			}

			this.render.paint();
		},
		append : function(element) {
			var n_p;
			if( typeof element === 'string')
				element = element.replace("\t", "    ").replace(/\r\n/g, "\n");

			if(element.length) {
				for(var i = 0; i < element.length; i++) {
					this.cur_page.append(element[i]);
				}
			} else {
				n_p = this.cur_page.append(element);
			}
			this.render.paint();
		},
		_delOrBack : function(is_del) {
			var new_pos = null;
			if(is_del) {
				new_pos = this.cur_page._del(this.caret_pos);
			} else {
				new_pos = this.cur_page._back(this.caret_pos);
			}
			this._setCaret(new_pos);

			this.render.paint();
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
			this._setCaret({
				index : -1,
				para : 0,
				para_at : -1,
				left : 0,
				top : this.line_height - this.font_height
			});
			this.render.paint();
			this.focus();
		}
	}

})(Daisy, Daisy.$);
