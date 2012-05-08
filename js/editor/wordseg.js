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
					from : index - 1,
					to : index
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
		 * 根据chrome的规则，向右选择会选择一致类型的单词，并将右边的空格一起包含
		 */
		_getRight : function(arr, idx, type) {
			var r = idx;
			for(var i = idx + 1; i < arr.length; i++) {
				if(this._getCharType(arr[i].value) !== type) {
					r = i - 1;
					break;
				}
			}
			if(type !== this.TYPE.SPACE)
				r = this._getRight(arr, r, this.TYPE.SPACE);
			return r;
		},
		_getLeft : function(arr,idx,type){
			var i = idx - 1;
			for(;i>=0;i--){
				if(this._getCharType(arr[i].value)!==type){
					break;
				}
			}
			return i;
		},
		getLeft : function(ele_arr, index) {
			
		},
		getRight : function(ele_arr, index) {

		}
	}
})(Daisy, Daisy.$);
