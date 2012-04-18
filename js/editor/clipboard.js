(function(Daisy, $) {
	/**
	 * 模拟的剪贴板，在firefox下不能直接向系统剪贴板中写入数据。
	 * 使用单例模式。
	 */
	Daisy.Clipboard = function() {
		this.inner_text = "";
		this.inner_data = null;
		this.saved_event = null;
		this.saved_callback = null;
		
		this._image_delegate = $.createDelegate(this,this._imageLoad);
		this._text_delegate = $.createDelegate(this, this._textLoad);
	};
	var C = Daisy.Clipboard;
	C.prototype = {
		getData : function(e, callback) {
			if(e == null || typeof callback !== 'function') {
				return null;
			}
			this.saved_event = e;
			this.saved_callback = callback;
			if(e && e.clipboardData && e.clipboardData.types) {
				/**
				 * chrome safari
				 */
				var d_type = e.clipboardData.types[0];
				$.log(e.clipboardData.types);
				$.log(e.clipboardData.items);
				if(d_type === "text/html") {
					this.data = {
						type : 'html',
						value : e.clipboardData.getData("text/html")
					}
					this._checkData();
				}else if(d_type === "text/uri-list"){
					this.data = {
						type : 'url',
						value : e.clipboardData.getData("text/uri-list")
					}
					this._checkData();
				}else if(/image/.test(d_type)) {
					var reader = new FileReader();

					reader.onload = this._image_delegate;

					reader.readAsDataURL(e.clipboardData.items[0].getAsFile());
				} else {
					this.data = {
						type : 'text',
						value : e.clipboardData.getData("text/plain")
					}
					this._checkData();
				}

			} else if(window.clipboardData) {
				/**
				 * IE 9
				 */
				this.data = {
					type : 'text',
					value : window.clipboardData.getData('text')
				};
				this._checkData();
			} else {
				/*
				 * firefox
				 */
				window.setTimeout( this._text_delegate , 5);

			}

		},
		_textLoad : function() {
			this.data = {
				type : 'text',
				value : this.saved_event.target.value
			};
			this._checkData();
		},
		_imageLoad : function(evt) {

			this.data = {
				type : 'image',
				value : evt.target.result
			};
			this._checkData();
		},
		_checkData : function() {
			if(this.data.type === "text") {
				if(this.data.value === "") {
					this.data = null;
				} else if(this.data.value === this.inner_text) {
					this.data.type = "item";
					this.data.value = this.inner_data;
				}
			}

			this.saved_callback(this.data);

		},
		setData : function(type, value, e) {
			this.data = data;
		}
	}

	C.__instance__ = null;
	C.getInstance = function() {
		if(C.__instance__ === null)
			C.__instance__ = new C();
		return C.__instance__;
	}
})(Daisy, Daisy.$);

