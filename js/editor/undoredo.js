(function(Daisy, $) {
	/**
	 * @class _URCommand
	 * Undo&Redo Command
	 */
	Daisy._URCommand = function() {

	}
	Daisy._URCommand.prototype = {
		undo : function(target) {
			throw "abstract method";
		},
		redo : function(target) {
			throw "abstract method";
		}
	}

	Daisy._InsertCommand = function(caret_before, caret_after, ele_array) {
		this.c_b = caret_before;
		this.c_a = caret_after;
		this.e_arr = ele_array;
	}
	Daisy._InsertCommand.prototype = {
		undo : function(editor) {
			// $.log("undo insert");
			// $.log(this.c_b);
			// $.log(this.c_a);
			editor._delete(this.c_b, this.c_a);
		},
		redo : function(editor) {
			editor._insert(this.e_arr, this.c_b);
		}
	}
	$.inherit(Daisy._InsertCommand, Daisy._URCommand);
	
	Daisy._CombineCommand = function() {
		this.cmd_array = [];
	}
	Daisy._CombineCommand.prototype = {
		add : function(cmd) {
			this.cmd_array.push(cmd);
		},
		undo : function(editor) {
			for(var i = this.cmd_array.length - 1; i >= 0; i--) {
				this.cmd_array[i].undo(editor);
			}
		},
		redo : function(editor) {
			for(var i = 0; i < this.cmd_array.length; i++) {
				this.cmd_array[i].redo(editor);
			}
		}
	}
	$.inherit(Daisy._CombineCommand, Daisy._URCommand);
	
	Daisy._DeleteCommand = function(caret_before,caret_after, ele_array) {
		this.c_b = caret_before;
		this.c_a = caret_after;
		this.e_arr = ele_array;
	}
	Daisy._DeleteCommand.prototype = {
		undo : function(editor) {
			editor._insert(this.e_arr, this.c_a);
		},
		redo : function(editor) {
			editor._delete(this.c_a,this.c_b);
		}
	}
	$.inherit(Daisy._DeleteCommand, Daisy._URCommand);
	
	Daisy._DoodleNewCommand = function(doo){
		this.doodle = doo;
	}
	Daisy._DoodleNewCommand.prototype = {
		undo : function(editor){
			editor._removeDoodle(this.doodle);
		},
		redo : function(editor){
			editor._insertDoodle(this.doodle);
		}
	}
	$.inherit(Daisy._DoodleNewCommand, Daisy._URCommand);
	
	Daisy._DoodleDelCommand = function(doo){
		this.doodle = doo;
	}
	Daisy._DoodleDelCommand.prototype = {
		undo : function(editor){
			editor._insertDoodle(this.doodle);
		},
		redo : function(editor){
			editor._removeDoodle(this.doodle);
		}
	}
	$.inherit(Daisy._DoodleDelCommand, Daisy._URCommand);
	
	Daisy._DoodleMoveCommand = function(doo, dx, dy){
		this.doodle = doo;
		this.dx = dx;
		this.dy = dy;
	}
	Daisy._DoodleMoveCommand.prototype = {
		undo : function(editor){
			editor._moveDoodle(this.doodle,-this.dx, -this.dy);
		},
		redo : function(editor){
			editor._moveDoodle(this.doodle,this.dx, this.dy);
		}
	}
	$.inherit(Daisy._DoodleMoveCommand, Daisy._URCommand);
	
	Daisy._DoodleRSCommand = function(doo, relay_point, rotate, scale){
		this.doodle = doo;
		this.r = rotate;
		this.s = scale;
		this.p = relay_point;
		this.p2 = relay_point;
		if(doo.type===Daisy._Doodle.Type.IMAGE){
			this.p = doo.pre_matrix;
			this.p2 = doo.matrix;
		}
	}
	Daisy._DoodleRSCommand.prototype = {
		undo : function(editor){
			editor._rotateScaleDoodle(this.doodle,this.p, -this.r, 1/this.s);
		},
		redo : function(editor){
			editor._rotateScaleDoodle(this.doodle,this.p2, this.r, this.s);
		}
	}
	$.inherit(Daisy._DoodleRSCommand, Daisy._URCommand);

	Daisy._DoodleEraserCommand = function(doo,eraser){
		this.doodle = doo;
		this.eraser = eraser;
	}
	Daisy._DoodleEraserCommand.prototype = {
		undo : function(editor){
			this.doodle.removeEraser(this.eraser);
			editor.render.paint();
		},
		redo : function(editor){
			this.doodle.addEraser(this.eraser);
			editor.render.paint();
		}
	}
	$.inherit(Daisy._DoodleEraserCommand, Daisy._URCommand);
	Daisy._UndoRedoManager = function(editor) {
		this.cmd_array = [];
		this.cmd_index = -1;
		this.cmd_size = 0;
		this.editor = editor;
		this.MAX_NUM = 10;
	}
	Daisy._UndoRedoManager.prototype = {
		add : function(cmd) {
			//$.log(cmd)
			
			if(this.cmd_index + 1 < this.MAX_NUM){
				this.cmd_index++;
				this.cmd_array[this.cmd_index] = cmd;
				this.cmd_size = this.cmd_index + 1;
			}else{
				this.cmd_array.shift();
				this.cmd_array.push(cmd);
			}
		},
		undo : function() {
			if(this.cmd_index >= 0) {
				this.cmd_array[this.cmd_index--].undo(this.editor);
			}
		},
		redo : function() {
			if(this.cmd_index + 1 < this.cmd_size) {
				this.cmd_array[++this.cmd_index].redo(this.editor);
			}
		},
		clear : function(){
			this.cmd_index = -1;
			this.cmd_size = 0;
		}
	}
	
	Daisy._TextHistory = function(editor){
		this.base(editor);
		this.add_cmd = null;
		this.add_delegate = $.createDelegate(this,this._add_handler);
		this.add_timeout = null;
	}
	Daisy._TextHistory.prototype = {
		undo : function(){
			if(this.add_timeout!==null){
				window.clearTimeout(this.add_timeout);
				this._add_handler();
			}
			this.callBase("undo");
		},
		redo : function(){
			if(this.add_timeout!==null){
				window.clearTimeout(this.add_timeout);
				this._add_handler();
			}
			this.callBase("redo");
		},
		add : function(cmd){
		
			if(this.add_timeout!==null){
				window.clearTimeout(this.add_timeout);
			}else{
				this.add_cmd = new Daisy._CombineCommand();
			}
			this.add_cmd.add(cmd);
			this.add_timeout = window.setTimeout(this.add_delegate,700);
		},
		_add_handler : function(){
			this.callBase("add",this.add_cmd);
			this.add_timeout = null;
		},
		clear : function(){
			if(this.add_timeout!==null){
				window.clearTimeout(this.add_timeout);
				this.add_timeout = null;
			}
			this.callBase("clear");
		}
	}
	$.inherit(Daisy._TextHistory, Daisy._UndoRedoManager);
})(Daisy, Daisy.$);
