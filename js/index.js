$(function(){
	wn_editor = new Daisy.WebNote({
		line_width : 730,
		line_count : 20,
		line_height : 48,
		font_name : '微软雅黑',
		font_size : 33,
		width : 730,
		height : 600
	});
	
	LAYOUT.row_1 = $('#col-1 .logo')[0].offsetHeight;
	LAYOUT.row_2 = $('#col-1 .sub-title')[0].offsetHeight;
	layout();
	
});

function do_test(){
	//wn.cur_page.appendText("大家好");
	//wn.render.paint();
	wn.insert(window.hw);
	wn.focus();
}
