/**
 * 程序主逻辑
 */
(function(Daisy, $) {
	Daisy.WebNote = function(config) {

		this.canvas = $('wn-canvas');
		this.client = $('wn-client');
		this.container = $('wn-editor');
		this.caret = $('wn-caret');

		this.line_height = config.line_height;
		this.width = config.width;
		this.height = config.height;
		this.line_count = config.line_count;
		this.font_name = config.font_name == null ? '宋体' : config.font_name;
		this.font_size = config.font_size == null ? 18 : config.font_size;
		this.font = this.font_size + "px " + this.font_name;
		this.bg_color = config.background == null ? 'white' : config.background;
		this.color = config.foreground == null ? 'black' : config.foreground;

		this.caret_height = $.getFontHeight(this.font);
		this.c_height = this.line_height * this.line_count + 20;

		this.canvas.width = this.width;
		this.canvas.height = this.c_height;
		this.container.style.width = (this.width + (this.c_height > this.height ? 20 : 0)) + "px";
		this.container.style.height = this.height + 'px';
		this.caret.style.font = this.font_name;
		this.caret.style.color = this.color;
		this.caret.style.height = this.caret_height + "px";
		this.caret.style.top = (this.line_height - this.caret_height) + "px";

		this.render = new Daisy._Render(this);

		this.cur_page = null;
		this.pages = [];

		this.caret_pos = {
			index : -1,
			param : 0,
			param_at : -1,
			left : 0,
			top : this.line_height - this.caret_height
		}

		this.createPage();
		this.setCurPage(0);

		this.load = new Daisy._Load(this);
		this.load.loadToPage(this);

		this.initEvent();
		//$.dprint(this.cur_page);
		//this.focus();
		this.render.paint();
	}
	Daisy.WebNote.prototype = {
		_getEventPoint : function(e) {
			var x = 0, y = 0;
			//$.log(e);
			if( typeof e.offsetX !== 'undefined') {
				x = e.offsetX;
				y = e.offsetY;
			} else if( typeof e.layerX !== 'undefined') {
				x = e.layerX;
				y = e.layerY;
			}
			return {
				x : x,
				y : y
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
			var new_pos = this.cur_page._getCaret_xy(x,y);
			this._setCaret(new_pos);
		},
		_moveCaret_lc : function(line, colum) {

		},
		_setCaret : function(caret){
			this.caret_pos = caret;
			this._resetCaret();
		},
		_resetCaret : function(){
			$.log(this.caret_pos);
			this.caret.style.left =  this.caret_pos.left+'px';
			this.caret.style.top = this.caret_pos.top+"px";
		}
	}

})(Daisy, Daisy.$);
