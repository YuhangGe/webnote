/**
 * 事件处理
 */
if( typeof Daisy === 'undefined')
	Daisy = {};
(function(Daisy, $) {
	$.extend(Daisy.WebNote.prototype, {
		_focus_handler : function(e) {

			this.focused = true;
			this.caret.focus();
			//$.log('focus');
		},
		_blur_handler : function(e) {
			/**
			 * hack. 下面条件满足则表明光标的焦点失去，并且不在canvas上，
			 *       即整个editor失去焦点。
			 */
			//$.log('blur');
			if(e.explicitOriginalTarget !== this.canvas) {
				this.focused = false;
				//this.caret.style.display = "none";
			}
		},
		_leftmousedown_handler : function(e) {
			this.cur_page.select(null);
			this.render.paint();
			var p = this._getEventPoint(e);
			this._moveCaret_xy(p.x, p.y);
			this.__left_mouse_down__ = true;
			this.__pre_pos__ = this.caret_pos;
			this.__down_pos__ = this.caret_pos;
			if(typeof this.canvas.setCapture==='function')
				this.canvas.setCapture(true);
		},
		_mousedown_handler : function(e) {
			//$.log(e.button);
			if(e.button === 0) {
				this._leftmousedown_handler(e);
			} else if(e.button === 2) {
				this._rightmousedown_handler(e);
			} else {
				$.stopEvent(e);
			}

		},
		_leftmouseup_handler : function(e) {
			this.__left_mouse_down__ = false;

			this.render.paint();
			if(typeof this.canvas.releaseCapture==='function')
				this.canvas.releaseCapture();
		},
		_mouseup_handler : function(e) {
			//$.log('mup');
			if(e.button === 0) {
				this._leftmouseup_handler(e);
			} else if(e.button === 2) {
				this._rightmouseup_handler(e);
			} else {
				$.stopEvent(e);
			}

		},
		_leftmousemove_handler_deal : function(pos) { out_if:
			if(pos.para !== this.__pre_pos__.para || pos.para_at !== this.__pre_pos__.para_at) {
				this._setCaret(pos);
				this.focus();
				var from = this.__down_pos__, to = pos;
				if(from.para === to.para && from.para_at === to.para_at && this.select_mode === true) {
					this.cur_page.select(null);
					break out_if;
				} else if(from.para > to.para || (from.para === to.para && from.para_at > to.para_at)) {
					from = pos;
					to = this.__down_pos__;

				}
				//$.log("select from %d,%d,line %d to %d,%d,line %d",from.para,from.para_at,from.line,to.para,to.para_at,to.line);
				this.cur_page.select(from, to);

				this.render.paint();
				this.__pre_pos__ = pos;
			}

		},
		_mousemove_handler : function(e) {
			if(this.__left_mouse_down__) {
				var p = this._getEventPoint(e), pos = this.cur_page._getCaret_xy(p.x, p.y);
				this._leftmousemove_handler_deal(pos);
			} else if(this.__right_mouse_down__) {
				this._rightmousemove_handler_deal(e);
			}
			$.stopEvent(e);
		},
		_keydown_handler : function(e) {

			//$.log(e);
			//$.log(this.read_only);
			//if(this.read_only && (e.keyCode<37||e.keyCode>40))
			//return;

			switch(e.keyCode) {
				case 13:
					//回车
					this.insert("\n");
					/**
					 * 在ie下面要stopEvent，让keypress不要触发，否则回车会多一个\r。由于不影响其它浏览器，统一stopEvent.
					 */
					$.stopEvent(e);
					break;
				case 8:
					//退格（删除）
					this._delOrBack(false);
					break;
				case 9:
					for(var i = 0; i < 4; i++)
					this.insert(' ');
					$.stopEvent(e);
					break;
				case 46:
					//del键
					this._delOrBack(true);
					break;
				case 37:
					//向左按键
					if(!this.__ime_on__)
						this.moveCaret("left");
					return;
				case 39:
					//向右s
					if(!this.__ime_on__)
						this.moveCaret("right");
					return;
				case 38:
					//向上
					this.moveCaret("up");
					return;
				case 40:
					//向下
					this.moveCaret("down");
					return;
				case 229:
					if(!this.__ime_on__) {
						this.__ime_on__ = true;
						$.log("ime on");
					}
					return;
				case 65:
					if(e.ctrlKey) {
						this._setCaret(this.cur_doc.selectAll());
						this.render.paint();
						$.stopEvent(e);
					}
					break;
				case 67:
					if(e.ctrlKey /* && ($.ie || $.firefox) */) {

						this.copy();
						$.stopEvent(e);
					}
					break;
				case 88:
					if(e.ctrlKey /* && ($.ie || $.firefox) */) {

						this.cut();
						$.stopEvent(e);
					}
					break;
				case 86:
					if(e.ctrlKey) {
						this.paste();
						$.stopEvent(e);
					}
					break;

			}
			this.__ime_on__ = false;
			$.log("ime off");
		},
		_input_handler : function(e) {
			$.log(e);
			//var f_t = new Date().getTithis();

			if(this.caret.value !== "") {
				if(!this.read_only)
					this.insert(this.caret.value);
				this.caret.value = "";
			}
			$.stopEvent(e);

		},
		_chrome_textinput_handler : function(e) {
			this.insert(e.data);
			this.caret.value = "";
			//$.log('ti %s',this.caret.value);
			this.caret.style.width = "1px";
			this.caret.style.background = "transparent";
			this.caret.style.height = ((this.font_height+this.caret_offset_1) * this.render.scale) + 'px';
			this.__ime_on__ = false;
			$.stopEvent(e);
		},
		_chrome_input_handler : function(e) {
			var s = this.caret.value;
			$.stopEvent(e);
			//$.log(s);
			if(s === "") {
				this.caret.style.height = ((this.font_height+this.caret_offset_1) * this.render.scale) + 'px';
				this.caret.style.width = "1px";
				this.caret.style.background = "transparent";
				this.caret.style.border = "0px"
				return;
			}
			this.render.ctx.font = this.caret.style.font;
			var w = this.render.ctx.measureText(s).width,dw = this.c_width-this.caret_pos.left * this.render.scale;
			if(w>dw){
				this.caret.style.height = (this.font_height+this.caret_offset_1) * this.render.scale * Math.ceil((w+10)/dw) + "px";
			}else{
				this.caret.style.width = w + "px";
			}
			this.caret.style.border = "1px dashed green";
			this.caret.style.borderColor = "rgba(28,148,164,0.3)";
			this.caret.style.background = "#FFFFCC";
			//"rgba(0,0,255,0.2)";

		},
		_copy_handler : function(e) {
			//this.copy(e);
			$.stopEvent(e);
		},
		_cut_handler : function(e) {
			//this.cut(e);
			$.stopEvent(e);
		},
		_paste_handler : function(e) {
			/**
			 * paste函数只在firefox下，并且内置的伪clipboard上没有内容的时候才会返回false，
			 * 只有在这种情况下才不取消默认事件。因为firefox没办法直接操作系统clipboard上的数据，
			 * 当copy时只能把数据copy到伪clipboard上（见clipboard.js代码），paste的时候也
			 * 从伪clipboard上获取。但是，firefox用户可以也有从系统的clipboard得到数据的需要，
			 * 为了平衡，就会在伪clipboard数据为空的时候返回false来使this.caret能够得到系统
			 * clipboard上的数据从而触发input事件插入数据。注意一但firefox用户执行过copy操作，则
			 * paste操作将不会得到系统clipboard上的数据。
			 */
			//$.log("paste");

			//if(this.paste(e)) {
			//$.stopEvent(e);
			//}
			$.stopEvent(e);
		},
		_caret_dblclick_handler : function(e) {
			this.__mouse_down__ = false;
			var p = this._getEventPoint(e);
			//$.log(e)
			this._setCaret(this.cur_doc.selectWord(this.offsetLeft + p.x, this.offsetTop + p.y));
			this.render.paint();
		},
		_canvas_dblclick_handler : function(e) {
			this.__mouse_down__ = false;
			var p = this._getEventPoint(e);
			this._setCaret(this.cur_doc.selectWord(p.x, p.y));
			this.render.paint();
			//e.preventDefault();
		},
		initEvent : function() {
			var me = this;
			this.__left_mouse_down__ = false;
			this.__right_mouse_down__ = false;
			this.__pre_pos__ = null;
			this.__ime_on__ = false;
			$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._mousedown_handler));
			$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._mouseup_handler));
			$.addEvent(this.canvas, 'mousemove', $.createDelegate(this, this._mousemove_handler));

			$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._focus_handler));
			$.addEvent(this.caret, 'mouseup', function(e) {
				$.log(e);
			});
			$.addEvent(this.caret, 'blur', $.createDelegate(this, this._blur_handler));
			$.addEvent(this.caret, "keydown", $.createDelegate(this, this._keydown_handler));
			if($.chrome || $.safari) {
				$.addEvent(this.caret, 'textInput', $.createDelegate(this, this._chrome_textinput_handler));
				$.addEvent(this.caret, 'input', $.createDelegate(this, this._chrome_input_handler));
			} else if($.ie) {
				$.addEvent(this.caret, 'textinput', $.createDelegate(this, this._chrome_textinput_handler));
				$.addEvent(this.caret, 'input', $.createDelegate(this, this._chrome_input_handler));
			} else {
				$.addEvent(this.caret, 'input', $.createDelegate(this, this._input_handler));
			}

			//$.addEvent(this.right_scroll, "scroll", $.createDelegate(this, this._right_scroll_handler));
			//$.addEvent(this.bottom_scroll, "scroll", $.createDelegate(this, this._bottom_scroll_handler));
			$.addEvent(this.caret, 'copy', $.createDelegate(this, this._copy_handler));
			$.addEvent(this.caret, 'cut', $.createDelegate(this, this._cut_handler));

			$.addEvent(this.caret, 'paste', $.createDelegate(this, this._paste_handler));

			//$.addWheelEvent(this.canvas, $.createDelegate(this, this._wheel_handler));

			$.addEvent(this.canvas, 'contextmenu', function(e) {
				$.stopEvent(e);
			})
		}
	});
})(Daisy, Daisy.$)