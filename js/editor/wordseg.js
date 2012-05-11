(function(Daisy, $) {
	/**
	 * 对文字进行以词为单位选择
	 */

	Daisy._WordSeg = function(editor) {
		this.editor = editor;
	}
	Daisy._WordSeg.prototype = {
		TYPE : {
			DIG_WORD : 0,
			ASCII : 1,
			UNICODE : 2,
			OTHER : 3,
			SPACE : 4
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
		getRange : function(arr, idx) {
			var len = arr.length, ce = arr[idx], ct = this._getCharType(ce.value);
			if(ct === this.TYPE.OTHER){
				return {
					from : idx - 1,
					to : idx
				}
			}else if(ct === this.TYPE.UNICODE){
				return this._getChineseRange(arr,idx);
			}else{
				return {
					from : this._getLeft(arr,idx,ct),
					to : this._getRight(arr,idx,ct)
				}
			}
			
		},
		getRight : function(arr,idx){
			var len = arr.length, ce = arr[idx], ct = this._getCharType(ce.value),
				r = idx;
			if(ct !== this.TYPE.SPACE){
				r = this._getRight(arr,idx,ct);
			}
			return this._getRight(arr,r,this.TYPE.SPACE);
		},
		getLeft : function(arr,idx){
			var len = arr.length, ce = arr[idx], ct = this._getCharType(ce.value);
			var l = this._getLeft(arr,idx,ct);
			if(ct===this.TYPE.SPACE && arr[l]!=null){
				return this._getLeft(arr, l, this._getCharType(arr[l].value));
			}else
				return l;
		},
		/**
		 * 得到中文分词的单词范围。
		 * 当前没有具体实现。直接返回单个字符的范围。 
		 */
		_getChineseRange : function(arr,idx){
		 
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
				return i-1;
			else
				return idx;
		},
		_getLeft : function(arr,idx,type){
			var i = idx - 1;
			if(type === this.TYPE.UNICODE || type === this.TYPE.OTHER)
				return i;
			for(;i>=0;i--){
				if(this._getCharType(arr[i].value)!==type){
					break;
				}
			}
			return i;
		}
	}
})(Daisy, Daisy.$);
