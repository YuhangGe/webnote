/**
 *
 */
(function(Daisy, $) {
	Daisy._Load = function(editor) {
		this.editor = editor;
	}
	Daisy._Load.prototype = {
		_pushBihua : function(bihua, str_arr) {
			for(var i = 0; i < str_arr.length; i++) {
				bihua.push(this.str_to_points(this.get_str(str_arr[i])));
			}
		},
		loadToPage : function(editor) {
			

			 // var str=  "good";// "hello\nworld\n.鎴戞槸钁涚窘鑸�\n\n\n\n澶у濂藉摝銆傚ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝﹀ぇ瀹跺ソ鍝\nhello daisy.i love you\n";
			 // for(var i=0;i<str.length;i++)
				 // editor.cur_page.append(str[i]);
// 			
// return;

			
			var len = window.WNItem.text_array.length,j=0;
			for(var i = 0; i < len; i++) {
				var ele = window.WNItem.text_array[i];
				if( typeof ele === 'string') {
					editor.cur_page.append(ele, {
						font : this.editor.font_size + "px " + this.editor.font_name,
						bold : false,
						color : this.editor.color
					});
				} else {
					editor.cur_page.append(this._loadHandWord(ele));
					//break;
				
				}
			}
			
			//this._loadStyle(editor.cur_page.style_array);
		},
		_loadStyle : function(s_arr) {
			var b_arr = window.WNItem.bold_array, idx = 1;
			for(var i = 0; i < b_arr.charCodeAt(0); i++) {

				for(var j = b_arr.charCodeAt(idx++); j < b_arr.charCodeAt(idx++); j++) {
					var s = s_arr[j];
					if(s != null) {
						s.bold = true;
						s.font = "bold " + s.font;
					} else {
						throw "bad index ! at bold : "+j;
					}
				}
			}
			var c_arr = window.WNItem.color_array, idx = 1;

			for(var i = 0; i < c_arr.charCodeAt(0); i++) {
				for(var j = c_arr.charCodeAt(idx++); j < c_arr.charCodeAt(idx++); j++) {
					var s = s_arr[j];
					if(s != null) {
						s.color = this._getColorStr(c_arr.charCodeAt(idx++), c_arr.charCodeAt(idx++), c_arr.charCodeAt(idx++));
					} else {
						//throw "bad index at color! " + j;
					}
				}
			}
		},
		_getColorStr : function(r, g, b) {
			r = r.toString(16);
			if(r.length === 1)
				r = '0' + r;
			g = g.toString(16);
			//$.dprint("%s,%d",g,g.length);
			if(g.length === 1)
				g = '0' + g;
			b = b.toString(16);
			if(b.length === 1)
				b = '0' + b;

			//$.dprint("r:%s,g:%s,b:%s",r,g,b);
			return '#' + r + g + b;
		},
		_loadHandWord : function(index) {

			var hs = window.WNItem.hand_array[index], hw = {
				index : hs.charCodeAt(0),
				width : hs.charCodeAt(1),
				height : hs.charCodeAt(2),
				weight : hs.charCodeAt(3),
				color : '',
				bihua : []
			};
			hw.color = this._getColorStr(hs.charCodeAt(4), hs.charCodeAt(5), hs.charCodeAt(6));
			var bnum = hs.charCodeAt(7), idx = 8;
			for(var j = 0; j < bnum; j++) {
				var new_bh = [], pn = hs.charCodeAt(idx++);
				//$.log('pn %d',pn)
				for(var k = 0; k < pn; k ++) {
					//$.log("nbh")
					new_bh.push({
						x : hs.charCodeAt(idx++),
						y : hs.charCodeAt(idx++)
					});
				}
				hw.bihua.push(new_bh);
			}
			if(index===3)
				window.hw=hw;
			return hw;

		}
	}

})(Daisy, Daisy.$);
