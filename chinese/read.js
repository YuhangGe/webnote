(function() {
	var fs = require("fs");
	var txt = "", idx = 0;
	function read_num() {
		return txt.charCodeAt(idx++);
	}
	function read_word(length){
		if(length==null)
			length = 1;
		var w = txt.substr(idx,length);
		idx+=length;
		return w;
	}
	txt = fs.readFileSync("dict.txt", "utf8");
	var c_num = read_num();
	//console.log("char number: "+c_num);
	for(var i=0; i<100;i++){
		var w_chr = read_word(1), count = read_num();
		//console.log("count:"+count);
		for(var j=1;j<=count;j++){
			var w_num = read_num();
			//console.log("w_num:"+w_num);
			for(var x=0;x<w_num;x++){
				console.log(w_chr+read_word(j));
			}
		}
	}
})();
