(function(Daisy, $) {

	$.extend(Daisy.WebNote.prototype, {
		initShortKey : function() {
			this.SHORTKEY_TABLE = {
				'ctrl-a' : this._ctrl_a_handler,
				'ctrl-up' : this._ctrl_up_handler,
				'ctrl-down' : this._ctrl_down_handler,
				'ctrl-left' : this._ctrl_left_handler,
				'ctrl-right' : this._ctrl_right_handler,
				'ctrl-z' : this._undo_handler,
				'ctrl-y' : this._redo_handler,
				'left' : this._left_handler,
				'right' : this._right_handler,
				'up' : this._up_handler,
				'down' : this._down_handler,
				'shift-left' : this._shift_left_handler,
				'shift-right' : this._shift_right_handler,
				'shift-up' : this._shift_up_handler,
				'shift-down' : this._shift_down_handler,
				'ctrl-shift-left' : this._ctrl_shift_left_handler,
				'ctrl-shift-right' : this._ctrl_shift_right_handler,
				'ctrl-home' : this._ctrl_home_handler,
				'ctrl-end' : this._ctrl_end_handler,
				'shift-home' : this._shift_home_handler,
				'shift-end' : this._shift_end_handler,
				'ctrl-shift-home' : this._ctrl_shift_home_handler,
				'ctrl-shift-end' : this._ctrl_shift_end_handler,
				'home' : this._home_handler,
				'end' : this._end_handler,
				'ctrl-b' : this._ctrl_b_handler,
				'pageup' : this._pageup_handler,
				'pagedown' : this._pagedown_handler
			};
			this.KEY_TABLE = {
				33 : 'pageup',
				34 : 'pagedown',
				36 : 'home',
				35 : 'end',
				37 : 'left',
				39 : 'right',
				38 : 'up',
				40 : 'down'
			}
		},
		_pageup_handler : function(){
			this.container.scrollTop -= 15 * this.line_height * this.render.scale;
		},
		_pagedown_handler : function(){
			this.container.scrollTop += 15 * this.line_height * this.render.scale;
		},
		_ctrl_b_handler : function(){
			ctrlSetBold();
		},
		_shift_home_handler : function(){
			if(this.caret_pos.para_at<0)
				return;
			this._shift_select(this.cur_page.para_info[this.caret_pos.para].index);
		},
		_shift_end_handler : function(){
			var p = this.cur_page.para_info[this.caret_pos.para];
			if(this.caret_pos.para_at === p.length - 1)
				return;
			this._shift_select(p.index + p.length);
		},
		_ctrl_shift_home_handler : function(){
			if(this.caret_pos.index<0)
				return;
			this._shift_select(-1);
		},
		_ctrl_shift_end_handler : function(){
			if(this.caret_pos.index === this.cur_page.ele_array.length - 1)
				return;
			this._shift_select(this.cur_page.ele_array.length - 1);
		},
		_home_handler : function(){
			this._setCaret(this.cur_page.getCaretByIndex(this.cur_page.para_info[this.caret_pos.para].index));
			this.cur_page.select(null);
			this.render.paint();
		},
		_end_handler : function(){
			var p = this.cur_page.para_info[this.caret_pos.para];
			this._setCaret(this.cur_page.getCaretByIndex(p.index + p.length));
			this.cur_page.select(null);
			this.render.paint();
		},
		_ctrl_home_handler : function(){
			this._setCaret(this.cur_page.getCaretByIndex(-1));
			this.cur_page.select(null);
			this.render.paint();
		},
		_ctrl_end_handler : function(){
			this._setCaret(this.cur_page.getCaretByIndex(this.cur_page.ele_array.length-1));
			this.cur_page.select(null);
			this.render.paint();
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
		_shift_up_handler : function(){
			
		},
		_shift_right_handler : function() {
			if(this.caret_pos.index >= this.cur_page.ele_array.length - 1)
				return;
			this._shift_select(this.caret_pos.index + 1);
		},
		_ctrl_shift_left_handler : function() {
			if(this.caret_pos.index < 0)
				return;
			this._shift_select(this.wordSeg.getLeft(this.cur_page.ele_array, this.caret_pos.index));
		},
		_ctrl_shift_right_handler : function() {
			if(this.caret_pos.index >= this.cur_page.ele_array.length - 1)
				return;
			this._shift_select(this.wordSeg.getRight(this.cur_page.ele_array, this.caret_pos.index+1));
		},
		_ctrl_left_handler : function() {
			var idx = this.caret_pos.index;
			if(idx >= 0) {
				this._setCaret(this.cur_page.getCaretByIndex(this.wordSeg.getLeft(this.cur_page.ele_array, idx)));
			}
		 	this.cur_page.select(null);
		 	this.render.paint();
		},
		_ctrl_right_handler : function() {
			var idx = this.caret_pos.index + 1, err = this.cur_page.ele_array;
			if(idx < err.length) {
				this._setCaret(this.cur_page.getCaretByIndex(this.wordSeg.getRight(err, idx)));
			}
				this.cur_page.select(null);
		 	this.render.paint();
		},
		_ctrl_up_handler : function() {
			this.container.scrollTop -= this.line_height * this.render.scale;
		},
		_ctrl_down_handler : function() {
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
		_up_handler : function() {
			//向上
			this.moveCaret("up");
		},
		_down_handler : function() {
			//向下
			this.moveCaret("down");
		},
		_shortkey_handler : function(e) {
			var c_key = (e.ctrlKey ? "ctrl-" : "") + (e.shiftKey ? "shift-" : "") + (this.KEY_TABLE[e.keyCode] == null ? String.fromCharCode(e.keyCode).toLowerCase() : this.KEY_TABLE[e.keyCode]), k_func = this.SHORTKEY_TABLE[c_key];
			if( typeof k_func === 'function') {
				//$.log(c_key);
				k_func.apply(this, []);
				return true;
			}
			return false;
		}
	});
})(Daisy, Daisy.$);
