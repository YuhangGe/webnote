/**
 * 加载doodle 物件
 */
(function(Daisy, $) {
	$.extend(Daisy._Load.prototype, {
		loadDoodle : function(data,from) {
			if(from!=null)
				this.idx = from;
			if(data!=null)
				this.data = data;
				
			$.log("%d,%d",this.idx,data.charCodeAt(0));
			this.page = this.editor.cur_page;
			this.page.doodle_height = this.read();
			this.page.doodle_width = this.read();
			this.read();
			//page id;
			var d_num = this.read();
			$.log("doodle number:%d", d_num);
			for(var i = 0; i < d_num; i++) {
				var doo = this.readDoodle();
				//$.log(doo)
				if(doo!==null)
					this.page.doodle_list.push(doo);
			}
			//$.log(this.page.doodle_list);
			//img = this.page.doodle_list[0];
		},
		read_float : function() {
			var f_len = this.read(), f_str = this.read_str(f_len);
			//$.log("f_len:%d, %s",f_len,f_str);
			return Number(f_str);
		},
		readDoodle : function() {
			var type = this.read(), pen_width = this.read_float(), color = this._getColorStr(this.read(), this.read(), this.read()), e_num = this.read();
			var eraser_list = [];
			//$.log("enum:%d", e_num);
			//$.log("pen_w:"+pen_width);
			for(var i = 0; i < e_num; i++) {
				eraser_list.push(this.readEraser());
			}
			//$.log(eraser_list);
			//$.log("doodle type:%d", type);
			var value = null, tag = false;
			if(type === Daisy._Doodle.Type.GROUP){
				//$.log('group')
				var g_len = this.read();
				var g_list = [];
				for(var i=0;i<g_len;i++){
					g_list.push(this.readDoodle());
				}
				value = g_list;
			}else if(type === Daisy._Doodle.Type.ERASER) {
				throw "eraser doodle? must be attached to other doodle.";
			} else if(type === Daisy._Doodle.Type.IMAGE) {
				var h = this.read(),l=this.read(),d_len = h<<16|l;
				$.log('image len:%d,h:%d,l:%d', d_len,h,l);
				value = this.read_str(d_len);
				var matrix = [];
				for(var i = 0; i < 9; i++) {
					matrix.push(this.read_float());
				}
				tag = matrix;
			} else {
				var pn = this.read(), points = [];
				for(var i = 0; i < pn; i++) {
					points.push({
						x : this.read(),
						y : this.read()
					});
				}
				value = points;
			}
			return Daisy._Doodle.create(type, pen_width, color, eraser_list, value, tag);

		},
		readEraser : function() {
			var pen_width = this.read_float(), pn = this.read(), points = [];
			for(var i = 0; i < pn; i++) {
				points.push({
					x : this.read(),
					y : this.read()
				})
			}
			return Daisy._Doodle.create(Daisy._Doodle.Type.ERASER, pen_width, null, null, points, null);
		}
	})
})(Daisy, Daisy.$);
