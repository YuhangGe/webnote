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
		_findHW : function(hw_arr,idx){
			for(var i=0;i<hw_arr.length;i++){
				if(hw_arr[i].index===idx)
					return hw_arr[i];
			}
			throw "not found?!";
		},
		loadPage : function(data,from){
			if(from==null)
				this.idx = 0;
			else
				this.idx = from;
			
			this.data = data;
			this.page = this.editor.cur_page;

			this.loadItem()
			this.loadDoodle();
		},
		loadItem : function(data,from) {
			if(from!=null)
				this.idx = from;
			if(data!=null)
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

			var len = this.read(),text = this.data.substr(this.idx,len);
			this.idx+=len;
			len = this.read();
			$.log("hand len:%d",len);
			var hw_arr = [];
			for(var i=0;i<len;i++){
				var hw = this._loadHandWord();
				//$.log(this.idx)
				//$.log(hw);
				hw_arr.push(hw); 
			}
		 
			for(var i=0;i<text.length;i++){
				var t = text[i];
				if(t==='\ufffc'){
					this.editor.cur_page.append(this._findHW(hw_arr,i));
				}else{
					this.editor.cur_page.append(t, {
						font : this.editor.font_size + "px " + this.editor.font_name,
						bold : false,
						color : this.editor.color
					});
				}
			}
		//	this._loadStyle();
			
			//this._loadStyle(editor.cur_page.style_array);
		},
		_loadStyle : function() {
			var len = this.read();
			for(var i = 0; i < len; i++) {

				for(var j = this.read(); j < this.read(); j++) {
					var ele = this.editor.cur_page.ele_array[j];
					if(ele.type === Daisy._Element.Type.CHAR) {
						ele.style.bold = true;
						ele.style.font = "bold " + ele.style.font;
					}
				}
			}
			len = this.read();
			var s,e;
			for(var i = 0; i < len; i++) {
				s=this.read();
				e=this.read();
				//$.log("s:%d,e:%d",s,e);
				for(var j = s; j < e; j++) {
					
					var ele = this.editor.cur_page.ele_array[j];
					if(ele.type === Daisy._Element.Type.CHAR) {
						ele.style.color = this._getColorStr(this.read(),this.read(),this.read());
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
		read : function(){
			var v = this.data.charCodeAt(this.idx++);
			return v;
		},
		read_str : function(len){
			var v = this.data.substr(this.idx,len);
			this.idx+=len;
			return v;
		},
		_loadHandWord : function() {

			var hw = {
				index : this.read(),
				width : this.read(),
				height : this.read(),
				weight : this.read(),
				color : '',
				bihua : []
			};
			hw.color = this._getColorStr(this.read(), this.read(), this.read());
			var bnum = this.read();
			for(var j = 0; j < bnum; j++) {
				var new_bh = [], pn = this.read();
				for(var n = 0; n <pn ; n ++) {
					//$.log("nbh")
					var x= this.read(),y=this.read();
					new_bh.push({
						x : x,
						y : y
					});
					
				}
				hw.bihua.push(new_bh);
			}
		
			return hw;

		}
	}

})(Daisy, Daisy.$);
