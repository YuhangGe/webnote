$.createDelegate = function(instance, func) {
	return function() {
		func.apply(instance, arguments);
	}
}
Daisy = {};
Daisy._ColorPicker = function(tigger, onColorChange) {
	this.tigger = ( typeof tigger === 'string') ? $('#' + tigger) : $(tigger);
	this.tigger.click($.createDelegate(this, this.show));
	this.panel = Daisy._ColorPicker.color_panel;
	this.onColorChange = (typeof onColorChange === 'function') ? onColorChange : function() {
			// do nothing
	};
	this.dealColorDelegate = $.createDelegate(this,this.dealColorChange);
}
Daisy._ColorPicker.color_array = [['black', 'white', 'gray'], ['red', 'orange', 'yellow'], ['purple', 'blue', 'green']];

Daisy._ColorPicker.initPicker = function() {
	var CP = Daisy._ColorPicker;
	CP.colorChange = function(color) {
		// do nothing;
		$.log(color)
	};
	CP.color_panel = $("<div>").css({
		position : 'absolute',
		display : 'none'
	});
	var t = $("<table border='1' cellspacing='2'>");
	var c_arr = CP.color_array;
	for(var i = 0; i < c_arr.length; i++) {
		var r = c_arr[i], r_dom = $("<tr>");
		for(var j = 0; j < r.length; j++) {
			r_dom.append($("<td>").css({
				'width' : 30,
				'height' : 30,
				'background-color' : r[j]
			}).click(function() {
				$.log('cc')
				CP.colorChange(this.style.backgroundColor);
			}));
		}
		t.append(r_dom)
	}
	CP.color_panel.append(t).appendTo($(document.body));

}
Daisy._ColorPicker.prototype = {
	show : function() {
		var off = this.tigger.offset();
		this.panel.css({
			left : off.left,
			top : off.top + this.tigger.height()
		});
		Daisy._ColorPicker.colorChange = this.dealColorDelegate;
		this.panel.fadeIn();
	},
	dealColorChange : function(color) {
		this.tigger.find("div").css('background-color',color);
		this.onColorChange(color);
		this.panel.fadeOut();
	}
}

$(Daisy._ColorPicker.initPicker);
