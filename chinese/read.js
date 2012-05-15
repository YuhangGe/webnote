var w_trie = {};

var c_table = {};
var c_num = 0;

function _insert(word){
	for(var i=0;i<word.length;i++){
		var c = word[i];
		if(c_table[c]==null){
			c_table[c] = c_num++;
		}
		//t[c] = t[c]==null?{}:t[c];
		//t = t[c];
	}
	//t[''] = 1;
}

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
	console.log("char number: "+c_num);
	for(var i=0; i<c_num;i++){
		var w_chr = read_word(1), count = read_num(), t = c_table[w_chr];
		if(t==null){
			t = c_table[w_chr] = c_num++;
		}
		for(var j=1;j<=count;j++){
			var w_num = read_num();
			//console.log("w_num:"+w_num);
			for(var x=0;x<w_num;x++){
				_insert(read_word(j));
			}
		}
	}
	console.log("c_num:"+c_num);
/*	var stdin = process.openStdin();
	stdin.on('data', function(d) {
		d = d.toString().trim();
		if(d==="q"){
			console.log("bye!");
			process.exit();
		}else{
			var t = w_trie;
			console.log(d.length)
			for(var i=0;i<d.length;i++){
				console.log(d[i])
				if(t[d[i]]==null && t['']==null){
					console.log("not found");
					return;
				}else{
					console.log(d[i]);
					t = t[d[i]];
				}
			}
			if(t['']==null){
				console.log("not found.");
			}else{
				console.log("found.");
			}
			
		}
		
	});
	*/
})();
