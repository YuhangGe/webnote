/**
 * 页面逻辑
 */
(function(Daisy, $) {
	Daisy._Element = function(type, value, style) {
		this.type = type;
		this.value = value;
		this.left = 0;
		this.bottom = 0;
		this.width = 0;
		this.height = 0;
		this.style = style;
		//该元素是否需要重新计算其宽度。
		this.need_measure = true;
	}
	Daisy._Element.Type = {
		CHAR : 0,
		HANDWORD : 1,
		NEWLINE : 2
	}
	Daisy._Page = function(editor) {
		this.editor = editor;
		this.ele_array = [];

		this.para_number = 1;
		this.para_info = [{
			index : -1,
			length : 0,
			line_start : 0,
			line_cross : 1
		}];

	}
	Daisy._Page.prototype = {
		_getParaByRow : function(row){
			
		},
		_getCaret_xy : function(x, y) {
			//$.log(x+","+y);
			var line_height = this.editor.render.line_height, row = Math.floor(y / line_height);
			
			// //$.log(row);
			// var line = this.line_info[row], left = 0, top = row * line_height, col = -1, idx = line.start;
			//
			// //$.log(row);
			// //$.log(line);
			// if(line.length > 0) {
			// var k = line.start + 1, e = k + line.length;
			// for(; k < e; k++) {
			// var cw = this.editor.render.getTextWidth_2(this.text_array[k], k);
			// //this.editor.render.getTextWidth(this.text_array[k]);
			// if(left + cw / 2 > x)
			// break;
			// else
			// left += cw;
			// }
			// idx = k - 1;
			//
			// //$.log(left);
			// col = idx - line.start - 1;
			// }
			//
			return {
				param : 0,
				param_at : -1,
				index : -1,
				left : x,
				top : y
			};
		},
		_appendLine : function(){
		
			var last_para = this.para_info[this.para_number-1]
			this.para_info.push({
				index : this.ele_array.length,
				length : 0,
				line_start : last_para.line_start+last_para.line_cross,
				line_cross : 1
			})
			
			this.ele_array.push(new Daisy._Element(Daisy._Element.Type.NEW_LINE, '\n', null));
			this.para_number ++;
		},
		append : function(ele, style) {

			var new_ele = null;
			if( typeof ele === 'string') {
				if(ele==='\n'){
					this._appendLine();
					return;
				}
				if(style == null)
					style = {
						font : this.editor.font,
						bold : false,
						color : this.editor.color
					};
				//$.log(style);
				new_ele = new Daisy._Element(Daisy._Element.Type.CHAR, ele, style);
			} else {
				new_ele = new Daisy._Element(Daisy._Element.Type.HANDWORD,ele.bihua,{
					weight : ele.weight,
					color : ele.color
				});
				new_ele.width = ele.width;
				new_ele.height = ele.height;
			}
			this.ele_array.push(new_ele);
			
			
			var last_param = this.para_info[this.para_number-1],
				pre_line_cross = last_param.line_cross;
			last_param.length++;
			
			var new_line_cross = this.editor.render._measureParagraph(last_param);
			if(new_line_cross>pre_line_cross){
				last_param.line_cross=new_line_cross;
			}
			// this.text_array.push(text);
			// this.style_array.push(style);
			//
			// if(text==='\n'){
			//
			// }else{
			// last_param.length ++;
			//
			// }
		}
	}

})(Daisy, Daisy.$);
