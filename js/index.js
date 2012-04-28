/**
 * 根据浏览器窗口大小对面板进行布局
 */
$.getSize = function()//函数：获取尺寸
{
	var w = 0, h = 0;
	//获取窗口宽度
	if(window.innerWidth)
		w = window.innerWidth;
	else if((document.body) && (document.body.clientWidth))
		w = document.body.clientWidth;
	//获取窗口高度
	if(window.innerHeight)
		h = window.innerHeight;
	else if((document.body) && (document.body.clientHeight))
		h = document.body.clientHeight;
	return {
		width : w,
		height : h
	}
}
var LAYOUT = {
	col_1_min : 200,
	col_2_min : 200,
	col_1 : 200,
	col_2 : 300,
	col_3 : 500,
	row_1 : 40,
	row_2 : 30
}
function layout() {
	//return;
	var size = $.getSize();
	//$.log(size);
	$('#col-1').height(size.height);
	$('#col-2').height(size.height);
	$('#col-3').height(size.height);
	$('#page-list').height(size.height - LAYOUT.row_1 - LAYOUT.row_2 - 2);
	// -2是减去两条边线的宽/高
	$('#col-3').width(size.width - LAYOUT.col_1 - LAYOUT.col_2 - 2);

	if(SNEditor != null)
		SNEditor.setSize(size.width - LAYOUT.col_1 - LAYOUT.col_2 - 2, size.height - LAYOUT.row_1 - LAYOUT.row_2 - 2);

}


$(window).resize(layout);

$(function() {

	initPlugin();
	/*
	* phone
	*/
	// wn_editor = new Daisy.WebNote({
	// line_width : 730,
	// line_count : 20,
	// line_height : 48,
	// font_name : '微软雅黑',
	// font_size : 33,
	// width : 730,
	// height : 600
	// });
	/**
	 * pad
	 */

	LAYOUT.row_1 = $('#col-1 .logo')[0].offsetHeight;
	LAYOUT.row_2 = $('#col-1 .sub-title')[0].offsetHeight;
	SNEditor = Daisy.createEditor('edit-container');
	layout();

	if(SNEditor == null) {
		return;
	}

	///SNEditor.append("Vingt mille lieues sous les mers  est la première livre de Jules Verne que j’ai lue. Personnellement, je p");
	//SNEditor.append("hello world goooooooooooooooooooooooooooooooooooooooogle\nlove daisy");

	// $.get("load_item.php?file=adb\\data2\\", function(data) {
	// SNEditor.loadItem(data, 0);
	// }, 'text');
	// $.get("load_doodle.php?file=adb\\data2\\", function(data) {
	// SNEditor.loadDoodle(data, 0);
	// }, 'text');
	//
	//$.get("other_lang.txt",function(data){
	//SNEditor.append(data);
	//})

	//SNEditor.append("\ndjlsdkl jdksljdklsdkj jdskljdlsdj  djslkdjklsd  djskldjklsd djskldjsd djklsdjlsdj djlsd d jsdkl d");
	//SNEditor.append("Juan WongPodsdsddsdsdssted July 27, 2006 at 8:26 am | Permalinkglad I can help  Adam Ziegler");

	SNEditor.insert("abc\nd");
	//SNEditor.append("歡迎使用SuperNote網頁版。\n目前還只是演示版本，請點擊左側筆記本列表加載示例筆記本。")
	loadAllBook();

	//$('#ctrl-handword').qtip("show")
});
/**
 * 初始化jQuery 插件，包括颜色选择、tip、menu等
 */
function initPlugin() {
	
	var cp = new Daisy._ColorPicker('colorSelector', function(color){
		 ctrlSetColor(color);
	});
	
	// $('.edit-ctrl a').qtip({
		// position : {
			// my : "bottom left",
			// at : "top right",
			// adjust : {
				// x : 0,
				// y : -3
			// }
		// },
		// style : {
			// classes : 'ui-tooltip-shadow',
			// tip : {
				// border : 1
			// }
		// }
	// });
}

/**
 * 加载笔记本
 */
function loadAllBook() {
	$.getJSON("data/getallbook.php", function(data) {
		if(data.status != 0) {
			$('#page-list').html("網絡錯誤或未登錄，請重試");
			return;
		}
		var books = data.books, bl_dom = $('#book-list');
		if(books.length == 0) {
			$('#book-list li p').html("沒有筆記本，請新建");
		} else {
			bl_dom.html("");
		}
		for(var i = 0; i < books.length; i++) {
			var b = books[i];
			bl_dom.append($('<li id="book_' + b.bookid + '" onclick="loadBook(\'' + b.bookid + '\');">').html('<p class="book-title">' + b.name + '</p></p><p class="book-type">(For ' + (b.type == 'phone' ? 'Phone' : 'Pad') + ') ' + b.pagenum + '页</p>'));
		}
	});
}

function loadBook(id) {
	Daisy.Global.cur_page.bookid = id;
	$('#page-list').html("<p>正在加載筆記列表，請稍候...</p>");
	$.getJSON("data/getbook.php?bookid=" + id, function(data) {
		if(data.status != 0) {
			$('#page-list').html('<p>網絡錯誤或未登錄，請重試</p>');
			return;
		}
		var pages = data.pages, pl_dom = $('#page-list');
		if(pages.length == 0) {
			pl_dom.html("<p>沒有筆記，請新建</p>");
		} else {
			pl_dom.html("");
		}
		for(var i = 0; i < pages.length; i++) {
			var p = pages[i];
			pl_dom.append($('<li id="page_' + p.pageid + '" onclick="loadPage(\'' + p.pageid + '\');">').html('<p><img class="thumb-pad" src="' + p.thumb + '" /></p><p>' + p.date + '</p>'));
		}
	});
}

function loadPage(id) {
	SNEditor.clear();
	SNEditor.insert("正在加載筆記內容，請稍候...");
	Daisy.Global.cur_page.pageid = id;
	$.get("data/openpage.php?bookid=" + Daisy.Global.cur_page.bookid + "&pageid=" + id, function(data) {
		//alert(data.length);
		if(data.charCodeAt(0) != 0) {

		} else {
			SNEditor.clear();
			SNEditor.loadPage(data, 1);
		}

	}, "text")
}