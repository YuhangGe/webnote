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
			$.log(this.c_a);
			$.log(this.c_b);
			editor._delete(this.c_a,this.c_b);
		}
	}
	$.inherit(Daisy._DeleteCommand, Daisy._URCommand);
	
	Daisy._UndoRedoManager = function(editor) {
		this.cmd_array = [];
		this.cmd_index = -1;
		this.cmd_size = 0;
		this.editor = editor;
	}
	Daisy._UndoRedoManager.prototype = {
		add : function(cmd) {
			this.cmd_index++;
			this.cmd_array[this.cmd_index] = cmd;
			this.cmd_size = this.cmd_index + 1;
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
		
		}
	}
})(Daisy, Daisy.$);
