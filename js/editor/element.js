(function(Daisy, $) {
	Daisy._Element = function(type, value, style) {
		if(type == null)
			console.trace();
		this.type = type;
		this.value = value;
		this.left = 0;
		this.bottom = 0;
		this.width = 0;
		this.height = 0;
		this.style = style;
		//元素所在行
		this.line_at = -1;
		//该元素是否需要重新计算其宽度。
		this.need_measure = true;
		this.visible = true;
	}
	Daisy._Element.prototype = {
		toString : function() {
			if(this.type === Daisy._Element.Type.CHAR)
				return this.value;
			else
				return "@@";
		},
		copy : function() {
			var c_value = this.type === Daisy._Element.Type.HANDWORD ? this._copyHandWord() : this.value;
			var c_ele = new Daisy._Element(this.type, c_value, this._copyStyle(this.style));
			c_ele.width = this.width;
			c_ele.height = this.height;
			return c_ele;
		},
		_copyHandWord : function() {
			var c_hw = [];
			for(var i = 0; i < this.value.length; i++) {
				var bihua = this.value[i], c_bihua = [];
				for(var j = 0; j < bihua.length; j++) {
					var p = bihua[j];
					c_bihua.push({
						x : p.x,
						y : p.y
					});
				}
				c_hw.push(c_bihua);
			}
			return c_hw;
		},
		_copyStyle : function(style) {
			var c_style = {};
			for(var s in this.style) {
				c_style[s] = this.style[s];
			}
			//$.log(c_style);
			return c_style;
		},
		draw : function(ctx){
			return;
		}
	}

	Daisy._Element.Type = {
		CHAR : 0,
		HANDWORD : 1,
		NEWLINE : 2
	}
	Daisy._NewLineElement = function(){
		Daisy._Element.apply(this,[Daisy._Element.Type.NEWLINE,"\n",{}]);
	}
	Daisy._NewLineElement.prototype = {
		toString : function(){
			return "\n";
		},
		copy : function(){
			return new Daisy._NewLineElement();
		},
		draw : function(ctx){
			return;
		}
	}
	
	Daisy._CharElement = function(value,style){
		Daisy._Element.apply(this,[Daisy._Element.Type.CHAR,value,style]);
		//$.log(this.value);
	}
	Daisy._CharElement.prototype = {
		toString : function(){
			return this.value;
		},
		copy : function(){
			return new Daisy._CharElement(this.value,$.copyJson(this.style));
		},
		draw : function(ctx){
			ctx.font = this.style.font;
			ctx.fillStyle = this.style.color;
			ctx.fillText(this.value, this.left, this.bottom);
		}
	}
	
	Daisy._HandElement = function(value,style,width,height){
		Daisy._Element.apply(this,[Daisy._Element.Type.HANDWORD,value,style]);
		this.width = width;
		this.height = height;
	}
	Daisy._HandElement.prototype = {
		toString : function(){
			return "@handword@";
		},
		toSVG : function(){
			var svg_str = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='"+this.width+"' height='"+this.height+"'><path d='";
				for(var i=0;i<this.value.length;i++){
					svg_str += $.besierToSVG(this.value[i]);
				}
			svg_str += "' fill='none' stroke='"+this.style.color+"' stroke-width='"+this.style.weight+"' /></svg>";
			return svg_str;
		},
		_copyBihua : function() {
			var c_hw = [];
			for(var i = 0; i < this.value.length; i++) {
				var bihua = this.value[i], c_bihua = [];
				for(var j = 0; j < bihua.length; j++) {
					var p = bihua[j];
					c_bihua.push({
						x : p.x,
						y : p.y
					});
				}
				c_hw.push(c_bihua);
			}
			return c_hw;
		},
		copy : function(){
			return new Daisy._HandElement(this._copyBihua(),$.copyJson(this.style),this.width,this.height);
		},
		draw : function(ctx){
			ctx.lineWidth = this.style.bold?this.style.weight * 1.5 : this.style.weight;
			ctx.strokeStyle = this.style.color;
			ctx.save();
			ctx.translate(this.left, this.bottom - this.height);
			for(var i = 0; i < this.value.length; i++) {
				$.drawBesier(ctx, this.value[i]);
			}
			ctx.restore();
		}
	}
})(Daisy,Daisy.$);
