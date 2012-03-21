Daisy._Render = function(editor){
	this.editor = editor;
	this.page = null;
	this.canvas = this.editor.canvas;
	this.ctx = this.canvas.getContext('2d');
	this.hand_canvas = document.createElement("canvas");
	this.hand_ctx = this.hand_canvas.getContext('2d');
	
	this.line_height = 30;
	this.line_width = 500;
	this.line_count = 20;
	
	this.c_width = this.line_width;
	this.c_height = this.line_height * this.line_count + 20;
	this.canvas.width = this.line_width;
	this.canvas.height = this.c_height;
	
	this.styles = [{font:'20px 宋体',color:'black'}]
}
Daisy._Render.prototype = {
	resetPage : function(){
		this.page = this.editor.cur_page;
	},
	_drawLine : function(ctx,x1,y1,x2,y2){
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
		ctx.closePath();
	},
	_paintBackground : function(){
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0,0,this.c_width,this.c_height);
		
		this.ctx.strokeStyle = "gray";
		this.ctx.lineWidth = 1;
		
		var top = 0;
		for(var i=0;i<this.line_count;i++){
			top+=this.line_height;
			this._drawLine(this.ctx,0,top,this.c_width,top);
		}
	},
	_paintHandWord:function(hw,left,top){
		this.hand_canvas.width = hw.width;
		this.hand_canvas.height = hw.height;
		this.hand_ctx.strokeStyle = hw.color;
		this.hand_ctx.lineWidth = hw.weight;
		
		for(var i=0;i<hw.bihua.length;i++){
			this._drawBihua(this.hand_ctx,hw.bihua[i]);			
		}
		
		this.ctx.drawImage(this.hand_canvas,left,top-this.line_height);
	},
	_drawBihua: function(ctx,bh){
		//ctx.strokeStyle = 'red';  
       // ctx.lineWidth = 2;  
		var len = bh.length;
		if(len===0)
			return;
		else if(len === 1){
			//to do 
			return ;
		}
		
		ctx.beginPath();
		var s = bh[0],e = bh[len-1];
		
		var ctrl = null,dest = null;
		
		
		ctrl = bh[0];
		ctx.moveTo(ctrl.x,ctrl.y);
       	for(var i=0;i<len-1;i++){
       		dest = this._getMiddlePoint(bh[i],bh[i+1]);
       		ctx.quadraticCurveTo(ctrl.x,ctrl.y,dest.x,dest.y);
       		ctrl = bh[i+1];
       	}
       	dest = bh[len-1];
       	ctx.quadraticCurveTo(ctrl.x,ctrl.y,dest.x,dest.y);
        ctx.stroke();
        ctx.closePath(); 
       
	},
	_getMiddlePoint:function(p1,p2){
		return {
			x : (p1.x+p2.x)/2,
			y : (p1.y+p2.y)/2
		}
	},
	paint : function(){
		
		this.ctx.textAlign = "start";
		this.ctx.textBaseline = 'bottom';
		
		this._paintBackground();
		
		var t_arr = this.page.text_array,s_arr=this.page.style_array,hi_arr= this.page.hand_array.index,hv_arr=this.page.hand_array.value;
		
		var left = 0, top = this.line_height;
		
		for(var i=0;i<t_arr.length;i++){
			var idx = hi_arr.indexOf(i-1),hand_word=(idx<0?null:hv_arr[idx]);
			if(idx>=0){
				if(left+hand_word.width>this.c_width){
					top+=this.line_height;
					left = 0;
				}
				this._paintHandWord(hand_word,left,top-2);
				left += hand_word.width;
			}
			var c = t_arr[i];
			//$.dprint(c);
			if(c==='\n'){
				top+=this.line_height;
				left = 0;
			}else{
				var style = this.styles[s_arr[i]];
				this.ctx.font = style.font;
				this.ctx.fillStyle = style.color;
				
				var cw = this.ctx.measureText(c).width;
				if(left+cw>this.c_width){
					top+=this.line_height;
					left = 0;
				}
				this.ctx.fillText(c,left,top-2);
				left+=cw; 
				
			}
		}
	}
}
