/**
 *
 */
(function(Daisy, $) {
	Daisy._Load = function(editor) {
		this.editor = editor;
		this.page = null;
		this.data = "";
		this.idx = 0;
	}
	Daisy._Load.prototype = {
		_findHW : function(hw_arr, idx) {
			for(var i = 0; i < hw_arr.length; i++) {
				if(hw_arr[i].index === idx)
					return hw_arr[i];
			}
			throw "not found?!";
		},
		loadPage : function(data, from) {
			if(from == null)
				this.idx = 0;
			else
				this.idx = from;

			this.data = data;
			this.page = this.editor.cur_page;

			this.loadItem(data)
			this.loadDoodle(data);
			this.editor.clearUndoRedo();
		},
		loadItem : function(data, from) {
			if(from != null)
				this.idx = from;
			if(data != null)
				this.data = data;
			this.page = this.editor.cur_page;

			// var str= "aaaaaaaaaa",ts = [];
			// for(var i=0;i<6;i++){
			// ts.push(str);
			// }
			// ts.push("a");
			// str=ts.join("");
			// $.log("len%d",str.length)
			// for(var i=0;i<str.length;i++)
			// this.editor.cur_page.append(str[i]);
			//
			// return;

			var len = this.read(), text = this.data.substr(this.idx, len);
			//$.log(text);
			this.idx += len;
			len = this.read();
			//$.log("hand len:%d", len);
			var hw_arr = [];
			for(var i = 0; i < len; i++) {
				var hw = this._loadHandWord();
				//$.log(hw.width)
				//$.log(hw);
				hw_arr.push(hw);
			}

			for(var i = 0; i < text.length; i++) {
				var t = text[i];
				//$.log("t:%d %s",i,t);
				if(t === '\ufffc') {
					this.editor.insert(this._findHW(hw_arr, i));
				} else {

					this.editor.insert(t);
				}
			}
			this._loadStyle();

			//this._loadStyle(editor.cur_page.style_array);
		},
		_loadStyle : function() {
			var len = this.read();
			for(var i = 0; i < len; i++) {
				//$.log("bold s:%d,e:%d",s,e);
				for(var j = this.read(); j < this.read(); j++) {
					var ele = this.editor.cur_page.ele_array[j];
					if(ele.type === Daisy._Element.Type.CHAR) {
						ele.style.bold = true;
						ele.style.font = "bold " + ele.style.font;
					}
				}
			}
			len = this.read();
			for(var i = 0; i < len; i++) {
				var s = this.read(), e = this.read(), c = this._getColorStr(this.read(), this.read(), this.read());
				//$.log("color s:%d,e:%d c:%s",s,e,c);
				for(var j = s; j < e; j++) {

					var ele = this.editor.cur_page.ele_array[j];
					if(ele.type === Daisy._Element.Type.CHAR) {
						ele.style.color = c;
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
		read : function() {
			var v = this.data.charCodeAt(this.idx++);
			return v;
		},
		read_str : function(len) {
			var v = this.data.substr(this.idx, len);
			this.idx += len;
			return v;
		},
		_loadHandWord : function() {
			var index = this.read(),
				width = this.read(),
				height = this.read(),
				style = {
					weight : this.read_float(),
					color :  this._getColorStr(this.read(), this.read(), this.read()),
				},
				value = [];
			var hw = new Daisy._HandElement(value, style, width, height);
			//额外附属一个index,用来插入时检索
			hw.index = index; 
			
			var bnum = this.read();
			for(var j = 0; j < bnum; j++) {
				var new_bh = [], pn = this.read();
				for(var n = 0; n < pn; n++) {
					//$.log("nbh")
					var x = this.read(), y = this.read();
					new_bh.push({
						x : x,
						y : y
					});

				}
				hw.value.push(new_bh);
			}
			
			/**
			 * 在有些版本的手机导出文件里面，手写体的width没有给出，则在这里计算。 
			 */
			if(hw.width === 0) {
				hw.width = this._calcHandWidth(hw.bihua,hw.height);
			}
			
			return hw;

		},
		_calcHandWidth : function(bihuas, height) {
			
			var p0 = bihuas[0][0], x1 = p0.x, y1 = p0.y, x2 = p0.x, y2 = p0.y;
			for(var i = 0; i < bihuas.length; i++) {
				var bh = bihuas[i];
				for(var j = 0; j < bh.length; j++) {
					var p = bh[j];
					if(p.x < x1)
						x1 = p.x;
					if(p.x > x2)
						x2 = p.x;
					if(p.y < y1)
						y1 = p.y;
					if(p.y > y2)
						y2 = p.y;
				}
			}
			var w = x2 - x1, h = y2 - y1;
			if(h===0)
				h=1;
			return _w = (w / h * height);// + this.editor.font_height * 0.3;
		}
	}

})(Daisy, Daisy.$);
