var w_trie = {};

function _insert(t,word){
	for(var i=0;i<word.length;i++){
		var c = word[i];
		t[c] = t[c]==null?{}:t[c];
		t = t[c];
	}
	t[''] = 1;
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
	//console.log("char number: "+c_num);
	for(var i=0; i<8;i++){
		var w_chr = read_word(1), count = read_num(), t = w_trie[w_chr] = {};
		
		for(var j=1;j<=count;j++){
			var w_num = read_num();
			//console.log("w_num:"+w_num);
			for(var x=0;x<w_num;x++){
				_insert(t,read_word(j));
			}
		}
	}
	var stdin = process.openStdin();
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
})();
