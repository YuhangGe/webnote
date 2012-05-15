function State(root) {
	this.id = State.__auto__id__++;
	this.accept = false;
	this.next = {};
	// if(root) {
		// this.table = {
			// base : [],
			// next : [],
			// check : []
		// }
	// }
}

State.__auto__id__ = 0;
State.prototype = {
	getNext : function(chr) {
		return this.next[chr];
	}
}

var w_trie = new State(), w_number = 0, w_list = [];

var c_arr = [];
var Table = {
	base : [],
	next : [],
	check : []
};

var Eqc = {
	_id : 0,
	table : {},
	get : function(chr) {
		var e = this.table[chr];
		if(e == null) {
			e = this.table[chr] = this._id++;
		}
		return e;
	},
	add : function(chr) {
		this.table[chr] = this._id++;
	}
};

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

function getBase(s) {
	var base = 0;
	//console.log(Table.next);
	out:
	while(true) {
		for(var w in s.next) {
			//console.log(Table.next[base + Number(w)])
			if(Table.next[base + Number(w)] != null) {
				base++;
				continue out;
			}
		}
		break;
	}
	return base;
}

function addWord(w) {
	var c = Eqc.get(w[0]);
	if(w_trie.next[c] == null) {
		w_trie.next[c] = new State(true);
	}
	w_list.push(w);

}

function _add(w) {
	var t = w_trie.next[Eqc.get(w[0])];
	if(t == null) {
		throw "?";
	}
	for(var i = 1; i < w.length; i++) {
		var c = Eqc.get(w[i]);
		if(t.next[c] == null) {
			t.next[c] = new State();
		}
		t = t.next[c];
	}
	t.accept = true;
}

function createTable() {
	//console.log(w_list.length)
	for(var i = 0; i < w_list.length; i++) {
		_add(w_list[i]);
	}
	//console.log("total states num:" + State.__auto__id__)
	_totable(w_trie)
}

function _totable(state) {
	if(state.accept){
		//Table.base[state.id] = -1;
		return;
	}
		

	var n_list = [], base = getBase(state);
	//console.log("base:" + base);
	Table.base[state.id] = base;
	for(var i in state.next) {
		//console.log(state.next[i])
		var c = Number(i);
		Table.check[base + c] = state.id;
		Table.next[base + c] = state.next[i].id;
		n_list.push(state.next[i]);
		//console.log(n_list)
	}
	//console.log(n_list.length)
	for(var i = 0; i < n_list.length/*(n_list.length>2?2:n_list.length)*/; i++) {
		_totable(n_list[i])
	}
}

(function() {
	var fs = require("fs");

	var lines = fs.readFileSync("cedict_ts.txt", "utf8").split("\n"), word_list = [];
	//console.log(lines.length);
	for(var i = 0; i < lines.length; i++) {
		var l = lines[i], idx = l.indexOf(" "), w1 = l.substring(0, idx), w2 = l.substring(idx + 1, l.indexOf(" ", idx + 1));
		if(w1.length < 2)
			continue;

		addWord(w1);
		if(w2 !== w1) {
			addWord(w2);
		}
	}

	console.log("total char number:" + State.__auto__id__);

	createTable();
	console.log(Eqc.table.length);
	console.log();
	console.log(Table.base.length+","+Table.next.length+","+Table.check.length)
	//fs.writeFileSync("dict.txt", output(), "utf8");
	// var stdin = process.openStdin();
	// stdin.on('data', function(chunk) {
	// console.log("bye!");
	// process.exit();
	// });

})();
