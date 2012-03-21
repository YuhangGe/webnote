
Daisy._Page = function(editor){
	this.editor = editor;
	this.text_array = [];
	this.style_array = [];
	this.last_idx = -1;
	this.hand_array = {
		index:[],
		value:[]
	};
	
	
	this.appendText("good morning,every one.I'm 葛羽航.");
	
	this.appendText("很高兴能和大家一起工作。我来自四川眉山，苏东坡的出生地。\nEvery body ");
	
	var b1 = ' 00 04 00 12 00 05 00 13 00 0E 00 12 00 14 00 12 00 21 00 12 00 28 00 12 00 2D 00 13 00 2D 00 13';
	b1 = b1.replace(/\s*00\s*/g,"\\x");
	 
	b1 = eval('"'+b1+'"');
	var b2 = '  00 17 00 05 00 17 00 05 00 17 00 0A 00 17 00 16 00 17 00 20 00 17 00 22';
	b2 = b2.replace(/\s*00\s*/g,"\\x");
	 
	b2 = eval('"'+b2+'"');
	//$.dprint(this.str);
	var hw = {
		height : 24,
		width : 38,
		color : 'blue',
		weight : 1,
		bihua : []
	}
	
	
	hw.bihua.push(this.str_to_points(b1),this.str_to_points(b2));
	
	this.appendHandWord(hw);
	this.appendText("is good.\n\nHello");
	

}
Daisy._Page.prototype = {
	str_to_points: function(str){
		var len = str.length;
		if(len===0 || (len & 1)!==0)
			return [];
 		var points = [];
		for(var i=0;i<len;i+=2){
			var x = str.charCodeAt(i),y=str.charCodeAt(i+1);
			//$.dprint("x:%d,y:%d",x,y);
			points.push({
				x:x,y:y
			});
		}
		return points;
	},
	appendText : function(text){
		for(var i=0;i<text.length;i++){
			this.text_array.push(text[i]);
			this.style_array.push(0);
		}
		this.last_idx+=text.length;
	},
	appendHandWord : function(hw){
		this.hand_array.index.push(this.last_idx);
		this.hand_array.value.push(hw);
	}
}
