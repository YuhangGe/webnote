var w_hash = {}, w_number = 0;

var n_arr = [];

function _push(arr, val) {
	/**
	 * 按字符串长度从小到大插入
	 */
	for(var i = 0; i < arr.length; i++) {
		if(val.length <= arr[i].length) {
			arr.splice(i, 0, val);
			return;
		}
	}
	arr.push(val);
}

function addWord(w) {
	//console.log("add word: "+w);
	var k = w[0], v = w.substring(1, w.length), t = w_hash[k];
	//console.log(v)
	if(t == null) {
		w_hash[k] = t = [];
		w_number++;
	}
	_push(t, v);

}

function output() {
	var out = "" + String.fromCharCode(w_number);
	for(var w_key in w_hash) {
		//console.log(w_key);
		out += w_key + _outline(w_hash[w_key]);
		n_arr.push(w_key.charCodeAt(0));
	}
	return out;
}

function _outline(arr) {
	var rtn = [];
	var f = 0, t = 1, count = 0, pre_len = arr[f].length;
	for(var i = 1; i < pre_len; i++) {
		rtn.push("\x00");
		count++;
	}
	while(t < arr.length) {
		var c_len = arr[t].length;
		if(c_len !== pre_len) {
			//console.log("c_len:"+c_len+",p_len:"+pre_len)
			rtn.push(String.fromCharCode(t - f), arr.slice(f, t).join(""));
			for(var i = pre_len + 1; i < c_len; i++) {
				//console.log("000")
				rtn.push("\x00")
				count++;
			}

			pre_len = c_len;
			f = t;
			count++;
		}
		t++;
	}
	count++;
	//console.log("count:"+count);
	rtn.push(String.fromCharCode(t - f), arr.slice(f, t).join(""));
	return String.fromCharCode(count) + rtn.join("");
}

(function() {
	var fs = require("fs");

	var lines = fs.readFileSync("cedict_ts.txt", "utf8").split("\n");

	for(var i = 0; i < lines.length; i++) {
		var l = lines[i], idx = l.indexOf(" "), w1 = l.substring(0, idx), w2 = l.substring(idx + 1, l.indexOf(" ", idx + 1));
		if(w1.length <= 1)
			continue;
		addWord(w1);
		if(w2 !== w1) {
			addWord(w2);
		}
	}
	console.log("total char number:"+ w_number);
	fs.writeFileSync("dict.txt", output(), "utf8"); 
	console.log("finish");
	// var stdin = process.openStdin();
	// stdin.on('data', function(chunk) {
		// console.log("bye!");
		// process.exit();
	// });

})();
