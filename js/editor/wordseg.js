(function(Daisy, $) {
	/**
	 * 对文字进行以词为单位选择，
	 * 中文分词现在采用的方法有点消耗内存。
	 */
	Daisy._Trie = {
		txt : "",
		idx : 0,
		_insert : function(t, word) {
			for(var i = 0; i < word.length; i++) {
				var c = word[i];
				t[c] = t[c] == null ? {} : t[c];
				t = t[c];
			}
			t[''] = 1;
		},
		read_num : function() {
			return this.txt.charCodeAt(this.idx++);
		},
		read_word : function(length) {
			if(length == null)
				length = 1;
			var w = this.txt.substr(this.idx, length);
			this.idx += length;
			return w;
		},
		parse : function(data) {
			this.txt = data;
			this.idx = 0;
			var w_trie = {};

			var c_num = this.read_num();
			//console.log("char number: "+c_num);
			for(var i = 0; i < c_num; i++) {
				var w_chr = this.read_word(1), count = this.read_num(), t = w_trie[w_chr] = {};

				for(var j = 1; j <= count; j++) {
					var w_num = this.read_num();
					//console.log("w_num:"+w_num);
					for(var x = 0; x < w_num; x++) {
						this._insert(t, this.read_word(j));
					}
				}
			}

			return w_trie;
		}
	}

	Daisy._WordSeg = function(editor) {
		this.editor = editor;
		this.w_seg = [];
		this.word_loaded = false;
		this.w_trie = null;
		this.reset_timeout = null;
		this.reset_delegate = $.createDelegate(this, this._deal_reset);
	}
	Daisy._WordSeg.prototype = {
		TYPE : {
			DIG_WORD : 0,
			ASCII : 1,
			UNICODE : 2,
			OTHER : 3,
			SPACE : 4
		},
		load_word : function() {
			jQuery.get("chinese/dict.txt", $.createDelegate(this, this._deal_load));
		},
		_deal_load : function(data) {
			this.w_trie = Daisy._Trie.parse(data);
			this.word_loaded = true;
			this.reset();
		},
		_getCharType : function(chr) {
			if( typeof chr !== 'string')
				return this.TYPE.OTHER;
			var c = chr.charCodeAt(0);
			if(c === 32 || c === 9)
				return this.TYPE.SPACE;
			else if((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57))
				return this.TYPE.DIG_WORD;
			else if(c > 256)
				return this.TYPE.UNICODE;
			else
				return this.TYPE.ASCII;
		},
		reset : function() {
			if(!this.word_loaded) {
				this.load_word();
			} else {
				/**
				 * 通过timeout来避免频繁的分词计算。 
				 */
				if(this.reset_timeout !== null) {
					window.clearTimeout(this.reset_timeout);
				}
				this.reset_timeout = window.setTimeout(this.reset_delegate, 2000);
			}
		},
		_deal_reset : function() {
			var arr = this.editor.cur_page.ele_array;
			this.w_seg.length = 0;
			this.fenci(arr);
			//$.log(this.w_seg);
			this.reset_timeout = null;
		},
		_seg : function(f, t) {
			this.w_seg.push(f, t);
		},
		fenci : function(d) {
			var t = this.w_trie, f = 0, is_got = false, last_m = 0, i = 0;
			while(true) {
				var c = d[i].value, ct = this._getCharType(c);
				if((ct !== this.TYPE.UNICODE) || t[c] == null) {
					if(is_got) {
						is_got = false;
						t = this.w_trie;
						if(last_m > f) {
							this._seg(f, last_m);
						}
						i = f++;
					}
				} else {
					//if(t[c]!=null){
					t = t[c];
					if(is_got === false) {
						is_got = true;
						f = i;
						last_m = f;
					} else if(t[''] === 1) {
						last_m = i;
					}

					//}else{
					//if(is_got){

					//}
					//}
				}

				i++;
				if(i === d.length) {
					if(is_got) {
						if(last_m > f) {
							this._seg(f, last_m);
						} else if(f + 1 < d.length) {
							i = f + 1;
							continue;
						}
					}
					break;
				}

			}
		},
		getRange : function(arr, idx) {
			var len = arr.length, ce = arr[idx], ct = this._getCharType(ce.value);
			if(ct === this.TYPE.OTHER) {
				return {
					from : idx - 1,
					to : idx
				}
			} else if(ct === this.TYPE.UNICODE) {
				return this._getChineseRange(arr, idx);
			} else {
				return {
					from : this._getLeft(arr, idx, ct),
					to : this._getRight(arr, idx, ct)
				}
			}

		},
		getRight : function(arr, idx) {
			var len = arr.length, ce = arr[idx], ct = this._getCharType(ce.value), r = idx;
			if(ct !== this.TYPE.SPACE) {
				if(ct === this.TYPE.UNICODE) {
					r = this._getChineseRange(arr, idx).to;
				} else {
					r = this._getRight(arr, idx, ct);
				}
			}
			return this._getRight(arr, r, this.TYPE.SPACE);
		},
		getLeft : function(arr, idx) {
			var len = arr.length, ce = arr[idx], ct = this._getCharType(ce.value);
			var l = (ct === this.TYPE.UNICODE ? this._getChineseRange(arr, idx).from : this._getLeft(arr, idx, ct));
			if(ct === this.TYPE.SPACE && arr[l] != null) {
				return this._getLeft(arr, l, this._getCharType(arr[l].value));
			} else
				return l;
		},
		/**
		 * 得到中文分词的单词范围。
		 * 当前没有具体实现。直接返回单个字符的范围。
		 */
		_getChineseRange : function(arr, idx) {
			if(this.word_loaded) {
				for(var i = 0; i < this.w_seg.length; i += 2) {
					if(idx >= this.w_seg[i] && idx <= this.w_seg[i + 1]) {
						//$.log("%d,%d",idx,i)
						return {
							from : this.w_seg[i] - 1,
							to : this.w_seg[i + 1]
						}
					}
				}
			}
			return {
				from : idx - 1,
				to : idx
			}
		},
		/**
		 *
		 * @param {Object} arr
		 * @param {Object} idx
		 * @param {Object} type
		 * 根据chrome的规则，向右选择会选择一致类型的单词
		 */
		_getRight : function(arr, idx, type) {
			if(type === this.TYPE.UNICODE || type === this.TYPE.OTHER)
				return idx;
			for(var i = idx + 1; i < arr.length; i++) {
				if(this._getCharType(arr[i].value) !== type) {
					return i - 1;
				}
			}
			if(i === arr.length)
				return i - 1;
			else
				return idx;
		},
		_getLeft : function(arr, idx, type) {
			var i = idx - 1;
			if(type === this.TYPE.UNICODE || type === this.TYPE.OTHER)
				return i;
			for(; i >= 0; i--) {
				if(this._getCharType(arr[i].value) !== type) {
					break;
				}
			}
			return i;
		}
	}
})(Daisy, Daisy.$);
