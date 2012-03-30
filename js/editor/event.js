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
			//$.log("md at %d,%d",p.x,p.y);
			this._moveCaret_xy(p.x, p.y);

			this.__left_mouse_down__ = true;
			this.__pre_pos__ = this.caret_pos;
			this.__down_pos__ = this.caret_pos;

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

			// /**
			// * 如果当前游标的位置不在可见区域（即当前行的末尾没有显示），则滚动使之可见.
			// * 当前使用的规则是滚动到当前行宽度减去45的位置。
			// */
			// var cur_line = this.cur_doc.line_info[pos.line];
			// if(cur_line.width < this.scroll_left)
			// this.scrollLeft(cur_line.width - 45);
			// /**
			// * 调整游标位置使其可见
			// */
			// this.adjustScroll();
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
		_chrome_mousemove_handler : function(e) {
			if(this.__left_mouse_down__) {
				var p = this._getEventPoint_chrome(e);
				var pos = this.cur_page._getCaret_xy(p.x, p.y);
				this._leftmousemove_handler_deal(pos);
			} else if(this.__right_mouse_down__) {
				
			}
			$.stopEvent(e);
		},
		_chrome_mouseup_handler : function(e) {
			if(e.button === 0) {
				this.__left_mouse_down__ = false;
				this.render.paint();
			} else if(e.button === 2) {

			}

			$.delEvent(document.body, 'mousemove', this.__cmv_handler);
			$.delEvent(document.body, 'mouseup', this.__cmu_handler);

		},
		_chrome_mousedown_handler : function(e) {

			if(e.button === 0) {
				this._leftmousedown_handler(e);
			} else if(e.button === 2) {
				this._rightmousedown_handler(e);
			}

			//$.log("%d,%d",e.offsetX,e.offsetY);
			$.addEvent(document.body, 'mousemove', this.__cmv_handler);
			$.addEvent(document.body, 'mouseup', this.__cmu_handler);
		},
		_keydown_handler : function(e) {
			
			//$.log(e.ctrlKey);
			//$.log(this.read_only);
			if(this.read_only && (e.keyCode<37||e.keyCode>40))
				return;
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
					this.moveCaret("left");
					break;
				case 39:
					//向右s
					this.moveCaret("right");
					break;
				case 38:
					//向上
					this.moveCaret("up");
					break;
				case 40:
					//向下
					this.moveCaret("down");
					break;
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
				case 86:
					if(e.ctrlKey){
						this.paste();
						$.stopEvent(e);
					}
					break;
			}

		},
		_input_handler : function(e) {
			//	$.log(e);
			//var f_t = new Date().getTithis();
			
			if(this.caret.value !== "") {
				if(!this.read_only)
					this.insert(this.caret.value);
				this.caret.value = "";
			}

			$.stopEvent(e);

		},
		_wheel_handler : function(e) {
			//e=window.event|e;

			var delta = 0;
			if(e.wheelDelta) {
				delta = e.wheelDelta / 120;
			} else if(e.detail) {
				delta = -e.detail;
			}
			/*
			 * 滚动到底或者顶时，不需要 event.preventDefault()。这样可以使用户可以继续在浏览器中滚动。
			 */
			if(delta > 0 && this.scroll_top === 0 || delta < 0 && this.scroll_top === this.render.max_scroll_top)
				return;

			this.scrollTop(this.scroll_top - delta * 10);
			$.stopEvent(e);

		},
		_right_scroll_handler : function(e) {

			//$.log('rs');
			//jQuery.dprint("%d,%d",this.right_scroll.scrollTop,this.scroll_top)
			if(this.right_scroll.scrollTop !== this.scroll_top) {
				//$.log('rrs')
				this._doScrollTop(this.right_scroll.scrollTop);
			}
		},
		_bottom_scroll_handler : function(e) {

			if(this.bottom_scroll.scrollLeft !== this.scroll_left) {

				this._doScrollLeft(this.bottom_scroll.scrollLeft);

			}
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

			if(this.canvas.setCapture) {
				//$.log('fire')
				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._mousedown_handler));
				$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._mouseup_handler));
				$.addEvent(this.canvas, 'mousemove', $.createDelegate(this, this._mousemove_handler));
			} else {
				this.__cmv_handler = $.createDelegate(this, this._chrome_mousemove_handler);
				//$.log(this.__cmv_handler)
				this.__cmu_handler = $.createDelegate(this, this._chrome_mouseup_handler);
				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._chrome_mousedown_handler));
			}
			//$.addEvent(this.canvas, "dblclick", $.createDelegate(this, this._canvas_dblclick_handler));
			//$.addEvent(this.caret, "dblclick", $.createDelegate(this, this._caret_dblclick_handler));
			$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._focus_handler));
			$.addEvent(this.caret, 'mouseup', function(e) {
				$.log(e);
			});
			$.addEvent(this.caret, 'blur', $.createDelegate(this, this._blur_handler));
			$.addEvent(this.caret, "keydown", $.createDelegate(this, this._keydown_handler));
			$.addEvent(this.caret, 'input', $.createDelegate(this, this._input_handler));
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