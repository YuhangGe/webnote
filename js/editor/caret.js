(function(Daisy, $){
	$.extend(Daisy.WebNote.prototype, {
		initCaret : function(){
			this.caret_interval = null// window.setInterval(, 1000);
			this.caret_timeout = null;
			this.caret_show = true;
			this.caret_data = null;
			this.caret_flash_delegate = $.createDelegate(this, this._caretFlash);
			this.caret_delegate = $.createDelegate(this, this._resetCaret);
			this.caret_focus_delegate = $.createDelegate(this, function(){
				this.caret.focus();
			});
		},
		_caretFocus : function(){
			$.log('focus')
			this.caret.focus();
			/*
			 * focus是在mouseup事件里触发的，而caret_timeout是在mousedown中设置的，
			 * 可能出现执行到这里的代码时，_setCaret已经执行了，但caret_timeout还没有执行，(尽管可能性很小，因为caret_timeout设置的时间是0)
			 * 如果是那样就不需要显示光标和开始闪烁
			 */
			if(this.caret_timeout===null){
				this._caretShow();
				this._caretBeginFlash();
			}
		},
		_caretBlur : function(){
			$.log('blur')
			this._caretStopFlash();
			this._caretHide();
		},
		_caretBeginFlash : function(){
			$.log('begin')
			if(this.caret_interval!==null){
				window.clearInterval(this.caret_interval);
			}
			this.caret_interval = window.setTimeout(this.caret_flash_delegate, 100);
		},
		_caretStopFlash : function(){
			$.log("stop")
			window.clearTimeout(this.caret_interval);
			this.caret_interval = null;
		},
		_caretShow : function(){
			// $.log("show")
			this.render._showCaret(this.caret_left,this.caret_top, 1, this.caret_height, "black");
		},
		_caretHide : function(){
			//$.log("hide")
			this.render._hideCaret(this.caret_left-1,this.caret_top-1, this.caret_data);
		},
		_caretFlash : function(){
			//$.log(this.caret_show)
			if(this.caret_show){
				this._caretShow();
			}else {
				this._caretHide();
			}
			this.caret_show = ! this.caret_show;
			this.caret_interval = window.setTimeout(this.caret_flash_delegate, 550);
		},
		
		_setCaret : function(caret) {
			//$.log("set caret")
			if(this.caret_data!==null){
				this._caretStopFlash();
				this._caretHide();
			}

			this.caret_pos = caret;
			/**
			 * 把reset caret的操作延迟到当前函数之后。目的是为了让render.paint函数执行之后再resetCaret 
			 */
			this.caret_timeout = window.setTimeout(this.caret_delegate, 0);
		},
		_resetCaret : function() {
			//$.log("reset");
			this.caret_left = Math.round(this.caret_pos.left * this.render.scale);
			this.caret_top = Math.round((this.caret_pos.top + this.padding_top + this.baseline_offset) * this.render.scale);
			this.caret_data = this.render.ctx.getImageData(this.caret_left-1, this.caret_top-1, 3, this.caret_height+2);
			//$.log(this.cur_page.select_mode)
			//var off_t = this.caret_top - this.container.scrollTop, off_b = off_t - this.height + this.line_height + this.caret_offset_2;
			
			//$.log("off %d,%d",off_t,off_b)
			//if(off_t < 0) {
				//this.container.scrollTop += off_t;
			//} else if(off_b > 0) {
				//this.container.scrollTop += off_b;
			//}
			
			if(this.focused){
				this._caretShow();
				this._caretBeginFlash();
			}
			//this.caret.style.left = l + 'px';
			//this.caret.style.top = t + "px";
			this.caret_timeout = null;
		},
	});
	
})(Daisy, Daisy.$);
