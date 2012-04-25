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
		_deal_leftmouse_down : function(point) {
			this.cur_page.select(null);
			this.render.paint();
			this._moveCaret_xy(point.x, point.y);
			this.__pre_pos__ = this.caret_pos;
			this.__down_pos__ = this.caret_pos;
		},
		_leftmousedown_handler : function(e, is_chrome) {
			this.__left_mouse_down__ = true;
			var p = is_chrome ? this._getEventPoint_chrome(e) : this._getEventPoint(e);
			if(Daisy.Global.cur_mode === 'doodle_edit') {
				p.y += Math.round(this.padding_top / this.render.scale);
				//$.log("d : %d,%d",p.x,p.y)
				this._doodle_edit_down(p);
			} else {
				this._deal_leftmouse_down(p);
			}
			if( typeof this.canvas.setCapture === 'function')
				this.canvas.setCapture(true);
		},
		_mousedown_handler : function(e, is_chrome) {
			//$.log(e.button);
			if(e.button === 0) {
				this._leftmousedown_handler(e, is_chrome);
			} else if(e.button === 2) {
				this._rightmousedown_handler(e, is_chrome);
			} else {
				$.stopEvent(e);
			}

		},
		_leftmouseup_handler : function(e, is_chrome) {
			if(Daisy.Global.cur_mode === 'doodle_edit') {
				var p = is_chrome ? this._getEventPoint_chrome(e) : this._getEventPoint(e);
				p.y += Math.round(this.padding_top / this.render.scale);
				this._doodle_edit_up(p);
			}
			this.render.paint();
			this.__left_mouse_down__ = false;
			if( typeof this.canvas.releaseCapture === 'function')
				this.canvas.releaseCapture();
		},
		_mouseup_handler : function(e, is_chrome) {
			//$.log('mup');
			if(e.button === 0) {
				this._leftmouseup_handler(e, is_chrome);
			} else if(e.button === 2) {
				this._rightmouseup_handler(e, is_chrome);
			} else {
				$.stopEvent(e);
			}

		},
		_deal_leftmouse_move : function(pos) { 
			outif:
			if(pos.para !== this.__pre_pos__.para || pos.para_at !== this.__pre_pos__.para_at) {
				this._setCaret(pos);
				this.focus();
				var from = this.__down_pos__, to = pos;
				if(from.para === to.para && from.para_at === to.para_at && this.cur_page.select_mode) {
					this.cur_page.select(null);
					break outif;
				} else if(from.para > to.para || (from.para === to.para && from.para_at > to.para_at)) {
					from = pos;
					to = this.__down_pos__;

				}
				//$.log("select from %d,%d,line %d to %d,%d,line %d",from.para,from.para_at,from.line,to.para,to.para_at,to.line);
				this.cur_page.select(from, to);

			}
			this.render.paint();
			this.__pre_pos__ = pos;

		},
		_mousemove_handler : function(e, is_chrome) {
			if(this.__left_mouse_down__) {
				var p = is_chrome ? this._getEventPoint_chrome(e) : this._getEventPoint(e);
				if(Daisy.Global.cur_mode === 'doodle_edit') {
					p.y += Math.round(this.padding_top / this.render.scale);
					this._doodle_edit_move(p);
				} else {
					var pos = this.cur_page._getCaret_xy(p.x, p.y);
					this._deal_leftmouse_move(pos);
				}
			} else if(this.__right_mouse_down__) {
				this._rightmousemove_handler(e, is_chrome);
			}
			$.stopEvent(e);
		},
		_chrome_mousemove_handler : function(e) {
			this._mousemove_handler(e, true);
		},
		_chrome_mouseup_handler : function(e) {

			this._mouseup_handler(e, true);

			$.delEvent(document.body, 'mousemove', this.__cmv_handler);
			$.delEvent(document.body, 'mouseup', this.__cmu_handler);

		},
		_chrome_mousedown_handler : function(e) {

			this._mousedown_handler(e, true);
			$.addEvent(document.body, 'mousemove', this.__cmv_handler);
			$.addEvent(document.body, 'mouseup', this.__cmu_handler);
		},
		_keydown_handler : function(e) {

			//$.log(e);
			//$.log(this.read_only);
			if(this.read_only && (e.keyCode < 37 || e.keyCode > 40)) {
				$.stopEvent(e);
				return;
			}
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
					break;
				case 40:
					//向下
					this.moveCaret("down");
					break;
				case $.IME_KEY:
					if(!this.__ime_on__) {
						this.__ime_on__ = true;

						if($.firefox || $.opera) {
							this.__ime_check__ = window.setInterval($.createDelegate(this, this._firefox_input_handler), 10);
						}
						//$.log("ime on");
					}
					break;
				case 65:
					if(e.ctrlKey) {
						this._setCaret(this.cur_doc.selectAll());
						this.render.paint();
						$.stopEvent(e);
					}
					break;
				/**
				 * firefox 和 ie 下面当caret(即textarea)为空时，快捷键ctrl+c不能触发 oncopy事件，
				 * 需要手动处理
				 */
				case 67:
					if(e.ctrlKey && ($.ie || $.firefox)) {

						this._copy_handler(null);
						$.stopEvent(e);
					}
					break;
				case 88:
					if(e.ctrlKey && ($.ie || $.firefox)) {

						this._cut_handler(null);
						$.stopEvent(e);
					}
					break;
				case 90:
					if(e.ctrlKey){
						this.history.undo();
						$.stopEvent(e);
					}
					break;
				case 89:
					if(e.ctrlKey){
						this.history.redo();
						$.stopEvent(e);
					}

			}
		},
		_textinput_handler : function(e) {
			//$.log("ti")
			if( typeof e.data === 'string') {
				this.insert(e.data);
			} else {
				this.insert(this.caret.value);
			}

			this.__ime_on__ = false;
			if(this.__ime_check__ !== null) {
				window.clearInterval(this.__ime_check__);
				this.__ime_check__ = null;
			}
			if($.chrome || $.safari) {
				this.__bug_tag__ = true;
			} else {
				this.caret.value = "";
				this._adjust_caret("");
			}
		},
		_firefox_input_handler : function(e) {
			var s = this.caret.value;
			if(s === this.__ime_preval__)
				return;
			this.__ime_preval__ = s;
			this._adjust_caret(s);
		},
		_adjust_caret : function(s) {
			if(s === "") {
				this.__ime_on__ = false;
				this.caret.style.height = ((this.font_height + this.caret_offset_1) * this.render.scale) + 'px';
				this.caret.style.width = "1px";
				this.caret.style.background = "transparent";
				this.caret.style.border = "0px"
				return;
			}
			this.render.ctx.font = this.caret.style.font;
			var w = this.render.ctx.measureText(s).width, dw = this.c_width - this.caret_pos.left * this.render.scale;
			if(w > this.c_width) {
				this.caret.style.height = (this.font_height + this.caret_offset_1) * this.render.scale * Math.ceil(w / this.c_width) + "px";
			} else {
				this.caret.style.width = (w + 2 * this.render.scale) + "px";
				if(w > dw)
					this.caret.style.left = (this.c_width - w) + "px";
			}

			this.caret.style.border = "1px dashed green";
			this.caret.style.borderColor = "rgba(28,148,164,0.3)";
			this.caret.style.background = "#FFFFCC";
		},
		_chrome_input_handler : function(e) {
			//$.log('ci');
			var s = this.caret.value;
			if(this.__bug_tag__) {
				this.caret.value = "";
				s = "";
				this.__bug_tag__ = false;
			}
			this._adjust_caret(s);
			$.stopEvent(e);
		},
		_copy_handler : function(e) {
			if(Daisy.Global.cur_mode === 'handword' && this.cur_page.select_mode){
				this.clipboard.setData("item",this.cur_page.copyElement(),e);
			}else if(Daisy.Global.cur_mode === "doodle_edit"){
				
			}
			if(e!=null)
				$.stopEvent(e);
		},
		_cut_handler : function(e) {
			this._copy_handler(e);
			
		},
		_paste_handler : function(e) {
			this.clipboard.getData(e, $.createDelegate(this, this._deal_paste));
		},
		_paste_html : function(html) {

			var dom_p = document.createElement("div");
			dom_p.innerHTML = html;
			var text = dom_p.textContent;
			//==null?dom_p.innerText:dom_p.textContent;
			if($.chrome) {
				/**
				 * chrome 下面textContent会在前面和后面添加额外的换行，需要去除。 safari下面没有。
				 */
				text = text.substring(3, text.length - 3);
			}
			this.insert(text);

			var images = dom_p.getElementsByTagName("img");
			// $.log("images");
			// $.log(images);
			var left = this.caret_pos.left, top = this.caret_pos.top + this.line_height;
			for(var i = 0; i < images.length; i++) {
				var doo = Daisy._Doodle.create(Daisy._Doodle.Type.IMAGE, 2, 'black', [], images[i].getAttribute("src"));
				doo.move(left, top);
				left += 5;
				top += 5;
				this.cur_page.doodle_list.unshift(doo);
			}
			// this.render.paint();
		},
		_deal_paste : function(data) {
			if(data == null)
				return;

			if(data.type === "image") {
				this.insertImage(data.value);
			} else if(data.type === 'html') {
				this._paste_html(data.value);
			} else if(data.type === 'text' || data.type === 'url') {
				this.insert(data.value);
			} else if(data.type === 'item') {
				/**
				 * 从剪切版复制Daisy._Element元素时，对剪切版中的元素进行拷贝后插入到文本中。 
				 */
				var n_value = [];
				for(var i=0;i<data.value.length;i++)
					n_value.push(data.value[i].copy());
				this.insert(n_value);
			}

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
		_drop_handler : function(e) {
			$.stopEvent(e);
			
			var files = e.dataTransfer.files;
			if(files == null)
				return;
			if(files.length <= 0)
				return;
			for(var i = 0; i < files.length; i++) {
				var f = files[i], fr = new FileReader();
				if(/text/.test(f.type)) {
					fr.onload = $.createDelegate(this,function(e){
						this.insert(e.target.result)
					});
					fr.readAsText(f);
				} else if(/image/.test(f.type)) {
					fr.onload = $.createDelegate(this,function(e){
						this.insertImage(e.target.result);
					});
					fr.readAsDataURL(f);
				}
			}
		},
		_stop_handler : function(e) {
			$.stopEvent(e);
		},
		initEvent : function() {
			var me = this;
			this.__left_mouse_down__ = false;
			this.__right_mouse_down__ = false;
			this.__pre_pos__ = null;
			this.__ime_on__ = false;
			this.__ime_check__ = null;
			this.__ime_preval__ = "";

			if( typeof this.canvas.setCapture === 'function') {

				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._mousedown_handler));
				$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._mouseup_handler));
				$.addEvent(this.canvas, 'mousemove', $.createDelegate(this, this._mousemove_handler));
			} else {
				this.__cmv_handler = $.createDelegate(this, this._chrome_mousemove_handler);
				//$.log(this.__cmv_handler)
				this.__cmu_handler = $.createDelegate(this, this._chrome_mouseup_handler);
				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._chrome_mousedown_handler));
			}

			$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._focus_handler));
			$.addEvent(this.caret, 'mouseup', $.createDelegate(this, this._mouseup_handler));

			$.addEvent(this.caret, 'blur', $.createDelegate(this, this._blur_handler));
			$.addEvent(this.caret, "keydown", $.createDelegate(this, this._keydown_handler));

			/**
			 * chrome 和 safari下面貌似有bug.当输入空格时在textInput事件中 stopEvent会引发神奇bug。
			 * 但如果不stopEvent会紧接着触发 input事件导致输入框宽度设置错误。
			 * __bug_tag__，进行特处理。
			 */
			this.__bug_tag__ = false;
			/**
			 * chrome safari下面为textInput
			 * ie 为 textinput
			 * firefox 和opera 为 input
			 */
			var textinput_event_name = "textInput";
			if($.ie) {
				textinput_event_name = "textinput";
				$.addEvent(this.caret, 'input', $.createDelegate(this, this._chrome_input_handler));
			} else if($.firefox || $.opera) {
				textinput_event_name = "input";
			} else if($.chrome || $.safari) {
				$.addEvent(this.caret, 'input', $.createDelegate(this, this._chrome_input_handler));
			}
			$.addEvent(this.caret, textinput_event_name, $.createDelegate(this, this._textinput_handler));

			$.addEvent(this.caret, 'copy', $.createDelegate(this, this._copy_handler));
			$.addEvent(this.caret, 'cut', $.createDelegate(this, this._cut_handler));

			$.addEvent(this.caret, 'paste', $.createDelegate(this, this._paste_handler));

			$.addEvent(this.canvas, 'contextmenu', function(e) {
				$.stopEvent(e);
			});

			$.addEvent(this.canvas, "dragenter", $.createDelegate(this, this._stop_handler));
			$.addEvent(this.canvas, "dragexit", $.createDelegate(this, this._stop_handler));
			$.addEvent(this.canvas, "dragover", $.createDelegate(this, this._stop_handler));
			$.addEvent(this.canvas, "drop", $.createDelegate(this, this._drop_handler));
		}
	});
	/**MODULE END**/
})(Daisy, Daisy.$)