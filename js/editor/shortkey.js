(function(Daisy, $) {

	$.extend(Daisy.WebNote.prototype, {
		initShortKey : function() {
			this.SHORTKEY_TABLE = {
				'ctrl-a' : this._ctrl_a_handler,
				'ctrl-top' : this._ctrl_top_handler,
				'ctrl-bottom' : this._ctrl_bottom_handler,
				'ctrl-left' : this._ctrl_left_handler,
				'ctrl-right' : this._ctrl_right_handler,
				'ctrl-z' : this._undo_handler,
				'ctrl-y' : this._redo_handler,
				'ctrl-x' : this._ctrl_x_handler,
				'left' : this._left_handler,
				'right' : this._right_handler,
				'top' : this._top_handler,
				'bottom' : this._bottom_handler,
				'shift-left' : this._shift_left_handler,
				'shift-right' : this._shift_right_handler,
				'shift-top' : this._shift_top_handler,
				'shift-bottom' : this._shift_bottom_handler,
				'ctrl-shift-left' : this._ctrl_shift_left_handler,
				'ctrl-shift-right' : this._ctrl_shift_right_handler
			};
			this.KEY_TABLE = {
				37 : 'left',
				39 : 'right',
				38 : 'top',
				40 : 'bottom'
			}
		},
		_undo_handler : function() {
			if(this.cur_mode === 'readonly')
				return;
			var h = this.cur_mode === 'handword' ? this.text_history : this.doodle_history;
			h.undo();
		},
		_redo_handler : function() {
			if(this.cur_mode === 'readonly')
				return;
			var h = this.cur_mode === 'handword' ? this.text_history : this.doodle_history;
			h.redo();
		},
		_ctrl_a_handler : function() {
			this._setCaret(this.cur_page.selectAll());
			this.render.paint();
		},
		_shift_left_handler : function() {
			if(this.caret_pos.index < 0)
				return;
			this._shift_select(this.caret_pos.index - 1);
		},
		_shift_select : function(idx) {
			var fc = this.caret_pos, fi = fc.index;
			if(this.cur_page.select_mode) {
				var sr = this.cur_page.select_range;
				fc = (sr.from.index === fi ? sr.to : sr.from);
				fi = fc.index;
			}
			var nc = this.cur_page.getCaretByIndex(idx);
			if(idx === fi) {
				this.cur_page.select(null);
			} else if(idx < fi) {
				this.cur_page.select(nc, fc);
			} else {
				this.cur_page.select(fc, nc);
			}
			this._setCaret(nc);
			this.render.paint();
		},
		_shift_right_handler : function() {
			if(this.caret_pos.index >= this.cur_page.ele_array.length - 1)
				return;
			this._shift_select(this.caret_pos.index + 1);
		},
		_ctrl_shift_left_handler : function() {
			if(this.caret_pos.index < 0)
				return;
			this._shift_select(this.wordSeg.getRange(this.cur_page.ele_array, this.caret_pos.index).from);
		},
		_ctrl_shift_right_handler : function() {
			if(this.caret_pos.index >= this.cur_page.ele_array.length - 1)
				return;
			this._shift_select(this.wordSeg.getRange(this.cur_page.ele_array, this.caret_pos.index+1).to);
		},
		_ctrl_left_handler : function() {
			var idx = this.caret_pos.index;
			if(idx >= 0) {
				this._setCaret(this.cur_page.getCaretByIndex(this.wordSeg.getRange(this.cur_page.ele_array, idx).from));
			}
		 	this.cur_page.select(null);
		 	this.render.paint();
		},
		_ctrl_right_handler : function() {
			var idx = this.caret_pos.index + 1, err = this.cur_page.ele_array;
			if(idx < err.length) {
				this._setCaret(this.cur_page.getCaretByIndex(this.wordSeg.getRange(err, idx).to));
			}
				this.cur_page.select(null);
		 	this.render.paint();
		},
		_ctrl_top_handler : function() {
			this.container.scrollTop -= this.line_height * this.render.scale;
		},
		_ctrl_bottom_handler : function() {
			this.container.scrollTop += this.line_height * this.render.scale;
		},
		_left_handler : function() {
			//向左按键
			if(!this.__ime_on__)
				this.moveCaret("left");
		},
		_right_handler : function() {
			//向右s
			if(!this.__ime_on__)
				this.moveCaret("right");
		},
		_top_handler : function() {
			//向上
			this.moveCaret("up");
		},
		_bottom_handler : function() {
			//向下
			this.moveCaret("down");
		},
		_shortkey_handler : function(e) {
			var c_key = (e.ctrlKey ? "ctrl-" : "") + (e.shiftKey ? "shift-" : "") + (this.KEY_TABLE[e.keyCode] == null ? String.fromCharCode(e.keyCode).toLowerCase() : this.KEY_TABLE[e.keyCode]), k_func = this.SHORTKEY_TABLE[c_key];
			if( typeof k_func === 'function') {
				$.log(c_key);
				k_func.apply(this, []);
				return true;
			}
			return false;
		}
	});
})(Daisy, Daisy.$);
